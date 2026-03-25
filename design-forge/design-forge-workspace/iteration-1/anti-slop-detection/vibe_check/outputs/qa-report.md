# Vibe Check QA Report — Hero Section Evaluation

**Date:** 2026-03-10
**Component:** Hero section
**Verdict:** REJECT — 7 issues found, 4 critical/high severity

---

## Summary

This hero section triggers multiple anti-slop detectors and anti-pattern rules. The purple-to-pink gradient is the single most commoditized visual pattern in current web design. Combined with a 3.5x type scale ratio problem, stock photography, and full-width text, this reads as template output rather than intentional design. Every issue below has a concrete fix.

---

## Issues Found

### Issue 1: AI Purple Gradient — Instant Commoditization
**Severity:** High
**Anti-Pattern:** "AI purple gradients everywhere" (Universal Anti-Patterns); "Purple/cyan neon as AI signal" (Emerging Tech Anti-Patterns)
**Rule:** "Generic, indistinguishable from every other AI product launched since 2023. Derive palette from product identity and audience, not trend."

#8B5CF6-to-#EC4899 is the default gradient of AI landing pages, Tailwind demos, and template marketplaces. It communicates nothing about the product. It signals "I used a template" to anyone who has seen more than three SaaS landing pages in the past two years.

**Fix:** Derive your primary color from what the product does and who it serves. If you have brand colors, use them. If not, pick a single hue that reflects the product's personality and build a tonal palette from it. One primary + one accent via opacity/shade variations, not a gradient of two unrelated hues.

---

### Issue 2: Typography Scale Broken — 42px Heading / 12px Body
**Severity:** Critical
**Rules Triggered:**
- Typography Scale gate: "All text sizes from defined scale, no ad-hoc sizes"
- UX Guideline #86: "Visual hierarchy with size + weight + color"
- UX Guideline #84: "Line height 1.5x for body text, 1.6-1.8x for small text"
- WCAG text resizing: "Text scales to 200% without loss"

The heading-to-body ratio is 3.5:1 (42px / 12px). This creates a visual cliff — the heading screams while the body whispers. Standard typographic scales use ratios between 1.2x and 1.5x per step (e.g., 48 / 36 / 24 / 18 / 16 / 14). A well-structured hero would step down more gradually.

More critically, **12px body text fails accessibility standards**. At 400 weight on a muted gray palette, 12px Inter will not meet WCAG 4.5:1 contrast requirements in most gray-on-gradient combinations. It is also physically difficult to read for anyone over 40, on mobile, or in suboptimal lighting.

**Fix:** Body text minimum 16px (Inter 400). For a hero section specifically, 18px is the floor — hero body text should be comfortable to read at arm's length. Heading at 48px or 56px with semibold (600) weight. This gives a 3:1 or 3.1:1 ratio with proper stepping through the scale.

Recommended hero scale:
- Heading: 48px, Inter 600 (semibold)
- Subheading/body: 18px, Inter 400 (regular)
- Supporting text: 16px, Inter 400

---

### Issue 3: Inter 400 on Muted Gray — Legibility Failure
**Severity:** High
**Rules Triggered:**
- Anti-Pattern: "Thin fonts for data-heavy UIs — poor legibility at small sizes"
- Contrast Ratio gate: "4.5:1 normal text, 3:1 large text"

Inter at weight 400 is already a light-reading font. Pair it with "muted gray" text on a purple-to-pink gradient background, and you have a contrast problem. Muted grays (e.g., #9CA3AF, #6B7280) on saturated purple (#8B5CF6) will likely fall below 4.5:1. Even white text on #8B5CF6 only achieves approximately 4.6:1 — barely passing.

**Fix:** Use Inter 500 (medium) minimum for body text on colored backgrounds. Use white (#FFFFFF) or very light gray (#F9FAFB) for text on the gradient, and verify contrast at the darkest point of the gradient. Run every text/background combination through WebAIM's contrast checker.

---

### Issue 4: Full-Width Text at 1440px — Unreadable Lines
**Severity:** High
**Rules Triggered:**
- UX Guideline #21: "Max 65-75 characters per line for body text (~600-800px)"
- UX Guideline #83: "45-75 characters per line (optimal 65)"

At 1440px container width with 18px text, you are looking at 160+ characters per line. Reading research is unambiguous: lines beyond 75 characters cause readers to lose their place when tracking back to the next line. This is not a preference — it is a measurable usability degradation.

**Fix:** Constrain the text block to max-width 680px (centered). The container can remain 1440px for the overall section layout, but the text content itself must be narrowed. This is standard practice on every well-designed hero section.

---

### Issue 5: Stock Office Photo — Generic and Trust-Eroding
**Severity:** Medium
**Anti-Pattern:** "Stock photos of smiling doctors — generic, erodes trust" (Healthcare, but the principle applies universally)
**Component Benchmark:** Hero sections should use "product screenshot, illustration, or video" as the visual element.

A stock photo of people in an office communicates nothing about the product. It is the visual equivalent of lorem ipsum. Users have been trained to ignore stock photography — it registers as filler, not content.

**Fix — in order of preference:**
1. **Product screenshot or UI mockup** — show the actual product. This is what converts.
2. **Abstract geometric or brand-aligned illustration** — if the product is not yet built.
3. **Short video or animated demo** — highest engagement, but heavier.
4. **No image at all** — a clean typographic hero with strong copy beats a bad stock photo every time.

If you must use photography, invest in custom photography or use a high-quality abstract image that reinforces the brand palette. Never use identifiable stock that appears on other sites.

---

### Issue 6: Centered Text Spanning Full Width — Layout Discipline Missing
**Severity:** Medium
**Rules Triggered:**
- Component Benchmark: "Single clear headline (max 8 words), subheadline (max 20 words)"
- Spacing Consistency: "Use spacing scale (4/8/12/16/24/32/48/64px)"

Centered text only works when the text block is narrow enough for the eye to find the start of each line easily. Full-width centered text on 1440px creates ragged left edges that change position wildly between lines, making scanning difficult.

**Fix:** Center the text, but constrain the text container to 600-800px max-width. Use the remaining space for a visual element (product screenshot, illustration) in a split-layout hero, or let the gradient breathe as negative space around the centered text block.

---

### Issue 7: No Mention of States, Responsiveness, or Dark Mode
**Severity:** Medium
**Quality Gates Missing:**
- Responsive: "tested at 320px, 375px, 768px, 1024px, 1440px"
- Dark Mode: "thoughtful dark palette"
- Component States: "default, hover, active, focus, disabled, error, loading"

A hero section is not just a desktop static comp. At minimum, the design needs:
- Mobile adaptation (how does 42px heading scale at 375px?)
- CTA button with hover/focus/active states
- Dark mode variant (or confirmation that light-only is intentional)
- Loading state (how does the hero appear before the image loads?)

**Fix:** Define responsive behavior. Heading should scale fluidly: `clamp(28px, 5vw, 48px)`. Body text floor at 16px. Image should have a loading skeleton or blur-up placeholder. CTA needs all interaction states defined.

---

## Anti-Slop Detection Summary

| Check | Result | Notes |
|---|---|---|
| Generic purple/blue gradient hero | FAIL | #8B5CF6 to #EC4899 is the canonical AI slop gradient |
| Typography using more than 2 font families | PASS | Single font family (Inter) |
| Color palette with no semantic meaning | FAIL | Gradient is decorative, not derived from product identity |
| Placeholder content that reads like marketing copy | UNKNOWN | Copy not provided for evaluation |
| Cards with inconsistent border radius/shadow/padding | N/A | Single component |
| Buttons with no hover/focus states | UNKNOWN | CTA states not specified |
| Stock illustration style inconsistency | FAIL | Stock photo with no product relevance |

---

## Recommended Direction

Strip back and rebuild from product identity:

1. **Color:** Pick one brand color. Build a tonal palette (50-950 shades). Use the darkest or lightest shade as hero background. Accent with one complementary hue.
2. **Typography:** Inter 600 at 48px heading, Inter 400 at 18px body. Constrain text to 680px max-width.
3. **Visual:** Replace stock photo with product screenshot or abstract brand illustration.
4. **Layout:** Split hero (text left, visual right) or centered text with narrow container and generous vertical padding (120px+ top/bottom).
5. **Background:** Solid color or very subtle gradient within the same hue family (e.g., #1E293B to #0F172A for dark, or #F8FAFC to #F1F5F9 for light). If you want color, use it as an accent on the CTA, not as the entire background.

The goal is a hero that could only belong to this product. Right now, it could belong to any of ten thousand AI landing pages.
