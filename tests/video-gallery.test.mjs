import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const galleryRoot = path.join(projectRoot, "static", "media", "videos");
const manifestPath = path.join(galleryRoot, "gallery.json");
const manifestScriptPath = path.join(galleryRoot, "gallery-data.js");
const categoryPattern = /^--(.+?)--$/u;
const videoPattern = /\.(?:m4v|mp4|ogg|ogv|webm)$/iu;

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

test("every video category folder follows the naming contract", async () => {
    const folders = (await readdir(galleryRoot, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory());

    assert.ok(folders.length > 0);
    folders.forEach((folder) => assert.match(folder.name, categoryPattern));
});

test("the video manifest matches every supported video on disk", async () => {
    const manifestFiles = new Set();

    for (const category of manifest.categories) {
        assert.match(category.folder, categoryPattern);
        assert.ok(category.videos.length > 0);

        for (const video of category.videos) {
            assert.match(video.file, videoPattern);
            assert.ok(video.title.trim());
            const relativePath = path.join(category.folder, video.file);
            manifestFiles.add(relativePath);
            await assert.doesNotReject(() => readFile(path.join(galleryRoot, relativePath)));
        }
    }

    const diskFiles = new Set();
    const folders = (await readdir(galleryRoot, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory());
    for (const folder of folders) {
        const files = (await readdir(path.join(galleryRoot, folder.name), { withFileTypes: true }))
            .filter((entry) => entry.isFile() && videoPattern.test(entry.name));
        files.forEach((file) => diskFiles.add(path.join(folder.name, file.name)));
    }

    assert.deepEqual(manifestFiles, diskFiles);
    assert.equal(manifest.videoCount, diskFiles.size);
});

test("the direct-file video data script matches the JSON manifest", async () => {
    const manifestScript = await readFile(manifestScriptPath, "utf8");
    const serializedData = manifestScript
        .replace(/^window\.VIDEO_GALLERY_MANIFEST\s*=\s*/u, "")
        .replace(/;\s*$/u, "");

    assert.deepEqual(JSON.parse(serializedData), manifest);
});

test("video additions are wired to local and deployed automatic manifest sync", async () => {
    const generator = await readFile(
        path.join(projectRoot, "scripts", "generate-video-gallery.mjs"),
        "utf8"
    );
    const workflow = await readFile(
        path.join(projectRoot, ".github", "workflows", "sync-social-gallery.yml"),
        "utf8"
    );

    assert.match(generator, /process\.argv\.includes\("--watch"\)/u);
    assert.match(generator, /watch\(galleryRoot, \{ recursive: true \}\)/u);
    assert.match(workflow, /static\/media\/videos\/\*\*/u);
    assert.match(workflow, /node scripts\/generate-video-gallery\.mjs/u);
    assert.match(workflow, /static\/media\/videos\/gallery-data\.js/u);
});

test("the page renders one dynamic categorized Video Editing view", async () => {
    const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
    const script = await readFile(path.join(projectRoot, "static", "js", "main.js"), "utf8");
    const stylesheet = await readFile(path.join(projectRoot, "static", "css", "main.css"), "utf8");

    assert.match(html, /id="video-editing"/u);
    assert.match(html, /data-video-categories/u);
    assert.match(html, /data-video-gallery/u);
    assert.match(html, /videos\/gallery-data\.js/u);
    assert.doesNotMatch(html, /id="trend-editing"|id="editing-project"/u);
    assert.ok(
        html.indexOf("videos/gallery-data.js") < html.indexOf("static/js/main.js"),
        "Video gallery data must load before the main script."
    );
    assert.match(script, /VIDEO_GALLERY_MANIFEST_URL/u);
    assert.match(script, /window\.VIDEO_GALLERY_MANIFEST/u);
    assert.match(script, /renderVideoGallery/u);
    assert.match(script, /openVideoDetail/u);
    assert.match(script, /openVideoMosaic/u);
    assert.match(script, /setVideoMode/u);
    assert.match(script, /setVideoGalleryActive/u);
    assert.match(html, /data-video-cinema data-mode="rail"/u);
    assert.match(html, /data-video-detail/u);
    assert.match(html, /data-video-mosaic/u);
    assert.doesNotMatch(html, /class="video-viewer/u);
    assert.match(stylesheet, /\.video-cinema\s*\{[^}]*grid-template-rows:/su);
    assert.match(stylesheet, /\.video-poster\.is-active/u);
    assert.match(stylesheet, /@keyframes video-poster-rebuild/u);
    assert.match(stylesheet, /\.video-cinema\[data-mode="detail"\] \.video-cinema__detail/u);
    assert.match(stylesheet, /@keyframes video-mosaic-rise/u);
    assert.match(stylesheet, /@media \(max-width: 720px\)[\s\S]*\.video-cinema__category-list\s*\{[^}]*overflow-x:\s*auto;/u);
});

test("Video Editing is reachable through current and legacy navigation targets", async () => {
    const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
    const script = await readFile(path.join(projectRoot, "static", "js", "main.js"), "utf8");
    const pageIds = new Set([...html.matchAll(/data-page="([^"]+)"/gu)].map((match) => match[1]));
    const navigationTargets = [...html.matchAll(/class="toc-sidebar__link" href="#([^"]+)"/gu)]
        .map((match) => match[1])
        .filter((pageId) => pageIds.has(pageId));

    assert.ok(pageIds.has("video-editing"));
    assert.ok(navigationTargets.includes("video-editing"));
    assert.equal(
        navigationTargets[navigationTargets.indexOf("ai-generated-design") + 1],
        "video-editing",
        "Sequential navigation must continue from A.I. Generated Design to Video Editing."
    );
    assert.match(script, /"video-edited":\s*"video-editing"/u);
    assert.match(script, /"trend-editing":\s*"video-editing"/u);
    assert.match(script, /"editing-project":\s*"video-editing"/u);
    assert.match(script, /\.map\(\(link\) => resolvePageId\(/u);
    assert.match(script, /const pageId = resolvePageId\(requestedPage\);/u);
    assert.match(script, /showPage\(initialPageId === "home" \? "home" : initialPageRequest, false\)/u);
});
