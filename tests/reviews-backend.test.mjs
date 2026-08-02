import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const [backend, moderationGateway] = await Promise.all([
    readFile(new URL("../integrations/google-apps-script/contact-mailer/Code.gs", import.meta.url), "utf8"),
    readFile(new URL("../review-moderation.html", import.meta.url), "utf8")
]);

function createReviewBackend({ moderationEnabled = true } = {}) {
    const properties = new Map();
    const cache = new Map();
    const emails = [];
    const foldersById = new Map();
    const filesById = new Map();
    const spreadsheets = new Map();
    let uuidCounter = 0;
    let driveCounter = 0;
    let locked = false;

    const iterator = (items) => {
        let index = 0;
        return {
            hasNext: () => index < items.length,
            next: () => items[index++]
        };
    };
    const createFolder = (name, parent = null) => {
        const id = `folder-${++driveCounter}`;
        const folder = {
            id,
            name,
            parent,
            folders: [],
            files: [],
            getId: () => id,
            getName: () => name,
            getUrl: () => `https://drive.google.com/drive/folders/${id}`,
            getFoldersByName: (targetName) => iterator(folder.folders.filter((child) => child.name === targetName)),
            getFilesByName: (targetName) => iterator(folder.files.filter((file) => file.name === targetName)),
            createFolder(childName) {
                const child = createFolder(childName, folder);
                folder.folders.push(child);
                return child;
            },
            createFile(nameOrBlob, content = "", mimeType = "") {
                const isBlob = typeof nameOrBlob === "object";
                const name = isBlob ? nameOrBlob.getName() : nameOrBlob;
                const id = `file-${++driveCounter}`;
                const file = {
                    id,
                    name,
                    content: isBlob ? nameOrBlob : content,
                    mimeType,
                    parent: folder,
                    getId: () => id,
                    getName: () => name,
                    getUrl: () => `https://drive.google.com/file/d/${id}/view`
                };
                folder.files.push(file);
                filesById.set(id, file);
                return file;
            }
        };
        foldersById.set(id, folder);
        return folder;
    };
    const rootFolder = createFolder("My Drive");
    const createSheet = () => {
        const rows = [];
        return {
            rows,
            name: "Sheet1",
            frozenRows: 0,
            getLastRow: () => rows.length,
            setName(name) {
                this.name = name;
                return this;
            },
            setFrozenRows(count) {
                this.frozenRows = count;
                return this;
            },
            appendRow(values) {
                rows.push([...values]);
                return this;
            },
            deleteRow(rowNumber) {
                rows.splice(rowNumber - 1, 1);
                return this;
            },
            getRange(row, column, rowCount, columnCount) {
                return {
                    getValues() {
                        return Array.from({ length: rowCount }, (_, rowOffset) => (
                            Array.from({ length: columnCount }, (_, columnOffset) => (
                                rows[row - 1 + rowOffset]?.[column - 1 + columnOffset] ?? ""
                            ))
                        ));
                    },
                    setValues(values) {
                        values.forEach((sourceRow, rowOffset) => {
                            const targetIndex = row - 1 + rowOffset;
                            while (rows.length <= targetIndex) rows.push([]);
                            sourceRow.forEach((value, columnOffset) => {
                                rows[targetIndex][column - 1 + columnOffset] = value;
                            });
                        });
                        return this;
                    }
                };
            }
        };
    };
    const createSpreadsheet = (name) => {
        const id = `spreadsheet-${++driveCounter}`;
        const sheet = createSheet();
        const spreadsheet = {
            id,
            name,
            sheet,
            getId: () => id,
            getUrl: () => `https://docs.google.com/spreadsheets/d/${id}/edit`,
            getSheetByName: (sheetName) => sheet.name === sheetName ? sheet : null,
            getSheets: () => [sheet]
        };
        const file = {
            id,
            name,
            spreadsheet,
            parent: rootFolder,
            getId: () => id,
            getName: () => name,
            moveTo(folder) {
                this.parent.files = this.parent.files.filter((entry) => entry !== this);
                folder.files.push(this);
                this.parent = folder;
                return this;
            }
        };
        rootFolder.files.push(file);
        filesById.set(id, file);
        spreadsheets.set(id, spreadsheet);
        return spreadsheet;
    };
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
        DriveApp: {
            getRootFolder: () => rootFolder,
            getFolderById: (id) => {
                if (!foldersById.has(id)) throw new Error("Folder not found");
                return foldersById.get(id);
            },
            getFileById: (id) => {
                if (!filesById.has(id)) throw new Error("File not found");
                return filesById.get(id);
            }
        },
        SpreadsheetApp: {
            create: createSpreadsheet,
            openById: (id) => {
                if (!spreadsheets.has(id)) throw new Error("Spreadsheet not found");
                return spreadsheets.get(id);
            },
            open: (file) => file.spreadsheet
        },
        MimeType: {
            PLAIN_TEXT: "text/plain",
            HTML: "text/html"
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

    const runtimeBackend = moderationEnabled
        ? backend.replace("moderationEnabled: false", "moderationEnabled: true")
        : backend;
    vm.runInNewContext(`${runtimeBackend}
globalThis.reviewApi = {
  submit: handleReviewSubmission_,
  moderate: handleReviewModeration_,
  list: getPublishedReviews_,
  get: doGet,
  setup: setupPortfolioStorage,
  storeInquiry: storeInquiryInDrive_,
  resendPending: resendPendingReviewModerationEmails
};`, context);

    const findFolder = (parent, name) => parent.folders.find((folder) => folder.name === name);
    return {
        api: context.reviewApi,
        emails,
        properties,
        rootFolder,
        findFolder,
        getReviewSheet: () => [...spreadsheets.values()][0]?.sheet ?? null
    };
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

function moderationRequest(url) {
    return Object.fromEntries(new URLSearchParams(url.hash.slice(1)));
}

test("review submission creates the Drive hierarchy, stores a private Sheet row, and emails a preview", () => {
    const backendState = createReviewBackend();
    const { api, emails, rootFolder, findFolder, getReviewSheet } = backendState;
    const response = api.submit({ ...validReview });

    assert.match(response.getContent(), /review-result/u);
    assert.match(response.getContent(), /sent to Jerome for approval/u);
    assert.equal(emails.length, 1);
    assert.match(emails[0].subject, /5-star website review/u);
    assert.match(emails[0].htmlBody, /Accept &amp; Post/u);
    assert.match(emails[0].htmlBody, /Decline &amp; Delete/u);
    assert.match(emails[0].htmlBody, /Avery &amp; Co./u);

    const portfolioFolder = findFolder(rootFolder, "Website Portfolio");
    assert.ok(portfolioFolder);
    assert.ok(findFolder(portfolioFolder, "Inquiries"));
    const reviewsFolder = findFolder(portfolioFolder, "Reviews");
    assert.ok(reviewsFolder);
    assert.equal(reviewsFolder.files[0].name, "Portfolio Reviews");

    const sheet = getReviewSheet();
    assert.deepEqual(sheet.rows[0], [
        "Review ID", "Submitted At", "Name", "Email", "Company", "Title",
        "Rating", "Review", "Status", "Approved At", "Token Hash", "Token Expires At"
    ]);
    assert.equal(sheet.rows[1][2], "Avery & Co.");
    assert.equal(sheet.rows[1][3], "hello@example.com");
    assert.equal(sheet.rows[1][8], "pending");
    assert.ok(sheet.rows[1][10]);
    assert.ok(Date.parse(sheet.rows[1][11]) > Date.now());
    assert.deepEqual(JSON.parse(JSON.stringify(api.list())), []);
});

test("Accept and Post updates the private Sheet row and publishes only public fields", () => {
    const { api, emails, getReviewSheet } = createReviewBackend();
    api.submit({ ...validReview });
    const approveUrl = moderationLink(emails[0].body, "ACCEPT AND POST");
    const request = moderationRequest(approveUrl);
    const moderationPage = api.moderate(request);

    assert.match(moderationPage.getContent(), /Review accepted and posted/u);
    const published = JSON.parse(JSON.stringify(api.list()));
    assert.equal(published.length, 1);
    assert.equal(published[0].name, "Avery & Co.");
    assert.equal(published[0].rating, 5);
    assert.equal(Object.hasOwn(published[0], "email"), false);

    const sheetRow = getReviewSheet().rows[1];
    assert.equal(sheetRow[3], "hello@example.com");
    assert.equal(sheetRow[8], "approved");
    assert.ok(sheetRow[9]);
    assert.equal(sheetRow[10], "");
    assert.match(api.moderate(request).getContent(), /Review already handled/u);

    const publicResponse = api.get({ parameter: { mode: "reviews" } }).getContent();
    assert.match(publicResponse, /Published reviews are ready/u);
    assert.doesNotMatch(publicResponse, /hello@example\.com/u);
});

test("the anonymous public deployment cannot execute a moderation token", () => {
    const { api, emails, getReviewSheet } = createReviewBackend({ moderationEnabled: false });
    api.submit({ ...validReview });
    const approveUrl = moderationLink(emails[0].body, "ACCEPT AND POST");
    const response = api.get({ parameter: moderationRequest(approveUrl) });

    assert.match(response.getContent(), /Owner approval required/u);
    assert.equal(getReviewSheet().rows[1][8], "pending");
});

test("moderation emails use the portfolio gateway without exposing tokens to GitHub requests", () => {
    const { api, emails } = createReviewBackend();
    api.submit({ ...validReview });
    const approveUrl = moderationLink(emails[0].body, "ACCEPT AND POST");
    const rejectUrl = moderationLink(emails[0].body, "DECLINE AND DELETE");

    assert.equal(
        approveUrl.origin + approveUrl.pathname,
        "https://jeromebalangue.github.io/review-moderation.html"
    );
    assert.equal(rejectUrl.origin + rejectUrl.pathname, approveUrl.origin + approveUrl.pathname);
    assert.equal(approveUrl.search, "?v=5");
    assert.equal(moderationRequest(approveUrl).reviewAction, "approve");
    assert.equal(moderationRequest(rejectUrl).reviewAction, "reject");
    assert.doesNotMatch(emails[0].body, /\/macros\/u\/\d+\/s\//u);
});

test("the moderation gateway processes actions anonymously without Google account credentials", () => {
    assert.match(moderationGateway, /window\.location\.hash\.slice\(1\)/u);
    assert.match(moderationGateway, /\^\[a-f0-9\]\{32\}\$/u);
    assert.match(moderationGateway, /\^\[a-f0-9\]\{64\}\$/u);
    assert.doesNotMatch(moderationGateway, /data-confirm/u);
    assert.match(
        moderationGateway,
        /https:\/\/script\.google\.com\/macros\/s\/AKfycbyc81epxNpehBmO-qObFjn76f3UxAPtw1w3_FOHyP6Z67LlSlL0w95nL3pJSbI360-4Vw\/exec/u
    );
    assert.doesNotMatch(moderationGateway, /script\.google\.com\/a\/gmail\.com\/macros/u);
    assert.doesNotMatch(moderationGateway, /https:\/\/accounts\.google\.com\/AccountChooser/u);
    assert.doesNotMatch(moderationGateway, /script\.google\.com\/accounts/u);
    assert.match(moderationGateway, /fetch\(destination\.toString\(\)/u);
    assert.match(moderationGateway, /mode: "no-cors"/u);
    assert.match(moderationGateway, /credentials: "omit"/u);
    assert.match(moderationGateway, /window\.history\.replaceState/u);
    assert.doesNotMatch(moderationGateway, /window\.location\.assign/u);
});

test("pending reviews can receive a rotated replacement moderation link", () => {
    const { api, emails } = createReviewBackend();
    api.submit({ ...validReview });
    const oldApproveUrl = moderationLink(emails[0].body, "ACCEPT AND POST");
    emails.length = 0;

    assert.equal(api.resendPending().resent, 1);
    assert.equal(emails.length, 1);
    const newApproveUrl = moderationLink(emails[0].body, "ACCEPT AND POST");
    assert.notEqual(moderationRequest(newApproveUrl).reviewToken, moderationRequest(oldApproveUrl).reviewToken);
    assert.match(api.moderate(moderationRequest(oldApproveUrl)).getContent(), /Invalid moderation link/u);
    assert.match(api.moderate(moderationRequest(newApproveUrl)).getContent(), /Review accepted and posted/u);
});

test("expired moderation tokens are cleared without publishing the review", () => {
    const { api, emails, getReviewSheet } = createReviewBackend();
    api.submit({ ...validReview });
    const approveUrl = moderationLink(emails[0].body, "ACCEPT AND POST");
    const sheetRow = getReviewSheet().rows[1];
    sheetRow[11] = "2020-01-01T00:00:00.000Z";

    const response = api.moderate(moderationRequest(approveUrl));

    assert.match(response.getContent(), /Moderation link expired/u);
    assert.equal(sheetRow[8], "pending");
    assert.equal(sheetRow[10], "");
    assert.equal(sheetRow[11], "");
    assert.deepEqual(JSON.parse(JSON.stringify(api.list())), []);
});

test("Decline and Delete permanently removes the pending Sheet row", () => {
    const { api, emails, getReviewSheet } = createReviewBackend();
    api.submit({ ...validReview });
    const rejectUrl = moderationLink(emails[0].body, "DECLINE AND DELETE");
    const request = moderationRequest(rejectUrl);
    const moderationPage = api.moderate(request);

    assert.match(moderationPage.getContent(), /Review declined and deleted/u);
    assert.deepEqual(JSON.parse(JSON.stringify(api.list())), []);
    assert.equal(getReviewSheet().rows.length, 1);
});

test("tampered moderation tokens cannot publish a pending review", () => {
    const { api, emails } = createReviewBackend();
    api.submit({ ...validReview });
    const approveUrl = moderationLink(emails[0].body, "ACCEPT AND POST");
    const request = moderationRequest(approveUrl);
    request.reviewToken = `${request.reviewToken.slice(0, -1)}f`;

    assert.match(api.moderate(request).getContent(), /Invalid moderation link/u);
    assert.deepEqual(JSON.parse(JSON.stringify(api.list())), []);
});

test("invalid reviews are rejected before Drive, Sheet, or email writes", () => {
    const { api, emails, properties, rootFolder } = createReviewBackend();
    const response = api.submit({
        ...validReview,
        reviewRating: "6",
        reviewConsent: ""
    });

    assert.match(response.getContent(), /complete every required review field/u);
    assert.equal(emails.length, 0);
    assert.equal(properties.size, 0);
    assert.equal(rootFolder.folders.length, 0);
});

test("review email previews and Sheet cells neutralize submitted formulas and markup", () => {
    const { api, emails, getReviewSheet } = createReviewBackend();
    api.submit({
        ...validReview,
        reviewTitle: "=HYPERLINK(\"bad\")",
        reviewFeedback: "Great work <script>alert('no')</script>"
    });

    assert.match(emails[0].htmlBody, /=HYPERLINK\(&quot;bad&quot;\)/u);
    assert.match(emails[0].htmlBody, /&lt;script&gt;alert\(&#039;no&#039;\)&lt;\/script&gt;/u);
    assert.doesNotMatch(emails[0].htmlBody, /<script>alert/u);
    assert.equal(getReviewSheet().rows[1][5], "'=HYPERLINK(\"bad\")");
});

test("legacy property reviews migrate once into the canonical Google Sheet", () => {
    const { api, properties, getReviewSheet } = createReviewBackend();
    const id = "a".repeat(32);
    properties.set("reviews:index", JSON.stringify([id]));
    properties.set(`review:${id}`, JSON.stringify({
        id,
        name: "Legacy Client",
        email: "",
        company: "",
        title: "Still excellent",
        rating: 5,
        feedback: "Migrated safely.",
        status: "approved",
        createdAt: "2026-07-01T00:00:00.000Z",
        approvedAt: "2026-07-02T00:00:00.000Z",
        tokenHash: ""
    }));

    assert.equal(api.list()[0].name, "Legacy Client");
    assert.equal(getReviewSheet().rows.length, 2);
    assert.equal(properties.get("reviews:migratedToSheet"), "1");
    api.list();
    assert.equal(getReviewSheet().rows.length, 2);
});

test("inquiries store email copies and uploaded documents inside the named client folder", () => {
    const { api, rootFolder, findFolder } = createReviewBackend();
    const blob = {
        name: "creative-brief.pdf",
        getName() {
            return this.name;
        },
        copyBlob() {
            return {
                name: this.name,
                setName(name) {
                    this.name = name;
                    return this;
                },
                getName() {
                    return this.name;
                }
            };
        }
    };

    api.storeInquiry(
        "Avery / Co.",
        new Date("2026-08-02T01:30:00.000Z"),
        [{ name: "creative-brief.pdf", blob }],
        "Plain inquiry email",
        "<html>Branded inquiry email</html>"
    );

    const portfolioFolder = findFolder(rootFolder, "Website Portfolio");
    const inquiriesFolder = findFolder(portfolioFolder, "Inquiries");
    const clientFolder = findFolder(inquiriesFolder, "Avery - Co.");
    assert.ok(clientFolder);
    assert.equal(clientFolder.files.filter((file) => file.name.endsWith(".txt")).length, 1);
    assert.equal(clientFolder.files.filter((file) => file.name.endsWith(".html")).length, 1);
    assert.ok(clientFolder.files.some((file) => file.name === "creative-brief.pdf"));
});

test("the review backend uses locked Drive folders and Sheets with private public projections", () => {
    assert.match(backend, /portfolioFolderName: "Website Portfolio"/u);
    assert.match(backend, /inquiriesFolderName: "Inquiries"/u);
    assert.match(backend, /reviewsFolderName: "Reviews"/u);
    assert.match(backend, /reviewsSpreadsheetName: "Portfolio Reviews"/u);
    assert.match(backend, /webAppUrl: "https:\/\/script\.google\.com\/macros\/s\/AKfycbyKnUg4T1HiVJ3rxeiXGq5hjhtrZvLxFZaZj642kG7YiMdyCUyy6YFeSoxdkJww3HPQMg\/exec"/u);
    assert.match(backend, /moderationGatewayUrl: "https:\/\/jeromebalangue\.github\.io\/review-moderation\.html\?v=5"/u);
    assert.match(backend, /moderationEnabled: false/u);
    assert.match(backend, /moderationTokenLifetimeSeconds: 24 \* 60 \* 60/u);
    assert.match(backend, /if \(!CONTACT_CONFIG\.moderationEnabled\)/u);
    assert.doesNotMatch(backend, /Google will require Jerome's deploying account/u);
    assert.match(backend, /DriveApp\.getRootFolder\(\)/u);
    assert.match(backend, /SpreadsheetApp\.create\(CONTACT_CONFIG\.reviewsSpreadsheetName\)/u);
    assert.match(backend, /LockService\.getScriptLock\(\)/u);
    assert.match(backend, /hashReviewModerationToken_/u);
    assert.match(backend, /review\.status === "approved"/u);
    assert.match(backend, /reviewSubmissions: true/u);
});
