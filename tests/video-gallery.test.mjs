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
const manifest = sandbox.window.DRIVE_MEDIA_FALLBACK.galleries.video;

test("the Drive fallback keeps every video category and file", () => {
    assert.ok(manifest.categories.length > 0);
    let videoCount = 0;
    for (const category of manifest.categories) {
        assert.match(category.folder, categoryPattern);
        assert.ok(category.videos.length > 0);
        for (const video of category.videos) {
            assert.match(video.src, /^https:\/\/drive\.usercontent\.google\.com\/download\?id=/u);
            assert.match(video.mimeType, /^video\//u);
            assert.ok(video.id);
            assert.ok(video.title.trim());
            videoCount += 1;
        }
    }
    assert.equal(manifest.videoCount, videoCount);
});

test("video additions are wired to the live Drive folder catalog", async () => {
    const catalog = await readFile(
        path.join(projectRoot, "integrations", "google-apps-script", "drive-media-catalog", "Code.gs"),
        "utf8"
    );

    assert.match(catalog, /requireChildFolder_\(mediaFolder, "videos"\)/u);
    assert.match(catalog, /buildCategorizedGallery_\(videosFolder, "videos"\)/u);
    assert.match(catalog, /categoryFolderPattern:\s*\/\^--\(\.\+\?\)--\$\//u);
});

test("the page renders one dynamic categorized Video Editing view", async () => {
    const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
    const script = await readFile(path.join(projectRoot, "static", "js", "main.js"), "utf8");
    const stylesheet = await readFile(path.join(projectRoot, "static", "css", "main.css"), "utf8");

    assert.match(html, /id="video-editing"/u);
    assert.match(html, /data-video-categories/u);
    assert.match(html, /data-video-gallery/u);
    assert.match(html, /static\/js\/drive-media-data\.js/u);
    assert.doesNotMatch(html, /id="trend-editing"|id="editing-project"/u);
    assert.ok(
        html.indexOf("drive-media-data.js") < html.indexOf("static/js/main.js"),
        "Drive gallery fallback data must load before the main script."
    );
    assert.match(script, /loadDriveMediaCatalog/u);
    assert.match(script, /getFallbackDriveGallery\("video", "VIDEO_GALLERY_MANIFEST"\)/u);
    assert.match(script, /renderVideoGallery/u);
    assert.match(script, /openVideoDetail/u);
    assert.match(script, /setVideoMode/u);
    assert.match(script, /setVideoGalleryActive/u);
    assert.match(html, /data-video-cinema data-mode="rail"/u);
    assert.match(html, /data-video-detail/u);
    assert.match(html, /data-video-detail-video[^>]*crossorigin="anonymous"/u);
    assert.ok(
        script.indexOf('preview.crossOrigin = "anonymous";') < script.indexOf("preview.src = entry.src;"),
        "Drive previews must opt into CORS before their source is assigned."
    );
    assert.ok(
        script.indexOf('videoDetailVideo.crossOrigin = "anonymous";')
            < script.indexOf("videoDetailVideo.src = entry.src;"),
        "The detail player must opt into CORS before its source is assigned."
    );
    assert.match(script, /preview\.poster = getDriveThumbnailUrl\(entry\.id\);/u);
    assert.match(script, /videoDetailVideo\.poster = getDriveThumbnailUrl\(entry\.id\);/u);
    assert.doesNotMatch(html, /data-video-gallery-open|data-video-detail-gallery|data-video-mosaic/u);
    assert.doesNotMatch(script, /openVideoMosaic|closeVideoMosaic|renderVideoMosaic/u);
    assert.doesNotMatch(html, /class="video-viewer/u);
    assert.match(stylesheet, /\.video-cinema\s*\{[^}]*grid-template-rows:/su);
    assert.match(stylesheet, /\.video-poster\.is-active/u);
    assert.match(stylesheet, /@keyframes video-poster-rebuild/u);
    assert.match(stylesheet, /\.video-cinema\[data-mode="detail"\] \.video-cinema__detail/u);
    assert.doesNotMatch(stylesheet, /video-cinema__mosaic|video-mosaic-card|video-gallery-open/u);
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

test("portrait videos keep their native orientation in the detail viewer", async () => {
    const script = await readFile(path.join(projectRoot, "static", "js", "main.js"), "utf8");
    const stylesheet = await readFile(path.join(projectRoot, "static", "css", "main.css"), "utf8");

    assert.match(script, /const syncVideoOrientation = \(video, frame\)/u);
    assert.match(script, /videoHeight > videoWidth\s*\? "portrait"/u);
    assert.match(script, /syncVideoOrientation\(videoDetailVideo, videoDetail\)/u);
    assert.match(
        stylesheet,
        /\.video-cinema__detail-video\s*\{[^}]*object-fit:\s*contain;/su
    );
    assert.match(
        stylesheet,
        /\.video-cinema__detail\.is-portrait \.video-cinema__detail-video\s*\{[^}]*aspect-ratio:\s*var\(--video-aspect-ratio\);/su
    );
});

test("Video Editing uses the curtain, ignores rail wheel selection, and unmutes clicked videos", async () => {
    const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
    const script = await readFile(path.join(projectRoot, "static", "js", "main.js"), "utf8");
    const stylesheet = await readFile(path.join(projectRoot, "static", "css", "main.css"), "utf8");

    assert.match(
        stylesheet,
        /\.video-cinema\s*\{[^}]*drive\.google\.com\/thumbnail[^}]*background-size:\s*cover;/su
    );
    assert.doesNotMatch(script, /videoStage\?\.addEventListener\("wheel"|videoRailWheelDelta|videoRailWheelTimer/u);
    assert.doesNotMatch(html, /data-video-detail-video[^>]*\bmuted\b/u);
    assert.match(script, /videoDetailVideo\.controls = true;\s*videoDetailVideo\.muted = false;/u);
    assert.match(script, /setVideoWatchButtonState\(true\);\s*void videoDetailVideo\.play\(\)/u);
});
