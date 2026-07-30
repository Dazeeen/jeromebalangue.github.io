import { watch } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const galleryRoot = path.join(
    projectRoot,
    "static",
    "media",
    "images",
    "AI_generated_design"
);
const manifestPath = path.join(galleryRoot, "gallery.json");
const manifestScriptPath = path.join(galleryRoot, "gallery-data.js");
const imageExtensionPattern = /\.(?:avif|gif|jpe?g|png|svg|webp)$/iu;
const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const labelFromFilename = (filename) => filename
    .replace(/\.[^.]+$/u, "")
    .replace(/[_-]+/gu, " ")
    .replace(/\bai\b/giu, "AI")
    .replace(/\s+/gu, " ")
    .trim()
    .replace(/\b\w/gu, (character) => character.toUpperCase());

const publicImagePath = (filename) => [
    "static",
    "media",
    "images",
    "AI_generated_design",
    filename
].map(encodeURIComponent).join("/");

const readImageDimensions = async (filename) => {
    const extension = path.extname(filename).toLowerCase();
    const image = await readFile(path.join(galleryRoot, filename));

    if (extension === ".png" && image.length >= 24) {
        return { width: image.readUInt32BE(16), height: image.readUInt32BE(20) };
    }

    if ((extension === ".jpg" || extension === ".jpeg") && image.length >= 12) {
        const sizeMarkers = new Set([
            0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
            0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf
        ]);
        let offset = 2;
        while (offset + 9 < image.length) {
            if (image[offset] !== 0xff) {
                offset += 1;
                continue;
            }
            const marker = image[offset + 1];
            if (sizeMarkers.has(marker)) {
                return {
                    width: image.readUInt16BE(offset + 7),
                    height: image.readUInt16BE(offset + 5)
                };
            }
            if (marker === 0xd8 || marker === 0xd9) {
                offset += 2;
                continue;
            }
            const segmentLength = image.readUInt16BE(offset + 2);
            if (segmentLength < 2) break;
            offset += segmentLength + 2;
        }
    }

    return {};
};

const buildManifest = async () => {
    const imageEntries = (await readdir(galleryRoot, { withFileTypes: true }))
        .filter((entry) => entry.isFile() && imageExtensionPattern.test(entry.name))
        .sort((left, right) => collator.compare(left.name, right.name));

    const images = await Promise.all(imageEntries.map(async (image) => ({
        file: image.name,
        src: publicImagePath(image.name),
        alt: labelFromFilename(image.name),
        ...await readImageDimensions(image.name)
    })));

    return {
        version: 1,
        imageCount: imageEntries.length,
        images
    };
};

const serializeManifest = (manifest) => ({
    json: `${JSON.stringify(manifest, null, 2)}\n`,
    script: `window.AI_GALLERY_MANIFEST = ${JSON.stringify(manifest, null, 2)};\n`
});

const writeManifest = async () => {
    const manifest = await buildManifest();
    const serialized = serializeManifest(manifest);
    await Promise.all([
        writeFile(manifestPath, serialized.json, "utf8"),
        writeFile(manifestScriptPath, serialized.script, "utf8")
    ]);
    console.log(`Generated AI gallery data with ${manifest.imageCount} images.`);
};

if (process.argv.includes("--check")) {
    const manifest = await buildManifest();
    const serialized = serializeManifest(manifest);
    let existingManifest = "";
    let existingManifestScript = "";
    try {
        existingManifest = await readFile(manifestPath, "utf8");
    } catch {
        // A missing manifest is reported by the comparison below.
    }
    try {
        existingManifestScript = await readFile(manifestScriptPath, "utf8");
    } catch {
        // A missing browser data script is reported by the comparison below.
    }

    if (
        existingManifest !== serialized.json
        || existingManifestScript !== serialized.script
    ) {
        console.error("AI gallery data files are missing or stale. Run:");
        console.error("  node scripts/generate-ai-gallery.mjs");
        process.exitCode = 1;
    } else {
        console.log(`AI gallery data is current (${manifest.imageCount} images).`);
    }
} else {
    await writeManifest();

    if (process.argv.includes("--watch")) {
        let updateTimer = null;
        let updateQueue = Promise.resolve();
        watch(galleryRoot, { persistent: true }, (eventType, changedFile) => {
            const filename = changedFile?.toString() || "";
            if (!filename || !imageExtensionPattern.test(filename)) return;

            clearTimeout(updateTimer);
            updateTimer = setTimeout(() => {
                updateQueue = updateQueue
                    .then(writeManifest)
                    .catch((error) => {
                        console.error("AI gallery data could not be regenerated.", error);
                        process.exitCode = 1;
                    });
            }, 180);
        });
        console.log(`Watching ${galleryRoot} for image changes. Press Ctrl+C to stop.`);
    }
}
