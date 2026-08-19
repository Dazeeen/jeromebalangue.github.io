import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [html, css, script] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../static/css/main.css", import.meta.url), "utf8"),
    readFile(new URL("../static/js/main.js", import.meta.url), "utf8")
]);

test("the homepage places published testimonials and a CTA below the hero", () => {
    const heroIndex = html.indexOf('class="landing__hero"');
    const testimonialsIndex = html.indexOf('class="home-testimonials"');
    const aboutIndex = html.indexOf('id="about-me"');

    assert.ok(heroIndex >= 0 && heroIndex < testimonialsIndex);
    assert.ok(testimonialsIndex < aboutIndex);
    assert.match(html, /data-home-review-track[\s\S]*?Loading client stories/u);
    assert.match(html, /href="#reviews" data-page-jump="reviews"[\s\S]*?View all reviews/u);
    assert.match(html, /href="#contact-collaboration" data-page-jump="contact-collaboration"[\s\S]*?Contact Jerome/u);
});

test("published review data renders complete, reference-style testimonial cards without profile photos", () => {
    assert.match(script, /const renderHomeTestimonials = \(reviews\)/u);
    assert.match(script, /renderHomeTestimonials\(safeReviews\)/u);
    assert.match(script, /reviewCopy\.textContent = feedback/u);
    assert.match(script, /personName\.textContent = name/u);
    assert.match(script, /"★"\.repeat\(rating\) \+ "☆"\.repeat\(5 - rating\)/u);
    assert.doesNotMatch(script, /label\.textContent = "testimonial"/u);
    assert.doesNotMatch(script, /home-testimonial-card__label/u);
    assert.doesNotMatch(css, /\.home-testimonial-card__label/u);
    assert.match(script, /Array\.from\(\{ length: 5 \}, \(\) => document\.createElement\("i"\)\)/u);
    assert.match(script, /createQuote\("closing"\)[\s\S]*?createQuote\("opening"\)/u);
    assert.match(script, /quoteShape\.setAttribute\("viewBox", "0 0 74 54"\)/u);
    assert.doesNotMatch(script, /home-testimonial-card__avatar/u);
    assert.match(css, /\.home-testimonial-card\s*\{[\s\S]*?flex: 0 0 clamp\(22rem, 29vw, 26\.1875rem\)/u);
    assert.match(css, /\.home-testimonial-card__panel\s*\{[\s\S]*?width: 87\.1cqi;[\s\S]*?min-height: 45\.8cqi;/u);
    assert.match(css, /\.home-testimonial-card__orbit\s*\{[\s\S]*?top: 20\.05cqi;[\s\S]*?width: 30\.8cqi;/u);
    assert.match(css, /\.home-testimonial-card__orbit::before\s*\{[\s\S]*?clip-path: inset\(0 0 49% 0\)/u);
    assert.match(css, /\.home-testimonial-card__dots\s*\{[\s\S]*?justify-content: space-between;/u);
    assert.match(css, /\.home-testimonial-card__dots i\s*\{[\s\S]*?border-radius: 50%;/u);
    assert.match(css, /\.home-testimonial-card__dots--left\s*\{[\s\S]*?top: 32\.5cqi;/u);
    assert.match(css, /\.home-testimonial-card__dots--right\s*\{[\s\S]*?top: 21\.9cqi;/u);
    assert.match(css, /\.home-testimonial-card__quote svg\s*\{[\s\S]*?fill: #f5f7fb;/u);
    assert.match(css, /\.home-testimonial-card__feedback\s*\{[\s\S]*?white-space: normal;/u);
    const feedbackRule = css.match(/\.home-testimonial-card__feedback\s*\{[^}]*\}/u)?.[0] || "";
    assert.doesNotMatch(feedbackRule, /line-clamp|overflow:\s*hidden/u);
});

test("one published review renders exactly one static card while multiple reviews keep the marquee", () => {
    assert.doesNotMatch(script, /Math\.max\(4, safeReviews\.length\)/u);
    assert.doesNotMatch(script, /safeReviews\[index % safeReviews\.length\]/u);
    assert.match(script, /if \(safeReviews\.length === 1\)\s*\{[\s\S]*?replaceChildren\(createGroup\(\)\)[\s\S]*?classList\.add\("is-ready", "is-static"\)/u);
    assert.match(script, /homeReviewTrack\.replaceChildren\(createGroup\(\), createGroup\(true\)\)/u);
    assert.match(css, /\.home-testimonials__track\.is-static\s*\{[\s\S]*?justify-content: center;/u);
});

test("the testimonial list continuously auto-scrolls, pauses for interaction, and respects reduced motion", () => {
    assert.match(css, /\.landing\s*\{[\s\S]*?height: 100svh;[\s\S]*?overflow-y: auto;/u);
    assert.match(css, /\.landing__hero\s*\{[\s\S]*?min-height: 100svh;[\s\S]*?overflow: hidden;/u);
    assert.match(css, /\.home-testimonials__track\s*\{[\s\S]*?display: flex;[\s\S]*?width: max-content;/u);
    assert.match(css, /\.home-testimonials__track\.is-ready:not\(\.is-static\)\s*\{[\s\S]*?animation: home-testimonials-scroll/u);
    assert.match(css, /\.home-testimonials__viewport:hover \.home-testimonials__track,[\s\S]*?animation-play-state: paused;/u);
    assert.match(css, /@keyframes home-testimonials-scroll[\s\S]*?translate3d/u);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.home-testimonials__track\.is-ready\s*\{[\s\S]*?animation: none;/u);
    assert.match(css, /\.home-testimonials\s*\{[\s\S]*?background-image:\s*url\("https:\/\/drive\.google\.com\/thumbnail/u);
    assert.doesNotMatch(css, /\.home-testimonials\s*\{[\s\S]*?rgba\(3, 13, 33, 0\.97\)/u);
    assert.match(script, /pageJumpLinks\.forEach/u);
    assert.match(html, /static\/css\/main\.css\?v=1\.0\.60/u);
    assert.match(html, /static\/js\/main\.js\?v=1\.0\.55/u);
});
