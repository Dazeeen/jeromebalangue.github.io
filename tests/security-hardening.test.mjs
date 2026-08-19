import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [html, moderationHtml, mainScript, driveData, securityPolicy] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../review-moderation.html", import.meta.url), "utf8"),
    readFile(new URL("../static/js/main.js", import.meta.url), "utf8"),
    readFile(new URL("../static/js/drive-media-data.js", import.meta.url), "utf8"),
    readFile(new URL("../SECURITY.md", import.meta.url), "utf8")
]);

test("the public pages enforce a restrictive browser policy", () => {
    for (const page of [html, moderationHtml]) {
        assert.match(page, /http-equiv="Content-Security-Policy"/u);
        assert.match(page, /default-src 'none'/u);
        assert.match(page, /script-src 'self'/u);
        assert.match(page, /object-src 'none'/u);
        assert.match(page, /require-trusted-types-for 'script'/u);
        assert.match(page, /name="referrer" content="no-referrer"/u);
        assert.doesNotMatch(page, /script-src[^;]*'unsafe-inline'/u);
        assert.doesNotMatch(page, /script-src[^;]*'unsafe-eval'/u);
    }
    assert.doesNotMatch(mainScript, /\.innerHTML\s*=|\beval\(|new Function/u);
});

test("the Drive catalog is sandboxed and rejects spoofed messages", () => {
    assert.match(mainScript, /catalogFrame\.setAttribute\("sandbox", "allow-scripts allow-same-origin"\)/u);
    assert.match(mainScript, /event\.source !== catalogFrame\.contentWindow/u);
    assert.match(mainScript, /isTrustedGoogleAppsScriptOrigin\(event\.origin\)/u);
    assert.match(mainScript, /event\.data\?\.nonce !== requestNonce/u);
    assert.match(mainScript, /event\.data\?\.source !== DRIVE_MEDIA_CATALOG_SOURCE/u);
    assert.doesNotMatch(mainScript, /document\.createElement\("script"\)[\s\S]*?catalogUrl/u);
});

test("the hero résumé download uses only the public PDF file", () => {
    assert.match(html, /class="resume-download"[\s\S]*?data-resume-download/u);
    assert.match(html, /drive\.usercontent\.google\.com\/download\?id=1D_4vuNZl4jcVPtUhJgp8ShbcuKHLpsBv/u);
    assert.match(mainScript, /syncResumeDownload\(window\.DRIVE_MEDIA_FALLBACK\?\.resume\)/u);
    assert.match(mainScript, /\^\[A-Za-z0-9_-\]\{10,\}\$/u);
    assert.doesNotMatch(driveData, /mediaFolderUrl|images\/(?:archive|source-assets)\//u);
});

test("the repository documents the unavoidable public-source boundary", () => {
    assert.match(securityPolicy, /public static GitHub Pages site/u);
    assert.match(securityPolicy, /No password, API secret, private token/u);
    assert.match(securityPolicy, /source assets and archives remain private/u);
});
