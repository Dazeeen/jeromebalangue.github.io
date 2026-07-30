import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const mediaRoot = path.join(projectRoot, "static", "media");
const imagesRoot = path.join(mediaRoot, "images");
const imagePattern = /\.(?:avif|gif|jpe?g|png|svg|webp)$/iu;
const labeledFilenamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:avif|gif|jpe?g|png|svg|webp)$/u;

const walkFiles = async (directory) => {
    const files = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await walkFiles(entryPath));
        if (entry.isFile()) files.push(entryPath);
    }
    return files;
};

test("every image asset lives under static/media/images", async () => {
    const imageFiles = (await walkFiles(mediaRoot)).filter((file) => imagePattern.test(file));

    assert.ok(imageFiles.length > 0);
    imageFiles.forEach((file) => {
        assert.ok(
            file.startsWith(`${imagesRoot}${path.sep}`),
            `Image is outside the images root: ${path.relative(projectRoot, file)}`
        );
    });
});

test("image filenames are readable kebab-case labels", async () => {
    const imageFiles = (await walkFiles(imagesRoot)).filter((file) => imagePattern.test(file));

    imageFiles.forEach((file) => {
        assert.match(
            path.basename(file),
            labeledFilenamePattern,
            `Unlabeled image filename: ${path.relative(imagesRoot, file)}`
        );
    });
});

test("every image path referenced by the page and stylesheet exists", async () => {
    const sources = [
        await readFile(path.join(projectRoot, "index.html"), "utf8"),
        await readFile(path.join(projectRoot, "static", "css", "main.css"), "utf8")
    ];
    const references = sources
        .flatMap((source) => [...source.matchAll(/(?:static\/media\/images|\.\.\/media\/images)\/[^"')\s]+/gu)])
        .map((match) => match[0].replace(/^\.\.\/media/gu, "static/media"))
        .map((reference) => decodeURIComponent(reference.split("?")[0]));

    assert.ok(references.length > 0);
    for (const reference of new Set(references)) {
        await assert.doesNotReject(
            () => readFile(path.join(projectRoot, ...reference.split("/"))),
            `Missing referenced image: ${reference}`
        );
    }
});
