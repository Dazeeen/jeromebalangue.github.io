# Jerome Portfolio Drive Media Catalog

This Apps Script project reads the media tree stored under
`Website Portfolio/Media` in Jerome's Google Drive and exposes a JSONP catalog
for the static GitHub Pages portfolio.

The catalog preserves the existing `--Category Name--` convention for the
Social Media Designs and Video Editing galleries. Creating a matching folder
in Drive and adding supported media makes the category available on the site
after the short catalog cache expires.

Drive folders:

- Website Portfolio: `1R2xw7ASAw36ULoU3BVAUqgyKhtiKRe6O`
- Media: `18SAnq0Bb9ghlt2mG0jPKkSmh0hw7qvAT`

The web app is deployed to run as Jerome and allow anonymous reads. The media
folder itself must also retain `Anyone with the link` viewer access so browser
image and video requests can load the returned Drive URLs.
