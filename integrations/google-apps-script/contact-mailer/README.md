# Google Apps Script contact mailer

This backend sends the portfolio contact form as a branded HTML email without
exposing a private API key in the public GitHub Pages source.

## Deploy from Jerome's Google account

1. Sign in to the Google account that owns `balanguejerome@gmail.com`.
2. Open `https://script.new` and replace the editor contents with `Code.gs`; keep
   the matching `appsscript.json` manifest settings from this folder.
3. Select **Deploy > New deployment > Web app**.
4. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
5. Authorize Mail, Google Drive, and Google Sheets when Google prompts for permission.
6. Copy the final `/exec` web app URL. The portfolio currently uses:

   ```text
   https://script.google.com/macros/s/AKfycbxwS5NBw7Lqgjas7Kh7P2QtIq_b2PMLZejBw3RN6jmFLuJ493m_xT1vEsq8akp2TU0F-A/exec
   ```

Do not place Google passwords, OAuth tokens, or private API keys in this repository.
The public deployment accepts anonymous contact/review submissions but has
`moderationEnabled: false`, so even a valid moderation token cannot be executed
through its URL. Jerome-only moderation uses this separate deployment:

```text
https://script.google.com/macros/s/AKfycbyc81epxNpehBmO-qObFjn76f3UxAPtw1w3_FOHyP6Z67LlSlL0w95nL3pJSbI360-4Vw/exec
```

That deployment is a versioned snapshot with **Who has access: Only myself** and
belongs to `balanguejerome@gmail.com`. Its snapshot has `moderationEnabled: true`.
Keep the repository manifest in public mode (`ANYONE_ANONYMOUS`) and the committed
code guard set to `false`; updating the private deployment requires intentionally
creating a private `MYSELF` version, never pointing it at an ordinary public build.

The backend sends a custom portfolio email with the website's public blue-curtain
background, provides a plain-text fallback, sets Reply-To to the visitor, validates
input, escapes HTML, uses a honeypot, and rate-limits repeated submissions from the
same email address for one minute. Email clients that block remote images will use
the matching solid navy and blue fallback colors until images are displayed.

The contact form can optionally attach up to 10 documents, with a 5 MB per-file and
20 MB combined limit. Allowed formats are PDF, DOCX, XLSX, PPTX, ODT, ODS, ODP, RTF,
TXT, and CSV. Visitors can choose or drag and drop files, review each filename and
size, remove individual selections, and follow preparation/upload progress. The
browser converts each document to Base64 for the static GitHub Pages form, then the
backend checks the count, combined size, extension, declared MIME type, decoded size,
executable signatures, and document container structure before adding every verified
blob to the email. Executables, scripts, macro-enabled Office packages, archives, and
renamed application files are rejected.

## Google Drive inquiry archive

The script idempotently creates this private hierarchy in the deploying account:

```text
Website Portfolio/
|-- Inquiries/
|   `-- <client name>/
|       |-- Inquiry - <timestamp>.txt
|       |-- Inquiry - <timestamp>.html
|       `-- <validated uploaded documents>
`-- Reviews/
    `-- Portfolio Reviews (Google Sheet)
```

`setupPortfolioStorage()` can be run once from the Apps Script editor to create the
folders and Sheet immediately. Normal validated submissions also call the same
idempotent setup, so existing matching folders are reused instead of duplicated.
The manifest limits API execution to the deploying account (`MYSELF`). The Drive
archive is written before the inquiry email is sent.

## Review moderation and storage

The same web-app deployment also powers the portfolio Reviews page. Review
submissions use separate field names, a honeypot, a five-minute per-email rate limit,
strict length/rating/consent validation, and a script lock for concurrent writes.
Pending reviews are stored as private rows in the `Portfolio Reviews` Google Sheet
under `Website Portfolio/Reviews/` and are never returned by the public response.
Existing property-backed reviews are copied into the Sheet once during setup so the
Sheet becomes the canonical review store.

Each valid submission sends Jerome a branded preview email with one-time **Accept &
Post** and **Decline & Delete** links. Each link contains a high-entropy token; only
its SHA-256 hash and 24-hour expiry are stored. Email buttons first open the
portfolio-hosted `review-moderation.html` confirmation gateway, with credentials
kept in the URL fragment so they are not sent to GitHub. Nothing changes until
Jerome confirms the action. The gateway then opens Google's account chooser for
`balanguejerome@gmail.com` and continues to the separate `MYSELF` deployment.
Google blocks every other account before the script runs, and the public deployment
also refuses moderation as defense in depth. Approval clears the token and expiry
before exposing only public fields. Rejection deletes the pending Sheet row.
Expired links clear their stored credentials and require a fresh moderation email.
Reviewer email remains private in the Sheet and is never returned to the website.

If a deployment URL ever changes, update `CONTACT_CONFIG.webAppUrl` and the owner
deployment constant in `review-moderation.html`, redeploy both surfaces, then
run `resendPendingReviewModerationEmails()` once from the Apps Script editor. It
rotates the stored hashes and sends fresh working links for pending rows only.

The static page requests published reviews with `?mode=reviews` in a hidden iframe.
The response uses the existing trusted Google-origin plus
`jerome-portfolio-contact-mailer` marker contract, and never includes reviewer email
addresses or pending content.

Google applies daily MailApp quotas. A consumer Gmail account currently has a limit
of 100 email recipients per day; Google Workspace accounts currently have a higher
limit. This is not an unlimited email service.
