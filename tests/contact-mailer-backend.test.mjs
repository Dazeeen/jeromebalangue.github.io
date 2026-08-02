import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const backend = await readFile(
    new URL("../integrations/google-apps-script/contact-mailer/Code.gs", import.meta.url),
    "utf8"
);

function renderEmail(name, email, message, attachmentInfo = null) {
    const context = {};
    vm.runInNewContext(
        `${backend}\nglobalThis.renderContactEmail = createHtmlEmail_;`,
        context
    );
    return context.renderContactEmail(name, email, message, "August 1, 2026 at 2:30 PM", attachmentInfo);
}

function createAttachmentValidator(zipEntries = [], validatorName = "createDocumentAttachment_") {
    const createBlob = (bytes, mimeType = "application/octet-stream", name = "document") => ({
        getBytes: () => [...bytes],
        getDataAsString: () => Buffer.from(bytes.map((byte) => byte & 255)).toString("utf8"),
        getName: () => name,
        getContentType: () => mimeType
    });
    const context = {
        Utilities: {
            base64Decode(value) {
                return [...Buffer.from(value, "base64")].map((byte) => byte > 127 ? byte - 256 : byte);
            },
            newBlob(bytes, mimeType = "application/octet-stream", name = "document") {
                return createBlob(bytes, mimeType, name);
            },
            unzip() {
                return zipEntries.map((entry) => createBlob(
                    [...Buffer.from(entry.contents || "", "utf8")],
                    entry.mimeType,
                    entry.name
                ));
            }
        }
    };
    vm.runInNewContext(
        `${backend}\nglobalThis.validateDocumentAttachment = ${validatorName};`,
        context
    );
    return context.validateDocumentAttachment;
}

test("the Apps Script mailer produces branded HTML and a plain-text fallback", () => {
    assert.match(backend, /MailApp\.sendEmail\(emailOptions\)/u);
    assert.match(backend, /const htmlEmail = createHtmlEmail_/u);
    assert.match(backend, /const plainTextEmail = createPlainTextEmail_/u);
    assert.match(backend, /htmlBody: htmlEmail/u);
    assert.match(backend, /body: plainTextEmail/u);
    assert.match(backend, /New Project<br>Inquiry/u);
    assert.match(backend, /Project brief/u);
    assert.match(backend, /Reply now/u);
    assert.match(backend, /replyTo: email/u);
});

test("the HTML email carries the portfolio blue-curtain theme", () => {
    assert.match(backend, /curtainImageUrl: "https:\/\/jeromebalangue\.github\.io\/static\/media\/images\/site\/portfolio-background\.png"/u);
    assert.match(backend, /background="\$\{curtainImageUrl\}"/u);
    assert.match(backend, /background-image:[^;]*url\(\$\{curtainImageUrl\}\)/u);
    assert.match(backend, /Jerome Balangue Portfolio/u);
    assert.match(backend, /profileImageUrl: "https:\/\/jeromebalangue\.github\.io\/static\/media\/images\/home\/jerome-hero-portrait\.jpg"/u);
    assert.match(backend, /alt="Jerome Balangue"/u);
});

test("the rendered email includes contact details while escaping submitted HTML", () => {
    const html = renderEmail(
        "Avery & Co.",
        "hello@example.com",
        "Brand launch\n<script>alert('no')</script>"
    );

    assert.match(html, /Avery &amp; Co\./u);
    assert.match(html, /mailto:hello@example\.com/u);
    assert.match(html, /Brand launch<br>&lt;script&gt;alert\(&#039;no&#039;\)&lt;\/script&gt;/u);
    assert.doesNotMatch(html, /<script>alert/u);
});

test("the rendered email shows a safely escaped attached-document summary", () => {
    const html = renderEmail(
        "Avery",
        "hello@example.com",
        "Please review the brief.",
        { name: "launch & media.pdf", sizeBytes: 1536 }
    );

    assert.match(html, /Attached document/u);
    assert.match(html, /launch &amp; media\.pdf/u);
    assert.match(html, /2 KB &middot; verified document/u);
});

test("the rendered email lists every attached document with its verified size", () => {
    const html = renderEmail(
        "Avery",
        "hello@example.com",
        "Please review both files.",
        [
            { name: "launch & media.pdf", sizeBytes: 1536 },
            { name: "production-notes.txt", sizeBytes: 3072 }
        ]
    );

    assert.match(html, /Attached documents \(2\)/u);
    assert.match(html, /launch &amp; media\.pdf/u);
    assert.match(html, /production-notes\.txt/u);
    assert.match(html, /3 KB &middot; verified document/u);
});

test("the backend accepts a real PDF signature and rejects an executable renamed as PDF", () => {
    const validateAttachment = createAttachmentValidator();
    const pdf = Buffer.from("%PDF-1.7\nPortfolio brief", "utf8");
    const validAttachment = validateAttachment({
        attachmentName: "creative-brief.pdf",
        attachmentType: "application/pdf",
        attachmentSize: String(pdf.length),
        attachmentData: pdf.toString("base64")
    });

    assert.equal(validAttachment.name, "creative-brief.pdf");
    assert.equal(validAttachment.sizeBytes, pdf.length);

    const executable = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00]);
    assert.throws(() => validateAttachment({
        attachmentName: "not-a-document.pdf",
        attachmentType: "application/pdf",
        attachmentSize: String(executable.length),
        attachmentData: executable.toString("base64")
    }), /UNSUPPORTED_ATTACHMENT/u);
});

test("the backend verifies Office package structure and rejects embedded macro payloads", () => {
    const packageBytes = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    const request = {
        attachmentName: "campaign-plan.docx",
        attachmentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        attachmentSize: String(packageBytes.length),
        attachmentData: packageBytes.toString("base64")
    };
    const validateDocument = createAttachmentValidator([
        { name: "[Content_Types].xml" },
        { name: "word/document.xml" }
    ]);

    assert.equal(validateDocument(request).name, "campaign-plan.docx");

    const validateMacroPackage = createAttachmentValidator([
        { name: "[Content_Types].xml" },
        { name: "word/document.xml" },
        { name: "word/vbaProject.bin" }
    ]);
    assert.throws(() => validateMacroPackage(request), /INVALID_ATTACHMENT/u);
});

test("the backend accepts multiple documents and enforces the 10-document limit", () => {
    const validateAttachments = createAttachmentValidator([], "createDocumentAttachments_");
    const firstPdf = Buffer.from("%PDF-1.7\nFirst brief", "utf8");
    const secondPdf = Buffer.from("%PDF-1.7\nSecond brief", "utf8");
    const attachments = validateAttachments({
        attachmentsJson: JSON.stringify([
            {
                name: "first-brief.pdf",
                type: "application/pdf",
                size: firstPdf.length,
                data: firstPdf.toString("base64")
            },
            {
                name: "second-brief.pdf",
                type: "application/pdf",
                size: secondPdf.length,
                data: secondPdf.toString("base64")
            }
        ])
    });

    assert.equal(attachments.length, 2);
    assert.equal(attachments[0].name, "first-brief.pdf");
    assert.equal(attachments[1].name, "second-brief.pdf");

    assert.throws(() => validateAttachments({
        attachmentsJson: JSON.stringify(Array.from({ length: 11 }, (_, index) => ({
            name: `brief-${index}.pdf`
        })))
    }), /TOO_MANY_ATTACHMENTS/u);
});

test("the attachment backend has a strict document allowlist and package checks", () => {
    for (const extension of ["pdf", "docx", "xlsx", "pptx", "odt", "ods", "odp", "rtf", "txt", "csv"]) {
        assert.match(backend, new RegExp(`${extension}: Object\\.freeze`));
    }
    assert.match(backend, /maxAttachments: 10/u);
    assert.match(backend, /maxAttachmentBytes: 5 \* 1024 \* 1024/u);
    assert.match(backend, /maxTotalAttachmentBytes: 20 \* 1024 \* 1024/u);
    assert.match(backend, /hasExecutableSignature_\(bytes\)/u);
    assert.match(backend, /vbaProject\\\.bin/u);
    assert.match(backend, /Utilities\.unzip\(blob\)/u);
    assert.match(backend, /emailOptions\.attachments = attachments\.map/u);
    assert.match(backend, /entries\.length > CONTACT_CONFIG\.maxAttachments/u);
    assert.match(backend, /totalBytes > CONTACT_CONFIG\.maxTotalAttachmentBytes/u);
    assert.doesNotMatch(backend, /^\s*(?:exe|msi|bat|cmd|ps1): Object\.freeze/gmu);
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
    assert.match(backend, /setXFrameOptionsMode\(HtmlService\.XFrameOptionsMode\.ALLOWALL\)/u);
    assert.match(backend, /https:\/\/jeromebalangue\.github\.io/u);
    assert.match(backend, /jerome-portfolio-contact-mailer/u);
});

test("the Apps Script mailer advertises attachment support before the form enables it", () => {
    assert.match(backend, /type: "capabilities"/u);
    assert.match(backend, /documentAttachments: true/u);
    assert.match(backend, /maxAttachmentBytes: CONTACT_CONFIG\.maxAttachmentBytes/u);
    assert.match(backend, /maxAttachments: CONTACT_CONFIG\.maxAttachments/u);
    assert.match(backend, /maxTotalAttachmentBytes: CONTACT_CONFIG\.maxTotalAttachmentBytes/u);
    assert.match(backend, /type: String\(payload\.type \|\| "result"\)/u);
});

test("validated inquiries are archived in Jerome's Drive before email delivery", () => {
    assert.match(backend, /portfolioFolderName: "Website Portfolio"/u);
    assert.match(backend, /inquiriesFolderName: "Inquiries"/u);
    assert.match(backend, /storeInquiryInDrive_\([\s\S]*?MailApp\.sendEmail\(emailOptions\)/u);
    assert.match(backend, /clientFolder\.createFile\(recordBaseName \+ "\.txt"/u);
    assert.match(backend, /clientFolder\.createFile\(recordBaseName \+ "\.html"/u);
    assert.match(backend, /clientFolder\.createFile\(attachment\.blob\.copyBlob\(\)\.setName\(attachment\.name\)\)/u);
});
