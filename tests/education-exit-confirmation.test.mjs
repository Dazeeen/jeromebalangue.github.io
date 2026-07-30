import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
const stylesheet = await readFile(path.join(projectRoot, "static", "css", "main.css"), "utf8");
const script = await readFile(path.join(projectRoot, "static", "js", "main.js"), "utf8");

test("Education mounts a hidden, content-centered exit cue between its adjacent pages", () => {
    const educationEnd = html.indexOf("</section>", html.indexOf('id="education"'));
    const cue = html.indexOf("data-education-exit-cue");
    const nextPage = html.indexOf('id="social-media-design"');

    assert.ok(educationEnd < cue && cue < nextPage);
    assert.match(html, /data-education-exit-cue[\s\S]*?aria-hidden="true"/u);
    assert.match(stylesheet, /\.education-exit-cue\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?right:\s*0;[\s\S]*?left:\s*var\(--sidebar-rail\);/u);
    assert.match(stylesheet, /@media \(max-width: 720px\)[\s\S]*?\.education-exit-cue\s*\{\s*left:\s*0;/u);
    assert.match(stylesheet, /\.education-exit-cue\.is-visible/u);
    assert.match(stylesheet, /\.education-exit-cue\.is-up\s*\{[\s\S]*?top:/u);
});

test("Education exits in both directions only after a fresh confirming wheel gesture", () => {
    assert.match(script, /const EDUCATION_EXIT_GESTURE_PAUSE_MS\s*=\s*\d+;/u);
    assert.match(script, /const isEducationAtStart/u);
    assert.match(script, /const isEducationAtExitEdge\s*=\s*\(direction\)/u);
    assert.match(script, /const registerEducationExitWheel\s*=\s*\(delta\)/u);
    assert.match(script, /setEducationExitArmed\(educationScrollDirection\)/u);
    assert.match(script, /educationExitDirection !== direction/u);
    assert.match(script, /if \(!educationExitConfirmationGestureActive\) return;/u);
    assert.match(script, /direction !== educationExitDirection \|\| !isEducationAtExitEdge\(direction\)/u);
});
