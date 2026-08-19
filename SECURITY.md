# Security Policy

## Public frontend boundary

This portfolio is a public static GitHub Pages site. Its delivered HTML, CSS,
JavaScript, public media identifiers, and network requests can always be inspected
by visitors. No password, API secret, private token, private Drive folder link, or
moderation credential may be stored in frontend files.

Sensitive work stays in Google Apps Script or private Google Drive folders. Public
forms treat all browser input as untrusted and validate it again on the backend.
Public Drive access is limited to files intentionally displayed or downloaded by
the portfolio; source assets and archives remain private.

## Reporting a vulnerability

Send security reports privately to `balanguejerome@gmail.com`. Include the affected
URL, reproducible steps, and impact. Do not include active credentials or personal
data in a public GitHub issue.

## Supported deployment

Security fixes target the current `main` deployment at
`https://jeromebalangue.github.io/`.
