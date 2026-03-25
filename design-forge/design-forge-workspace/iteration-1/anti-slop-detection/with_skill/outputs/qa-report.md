# Visual QA Report

## Overall: F

The design described is a textbook accumulation of AI-generated design anti-patterns. It fails on every dimension of the rubric and triggers 6 out of 10 anti-slop checklist items. This section should be rebuilt from scratch.

---

| Dimension | Grade | Notes |
|-----------|-------|-------|
| Typography | F | 42px heading with 400 weight creates no hierarchy (needs 600-800 weight). 12px body text is below the 14px minimum for any content that isn't a badge or tag. Inter at 400 weight on a muted gray palette is the definition of "generic AI output" -- Inter requires bold brand colors to avoid looking templated. The heading-to-body ratio (42:12 = 3.5x) is extreme and creates a visual gap rather than a readable hierarchy. |
| Color | F | Purple-to-pink gradient (#8B5CF6 to #EC4899) is the single most recognized "AI made this" signal in web design. It is explicitly banned in the anti-slop checklist (rule #1) and the design principles ("Never: Purple-to-pink"). A muted gray palette paired with a loud gradient creates tonal whiplash -- the background screams while the text whispers. No evidence of a structured 5-color palette or intentional accent usage. |
| Spacing | D | Centered text spanning the full 1440px container violates the max center-aligned width rule (600px max). At 12px font size, a 1440px container produces lines of ~240+ characters -- roughly 4x the recommended 65-75 character max line width. No evidence of 8px grid adherence or intentional vertical rhythm (headline -> 24px -> subhead -> 32px -> CTA). |
| Layout | D | Full-width centered text with a stock photo is the lowest-effort hero layout. No structural indication of clear section boundaries, content containment, or responsive-ready design. The hero should answer 3 questions in 5 seconds (what is this, who is it for, what do I do next) -- a stock photo of "people in an office" answers none of them. No mention of a CTA button. |
| Polish | D | Stock photography of generic office scenes signals template-grade work. No mention of border-radius consistency, shadow system, hover states, or grain/noise texture on the gradient. The combination of anti-patterns (gradient + stock photo + Inter 400 + 12px body) reads as unfinished and unintentional. |

---

## Anti-Slop Checklist

| # | Check | Result | Detail |
|---|-------|--------|--------|
| 1 | No purple-to-pink gradients | FAIL | #8B5CF6 to #EC4899 is exactly this pattern |
| 2 | No Inter on timid palettes | FAIL | Inter 400 on muted gray -- textbook generic |
| 3 | Max 2 fonts | PASS | Only Inter mentioned |
| 4 | No text below 14px | FAIL | 12px body text violates the minimum |
| 5 | No centered text on wide containers | FAIL | Centered text spanning full 1440px (max is 600px for centered) |
| 6 | No stock photos | FAIL | Generic "people in an office" stock photo |
| 7 | Spacing on 8px grid | UNKNOWN | No spacing values provided to verify |
| 8 | Contrast passes AA | UNKNOWN | Cannot verify without knowing text color on gradient background; white text on #EC4899 (pink) yields approximately 3.2:1 -- likely fails AA for body text (needs 4.5:1) |
| 9 | No pure white/black in dark mode | UNKNOWN | Mode not specified |
| 10 | Icon style consistent | N/A | No icons described |

**Anti-slop score: 5 definite failures, 0-2 probable additional failures. This design is a slop archetype.**

---

## Fixes Required

These are not optional tweaks. Every item addresses a rubric failure.

### 1. Replace the gradient entirely

The purple-to-pink gradient must go. Choose ONE of these alternatives:

- **Option A: Solid dark background.** Use #0A0A0A to #141414. Let typography and a single brand accent do the work. Reference: Linear.app hero.
- **Option B: Subtle brand-tinted gradient.** Pick one brand hue, shift it 10-15 degrees within the same family (e.g., #1E3A5F to #0F1B2D -- dark navy). Desaturate 20-30%. Add 2-5% noise/grain overlay for depth.
- **Option C: No gradient.** Use a flat surface color and rely on spacing + type hierarchy for visual interest. This is harder to get wrong.

### 2. Fix the typography scale

| Element | Current | Fix to |
|---------|---------|--------|
| Heading size | 42px | 56-72px (hero H1 range) |
| Heading weight | 400 | 700-800 |
| Body size | 12px | 16-18px |
| Body weight | 400 | 400 (fine for body) |
| Letter-spacing (heading) | default | -0.02em |
| Line height (heading) | unknown | 1.05-1.1 |
| Line height (body) | unknown | 1.5-1.6 |

If keeping Inter for body, pair it with a display typeface that has personality:
- Space Grotesk (geometric, modern)
- Cabinet Grotesk (warm, distinctive)
- Clash Display (bold, editorial)

Inter alone at 400 weight cannot carry a hero section.

### 3. Constrain the text width

- Max content width for centered text: 600px (not 1440px)
- Alternatively: left-align the text in a 600-700px column on the left half, place the visual element on the right (split hero layout)
- This fixes both the readability problem (65-75 char line length) and the "floating in space" layout problem

### 4. Replace the stock photo

Stock photos of "people in an office" communicate nothing about your product. Alternatives ranked by effectiveness:

1. **Product screenshot or demo** -- shows exactly what the user gets (highest conversion signal)
2. **Abstract 3D illustration** -- custom, memorable, brand-ownable
3. **Architectural/geometric graphic** -- clean, professional, says "we designed this intentionally"
4. **Nothing** -- a well-designed hero with strong typography needs no image. See: Linear.app, Vercel.com

### 5. Add a CTA

The hero description has no call-to-action button. A hero must answer "what do I do next?" within 5 seconds. Add:
- High-contrast button (brand color background, contrasting text)
- Action verb label ("Start building", "Try it free", "See how it works")
- Position: 32-48px below the body text
- Min height: 44px, horizontal padding: 16-24px

### 6. Verify contrast

Once the gradient is replaced and text colors are chosen, verify every text/background pair:
- Body text (16-18px): minimum 4.5:1 contrast ratio
- Heading text (56-72px, bold): minimum 3:1 contrast ratio
- CTA button text: minimum 4.5:1 against button background

---

## Summary

This design hits 5 of the 10 anti-slop signals, which means it reads as AI-generated template output at first glance. The purple-to-pink gradient alone is disqualifying -- it has become the universal marker of unreviewed AI design. Combined with Inter 400 on a timid palette, 12px body text, full-width centered text, and a stock photo, this hero section communicates "nobody designed this."

The fixes above are structural, not cosmetic. Applying them transforms the section from template to intentional. Start with the gradient and typography -- those two changes alone would move this from F to C range. Add the text width constraint and stock photo replacement to reach B. Polish and CTA get it to A.
