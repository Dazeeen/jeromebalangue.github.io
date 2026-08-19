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
    assert.match(html, /<form class="contact-form"[\s\S]*?action="https:\/\/script\.google\.com\/macros\/s\/AKfycbyKnUg4T1HiVJ3rxeiXGq5hjhtrZvLxFZaZj642kG7YiMdyCUyy6YFeSoxdkJww3HPQMg\/exec"[\s\S]*?method="POST" target="contact-mailer-frame" data-contact-form>/u);
    assert.match(html, /name="name"[\s\S]*?name="email"[\s\S]*?name="message"/u);
    assert.match(html, /data-contact-dropzone[\s\S]*?Drag &amp; drop documents here[\s\S]*?click to choose files/u);
    assert.match(html, /id="contact-attachment" type="file" multiple hidden[\s\S]*?accept="\.pdf,\.docx,\.xlsx,\.pptx,\.odt,\.ods,\.odp,\.rtf,\.txt,\.csv"/u);
    assert.match(html, /name="attachmentsJson" data-contact-attachments-json/u);
    assert.match(html, /data-contact-attachment-list[\s\S]*?data-contact-upload-progress[\s\S]*?role="progressbar"/u);
    assert.match(html, /name="_honey"/u);
    assert.match(html, /<iframe name="contact-mailer-frame"[\s\S]*?hidden/u);
    assert.match(html, /<iframe name="contact-mailer-capability-frame"[\s\S]*?hidden/u);
    assert.match(script, /contactForm\?\.addEventListener\("submit"/u);
    assert.match(script, /window\.location\.origin !== CONTACT_SITE_ORIGIN/u);
    assert.match(script, /window\.addEventListener\("message"/u);
    assert.match(script, /event\.data\.source !== CONTACT_MAILER_SOURCE/u);
    assert.match(script, /event\.data\.type === "capabilities"/u);
    assert.match(script, /event\.data\.documentAttachments === true/u);
    assert.match(script, /const setContactAttachmentsLocked = \(locked\)/u);
    assert.match(script, /event\.data\.type === "result"/u);
    assert.doesNotMatch(script, /event\.source === contactMailer/u);
    assert.match(script, /HTMLFormElement\.prototype\.submit\.call\(contactForm\)/u);
    assert.match(script, /contactForm\.dataset\.state = "sending"/u);
    assert.match(script, /contactForm\.dataset\.state = "success"/u);
    assert.match(script, /contactForm\.dataset\.state = "error"/u);
    assert.match(script, /contactForm\.dataset\.state = "pending"/u);
    assert.doesNotMatch(script, /The email service took too long to respond\. Please try again\./u);
    assert.match(script, /CONTACT_ATTACHMENT_MAX_COUNT = 10/u);
    assert.match(script, /CONTACT_ATTACHMENT_MAX_BYTES = 5 \* 1024 \* 1024/u);
    assert.match(script, /CONTACT_ATTACHMENTS_MAX_TOTAL_BYTES = 20 \* 1024 \* 1024/u);
    assert.match(script, /FileReader\(\)/u);
    assert.match(script, /reader\.addEventListener\("progress"/u);
    assert.match(script, /readAsDataURL\(file\)/u);
    assert.match(script, /const addContactAttachments = \(files\)/u);
    assert.match(script, /contactAttachmentDropzone\?\.addEventListener\("dragover"/u);
    assert.match(script, /contactAttachmentDropzone\?\.addEventListener\("drop"/u);
    assert.match(script, /contactAttachmentsJson\.value = JSON\.stringify\(encodedAttachments\)/u);
    assert.doesNotMatch(html, /\.exe|\.msi|\.bat|\.cmd|\.ps1|\.app/u);
    assert.doesNotMatch(script, /formsubmit\.co/u);
});

test("contact statuses use accessible lower-right toasts", () => {
    assert.match(html, /class="site-toast-stack" data-site-toast-stack aria-live="polite"/u);
    assert.match(script, /SITE_TOAST_MAX_COUNT = 3/u);
    assert.match(script, /showContactToast\(successMessage, "success", "Message sent"\)/u);
    assert.match(script, /showContactToast\(errorMessage, "error", "Message not sent", 8000\)/u);
    assert.match(css, /\.site-toast-stack\s*\{[\s\S]*?position: fixed;[\s\S]*?right:[\s\S]*?bottom:/u);
    assert.match(css, /\.site-toast\.is-leaving/u);
});

test("the reference-inspired composition is responsive and cache-busted", () => {
    assert.match(css, /\.contact-section\s*\{[\s\S]*?repeating-linear-gradient[\s\S]*?drive\.google\.com\/thumbnail/u);
    assert.match(css, /\.contact-section\s*\{[\s\S]*?height: 100svh;[\s\S]*?min-height: 0;[\s\S]*?overflow: hidden;/u);
    assert.match(css, /\.contact-section__shell\s*\{[\s\S]*?height: 100%;[\s\S]*?min-height: 0;/u);
    assert.match(css, /\.contact-intro__shape\s*\{[\s\S]*?border-radius/u);
    assert.match(css, /@media \(max-width: 720px\)\s*\{[\s\S]*?\.contact-section\s*\{[\s\S]*?height: 100svh;[\s\S]*?min-height: 0;[\s\S]*?overflow: hidden;/u);
    assert.match(css, /@media \(max-width: 720px\)[\s\S]*?\.contact-section__shell\s*\{[\s\S]*?height: 100%;[\s\S]*?min-height: 0;/u);
    assert.match(css, /\.contact-form__dropzone/u);
    assert.match(css, /\.contact-form__file-item/u);
    assert.match(css, /\.contact-form__upload-progress-track/u);
    assert.match(css, /@keyframes contact-upload-indeterminate/u);
    assert.match(html, /static\/css\/main\.css\?v=1\.0\.57/u);
    assert.match(html, /static\/js\/main\.js\?v=1\.0\.51/u);
});
