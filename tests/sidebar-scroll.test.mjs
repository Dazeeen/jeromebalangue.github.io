import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [css, javascript, html] = await Promise.all([
    readFile(new URL("../static/css/main.css", import.meta.url), "utf8"),
    readFile(new URL("../static/js/main.js", import.meta.url), "utf8"),
    readFile(new URL("../index.html", import.meta.url), "utf8")
]);

test("the sidebar owns wheel scrolling instead of triggering page navigation", () => {
    assert.match(javascript, /const sidebarNav = sidebar\.querySelector\("\.toc-sidebar__nav"\);/);
    assert.match(javascript, /sidebar\.addEventListener\("wheel",[\s\S]*?event\.preventDefault\(\);[\s\S]*?event\.stopPropagation\(\);[\s\S]*?sidebarNav\.scrollTop \+= event\.deltaY \* deltaMultiplier;[\s\S]*?passive: false/);
    assert.match(javascript, /event\.target\.closest\("\.toc-sidebar"\)/);
});

test("the sidebar navigation supports contained touch and momentum scrolling", () => {
    const sidebarNavRule = css.match(/\.toc-sidebar__nav\s*\{([\s\S]*?)\}/)?.[1] ?? "";

    assert.match(sidebarNavRule, /overflow-y:\s*auto;/);
    assert.match(sidebarNavRule, /overscroll-behavior-y:\s*contain;/);
    assert.match(sidebarNavRule, /touch-action:\s*pan-y;/);
    assert.match(sidebarNavRule, /-webkit-overflow-scrolling:\s*touch;/);
});

test("sidebar scroll changes are cache-busted", () => {
    assert.match(html, /static\/css\/main\.css\?v=1\.0\.47/);
    assert.match(html, /static\/js\/main\.js\?v=1\.0\.41/);
});
