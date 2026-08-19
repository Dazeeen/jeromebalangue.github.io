import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const [html, mainScript, driveDataScript, catalogCode, appsscriptManifestSource] = await Promise.all([
    readFile(path.join(projectRoot, "index.html"), "utf8"),
    readFile(path.join(projectRoot, "static", "js", "main.js"), "utf8"),
    readFile(path.join(projectRoot, "static", "js", "drive-media-data.js"), "utf8"),
    readFile(
        path.join(
            projectRoot,
            "integrations",
            "google-apps-script",
            "drive-media-catalog",
            "Code.gs"
        ),
        "utf8"
    ),
    readFile(
        path.join(
            projectRoot,
            "integrations",
            "google-apps-script",
            "drive-media-catalog",
            "appsscript.json"
        ),
        "utf8"
    )
]);
const sandbox = { window: {} };
vm.runInNewContext(driveDataScript, sandbox);
const driveConfig = sandbox.window.DRIVE_MEDIA_CONFIG;
const fallback = sandbox.window.DRIVE_MEDIA_FALLBACK;
const appsscriptManifest = JSON.parse(appsscriptManifestSource);

test("the Drive fallback catalogs every migrated image and video", () => {
    const assets = Object.values(fallback.assets);
    const imageAssets = assets.filter((asset) => asset.mimeType.startsWith("image/"));
    const videoAssets = assets.filter((asset) => asset.mimeType.startsWith("video/"));
    const ids = assets.map((asset) => asset.id);

    assert.equal(assets.length, 54);
    assert.equal(imageAssets.length, 42);
    assert.equal(videoAssets.length, 12);
    assert.equal(new Set(ids).size, ids.length);
    imageAssets.forEach((asset) => {
        assert.match(asset.src, /^https:\/\/drive\.google\.com\/thumbnail\?id=/u);
    });
    videoAssets.forEach((asset) => {
        assert.match(asset.src, /^https:\/\/drive\.usercontent\.google\.com\/download\?id=/u);
    });
});

test("the fallback preserves categorized gallery behavior", () => {
    assert.deepEqual(
        Array.from(fallback.galleries.social.categories, (category) => category.name),
        ["Campaign", "Product", "Real Estate", "Solar"]
    );
    assert.equal(fallback.galleries.social.imageCount, 10);
    assert.equal(fallback.galleries.ai.imageCount, 5);
    assert.deepEqual(
        Array.from(fallback.galleries.video.categories, (category) => category.name),
        ["App Promotional Video", "Trend Editing", "Editing Project"]
    );
    assert.equal(fallback.galleries.video.videoCount, 12);
});

test("the page loads Drive data before gallery initialization", () => {
    assert.match(html, /static\/js\/drive-media-data\.js/u);
    assert.ok(
        html.indexOf("static/js/drive-media-data.js") < html.indexOf("static/js/main.js"),
        "Drive fallback data must load before the main application."
    );
    assert.doesNotMatch(html, /static\/media\/(?:images|videos)\//u);
    assert.match(driveConfig.catalogUrl, /^https:\/\/script\.google\.com\/macros\/s\//u);
    assert.match(mainScript, /loadDriveMediaCatalog/u);
    assert.match(mainScript, /callback=\$\{encodeURIComponent\(callbackName\)\}/u);
    assert.match(mainScript, /using the bundled fallback/u);
});

test("Apps Script scans Drive folders and publishes an anonymous JSONP catalog", () => {
    assert.equal(appsscriptManifest.webapp.access, "ANYONE_ANONYMOUS");
    assert.equal(appsscriptManifest.webapp.executeAs, "USER_DEPLOYING");
    assert.ok(appsscriptManifest.oauthScopes.includes(
        "https://www.googleapis.com/auth/drive.metadata.readonly"
    ));
    assert.match(catalogCode, /categoryFolderPattern:\s*\/\^--\(\.\+\?\)--\$\//u);
    assert.match(catalogCode, /Drive\.Files\.list/u);
    assert.match(catalogCode, /buildCategorizedGallery_\(socialFolder, "images"\)/u);
    assert.match(catalogCode, /buildCategorizedGallery_\(videosFolder, "videos"\)/u);
    assert.match(catalogCode, /ContentService\.MimeType\.JAVASCRIPT/u);
    assert.match(catalogCode, /catalogCacheSeconds:\s*60/u);
});
