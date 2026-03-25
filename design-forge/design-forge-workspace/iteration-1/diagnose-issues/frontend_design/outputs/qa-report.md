# Design QA Report: Landing Page Evaluation

**Date:** 2026-03-10
**Evaluation scope:** Typography, color, spacing, border-radius, gradient, and overall coherence

---

## Summary

This landing page has **7 significant design issues** spanning typography, spatial rhythm, consistency, and readability. The core problem is a lack of intentional design system: values feel arbitrary rather than derived from a unified scale, and the typography stack works against itself. The page reads as assembled from parts rather than designed as a whole.

**Overall grade: D+** — Needs a systemic rework, not incremental patches.

---

## Issues Found

### Issue 1: Three competing typefaces with no hierarchy logic

**Severity:** Critical

**What's wrong:** Inter (body), Playfair Display (presumably headings), and Fira Code (a monospace font used for body text) create typographic chaos. Each font carries a radically different personality:

- **Inter** — neutral, geometric sans-serif (also flagged as generic AI-slop by modern design standards)
- **Playfair Display** — high-contrast serif with editorial/luxury connotations
- **Fira Code** — monospace coding font with programming ligatures

Using three fonts is not inherently wrong, but these three have no shared DNA. Playfair Display's high-contrast serifs clash with Fira Code's mechanical monospace grid. Worse, Fira Code as body text is a readability anti-pattern: monospace fonts are designed for code editors where character alignment matters, not for flowing prose. Character spacing in monospace fonts reduces reading speed by 10-15% compared to proportional typefaces.

**Fix:** Reduce to two fonts maximum. Drop Inter entirely (it is the most generic sans-serif in the AI-generated design lexicon). Pair Playfair Display with a complementary body serif or humanist sans (e.g., Source Serif 4, Literata, or Satoshi). Reserve Fira Code exclusively for inline code snippets if the page has technical content. If the page is non-technical, remove Fira Code completely.

---

### Issue 2: 13px body text is below the accessibility floor

**Severity:** Critical

**What's wrong:** 13px body text fails to meet comfortable readability thresholds. WCAG does not mandate a minimum font size, but 16px (1rem) is the universally accepted baseline for body copy on the web. At 13px:

- Users on 1440p+ displays will struggle without zooming
- Mobile readability degrades significantly
- The text competes poorly against the bold gradient hero and card elements
- It signals "fine print" rather than "primary content"

**Fix:** Set body text to 16px minimum (1rem). For a landing page where scannability matters, 17-18px is often better. Use a modular type scale (e.g., 1.25 ratio) to derive heading sizes from the base: 16 / 20 / 25 / 31 / 39px.

---

### Issue 3: Inconsistent border-radius across cards and CTA

**Severity:** High

**What's wrong:** Three different border-radius values (8px, 16px, 24px) on related elements (cards and CTA button) break visual consistency. This is not creative variation — it reads as accidental. The CTA at 24px looks like a pill button attempting a different design language from the 8px cards next to it.

Consistent border-radius is one of the strongest signals of a coherent design system. When radius values drift, the entire page feels unfinished.

**Fix:** Pick one radius and apply it system-wide. Recommendations:
- **8px** — modern, slightly rounded, professional
- **12px** — softer, approachable
- If you want the CTA to feel distinct, differentiate it with color, scale, or shadow — not radius. A design token like `--radius-card: 12px` and `--radius-button: 12px` keeps the system tight. If you truly want two tiers, use a 2:1 ratio (e.g., 8px and 16px) with clear rules for when each applies.

---

### Issue 4: Purple-to-pink gradient hero is a design cliche

**Severity:** High

**What's wrong:** The purple-to-pink gradient is the single most overused background treatment in AI-generated and template-driven landing pages. It has become a visual shorthand for "this was not designed by a human." The skill guidelines explicitly flag purple gradients as generic AI-slop to avoid.

Beyond the cliche factor, purple-to-pink gradients often create contrast problems with white text depending on the specific hue values, especially in the pink midtones.

**Fix:** Choose a gradient that serves the brand's actual identity. Options:
- **Dark, atmospheric gradient** — deep navy to muted teal or charcoal to warm slate. Sophisticated and less common.
- **Monochromatic gradient** — single-hue with luminance shift (dark indigo to lighter indigo). Subtle and refined.
- **Solid color with texture** — skip the gradient entirely; use a rich solid color with noise/grain overlay or subtle pattern for depth.
- **Photographic or illustrative hero** — if the product has visual content, let it speak instead of a color field.

---

### Issue 5: 45px section spacing breaks the 8-point grid

**Severity:** Medium

**What's wrong:** 45px is not on any standard spatial scale (4pt, 8pt, or base-10). It creates a rhythm that cannot be evenly subdivided or multiplied. For context, the nearest 8-point values are 40px (5 units) and 48px (6 units). The 45px value will cause cumulative misalignment as sections stack, and it is awkward to pair with other spacing values in the layout.

Additionally, 45px may be too tight for section separation on a landing page. Sections need clear visual breathing room; 64-96px is more typical for major section breaks.

**Fix:** Adopt an 8-point spacing scale and use it everywhere:
- `--space-section: 64px` (8 units) for section gaps — or 80px/96px for more breathing room
- `--space-lg: 48px`, `--space-md: 32px`, `--space-sm: 16px`, `--space-xs: 8px` for internal spacing
- Document the scale as design tokens so every spacing value is traceable to the system.

---

### Issue 6: 11px button padding is too thin and off-grid

**Severity:** Medium

**What's wrong:** 11px padding on a button (presumably all sides or vertical) produces a cramped click target and an off-grid value. Buttons need generous padding for both visual comfort and touch-target compliance (WCAG recommends 44px minimum touch target). 11px vertical padding with 13px text yields roughly a 37px tall button — below the 44px minimum.

The odd number (11) also cannot come from a 4pt or 8pt grid, reinforcing the pattern of arbitrary values throughout the design.

**Fix:** Use `12px 24px` as minimum button padding (vertical/horizontal), which yields a comfortable ~42-44px height with 16px text. For a landing page CTA, `16px 32px` or even `16px 40px` is more appropriate — CTAs should feel substantial and inviting. Keep all padding values on the 4pt or 8pt grid.

---

### Issue 7: #FFFFFF on #1A1A1A is high-contrast but lacks nuance

**Severity:** Low

**What's wrong:** Pure white (#FFFFFF) on near-black (#1A1A1A) yields a contrast ratio of approximately 17.4:1, which far exceeds WCAG AAA requirements (7:1). While technically accessible, maximum contrast causes eye strain during extended reading — a known issue called "halation," where bright white text blooms against a dark background, especially for users with astigmatism (roughly 30-50% of the population).

This is not a failure, but a missed opportunity for refinement.

**Fix:** Soften the text to #E8E8E8 or #EDEDED for body copy (contrast ratio ~14:1, still AAA). Reserve pure #FFFFFF for headings and CTAs where maximum contrast serves emphasis. This two-tier approach adds typographic hierarchy while reducing visual fatigue.

---

## Prioritized Fix Recommendations

| Priority | Issue | Action |
|----------|-------|--------|
| 1 | Typography (Issues 1 + 2) | Reduce to 2 fonts, drop Inter and Fira Code body usage, set base size to 16px, establish type scale |
| 2 | Border-radius (Issue 3) | Unify to single value (8px or 12px), create `--radius` design token |
| 3 | Gradient (Issue 4) | Replace purple-to-pink with brand-appropriate palette; test contrast at all gradient points |
| 4 | Spacing system (Issues 5 + 6) | Adopt 8pt grid, set section spacing to 64-80px, button padding to 12-16px vertical |
| 5 | Text contrast (Issue 7) | Soften body text to #E8E8E8, keep #FFFFFF for headings |

## Design System Tokens to Establish

```css
:root {
  /* Typography */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Satoshi', 'Source Sans 3', sans-serif; /* replace Inter + Fira Code */
  --text-base: 1rem;        /* 16px */
  --text-lg: 1.25rem;       /* 20px */
  --text-xl: 1.563rem;      /* 25px */
  --text-2xl: 1.953rem;     /* 31px */
  --text-3xl: 2.441rem;     /* 39px */

  /* Spacing (8pt grid) */
  --space-xs: 0.5rem;       /* 8px */
  --space-sm: 1rem;         /* 16px */
  --space-md: 2rem;         /* 32px */
  --space-lg: 3rem;         /* 48px */
  --space-section: 5rem;    /* 80px */

  /* Radius */
  --radius: 0.75rem;        /* 12px — single value, system-wide */

  /* Colors */
  --text-primary: #FFFFFF;     /* headings, CTAs */
  --text-body: #E8E8E8;       /* body copy — reduced halation */
  --bg-primary: #1A1A1A;

  /* Button */
  --btn-padding: 0.75rem 2rem;  /* 12px 32px */
}
```

---

## Bottom Line

The design suffers from a missing design system, not from any single bad choice. The three-font stack, arbitrary spacing values, inconsistent radii, and cliched gradient are all symptoms of decisions made in isolation rather than derived from a unified system. Establishing the token set above and enforcing it across all elements will resolve every issue identified in this report.
