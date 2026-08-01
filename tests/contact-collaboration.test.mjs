import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [html, css, script] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../static/css/main.css", import.meta.url), "utf8"),
    readFile(new URL("../static/js/main.js", import.meta.url), "utf8")
]);

test("Contact & Collaboration is a real navigable page after Why Work With Me", () => {
    assert.match(html, /id="contact-collaboration" data-page="contact-collaboration"/u);
    assert.ok(
        html.indexOf('data-page="why-work-with-me"') < html.indexOf('data-page="contact-collaboration"'),
        "Contact & Collaboration should follow Why Work With Me"
    );
    assert.match(script, /"contact-collaboration": "Contact & Collaboration \| Jerome Balangue"/u);
});

test("the contact page keeps every collaboration offer and direct channel", () => {
    for (const offer of [
        "freelance projects",
        "brand collaborations",
        "video edits",
        "social media design work",
        "creative partnerships"
    ]) {
        assert.match(html.toLowerCase(), new RegExp(offer));
    }

    assert.match(html, /href="mailto:balanguejerome@gmail\.com"/u);
    assert.match(html, /href="tel:\+639085459038"/u);
});

test("the line-style contact form sends through the custom Apps Script mailer", () => {
    assert.match(html, /<form class="contact-form"[\s\S]*?action="https:\/\/script\.google\.com\/macros\/s\/AKfycbxwS5NBw7Lqgjas7Kh7P2QtIq_b2PMLZejBw3RN6jmFLuJ493m_xT1vEsq8akp2TU0F-A\/exec"[\s\S]*?method="POST" target="contact-mailer-frame" data-contact-form>/u);
    assert.match(html, /name="name"[\s\S]*?name="email"[\s\S]*?name="message"/u);
    assert.match(html, /name="_honey"/u);
    assert.match(html, /<iframe name="contact-mailer-frame"[\s\S]*?hidden/u);
    assert.match(script, /contactForm\?\.addEventListener\("submit"/u);
    assert.match(script, /window\.location\.origin !== CONTACT_SITE_ORIGIN/u);
    assert.match(script, /window\.addEventListener\("message"/u);
    assert.match(script, /event\.data\.source !== CONTACT_MAILER_SOURCE/u);
    assert.match(script, /HTMLFormElement\.prototype\.submit\.call\(contactForm\)/u);
    assert.match(script, /contactForm\.dataset\.state = "sending"/u);
    assert.match(script, /contactForm\.dataset\.state = "success"/u);
    assert.match(script, /contactForm\.dataset\.state = "error"/u);
    assert.doesNotMatch(script, /formsubmit\.co/u);
});

test("the reference-inspired composition is responsive and cache-busted", () => {
    assert.match(css, /\.contact-section\s*\{[\s\S]*?repeating-linear-gradient[\s\S]*?portfolio-background\.png/u);
    assert.match(css, /\.contact-intro__shape\s*\{[\s\S]*?border-radius/u);
    assert.match(css, /@media \(max-width: 720px\)\s*\{[\s\S]*?\.contact-section/u);
    assert.match(html, /static\/css\/main\.css\?v=1\.0\.44/u);
    assert.match(html, /static\/js\/main\.js\?v=1\.0\.37/u);
});
