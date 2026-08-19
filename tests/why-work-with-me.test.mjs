import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
const script = await readFile(path.join(projectRoot, "static", "js", "main.js"), "utf8");
const stylesheet = await readFile(path.join(projectRoot, "static", "css", "main.css"), "utf8");

test("Why Work With Me is a navigable page after Video Editing", () => {
    assert.match(html, /id="why-work-with-me" data-page="why-work-with-me"/u);
    assert.ok(
        html.indexOf('data-page="video-editing"') < html.indexOf('data-page="why-work-with-me"'),
        "Why Work With Me must follow Video Editing in page order."
    );
    assert.match(script, /"why-work-with-me": "Why Work With Me \| Jerome Balangue"/u);
});

test("the page keeps Jerome, six value bubbles, four tools, and the mission together", () => {
    assert.match(html, /class="why-portrait__image"[^>]*id=10BJZLxjdvVAzFq2gq89UAthh-DQgezRo/su);
    assert.match(
        html,
        /<div class="why-portrait__blob">[\s\S]*?<img class="why-portrait__image"[\s\S]*?<\/div>/u,
        "Jerome must be clipped by the morphing blob itself."
    );
    assert.equal((html.match(/class="why-value why-value--/gu) || []).length, 6);
    assert.equal((html.match(/class="why-tool why-tool--/gu) || []).length, 4);
    ["CapCut", "Canva", "ChatGPT", "Gemini"].forEach((tool) => assert.match(html, new RegExp(`>${tool}<`, "u")));
    assert.match(html, /why-tool__canva-wordmark">Canva</u);
    assert.match(html, /why-tool--chatgpt[\s\S]*?<svg viewBox="0 0 24 24"/u);
    assert.match(html, /To help brands grow through strategic and visually compelling design solutions\./u);
});

test("the liquid portrait, bubbles, tools, and particles have responsive motion", () => {
    const blobWave = stylesheet.slice(
        stylesheet.indexOf("@keyframes why-blob-wave"),
        stylesheet.indexOf("@keyframes why-backdrop-wave")
    );

    assert.match(stylesheet, /@keyframes why-blob-wave/u);
    assert.match(stylesheet, /@keyframes why-backdrop-wave/u);
    assert.match(stylesheet, /@keyframes why-value-float/u);
    assert.match(stylesheet, /@keyframes why-tool-float/u);
    assert.match(stylesheet, /@keyframes why-particle-drift/u);
    assert.match(stylesheet, /\.why-tool--chatgpt svg\s*\{[^}]*fill:\s*currentColor;[^}]*stroke:\s*none;/su);
    assert.match(stylesheet, /\.why-tool__canva-wordmark\s*\{[^}]*font-family:\s*"Pinyon Script"/su);
    assert.doesNotMatch(html, /why-portrait__photo-mask/u);
    assert.match(stylesheet, /\.why-portrait__blob\s*\{[^}]*overflow:\s*hidden;/su);
    assert.doesNotMatch(blobWave, /transform:/u, "The wave must reshape the clip without moving Jerome.");
    assert.match(
        stylesheet,
        /\.why-portrait__image\s*\{[^}]*left:\s*55%;[^}]*width:\s*88%;/su
    );
    assert.match(stylesheet, /\.why-section__title\s*\{[^}]*font-size:\s*clamp\(2\.35rem, 4vw, 4\.1rem\);/su);
    assert.match(stylesheet, /url\("https:\/\/drive\.google\.com\/thumbnail\?id=/u);
    assert.match(stylesheet, /@media \(max-width: 720px\)[\s\S]*\.why-stage\s*\{/u);
    assert.match(stylesheet, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.why-portrait__blob/u);
});
