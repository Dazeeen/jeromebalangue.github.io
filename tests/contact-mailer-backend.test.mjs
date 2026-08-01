import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const backend = await readFile(
    new URL("../integrations/google-apps-script/contact-mailer/Code.gs", import.meta.url),
    "utf8"
);

test("the Apps Script mailer produces branded HTML and a plain-text fallback", () => {
    assert.match(backend, /MailApp\.sendEmail\(\{/u);
    assert.match(backend, /htmlBody: createHtmlEmail_/u);
    assert.match(backend, /body: createPlainTextEmail_/u);
    assert.match(backend, /New collaboration inquiry/u);
    assert.match(backend, /replyTo: email/u);
});

test("the Apps Script mailer validates, escapes, and rate-limits submissions", () => {
    assert.match(backend, /isValidEmail_\(email\)/u);
    assert.match(backend, /escapeHtml_\(message\)/u);
    assert.match(backend, /CacheService\.getScriptCache\(\)/u);
    assert.match(backend, /request\._honey/u);
    assert.match(backend, /MailApp\.getRemainingDailyQuota\(\)/u);
});

test("the Apps Script mailer reports results back to the portfolio iframe", () => {
    assert.match(backend, /window\.top\.postMessage/u);
    assert.match(backend, /https:\/\/jeromebalangue\.github\.io/u);
    assert.match(backend, /jerome-portfolio-contact-mailer/u);
});
