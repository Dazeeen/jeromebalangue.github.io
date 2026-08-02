# Google Apps Script contact mailer

This backend sends the portfolio contact form as a branded HTML email without
exposing a private API key in the public GitHub Pages source.

## Deploy from Jerome's Google account

1. Sign in to the Google account that owns `balanguejerome@gmail.com`.
2. Open `https://script.new` and replace the editor contents with `Code.gs`; keep
   the matching `appsscript.json` manifest settings from this folder.
3. Select **Deploy > New deployment > Web app**.
4. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
5. Authorize MailApp when Google prompts for permission.
6. Copy the final `/exec` web app URL. The portfolio currently uses:

   ```text
   https://script.google.com/macros/s/AKfycbxwS5NBw7Lqgjas7Kh7P2QtIq_b2PMLZejBw3RN6jmFLuJ493m_xT1vEsq8akp2TU0F-A/exec
   ```

Do not place Google passwords, OAuth tokens, or private API keys in this repository.
The `/exec` URL is the only value the portfolio front end needs. After changing the
Apps Script code, open **Deploy > Manage deployments**, edit the existing web-app
deployment, select **New version**, and deploy it. Updating the existing deployment
keeps the current `/exec` URL while publishing the new email template.

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

## Review moderation and storage

The same web-app deployment also powers the portfolio Reviews page. Review
submissions use separate field names, a honeypot, a five-minute per-email rate limit,
strict length/rating/consent validation, and a script lock for concurrent writes.
Pending reviews are stored in script-wide Apps Script properties and are never
returned by the public reviews response.

Each valid submission sends Jerome a branded preview email with one-time **Accept &
Post** and **Decline & Delete** links. Each link contains a high-entropy token; only
its SHA-256 hash is stored. Approval removes the private reviewer email and token
before exposing the display fields publicly. Rejection deletes the record and its
index entry. Storage is intentionally capped at 80 retained pending/approved reviews
to remain below the Apps Script property-store limit even with maximum-length copy.

The static page requests published reviews with `?mode=reviews` in a hidden iframe.
The response uses the existing trusted Google-origin plus
`jerome-portfolio-contact-mailer` marker contract, and never includes reviewer email
addresses or pending content.

Google applies daily MailApp quotas. A consumer Gmail account currently has a limit
of 100 email recipients per day; Google Workspace accounts currently have a higher
limit. This is not an unlimited email service.
