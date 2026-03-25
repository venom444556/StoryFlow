# Design QA Report — Landing Page Evaluation

**Date:** 2026-03-10
**Evaluated by:** Claude (without skill)

---

## Summary

This landing page design contains several issues across typography, spacing, and visual consistency. The most significant problems are excessive font variety, inconsistent border radii, non-standard spacing values, and body text that is too small for comfortable reading. Six issues were identified, ranging from high to low severity.

---

## Issues Found

### Issue 1: Too Many Typefaces (High Severity)

**What:** The design uses three different fonts — Inter, Playfair Display, and Fira Code — with Fira Code (a monospace font) assigned to body text.

**Why this is a problem:**
- Best practice limits a design to two typefaces maximum. Three creates visual fragmentation and weakens brand coherence.
- Fira Code is a monospace font designed for code editors. Using it for body text degrades readability because monospace fonts have uneven visual rhythm at paragraph length — every character occupies the same width, which slows reading speed compared to proportional fonts.
- The combination of a geometric sans-serif (Inter), a transitional serif (Playfair Display), and a monospace (Fira Code) lacks a unifying design rationale.

**Recommendation:** Use Inter for body text and UI elements. Use Playfair Display for display headings if a serif accent is desired. Remove Fira Code entirely, or restrict it to code snippets only.

---

### Issue 2: Body Text Size Too Small (High Severity)

**What:** Body text is set at 13px.

**Why this is a problem:**
- The widely accepted minimum for body text on the web is 16px (1rem). WCAG does not mandate a specific font size, but 16px is the browser default and the established baseline for readability.
- At 13px, text becomes difficult to read on mobile devices and for users with any degree of visual impairment.
- Combined with Fira Code's monospace letterforms, 13px compounds the readability problem significantly.

**Recommendation:** Increase body text to 16px minimum. If a denser feel is desired, 15px is the absolute floor for a proportional font, but 16px remains the standard.

---

### Issue 3: Inconsistent Border Radius (Medium Severity)

**What:** Cards use mixed border-radius values — 8px on some, 16px on others, and 24px on the CTA.

**Why this is a problem:**
- Inconsistent border radii across elements of the same type (cards) create visual disorder. The eye registers the inconsistency even if the user cannot articulate it.
- A 3x range (8px to 24px) is too wide to read as intentional variation — it reads as accidental.
- The CTA at 24px may be intentionally more rounded to draw attention, but this should be a distinct element category, not a card variant.

**Recommendation:** Standardize cards to a single border-radius (8px is a safe, modern default). If the CTA button needs to stand out, differentiate it through color, size, or elevation rather than a different radius on its container. Establish a spacing/radius scale (e.g., 4px, 8px, 12px, 16px) and apply it consistently by element type.

---

### Issue 4: Non-Standard Spacing Values (Medium Severity)

**What:** Section spacing is 45px and button padding is 11px.

**Why this is a problem:**
- These values do not align with any standard spacing scale (4px, 8px, multiples of 4, or multiples of 8). A 45px gap and 11px padding are odd numbers that break grid alignment.
- 45px section spacing is likely too tight for clear visual separation between landing page sections. Typical section spacing ranges from 64px to 120px depending on content density.
- 11px button padding is slightly undersized and will produce visually cramped buttons, especially on touch targets where 44px minimum tap area is recommended (per Apple HIG and WCAG 2.5.5).

**Recommendation:** Adopt an 8px spacing scale. Use 48px (6 units) or 64px (8 units) for section spacing. Use 12px or 16px for button padding (vertical), ensuring the overall button height meets 44px minimum touch target.

---

### Issue 5: Contrast and Color Considerations (Low Severity)

**What:** #FFFFFF text on #1A1A1A background, with a purple-to-pink gradient hero.

**Why this is a problem:**
- The text/background contrast is technically excellent — #FFFFFF on #1A1A1A yields a contrast ratio of approximately 17.4:1, well above the WCAG AAA requirement of 7:1.
- However, pure white (#FFFFFF) on near-black (#1A1A1A) can cause halation (a glowing/blooming effect) for users with astigmatism, which affects roughly 33% of the population. This makes extended reading uncomfortable.
- The gradient hero introduces a question: if white text overlays the purple-to-pink gradient, contrast will vary across the gradient. Lighter pinks may fail contrast requirements.

**Recommendation:** Soften the white to #E8E8E8 or #F0F0F0 to reduce halation while maintaining strong contrast (still well above AAA). Verify that text placed over the gradient hero maintains at least 4.5:1 contrast at every point in the gradient, including the lightest pink area. Consider adding a dark overlay or text shadow if the gradient undermines readability.

---

### Issue 6: Gradient Hero Context (Low Severity)

**What:** Purple-to-pink gradient used as the hero background.

**Why this is a problem:**
- A purple-to-pink gradient is a common pattern and not inherently problematic, but without knowing the brand's color palette, it may conflict with the rest of the page's dark (#1A1A1A) aesthetic.
- The transition from a vibrant gradient hero into a dark, flat content area can create a jarring visual shift if not handled with a smooth transition or intermediary section.

**Recommendation:** Ensure the gradient colors are derived from the brand palette. Add a smooth transition (e.g., gradient fading into #1A1A1A) rather than a hard edge between the hero and the content sections below.

---

## Summary Table

| # | Issue | Severity | Category |
|---|-------|----------|----------|
| 1 | Three typefaces, monospace for body text | High | Typography |
| 2 | 13px body text (below 16px minimum) | High | Typography / Accessibility |
| 3 | Mixed border-radius (8/16/24px) on cards | Medium | Visual Consistency |
| 4 | Non-standard spacing (45px sections, 11px button padding) | Medium | Layout / Spacing |
| 5 | Pure white on near-black halation risk; gradient contrast unverified | Low | Accessibility / Color |
| 6 | Gradient-to-dark transition may be jarring | Low | Visual Design |

---

## Overall Assessment

The design has strong foundations (dark theme, good base contrast ratio, modern font choices available) but suffers from inconsistency in execution. The two high-severity issues — monospace body text and undersized font — should be addressed before development. The medium-severity issues around spacing and border-radius should be standardized to a design token system to prevent drift. The low-severity color issues are refinements that improve polish and accessibility.
