# Jerome Balangue Portfolio

Static portfolio website prepared for GitHub Pages.

## Project structure

```text
index.html                  Main page markup
static/
  css/
    main.css                Site styles and Drive-backed visual URLs
  js/
    head.js                 Early page setup
    drive-media-data.js     Verified Drive fallback catalog and endpoint config
    main.js                 Navigation, animation, and live Drive catalog loader
    print-3d.js             Editable Three.js model source
    print-3d.bundle.js      Local browser-ready 3D bundle
  fonts/
    *.woff2                 Self-hosted font files
    OFL-*.txt               Font licenses
  vendor/
    three/                  Local Three.js library and license
integrations/
  google-apps-script/
    drive-media-catalog/    Read-only Drive folder scanner used by the galleries
```

The site does not depend on Bootstrap, jQuery, or a JavaScript CDN. Google Fonts
are downloaded and served locally from `static/fonts`; portfolio images and
videos are served by Jerome's public Google Drive media folder.

## Google Drive media library

The organized media source is `Website Portfolio/Media` in Jerome's Google Drive:

```text
Media/
  images/
    social-media-designs/
      --Category Name--/
    AI_generated_design/
    ...all other site image folders
  videos/
    --Category Name--/
Resume/                    Private folder; first PDF is the hero download source
Private Source & Archives/ Private original files, references, and ZIP archives
```

The Social Media Designs and Video Editing sections keep the same folder convention:

```text
--Category Name--
```

For example, creating `--Brand Identity--` under `social-media-designs` and adding
images automatically creates the **Brand Identity** filter on the site. The same
rule applies to video category folders. Empty category folders are hidden. Files
added to `AI_generated_design` automatically join both the organized AI gallery
and its randomized floating cards.

`integrations/google-apps-script/drive-media-catalog/` exposes a read-only catalog
to a sandboxed hidden frame. The browser accepts its `postMessage` response only
from Google Apps Script, with the expected source marker and a per-request nonce.
It displays the bundled verified Drive snapshot immediately, then replaces it with
the current folder scan when the catalog loads.
The live catalog is cached for only 60 seconds, so folder and media changes normally
appear within about a minute without editing the repository or regenerating files.

Only files intentionally displayed by the portfolio are kept in its public media
tree. Source assets, references, archives, inquiries, and review storage remain in
private Drive folders. Do not rename the public `images`, `videos`,
`social-media-designs`, or `AI_generated_design` folders; category folders and their
media can be freely added, renamed, or removed using the `--Category Name--` format.

The hero résumé button uses the alphabetically first PDF in `Website Portfolio/Resume`.
The folder stays private while the selected PDF itself has read-only public access.
Prefix the intended download with `01 -` when replacing it.

## Browser security boundary

The repository and deployed static frontend are public, so delivered HTML, CSS, and
JavaScript cannot be hidden from browser developer tools. Security therefore does
not rely on obfuscation. The site enforces a restrictive Content Security Policy,
Trusted Types, a no-referrer policy, origin-and-nonce-checked cross-origin messages,
backend validation, and private Drive separation. No private token or credential is
stored in frontend code. See `SECURITY.md` for the reporting policy.

## Why Work With Me

The Why Work With Me page centers Jerome inside an animated liquid portrait shape,
surrounded by floating value bubbles, tool marks, and ambient particles. The mission
statement remains beneath the composition, and reduced-motion visitors receive the
same content without the continuous animations.

## Contact form delivery

The Contact & Collaboration form posts to a Google Apps Script web app owned by
Jerome. The script sends a custom branded HTML email to
`balanguejerome@gmail.com`, with a plain-text fallback and Reply-To set to the
visitor's email address. A hidden iframe keeps the visitor on the portfolio, while
the Apps Script response reports success or failure through `postMessage`.

The front end accepts mailer responses only from Google Apps Script origins and only
when they carry the expected `jerome-portfolio-contact-mailer` source marker. Form
submission is enabled only on `https://jeromebalangue.github.io`; direct `file://`
and local previews do not send email. The editable backend and deployment notes are
in `integrations/google-apps-script/contact-mailer/`.

The attachment field supports drag-and-drop or file selection for up to 10 verified
documents, capped at 5 MB each and 20 MB combined. Selected filenames and sizes are
shown before submission, and preparation/upload progress remains visible while the
message is being delivered. Every validated inquiry is also archived in Jerome's
private Google Drive under `Website Portfolio/Inquiries/<client name>/`. The client
folder contains plain-text and branded HTML copies of the inquiry email plus every
verified uploaded document.

## Moderated reviews

The final portfolio page is a blue-curtain Reviews experience with an accessible
five-star form and a live list of approved client stories. New reviews are saved as
private pending rows in `Website Portfolio/Reviews/Portfolio Reviews`, a Google
Sheet owned by Jerome, and trigger a branded preview email. The email contains
one-time **Accept & Post** and **Decline & Delete** actions. Approval changes the
private row to `approved`, clears its moderation token, and publishes only its safe
display fields; rejection permanently deletes the pending row. Reviewer email
addresses remain private and are never included in the public reviews response.
