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
    "AI_generated_design"
);
const manifestPath = path.join(galleryRoot, "gallery.json");
const manifestScriptPath = path.join(galleryRoot, "gallery-data.js");
const imagePattern = /\.(?:avif|gif|jpe?g|png|svg|webp)$/iu;

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

test("the AI manifest matches every image in AI_generated_design", async () => {
    const diskFiles = (await readdir(galleryRoot, { withFileTypes: true }))
        .filter((entry) => entry.isFile() && imagePattern.test(entry.name))
        .map((entry) => entry.name)
        .sort();
    const manifestFiles = manifest.images.map((image) => image.file).sort();

    assert.ok(diskFiles.length >= 5);
    assert.deepEqual(manifestFiles, diskFiles);
    assert.equal(manifest.imageCount, diskFiles.length);
    for (const image of manifest.images) {
        assert.match(image.src, /^static\/media\/images\/AI_generated_design\//u);
        assert.ok(image.alt);
        assert.ok(Number.isInteger(image.width) && image.width > 0);
        assert.ok(Number.isInteger(image.height) && image.height > 0);
        await assert.doesNotReject(() => readFile(path.join(galleryRoot, image.file)));
    }
});

test("the direct-file AI data script matches the JSON manifest", async () => {
    const manifestScript = await readFile(manifestScriptPath, "utf8");
    const serializedData = manifestScript
        .replace(/^window\.AI_GALLERY_MANIFEST\s*=\s*/u, "")
        .replace(/;\s*$/u, "");

    assert.deepEqual(JSON.parse(serializedData), manifest);
});

test("AI image additions and removals are wired to automatic manifest sync", async () => {
    const generator = await readFile(
        path.join(projectRoot, "scripts", "generate-ai-gallery.mjs"),
        "utf8"
    );
    const workflow = await readFile(
        path.join(projectRoot, ".github", "workflows", "sync-social-gallery.yml"),
        "utf8"
    );

    assert.match(generator, /process\.argv\.includes\("--watch"\)/u);
    assert.match(generator, /watch\(galleryRoot, \{ persistent: true \}/u);
    assert.match(generator, /\.then\(writeManifest\)/u);
    assert.match(workflow, /static\/media\/images\/AI_generated_design\/\*\*/u);
    assert.match(workflow, /node scripts\/generate-ai-gallery\.mjs/u);
    assert.match(workflow, /static\/media\/images\/AI_generated_design\/gallery-data\.js/u);
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
    assert.match(html, /AI_generated_design\/gallery-data\.js/u);
    assert.ok(
        html.indexOf("AI_generated_design/gallery-data.js") < html.indexOf("static/js/main.js"),
        "AI gallery data must load before the main script."
    );
    assert.match(script, /window\.AI_GALLERY_MANIFEST/u);
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
        /\.ai-section\s*\{[^}]*portfolio-background\.png[^}]*background-attachment:\s*fixed;/su
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
