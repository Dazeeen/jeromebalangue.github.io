import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const mediaRoot = path.join(projectRoot, "static", "media");

test("the migrated local media tree is removed from the deployable site", async () => {
    await assert.rejects(() => access(mediaRoot));
});

test("the active page and stylesheet use Drive image URLs from the bundled catalog", async () => {
    const sources = [
        await readFile(path.join(projectRoot, "index.html"), "utf8"),
        await readFile(path.join(projectRoot, "static", "css", "main.css"), "utf8"),
        await readFile(path.join(projectRoot, "review-moderation.html"), "utf8")
    ];
    const driveData = await readFile(
        path.join(projectRoot, "static", "js", "drive-media-data.js"),
        "utf8"
    );
    const sandbox = { window: {} };
    vm.runInNewContext(driveData, sandbox);
    const assetIds = new Set(Object.values(sandbox.window.DRIVE_MEDIA_FALLBACK.assets)
        .filter((asset) => asset.mimeType.startsWith("image/"))
        .map((asset) => asset.id));
    const activeSource = sources.join("\n");
    const referencedIds = [...activeSource.matchAll(/drive\.google\.com\/thumbnail\?id=([A-Za-z0-9_-]+)/gu)]
        .map((match) => match[1]);

    assert.doesNotMatch(activeSource, /(?:static\/media\/images|\.\.\/media\/images)\//u);
    assert.ok(referencedIds.length > 0);
    referencedIds.forEach((id) => assert.ok(assetIds.has(id), `Uncatalogued Drive image id: ${id}`));
});
