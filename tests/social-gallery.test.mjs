import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const galleryRoot = path.join(
    projectRoot,
    "static",
    "media",
    "images",
    "social-media-designs"
);
const manifestPath = path.join(galleryRoot, "gallery.json");
const manifestScriptPath = path.join(galleryRoot, "gallery-data.js");
const categoryPattern = /^--(.+?)--$/u;
const imagePattern = /\.(?:avif|gif|jpe?g|png|svg|webp)$/iu;

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

test("every gallery folder follows the category naming contract", async () => {
    const folders = (await readdir(galleryRoot, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory());

    assert.ok(folders.length > 0);
    folders.forEach((folder) => assert.match(folder.name, categoryPattern));
});

test("the generated manifest matches every category image on disk", async () => {
    const manifestFiles = new Set();

    for (const category of manifest.categories) {
        assert.match(category.folder, categoryPattern);
        assert.ok(category.images.length > 0);

        for (const image of category.images) {
            assert.match(image.file, imagePattern);
            const relativePath = path.join(category.folder, image.file);
            manifestFiles.add(relativePath);
            await assert.doesNotReject(() => readFile(path.join(galleryRoot, relativePath)));
        }
    }

    const diskFiles = new Set();
    const folders = (await readdir(galleryRoot, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory());
    for (const folder of folders) {
        const files = (await readdir(path.join(galleryRoot, folder.name), { withFileTypes: true }))
            .filter((entry) => entry.isFile() && imagePattern.test(entry.name));
        files.forEach((file) => diskFiles.add(path.join(folder.name, file.name)));
    }

    assert.deepEqual(manifestFiles, diskFiles);
    assert.equal(manifest.imageCount, diskFiles.size);
});

test("the direct-file gallery data script matches the JSON manifest", async () => {
    const manifestScript = await readFile(manifestScriptPath, "utf8");
    const serializedData = manifestScript
        .replace(/^window\.SOCIAL_GALLERY_MANIFEST\s*=\s*/u, "")
        .replace(/;\s*$/u, "");

    assert.deepEqual(JSON.parse(serializedData), manifest);
});

test("the page uses dynamic gallery mount points instead of hard-coded cards", async () => {
    const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
    const script = await readFile(path.join(projectRoot, "static", "js", "main.js"), "utf8");

    assert.match(html, /data-social-filters/u);
    assert.match(html, /data-social-gallery-status/u);
    assert.doesNotMatch(html, /class="social-carousel__slide"/u);
    assert.match(html, /social-media-designs\/gallery-data\.js/u);
    assert.ok(
        html.indexOf("gallery-data.js") < html.indexOf("static/js/main.js"),
        "Gallery data must load before the main script."
    );
    assert.match(script, /SOCIAL_GALLERY_MANIFEST_URL/u);
    assert.match(script, /window\.SOCIAL_GALLERY_MANIFEST/u);
    assert.match(script, /renderSocialGallery/u);
});
