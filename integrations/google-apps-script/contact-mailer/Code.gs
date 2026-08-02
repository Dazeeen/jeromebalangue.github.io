const CONTACT_CONFIG = Object.freeze({
  destinationEmail: "balanguejerome@gmail.com",
  allowedOrigin: "https://jeromebalangue.github.io",
  responseSource: "jerome-portfolio-contact-mailer",
  senderName: "Jerome Balangue Portfolio",
  siteUrl: "https://jeromebalangue.github.io/",
  curtainImageUrl: "https://jeromebalangue.github.io/static/media/images/site/portfolio-background.png",
  profileImageUrl: "https://jeromebalangue.github.io/static/media/images/home/jerome-hero-portrait.jpg",
  rateLimitSeconds: 60,
  maxNameLength: 100,
  maxEmailLength: 254,
  maxMessageLength: 5000,
  maxAttachmentBytes: 5 * 1024 * 1024,
  maxUncompressedAttachmentBytes: 25 * 1024 * 1024
});

const CONTACT_DOCUMENT_TYPES = Object.freeze({
  pdf: Object.freeze({ mimeType: "application/pdf", kind: "pdf" }),
  docx: Object.freeze({
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    kind: "zip",
    requiredEntries: Object.freeze(["[Content_Types].xml", "word/document.xml"])
  }),
  xlsx: Object.freeze({
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    kind: "zip",
    requiredEntries: Object.freeze(["[Content_Types].xml", "xl/workbook.xml"])
  }),
  pptx: Object.freeze({
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    kind: "zip",
    requiredEntries: Object.freeze(["[Content_Types].xml", "ppt/presentation.xml"])
  }),
  odt: Object.freeze({
    mimeType: "application/vnd.oasis.opendocument.text",
    kind: "zip",
    requiredEntries: Object.freeze(["mimetype", "content.xml"])
  }),
  ods: Object.freeze({
    mimeType: "application/vnd.oasis.opendocument.spreadsheet",
    kind: "zip",
    requiredEntries: Object.freeze(["mimetype", "content.xml"])
  }),
  odp: Object.freeze({
    mimeType: "application/vnd.oasis.opendocument.presentation",
    kind: "zip",
    requiredEntries: Object.freeze(["mimetype", "content.xml"])
  }),
  rtf: Object.freeze({ mimeType: "application/rtf", kind: "rtf" }),
  txt: Object.freeze({ mimeType: "text/plain", kind: "text" }),
  csv: Object.freeze({ mimeType: "text/csv", kind: "text" })
});

function doGet() {
  return createBrowserResponse_({
    type: "capabilities",
    success: true,
    message: "The Jerome portfolio contact mailer is ready.",
    documentAttachments: true,
    maxAttachmentBytes: CONTACT_CONFIG.maxAttachmentBytes
  });
}

function doPost(event) {
  try {
    const request = readRequest_(event);

    // Silently accept bot-filled honeypots without sending an email.
    if (cleanText_(request._honey, 200)) {
      return createBrowserResponse_({
        success: true,
        message: "Your message was submitted successfully."
      });
    }

    const name = cleanText_(request.name, CONTACT_CONFIG.maxNameLength);
    const email = cleanText_(request.email, CONTACT_CONFIG.maxEmailLength).toLowerCase();
    const message = cleanText_(request.message, CONTACT_CONFIG.maxMessageLength);

    if (!name || !isValidEmail_(email) || !message) {
      return createBrowserResponse_({
        success: false,
        message: "Please provide a valid name, email address, and project message."
      });
    }

    enforceRateLimit_(email);

    if (MailApp.getRemainingDailyQuota() < 1) {
      throw new Error("DAILY_QUOTA_REACHED");
    }

    const attachment = createDocumentAttachment_(request);

    const submittedAt = Utilities.formatDate(
      new Date(),
      "Asia/Manila",
      "MMMM d, yyyy 'at' h:mm a"
    );
    const subject = `New portfolio inquiry from ${name}`;
    const attachmentInfo = attachment ? {
      name: attachment.name,
      sizeBytes: attachment.sizeBytes
    } : null;

    const emailOptions = {
      to: CONTACT_CONFIG.destinationEmail,
      subject,
      name: CONTACT_CONFIG.senderName,
      replyTo: email,
      body: createPlainTextEmail_(name, email, message, submittedAt, attachmentInfo),
      htmlBody: createHtmlEmail_(name, email, message, submittedAt, attachmentInfo)
    };
    if (attachment) emailOptions.attachments = [attachment.blob];

    MailApp.sendEmail(emailOptions);

    return createBrowserResponse_({
      success: true,
      message: "Thank you! Your message was sent to Jerome."
    });
  } catch (error) {
    console.error(error);
    const errorMessages = {
      RATE_LIMITED: "Please wait a minute before sending another message.",
      ATTACHMENT_TOO_LARGE: "Please attach a document no larger than 5 MB.",
      UNSUPPORTED_ATTACHMENT: "Only PDF, DOCX, XLSX, PPTX, ODT, ODS, ODP, RTF, TXT, or CSV documents are allowed.",
      INVALID_ATTACHMENT: "The attached file could not be verified as a safe document."
    };
    return createBrowserResponse_({
      success: false,
      message: errorMessages[error && error.message]
        || "The email service is temporarily unavailable. Please try again later."
    });
  }
}

function readRequest_(event) {
  if (!event) return {};

  const contentType = String(event.postData && event.postData.type || "").toLowerCase();
  if (contentType.indexOf("application/json") !== -1) {
    try {
      return JSON.parse(event.postData.contents || "{}");
    } catch (error) {
      return {};
    }
  }

  return event.parameter || {};
}

function cleanText_(value, maxLength) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function enforceRateLimit_(email) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    email,
    Utilities.Charset.UTF_8
  );
  const key = "contact:" + digest.map(function (byte) {
    return (byte + 256).toString(16).slice(-2);
  }).join("");
  const cache = CacheService.getScriptCache();

  if (cache.get(key)) throw new Error("RATE_LIMITED");
  cache.put(key, "1", CONTACT_CONFIG.rateLimitSeconds);
}

function createDocumentAttachment_(request) {
  const rawName = String(request.attachmentName || "").trim();
  const rawType = String(request.attachmentType || "").trim().toLowerCase();
  const rawSize = String(request.attachmentSize || "").trim();
  const rawData = String(request.attachmentData || "").trim();

  if (!rawName && !rawType && !rawSize && !rawData) return null;
  if (!rawName || !rawType || !rawSize || !rawData) throw new Error("INVALID_ATTACHMENT");

  const fileName = cleanAttachmentName_(rawName);
  const extension = getFileExtension_(fileName);
  const documentType = Object.prototype.hasOwnProperty.call(CONTACT_DOCUMENT_TYPES, extension)
    ? CONTACT_DOCUMENT_TYPES[extension]
    : null;
  const reportedSize = Number(rawSize);

  if (!documentType || rawType !== documentType.mimeType) {
    throw new Error("UNSUPPORTED_ATTACHMENT");
  }
  if (!Number.isInteger(reportedSize) || reportedSize < 1) {
    throw new Error("INVALID_ATTACHMENT");
  }
  if (reportedSize > CONTACT_CONFIG.maxAttachmentBytes) {
    throw new Error("ATTACHMENT_TOO_LARGE");
  }

  const maximumBase64Length = Math.ceil(CONTACT_CONFIG.maxAttachmentBytes / 3) * 4 + 4;
  if (rawData.length > maximumBase64Length) throw new Error("ATTACHMENT_TOO_LARGE");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(rawData)) throw new Error("INVALID_ATTACHMENT");

  let bytes;
  try {
    bytes = Utilities.base64Decode(rawData);
  } catch (error) {
    throw new Error("INVALID_ATTACHMENT");
  }

  if (bytes.length !== reportedSize) throw new Error("INVALID_ATTACHMENT");
  if (bytes.length > CONTACT_CONFIG.maxAttachmentBytes) throw new Error("ATTACHMENT_TOO_LARGE");
  if (hasExecutableSignature_(bytes)) throw new Error("UNSUPPORTED_ATTACHMENT");

  const blob = Utilities.newBlob(bytes, documentType.mimeType, fileName);
  if (!isVerifiedDocument_(blob, bytes, documentType)) {
    throw new Error("INVALID_ATTACHMENT");
  }

  return {
    blob,
    name: fileName,
    sizeBytes: bytes.length
  };
}

function cleanAttachmentName_(value) {
  const fileName = String(value || "")
    .replace(/^.*[\\/]/, "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 180);
  if (!fileName || fileName === "." || fileName === "..") {
    throw new Error("INVALID_ATTACHMENT");
  }
  return fileName;
}

function getFileExtension_(fileName) {
  const match = String(fileName).toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : "";
}

function unsignedByte_(value) {
  return Number(value) & 255;
}

function startsWithBytes_(bytes, signature) {
  if (bytes.length < signature.length) return false;
  return signature.every(function (value, index) {
    return unsignedByte_(bytes[index]) === value;
  });
}

function hasExecutableSignature_(bytes) {
  const executableSignatures = [
    [0x4d, 0x5a],
    [0x7f, 0x45, 0x4c, 0x46],
    [0xfe, 0xed, 0xfa, 0xce],
    [0xfe, 0xed, 0xfa, 0xcf],
    [0xce, 0xfa, 0xed, 0xfe],
    [0xcf, 0xfa, 0xed, 0xfe],
    [0xca, 0xfe, 0xba, 0xbe],
    [0x4c, 0x00, 0x00, 0x00, 0x01, 0x14, 0x02, 0x00],
    [0x23, 0x21]
  ];
  return executableSignatures.some(function (signature) {
    return startsWithBytes_(bytes, signature);
  });
}

function isVerifiedDocument_(blob, bytes, documentType) {
  if (documentType.kind === "pdf") {
    return startsWithBytes_(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  }
  if (documentType.kind === "rtf") {
    return bytesToAscii_(bytes, 12).indexOf("{\\rtf") === 0;
  }
  if (documentType.kind === "text") return isPlainTextDocument_(bytes);
  if (documentType.kind === "zip") return isVerifiedDocumentPackage_(blob, documentType);
  return false;
}

function isPlainTextDocument_(bytes) {
  return bytes.every(function (value) {
    const byte = unsignedByte_(value);
    return byte >= 32 || byte === 9 || byte === 10 || byte === 13 || byte >= 128;
  });
}

function bytesToAscii_(bytes, maximumLength) {
  return bytes.slice(0, maximumLength).map(function (value) {
    return String.fromCharCode(unsignedByte_(value));
  }).join("");
}

function isVerifiedDocumentPackage_(blob, documentType) {
  if (!startsWithBytes_(blob.getBytes(), [0x50, 0x4b, 0x03, 0x04])) return false;

  let entries;
  try {
    entries = Utilities.unzip(blob);
  } catch (error) {
    return false;
  }

  const blockedEntryPattern = /(^|\/)(vbaProject\.bin|[^/]+\.(?:exe|com|dll|jar|msi|bat|cmd|ps1|scr|app))$/i;
  const entryNames = [];
  let packageMimeType = "";
  let totalBytes = 0;

  for (let index = 0; index < entries.length; index += 1) {
    const entryName = String(entries[index].getName() || "").replace(/\\/g, "/");
    if (blockedEntryPattern.test(entryName)) return false;
    entryNames.push(entryName);
    if (entryName === "mimetype") {
      packageMimeType = entries[index].getDataAsString().trim();
    }
    totalBytes += entries[index].getBytes().length;
    if (totalBytes > CONTACT_CONFIG.maxUncompressedAttachmentBytes) return false;
  }

  const hasRequiredEntries = documentType.requiredEntries.every(function (requiredEntry) {
    return entryNames.indexOf(requiredEntry) !== -1;
  });
  if (!hasRequiredEntries) return false;
  return entryNames.indexOf("mimetype") === -1 || packageMimeType === documentType.mimeType;
}

function formatAttachmentSize_(bytes) {
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createPlainTextEmail_(name, email, message, submittedAt, attachmentInfo) {
  const lines = [
    "NEW PORTFOLIO COLLABORATION INQUIRY",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Submitted: ${submittedAt} (Asia/Manila)`,
    "",
    "PROJECT DETAILS",
    message
  ];
  if (attachmentInfo) {
    lines.push(
      "",
      `ATTACHED DOCUMENT: ${attachmentInfo.name} (${formatAttachmentSize_(attachmentInfo.sizeBytes)})`
    );
  }
  lines.push("", "Reply to this email to respond directly to the sender.");
  return lines.join("\n");
}

function createHtmlEmail_(name, email, message, submittedAt, attachmentInfo) {
  const safeName = escapeHtml_(name);
  const safeEmail = escapeHtml_(email);
  const safeMessage = escapeHtml_(message).replace(/\r?\n/g, "<br>");
  const safeSubmittedAt = escapeHtml_(submittedAt);
  const safeInitial = escapeHtml_(name.charAt(0).toUpperCase());
  const replySubject = escapeHtml_(encodeURIComponent(`Re: Portfolio inquiry from ${name}`));
  const curtainImageUrl = CONTACT_CONFIG.curtainImageUrl;
  const profileImageUrl = CONTACT_CONFIG.profileImageUrl;
  const siteUrl = CONTACT_CONFIG.siteUrl;
  const attachmentBlock = attachmentInfo ? `
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:14px;">
                <tr>
                  <td style="padding:14px 16px;border:1px solid #b9ccec;border-radius:12px;background:#eaf1ff;color:#18345f;">
                    <div style="font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#3975d5;">Attached document</div>
                    <div style="margin-top:5px;font-size:13px;font-weight:700;line-height:1.5;color:#14294c;">${escapeHtml_(attachmentInfo.name)}</div>
                    <div style="margin-top:2px;font-size:11px;color:#617695;">${escapeHtml_(formatAttachmentSize_(attachmentInfo.sizeBytes))} &middot; verified document</div>
                  </td>
                </tr>
              </table>` : "";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @media only screen and (max-width:620px) {
      .email-shell { width:100% !important; }
      .email-pad { padding-left:22px !important; padding-right:22px !important; }
      .email-title { font-size:34px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#02050c;font-family:Arial,Helvetica,sans-serif;color:#eef4ff;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safeName} sent a new project inquiry through your portfolio.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" background="${curtainImageUrl}" style="width:100%;background-color:#02050c;background-image:url(${curtainImageUrl});background-position:center top;background-size:cover;padding:34px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" class="email-shell" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;border:1px solid #284475;background:#07101f;border-radius:24px;overflow:hidden;box-shadow:0 22px 60px rgba(0,0,0,.5);">
          <tr>
            <td class="email-pad" background="${curtainImageUrl}" style="padding:36px 42px 40px;background-color:#06122a;background-image:linear-gradient(90deg,rgba(1,5,12,.42),rgba(20,75,180,.28)),url(${curtainImageUrl});background-position:center;background-size:cover;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td width="64" height="64" align="center" valign="middle" style="width:64px;height:64px;border:2px solid #9bc1ff;border-radius:50%;background:#0d5fe9;box-shadow:0 0 0 7px rgba(63,126,255,.14);overflow:hidden;">
                    <img src="${profileImageUrl}" width="64" height="64" alt="Jerome Balangue" style="display:block;width:64px;height:64px;border:0;border-radius:50%;object-fit:cover;object-position:center 24%;">
                  </td>
                </tr>
              </table>
              <div style="margin-top:24px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#94b9ff;">Jerome Balangue Portfolio</div>
              <h1 class="email-title" style="margin:13px 0 10px;font-size:42px;line-height:1.05;font-weight:700;letter-spacing:-1.5px;color:#ffffff;">New Project<br>Inquiry</h1>
              <p style="margin:0 auto;max-width:430px;font-size:14px;line-height:1.7;color:#d4e3ff;">A fresh creative opportunity has arrived through your portfolio website.</p>
            </td>
          </tr>
          <tr>
            <td class="email-pad" style="padding:34px 42px 38px;background:#0b46a0;">
              <div style="font-size:19px;font-weight:700;line-height:1.4;color:#ffffff;">Hi Jerome,</div>
              <p style="margin:10px 0 26px;font-size:14px;line-height:1.75;color:#dfebff;">Someone is interested in working with you. Here are the details they submitted so you can review the opportunity and reply directly.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:20px;border:1px solid #5f91e4;border-radius:18px;background:#123e88;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="58" valign="middle" style="width:58px;">
                          <div style="width:48px;height:48px;line-height:48px;border-radius:50%;background:#ffffff;color:#1559c7;font-size:20px;font-weight:800;text-align:center;">${safeInitial}</div>
                        </td>
                        <td class="sender-cell" valign="middle">
                          <div style="font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#aecdff;">Potential client</div>
                          <div style="margin-top:5px;font-size:20px;font-weight:700;color:#ffffff;">${safeName}</div>
                          <a href="mailto:${safeEmail}" style="display:inline-block;margin-top:5px;color:#d9e8ff;text-decoration:underline;">${safeEmail}</a>
                        </td>
                        <td class="reply-cell" align="right" valign="middle">
                          <a href="mailto:${safeEmail}?subject=${replySubject}" style="display:inline-block;padding:12px 18px;border:1px solid #ffffff;border-radius:999px;background:#ffffff;color:#104fae;font-size:11px;font-weight:800;letter-spacing:.8px;text-decoration:none;text-transform:uppercase;white-space:nowrap;">Reply now</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="email-pad" style="padding:36px 42px 38px;background:#f4f7fc;color:#0a1630;">
              <div style="font-size:10px;font-weight:800;letter-spacing:2.5px;text-align:center;text-transform:uppercase;color:#3975d5;">Project brief</div>
              <h2 style="margin:10px 0 22px;font-size:25px;line-height:1.25;text-align:center;color:#07152e;">What would they like to create?</h2>
              <div style="padding:22px 24px;border:1px solid #cad8ef;border-radius:16px;background:#ffffff;font-size:15px;line-height:1.75;color:#263852;box-shadow:0 8px 24px rgba(21,62,126,.08);">${safeMessage}</div>
              ${attachmentBlock}
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                <tr>
                  <td align="center" style="padding:0 8px;">
                    <div style="font-size:18px;color:#3275e6;">&#10003;</div>
                    <div style="margin-top:5px;font-size:9px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;color:#60718d;">Portfolio form</div>
                  </td>
                  <td align="center" style="padding:0 8px;border-left:1px solid #d6e0ef;border-right:1px solid #d6e0ef;">
                    <div style="font-size:18px;color:#3275e6;">&#10003;</div>
                    <div style="margin-top:5px;font-size:9px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;color:#60718d;">Form validated</div>
                  </td>
                  <td align="center" style="padding:0 8px;">
                    <div style="font-size:18px;color:#3275e6;">&#10003;</div>
                    <div style="margin-top:5px;font-size:9px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;color:#60718d;">Direct reply</div>
                  </td>
                </tr>
              </table>
              <div style="margin-top:28px;text-align:center;">
                <a href="mailto:${safeEmail}?subject=${replySubject}" style="display:inline-block;padding:14px 25px;border-radius:999px;background:#155fd7;color:#ffffff;font-size:11px;font-weight:800;letter-spacing:1px;text-decoration:none;text-transform:uppercase;">Respond to ${safeName}</a>
              </div>
            </td>
          </tr>
          <tr>
            <td class="email-pad" background="${curtainImageUrl}" style="padding:22px 42px;background-color:#061126;background-image:linear-gradient(90deg,rgba(1,5,12,.45),rgba(17,62,150,.32)),url(${curtainImageUrl});background-position:center bottom;background-size:cover;text-align:center;font-size:11px;line-height:1.7;color:#9fb5d8;">
              Submitted ${safeSubmittedAt} (Asia/Manila)<br>
              <a href="${siteUrl}" style="color:#c8dbff;text-decoration:none;">jeromebalangue.github.io</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function createBrowserResponse_(payload) {
  const response = JSON.stringify({
    source: CONTACT_CONFIG.responseSource,
    type: String(payload.type || "result"),
    success: Boolean(payload.success),
    message: String(payload.message || ""),
    documentAttachments: Boolean(payload.documentAttachments),
    maxAttachmentBytes: Number(payload.maxAttachmentBytes || 0)
  }).replace(/</g, "\\u003c");
  const targetOrigin = JSON.stringify(CONTACT_CONFIG.allowedOrigin);

  return HtmlService.createHtmlOutput(
    `<!doctype html><meta charset="utf-8"><script>window.top.postMessage(${response},${targetOrigin});</script>`
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
