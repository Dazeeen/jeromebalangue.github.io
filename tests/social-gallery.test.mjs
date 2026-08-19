import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const categoryPattern = /^--(.+?)--$/u;
const driveData = await readFile(
    path.join(projectRoot, "static", "js", "drive-media-data.js"),
    "utf8"
);
const sandbox = { window: {} };
vm.runInNewContext(driveData, sandbox);
const manifest = sandbox.window.DRIVE_MEDIA_FALLBACK.galleries.social;

test("the Drive fallback keeps every Social gallery category and image", () => {
    assert.ok(manifest.categories.length > 0);
    let imageCount = 0;
    for (const category of manifest.categories) {
        assert.match(category.folder, categoryPattern);
        assert.ok(category.images.length > 0);
        for (const image of category.images) {
            assert.match(image.src, /^https:\/\/drive\.google\.com\/thumbnail\?id=/u);
            assert.match(image.mimeType, /^image\//u);
            assert.ok(image.id);
            imageCount += 1;
        }
    }
    assert.equal(manifest.imageCount, imageCount);
});

test("the page uses dynamic gallery mount points instead of hard-coded cards", async () => {
    const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
    const script = await readFile(path.join(projectRoot, "static", "js", "main.js"), "utf8");

    assert.match(html, /data-social-filters/u);
    assert.match(html, /data-social-gallery-status/u);
    assert.doesNotMatch(html, /class="social-carousel__slide"/u);
    assert.match(html, /static\/js\/drive-media-data\.js/u);
    assert.ok(
        html.indexOf("drive-media-data.js") < html.indexOf("static/js/main.js"),
        "Drive gallery fallback data must load before the main script."
    );
    assert.match(script, /loadDriveMediaCatalog/u);
    assert.match(script, /getFallbackDriveGallery\("social", "SOCIAL_GALLERY_MANIFEST"\)/u);
    assert.match(script, /renderSocialGallery/u);
});
