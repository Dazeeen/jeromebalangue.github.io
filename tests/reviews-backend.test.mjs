import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const backend = await readFile(
    new URL("../integrations/google-apps-script/contact-mailer/Code.gs", import.meta.url),
    "utf8"
);

function createReviewBackend() {
    const properties = new Map();
    const cache = new Map();
    const emails = [];
    let uuidCounter = 0;
    let locked = false;

    const propertyStore = {
        getProperty: (key) => properties.get(key) ?? null,
        setProperty(key, value) {
            properties.set(key, String(value));
            return propertyStore;
        },
        deleteProperty(key) {
            properties.delete(key);
            return propertyStore;
        }
    };
    const createOutput = (content) => ({
        content,
        getContent() {
            return this.content;
        },
        setXFrameOptionsMode() {
            return this;
        }
    });
    const context = {
        console: { error() {} },
        PropertiesService: {
            getScriptProperties: () => propertyStore
        },
        CacheService: {
            getScriptCache: () => ({
                get: (key) => cache.get(key) ?? null,
                put: (key, value) => cache.set(key, value)
            })
        },
        LockService: {
            getScriptLock: () => ({
                waitLock() {
                    locked = true;
                },
                hasLock: () => locked,
                releaseLock() {
                    locked = false;
                }
            })
        },
        MailApp: {
            getRemainingDailyQuota: () => 100,
            sendEmail: (options) => emails.push(options)
        },
        ScriptApp: {
            getService: () => ({
                getUrl: () => "https://script.google.com/macros/s/test-deployment/exec"
            })
        },
        HtmlService: {
            XFrameOptionsMode: { ALLOWALL: "ALLOWALL" },
            createHtmlOutput: createOutput
        },
        Utilities: {
            DigestAlgorithm: { SHA_256: "SHA_256" },
            Charset: { UTF_8: "UTF_8" },
            computeDigest(_algorithm, value) {
                return [...createHash("sha256").update(String(value)).digest()]
                    .map((byte) => byte > 127 ? byte - 256 : byte);
            },
            getUuid() {
                uuidCounter += 1;
                return `00000000-0000-4000-8000-${uuidCounter.toString(16).padStart(12, "0")}`;
            },
            formatDate: () => "August 2, 2026 at 9:30 AM"
        }
    };

    vm.runInNewContext(`${backend}
globalThis.reviewApi = {
  submit: handleReviewSubmission_,
  moderate: handleReviewModeration_,
  list: getPublishedReviews_,
  get: doGet
};`, context);

    return { api: context.reviewApi, emails, properties };
}

const validReview = Object.freeze({
    submissionType: "review",
    reviewName: "Avery & Co.",
    reviewEmail: "hello@example.com",
    reviewCompany: "Northstar Studio",
    reviewTitle: "Changed our visual direction",
    reviewRating: "5",
    reviewFeedback: "Jerome translated our goals into a clear and memorable visual system.",
    reviewConsent: "yes",
    reviewWebsite: ""
});

function moderationLink(emailBody, label) {
    const match = emailBody.match(new RegExp(`${label}:\\n(https://[^\\n]+)`, "u"));
    assert.ok(match, `${label} link should be present`);
    return new URL(match[1]);
}

test("review submission stores a private pending record and emails a branded moderation preview", () => {
    const { api, emails, properties } = createReviewBackend();
    const response = api.submit({ ...validReview });

    assert.match(response.getContent(), /review-result/u);
    assert.match(response.getContent(), /sent to Jerome for approval/u);
    assert.equal(emails.length, 1);
    assert.match(emails[0].subject, /5-star website review/u);
    assert.match(emails[0].htmlBody, /New Website Review/u);
    assert.match(emails[0].htmlBody, /Accept &amp; Post/u);
    assert.match(emails[0].htmlBody, /Decline &amp; Delete/u);
    assert.match(emails[0].htmlBody, /Avery &amp; Co\./u);

    const reviewKeys = [...properties.keys()].filter((key) => /^review:[a-f0-9]{32}$/u.test(key));
    assert.equal(reviewKeys.length, 1);
    const storedReview = JSON.parse(properties.get(reviewKeys[0]));
    assert.equal(storedReview.status, "pending");
    assert.equal(storedReview.email, "hello@example.com");
    assert.ok(storedReview.tokenHash);
    assert.deepEqual(JSON.parse(JSON.stringify(api.list())), []);
});

test("Accept and Post publishes only public fields and makes the secure link single-use", () => {
    const { api, emails, properties } = createReviewBackend();
    api.submit({ ...validReview });
    const approveUrl = moderationLink(emails[0].body, "ACCEPT AND POST");
    const request = Object.fromEntries(approveUrl.searchParams);
    const moderationPage = api.moderate(request);

    assert.match(moderationPage.getContent(), /Review accepted and posted/u);
    const published = JSON.parse(JSON.stringify(api.list()));
    assert.equal(published.length, 1);
    assert.equal(published[0].name, "Avery & Co.");
    assert.equal(published[0].rating, 5);
    assert.equal(Object.hasOwn(published[0], "email"), false);

    const storedReview = JSON.parse(properties.get(`review:${published[0].id}`));
    assert.equal(Object.hasOwn(storedReview, "email"), false);
    assert.equal(Object.hasOwn(storedReview, "tokenHash"), false);
    assert.match(api.moderate(request).getContent(), /Review already handled/u);

    const publicResponse = api.get({ parameter: { mode: "reviews" } }).getContent();
    assert.match(publicResponse, /Published reviews are ready/u);
    assert.doesNotMatch(publicResponse, /hello@example\.com/u);
});

test("Decline and Delete permanently removes a pending review", () => {
    const { api, emails, properties } = createReviewBackend();
    api.submit({ ...validReview });
    const rejectUrl = moderationLink(emails[0].body, "DECLINE AND DELETE");
    const request = Object.fromEntries(rejectUrl.searchParams);
    const moderationPage = api.moderate(request);

    assert.match(moderationPage.getContent(), /Review declined and deleted/u);
    assert.deepEqual(JSON.parse(JSON.stringify(api.list())), []);
    assert.equal([...properties.keys()].some((key) => /^review:[a-f0-9]{32}$/u.test(key)), false);
});

test("tampered moderation tokens cannot publish a pending review", () => {
    const { api, emails } = createReviewBackend();
    api.submit({ ...validReview });
    const approveUrl = moderationLink(emails[0].body, "ACCEPT AND POST");
    const request = Object.fromEntries(approveUrl.searchParams);
    request.reviewToken = `${request.reviewToken.slice(0, -1)}f`;

    assert.match(api.moderate(request).getContent(), /Invalid moderation link/u);
    assert.deepEqual(JSON.parse(JSON.stringify(api.list())), []);
});

test("invalid reviews are rejected before storage or email delivery", () => {
    const { api, emails, properties } = createReviewBackend();
    const response = api.submit({
        ...validReview,
        reviewRating: "6",
        reviewConsent: ""
    });

    assert.match(response.getContent(), /complete every required review field/u);
    assert.equal(emails.length, 0);
    assert.equal(properties.size, 0);
});

test("review email previews escape submitted markup", () => {
    const { api, emails } = createReviewBackend();
    api.submit({
        ...validReview,
        reviewTitle: "<img src=x onerror=alert(1)>",
        reviewFeedback: "Great work <script>alert('no')</script>"
    });

    assert.match(emails[0].htmlBody, /&lt;img src=x onerror=alert\(1\)&gt;/u);
    assert.match(emails[0].htmlBody, /&lt;script&gt;alert\(&#039;no&#039;\)&lt;\/script&gt;/u);
    assert.doesNotMatch(emails[0].htmlBody, /<script>alert/u);
});

test("the review backend uses bounded script storage, locking, and private public projections", () => {
    assert.match(backend, /maxStoredReviews: 80/u);
    assert.match(backend, /PropertiesService\.getScriptProperties\(\)/u);
    assert.match(backend, /LockService\.getScriptLock\(\)/u);
    assert.match(backend, /hashReviewModerationToken_/u);
    assert.match(backend, /delete review\.email/u);
    assert.match(backend, /review\.status === "approved"/u);
    assert.match(backend, /reviewSubmissions: true/u);
});
