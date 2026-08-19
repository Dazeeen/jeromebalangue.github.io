# Jerome Portfolio Drive Media Catalog

This Apps Script project reads the media tree stored under
`Website Portfolio/Media` and the first PDF under `Website Portfolio/Resume` in
Jerome's Google Drive. It sends a catalog to the static GitHub Pages portfolio
through a sandboxed frame and a nonce-bound `postMessage` response.

The catalog preserves the existing `--Category Name--` convention for the
Social Media Designs and Video Editing galleries. Creating a matching folder
in Drive and adding supported media makes the category available on the site
after the short catalog cache expires.

The web app is deployed to run as Jerome and allow anonymous reads. The media
folder itself must also retain `Anyone with the link` viewer access so browser
image and video requests can load the returned Drive URLs. Source assets and
archives are stored outside that public tree. The Resume folder remains private;
only its selected first PDF is shared read-only for the download button.
