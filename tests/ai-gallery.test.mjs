import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const driveData = await readFile(
    path.join(projectRoot, "static", "js", "drive-media-data.js"),
    "utf8"
);
const sandbox = { window: {} };
vm.runInNewContext(driveData, sandbox);
const manifest = sandbox.window.DRIVE_MEDIA_FALLBACK.galleries.ai;

test("the Drive fallback catalogs every AI-generated image", () => {
    assert.ok(manifest.images.length >= 5);
    assert.equal(manifest.imageCount, manifest.images.length);
    for (const image of manifest.images) {
        assert.match(image.src, /^https:\/\/drive\.google\.com\/thumbnail\?id=/u);
        assert.match(image.mimeType, /^image\//u);
        assert.ok(image.id);
        assert.ok(image.alt);
    }
});

test("AI Drive additions and removals are wired to the live folder catalog", async () => {
    const catalog = await readFile(
        path.join(projectRoot, "integrations", "google-apps-script", "drive-media-catalog", "Code.gs"),
        "utf8"
    );
    const script = await readFile(path.join(projectRoot, "static", "js", "main.js"), "utf8");

    assert.match(catalog, /requireChildFolder_\(imagesFolder, "AI_generated_design"\)/u);
    assert.match(catalog, /buildAiGallery_\(aiFolder\)/u);
    assert.match(catalog, /catalogCacheSeconds:\s*60/u);
    assert.match(script, /loadDriveMediaCatalog/u);
});

test("the AI page renders a dimension-aware gallery beneath its hero", async () => {
    const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
    const script = await readFile(path.join(projectRoot, "static", "js", "main.js"), "utf8");
    const stylesheet = await readFile(path.join(projectRoot, "static", "css", "main.css"), "utf8");

    assert.match(html, /id="ai-generated-design"/u);
    assert.match(html, /class="ai-section__hero"/u);
    assert.match(html, /data-ai-ambient/u);
    assert.match(html, /class="ai-gallery-section"/u);
    assert.match(html, /data-ai-gallery/u);
    assert.match(html, /static\/js\/drive-media-data\.js/u);
    assert.ok(
        html.indexOf("drive-media-data.js") < html.indexOf("static/js/main.js"),
        "Drive gallery fallback data must load before the main script."
    );
    assert.match(script, /loadDriveMediaCatalog/u);
    assert.match(script, /getFallbackDriveGallery\("ai", "AI_GALLERY_MANIFEST"\)/u);
    assert.match(script, /getAIAspectRatio/u);
    assert.match(script, /syncAIGalleryLayout/u);
    assert.match(script, /card\.style\.flexBasis/u);
    assert.match(script, /card\.style\.flexGrow/u);
    assert.match(script, /setAICardDimensions/u);
    assert.match(script, /new ResizeObserver\(syncAIGalleryLayout\)/u);
    assert.match(script, /startAIFloatSequence/u);
    assert.match(script, /takeNextAIFloatImage\(activeSources, previousSource\)/u);
    assert.match(script, /pauseAllAIFloatCards\("viewer"\)/u);
    assert.match(script, /openAIViewer/u);
    assert.match(script, /aiViewerImage\.animate\(\[/u);
    assert.equal(
        (script.match(/aiViewerImage\.animate\(/gu) || []).length,
        1,
        "Only the opening approach animation should transform the viewer image."
    );
    assert.match(script, /aiViewerOpener\?\.classList\.add\("is-viewer-source-hidden"\)/u);
    assert.match(script, /opacity:\s*1,\s*filter:\s*"blur\(0\)"/u);
    assert.ok(
        script.indexOf('aiViewer.style.visibility = "hidden"')
            < script.indexOf("closingAnimation?.cancel()"),
        "The viewer must be hidden before its filled close animation is cancelled."
    );
    assert.ok(
        script.indexOf('opener?.classList.remove("is-viewer-source-hidden")')
            < script.indexOf("closingAnimation?.cancel()"),
        "The source card must replace the hidden viewer image before cancellation can repaint it."
    );
    assert.match(stylesheet, /\.ai-viewer\.is-open\.is-closing/u);
    assert.match(stylesheet, /\.ai-viewer\.is-open\.is-returning/u);
    assert.match(script, /returnAnimation\.reverse\(\)/u);
    assert.match(script, /card\.classList\.add\("is-viewer-origin"\)/u);
    assert.match(
        script,
        /event\.target\.closest\("\.ai-viewer__image, \.ai-viewer__close"\)/u
    );
    assert.match(stylesheet, /\.ai-section\s*\{[^}]*overflow-y:\s*auto;/su);
    assert.match(
        stylesheet,
        /\.ai-section\s*\{[^}]*drive\.google\.com\/thumbnail[^}]*background-attachment:\s*fixed;/su
    );
    assert.match(stylesheet, /\.ai-section__hero\s*\{[^}]*height:\s*100svh;/su);
    assert.match(stylesheet, /\.ai-section__hero\s*\{[^}]*background:\s*transparent;/su);
    assert.match(stylesheet, /\.ai-gallery-section\s*\{[^}]*background:\s*transparent;/su);
    assert.match(stylesheet, /\.ai-gallery\s*\{[^}]*display:\s*flex;[^}]*flex-wrap:\s*wrap;/su);
    assert.match(stylesheet, /\.ai-card__media\s*\{[^}]*aspect-ratio:\s*var\(--ai-card-aspect\);/su);
    assert.match(stylesheet, /\.ai-section__ambient\s*\{[^}]*position:\s*absolute;/su);
    assert.match(
        stylesheet,
        /\.ai-float-card\.is-viewer-source-hidden \.ai-float-card__drift\s*\{[^}]*visibility:\s*hidden;/su
    );
    assert.match(
        stylesheet,
        /\.ai-card\.is-viewer-source-hidden \.ai-card__media,[^{]*\{[^}]*visibility:\s*hidden;/su
    );
    assert.match(stylesheet, /@keyframes ai-float-card-wind/u);
    assert.match(stylesheet, /translate3d\(var\(--ai-float-drift-start\), 0, 0\)/u);
    assert.match(stylesheet, /translate3d\(var\(--ai-float-drift-end\), 0, 0\)/u);
    assert.match(stylesheet, /@media \(max-width: 540px\)[\s\S]*\.ai-gallery\s*\{[^}]*display:\s*grid;/u);
    assert.doesNotMatch(stylesheet, /@keyframes ai-card-wind/u);
});
