# Jerome Balangue Portfolio

Static portfolio website prepared for GitHub Pages.

## Project structure

```text
index.html                  Main page markup
static/
  css/
    main.css                Site styles and local font declarations
  js/
    head.js                 Early page setup
    main.js                 Navigation and animation behavior
    print-3d.js             Editable Three.js model source
    print-3d.bundle.js      Local browser-ready 3D bundle
  fonts/
    *.woff2                 Self-hosted font files
    OFL-*.txt               Font licenses
  media/
    images/                 Single root for every image asset
      site/                 Shared backgrounds
      home/                 Home page images
      about/                About page images
      social-media-designs/ Folder-driven Social Media Designs gallery
        --Category Name--/  Images assigned to this category
        gallery.json        Generated gallery manifest
        gallery-data.js     Direct-file-compatible browser data
      AI_generated_design/  Randomized floating A.I. design gallery
        gallery.json        Generated A.I. gallery manifest
        gallery-data.js     Direct-file-compatible A.I. gallery data
      print-marketing-materials/
                             Print assets grouped by material
      source-assets/        Labeled source/reference images
      archive/              Organized images not shown on the live pages
    archives/               Non-image source archives
    videos/                 Folder-driven Video Editing gallery
      --Category Name--/    Videos assigned to this category
      gallery.json          Generated video manifest
      gallery-data.js       Direct-file-compatible video data
  vendor/
    three/                  Local Three.js library and license
```

The site does not depend on Bootstrap, jQuery, a CDN, or remote JavaScript.
Google Fonts were downloaded and are served locally from `static/fonts`.

## Social Media Designs categories

The Social Media Designs page builds its filters and carousel from folders inside
`static/media/images/social-media-designs`. Category folders must use this exact pattern:

```text
--Category Name--
```

For example, adding images to `--Brand Identity--` creates a **Brand Identity**
filter and places those images in that category. Supported image types are AVIF,
GIF, JPEG, PNG, SVG, and WebP. Empty category folders are not displayed.

After changing the folders locally, regenerate the static manifest:

```powershell
node scripts/generate-social-gallery.mjs
```

Both generated files are required. `gallery-data.js` lets the gallery work when
`index.html` is opened directly from the filesystem, while `gallery.json` remains
the hosted fallback.

Pushing a category-folder or image change to `main` also runs
`.github/workflows/sync-social-gallery.yml`, which regenerates and commits the
manifest automatically. The HTML and JavaScript do not need to be edited when a
category or image is added.

## A.I. Generated Design gallery

The A.I. Generated Design page is driven by every supported image file in
`static/media/images/AI_generated_design`. No HTML or JavaScript edit is needed
when an image is added, renamed, or removed.

For automatic updates while editing the folder locally, keep this watcher running:

```powershell
node scripts/generate-ai-gallery.mjs --watch
```

It performs an initial sync, then regenerates `gallery.json` and `gallery-data.js`
after every add, rename, or removal. A one-time sync remains available through
`node scripts/generate-ai-gallery.mjs`.

Pushing an AI image change to `main` runs `.github/workflows/sync-social-gallery.yml`,
which also regenerates and commits both files automatically for the deployed site.
The organized gallery and the hero's shuffled floating cards use the same generated
image list. `gallery-data.js` keeps direct `file://` previews compatible, while
`gallery.json` remains the hosted fallback.

## Video Editing categories

The Video Editing page combines App Promotional Video, Trend Editing, and Editing
Project in one cinematic category experience: a focusable poster rail expands into an
inline feature view. Its categories and videos are generated from folders inside
`static/media/videos`. Category folders use the same exact pattern:

```text
--Category Name--
```

The folder name becomes the category label, and the video filename becomes the card
title. Supported browser video files are M4V, MP4, OGG/OGV, and WebM. Empty category
folders are not displayed.

For automatic updates while adding or renaming videos locally, keep this watcher
running:

```powershell
node scripts/generate-video-gallery.mjs --watch
```

A one-time generation is also available through
`node scripts/generate-video-gallery.mjs`. Pushing a category-folder or video change
to `main` runs `.github/workflows/sync-social-gallery.yml`, which regenerates and
commits `gallery.json` and `gallery-data.js`. The browser data file keeps direct
`file://` previews working without requiring a local server.

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
