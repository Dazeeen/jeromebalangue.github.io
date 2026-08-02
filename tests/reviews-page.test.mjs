import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [html, css, script] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../static/css/main.css", import.meta.url), "utf8"),
    readFile(new URL("../static/js/main.js", import.meta.url), "utf8")
]);

test("the former Thank You navigation slot is a real Reviews page", () => {
    assert.match(html, /href="#reviews"[\s\S]*?data-keyword="Reviews"[\s\S]*?class="toc-sidebar__label">Reviews</u);
    assert.doesNotMatch(html, /href="#thank-you"|class="toc-sidebar__label">Thank You</u);
    assert.match(html, /id="reviews" data-page="reviews"[\s\S]*?aria-labelledby="reviews-title"/u);
    assert.ok(
        html.indexOf('data-page="contact-collaboration"') < html.indexOf('data-page="reviews"'),
        "Reviews should follow Contact & Collaboration"
    );
    assert.match(script, /reviews: "Reviews \| Jerome Balangue"/u);
});

test("the Reviews page has the requested experience and consent fields", () => {
    assert.match(html, /We would love to hear about your experience\./u);
    assert.match(html, /data-review-list aria-live="polite" aria-busy="true"/u);
    assert.match(html, /<form class="review-form"[\s\S]*?name="submissionType" value="review"/u);
    for (const field of [
        "reviewName",
        "reviewEmail",
        "reviewCompany",
        "reviewTitle",
        "reviewRating",
        "reviewFeedback",
        "reviewConsent"
    ]) {
        assert.match(html, new RegExp(`name="${field}"`, "u"));
    }
    assert.match(html, /review-rating-5[\s\S]*?review-rating-4[\s\S]*?review-rating-3[\s\S]*?review-rating-2[\s\S]*?review-rating-1/u);
    assert.match(html, /My email stays private\./u);
    assert.match(html, /iframe name="review-mailer-frame"[\s\S]*?iframe name="reviews-data-frame"/u);
});

test("published reviews render from the trusted Apps Script response without exposing email", () => {
    assert.match(script, /event\.data\.type === "reviews"/u);
    assert.match(script, /event\.data\.reviewSubmissions === true/u);
    assert.match(script, /const renderPublishedReviews = \(reviews\)/u);
    assert.match(script, /reviewCopy\.textContent = feedback/u);
    assert.match(script, /personName\.textContent = name/u);
    assert.match(script, /"★"\.repeat\(rating\)/u);
    assert.match(script, /\?mode=reviews&nonce=\$\{Date\.now\(\)\}/u);
    assert.doesNotMatch(script, /review\?\.email/u);
});

test("review submission uses the existing secure iframe and lower-right toast flow", () => {
    assert.match(script, /reviewForm\?\.addEventListener\("submit"/u);
    assert.match(script, /HTMLFormElement\.prototype\.submit\.call\(reviewForm\)/u);
    assert.match(script, /event\.data\.type === "review-result"/u);
    assert.match(script, /showReviewToast\(successMessage, "success", "Review received", 8000\)/u);
    assert.match(script, /Your review was submitted for Jerome's approval/u);
});

test("the review layout adopts the blue-curtain theme and is responsive", () => {
    assert.match(css, /\.reviews-section\s*\{[\s\S]*?portfolio-background\.png/u);
    assert.match(css, /\.reviews-section__shell\s*\{[\s\S]*?grid-template-columns/u);
    assert.match(css, /\.review-form-card\s*\{[\s\S]*?background: rgba\(248, 250, 254, 0\.97\)/u);
    assert.match(css, /\.review-form__stars input:checked ~ label/u);
    assert.match(css, /\.review-form__rating legend\s*\{[\s\S]*?width: 100%;[\s\S]*?text-align: center;/u);
    assert.match(css, /\.review-form__stars\s*\{[\s\S]*?width: 100%;[\s\S]*?justify-content: center;/u);
    assert.match(css, /\.review-form__stars label\s*\{[\s\S]*?font-size: clamp\(1\.9rem, 2\.5vw, 2\.35rem\);/u);
    assert.match(css, /\.review-form__field input,[\s\S]*?font-size: clamp\(0\.76rem, 0\.9vw, 0\.84rem\);/u);
    assert.match(css, /@media \(max-width: 780px\)[\s\S]*?\.reviews-section__shell/u);
    assert.match(html, /static\/css\/main\.css\?v=1\.0\.49/u);
    assert.match(html, /static\/js\/main\.js\?v=1\.0\.42/u);
});
