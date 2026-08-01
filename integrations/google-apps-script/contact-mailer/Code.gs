const CONTACT_CONFIG = Object.freeze({
  destinationEmail: "balanguejerome@gmail.com",
  allowedOrigin: "https://jeromebalangue.github.io",
  responseSource: "jerome-portfolio-contact-mailer",
  senderName: "Jerome Balangue Portfolio",
  rateLimitSeconds: 60,
  maxNameLength: 100,
  maxEmailLength: 254,
  maxMessageLength: 5000
});

function doGet() {
  return createBrowserResponse_({
    success: false,
    message: "This endpoint accepts contact-form POST requests only."
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

    const submittedAt = Utilities.formatDate(
      new Date(),
      "Asia/Manila",
      "MMMM d, yyyy 'at' h:mm a"
    );
    const subject = `New portfolio inquiry from ${name}`;

    MailApp.sendEmail({
      to: CONTACT_CONFIG.destinationEmail,
      subject,
      name: CONTACT_CONFIG.senderName,
      replyTo: email,
      body: createPlainTextEmail_(name, email, message, submittedAt),
      htmlBody: createHtmlEmail_(name, email, message, submittedAt)
    });

    return createBrowserResponse_({
      success: true,
      message: "Thank you! Your message was sent to Jerome."
    });
  } catch (error) {
    console.error(error);
    return createBrowserResponse_({
      success: false,
      message: error && error.message === "RATE_LIMITED"
        ? "Please wait a minute before sending another message."
        : "The email service is temporarily unavailable. Please try again later."
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

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createPlainTextEmail_(name, email, message, submittedAt) {
  return [
    "NEW PORTFOLIO COLLABORATION INQUIRY",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Submitted: ${submittedAt} (Asia/Manila)`,
    "",
    "PROJECT DETAILS",
    message,
    "",
    "Reply to this email to respond directly to the sender."
  ].join("\n");
}

function createHtmlEmail_(name, email, message, submittedAt) {
  const safeName = escapeHtml_(name);
  const safeEmail = escapeHtml_(email);
  const safeMessage = escapeHtml_(message).replace(/\r?\n/g, "<br>");
  const safeSubmittedAt = escapeHtml_(submittedAt);

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#05070d;font-family:Arial,Helvetica,sans-serif;color:#eef4ff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#05070d;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;border:1px solid #21355d;background:#091120;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:34px 38px;background:linear-gradient(135deg,#081126 0%,#123d9c 58%,#246cff 100%);">
              <div style="font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#a9c8ff;">Jerome Balangue Portfolio</div>
              <h1 style="margin:14px 0 8px;font-size:32px;line-height:1.1;color:#ffffff;">New collaboration inquiry</h1>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#d5e4ff;">A new project message was submitted through your portfolio website.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 38px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:0 0 20px;border-bottom:1px solid #1c2b49;">
                    <div style="font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#7398d8;">Potential client</div>
                    <div style="margin-top:7px;font-size:22px;font-weight:700;color:#ffffff;">${safeName}</div>
                    <a href="mailto:${safeEmail}" style="display:inline-block;margin-top:7px;color:#82adff;text-decoration:none;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:26px 0 0;">
                    <div style="font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#7398d8;">Project details</div>
                    <div style="margin-top:12px;padding:20px;border:1px solid #20375f;border-radius:16px;background:#0d1a30;font-size:15px;line-height:1.75;color:#edf4ff;">${safeMessage}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:26px 0 0;">
                    <a href="mailto:${safeEmail}?subject=${encodeURIComponent(`Re: Portfolio inquiry from ${name}`)}" style="display:inline-block;padding:13px 20px;border-radius:999px;background:#4f86ff;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:1px;text-decoration:none;text-transform:uppercase;">Reply to ${safeName}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 38px;border-top:1px solid #1c2b49;background:#070d18;font-size:11px;line-height:1.6;color:#7183a3;">
              Submitted ${safeSubmittedAt} &middot; jeromebalangue.github.io
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
    success: Boolean(payload.success),
    message: String(payload.message || "")
  }).replace(/</g, "\\u003c");
  const targetOrigin = JSON.stringify(CONTACT_CONFIG.allowedOrigin);

  return HtmlService.createHtmlOutput(
    `<!doctype html><meta charset="utf-8"><script>window.top.postMessage(${response},${targetOrigin});</script>`
  );
}
