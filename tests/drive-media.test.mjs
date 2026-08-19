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

    assert.equal(assets.length, 46);
    assert.equal(imageAssets.length, 34);
    assert.equal(videoAssets.length, 12);
    assert.equal(new Set(ids).size, ids.length);
    imageAssets.forEach((asset) => {
        assert.match(asset.src, /^https:\/\/drive\.google\.com\/thumbnail\?id=/u);
    });
    videoAssets.forEach((asset) => {
        assert.match(asset.src, /^https:\/\/drive\.usercontent\.google\.com\/download\?id=/u);
    });
    assert.equal(fallback.resume.id, "1D_4vuNZl4jcVPtUhJgp8ShbcuKHLpsBv");
    assert.equal(fallback.resume.mimeType, "application/pdf");
    assert.doesNotMatch(driveDataScript, /images\/(?:archive|source-assets)\//u);
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
    assert.match(mainScript, /catalogFrame\.setAttribute\("sandbox", "allow-scripts allow-same-origin"\)/u);
    assert.match(mainScript, /event\.data\?\.nonce !== requestNonce/u);
    assert.match(mainScript, /event\.data\?\.source !== DRIVE_MEDIA_CATALOG_SOURCE/u);
    assert.match(mainScript, /using the bundled fallback/u);
    assert.equal(driveConfig.catalogTimeoutMs, 30000);
    assert.equal(driveConfig.catalogRetryCount, 1);
    assert.equal(driveConfig.catalogRetryDelayMs, 2500);
    assert.equal(driveConfig.catalogRefreshMs, 60000);
    assert.match(mainScript, /attempt <= retryCount/u);
    assert.match(mainScript, /loadDriveMediaCatalog\(\{ forceRefresh: true \}\)/u);
    assert.match(mainScript, /visibilitychange/u);
});

test("Apps Script scans Drive folders and publishes a nonce-bound iframe catalog", () => {
    assert.equal(appsscriptManifest.webapp.access, "ANYONE_ANONYMOUS");
    assert.equal(appsscriptManifest.webapp.executeAs, "USER_DEPLOYING");
    assert.ok(appsscriptManifest.oauthScopes.includes(
        "https://www.googleapis.com/auth/drive.metadata.readonly"
    ));
    assert.match(catalogCode, /categoryFolderPattern:\s*\/\^--\(\.\+\?\)--\$\//u);
    assert.match(catalogCode, /Drive\.Files\.list/u);
    assert.match(catalogCode, /buildCategorizedGallery_\(socialFolder, "images"\)/u);
    assert.match(catalogCode, /buildCategorizedGallery_\(videosFolder, "videos"\)/u);
    assert.match(catalogCode, /buildResumeEntry_\(\)/u);
    assert.match(catalogCode, /window\.top\.postMessage/u);
    assert.match(catalogCode, /HtmlService\.XFrameOptionsMode\.ALLOWALL/u);
    assert.doesNotMatch(catalogCode, /ContentService\.MimeType\.JAVASCRIPT/u);
    assert.match(catalogCode, /catalogCacheSeconds:\s*60/u);
});

test("Drive gallery files use MIME type and folders instead of filename conventions", () => {
    assert.match(catalogCode, /imageMimePattern:\s*\/\^image\\\//u);
    assert.match(catalogCode, /videoMimePattern:\s*\/\^video\\\//u);
    assert.match(catalogCode, /const files = listFiles_\(categoryFolder, mimePattern\)/u);
    assert.match(catalogCode, /entry\.alt = labelFromFilename_\(file\.name\)/u);
    assert.doesNotMatch(catalogCode, /file\.name\.match|filenamePattern|fileNamePattern/u);
});
