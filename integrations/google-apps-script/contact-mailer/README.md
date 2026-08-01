# Google Apps Script contact mailer

This backend sends the portfolio contact form as a branded HTML email without
exposing a private API key in the public GitHub Pages source.

## Deploy from Jerome's Google account

1. Sign in to the Google account that owns `balanguejerome@gmail.com`.
2. Open `https://script.new` and replace the editor contents with `Code.gs`.
3. Select **Deploy > New deployment > Web app**.
4. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
5. Authorize MailApp when Google prompts for permission.
6. Copy the final `/exec` web app URL. The portfolio currently uses:

   ```text
   https://script.google.com/macros/s/AKfycbxwS5NBw7Lqgjas7Kh7P2QtIq_b2PMLZejBw3RN6jmFLuJ493m_xT1vEsq8akp2TU0F-A/exec
   ```

Do not place Google passwords, OAuth tokens, or private API keys in this repository.
The `/exec` URL is the only value the portfolio front end needs. After changing the
Apps Script code, create a new deployed version so the live `/exec` endpoint receives
the update.

The backend sends a custom blue portfolio email, provides a plain-text fallback,
sets Reply-To to the visitor, validates input, escapes HTML, uses a honeypot, and
rate-limits repeated submissions from the same email address for one minute.

Google applies daily MailApp quotas. A consumer Gmail account currently has a limit
of 100 email recipients per day; Google Workspace accounts currently have a higher
limit. This is not an unlimited email service.
