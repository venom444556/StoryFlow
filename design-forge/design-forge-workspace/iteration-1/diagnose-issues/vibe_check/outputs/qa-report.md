# Vibe Check QA Report — Landing Page Design Evaluation

**Date:** 2026-03-10
**Evaluator:** Vibe Check (CHAOS AgentOS)
**Subject:** Landing page with mixed typography, inconsistent border-radius, gradient hero, 13px body text

---

## Overall Verdict: FAIL — 7 Issues Found (3 Critical, 3 High, 1 Medium)

This design exhibits multiple hallmarks of "AI slop" as defined by the Vibe Check anti-pattern guard. The combination of three unrelated font families, inconsistent border radii, off-grid spacing, and undersized body text signals a design assembled without a coherent system. The purple-to-pink gradient hero triggers the "AI purple gradients" anti-pattern. None of the 8+1 design system dimensions are internally consistent.

---

## Issues Found

### Issue 1: Three Font Families — Typographic Chaos
**Severity:** Critical
**Dimension:** Typography
**Anti-Pattern Triggered:** "Typography using more than 2 font families" (AI Slop Detection, SKILL.md line 107)

**What's wrong:**
The design uses Inter, Playfair Display, and Fira Code simultaneously. These three fonts have completely different DNA:
- **Inter** — geometric sans-serif, designed for UI
- **Playfair Display** — high-contrast serif, designed for editorial headlines
- **Fira Code** — monospace with coding ligatures, designed for terminals

Using Fira Code for body text is particularly problematic. Monospace fonts are designed for code, not reading. Every character occupies the same width, which destroys the natural rhythm that proportional fonts create for comfortable reading. Fira Code for body text will feel like reading a legal deposition typed on a typewriter.

**The rule:** Maximum 2 font families. One for headings, one for body. A monospace font is acceptable only as a third specialized font for code snippets or data values — never for body text.

**Fix:**
Pick one of these proven pairings from the typography catalog:
- **Option A (Editorial):** Playfair Display (headings) + Source Serif 4 (body) — pairing #10, "Classic Editorial"
- **Option B (Modern):** Inter (headings + body, weight variation) — pairing #1, "Modern Technical"
- **Option C (Contrast):** Playfair Display (headings) + Lato (body) — pairing #22, "Classic Luxury"

If code snippets appear on the page, Fira Code can serve as a tertiary monospace font scoped exclusively to `<code>` and `<pre>` elements.

---

### Issue 2: Inconsistent Border-Radius Across Components
**Severity:** High
**Dimension:** Components
**Anti-Pattern Triggered:** "Cards with inconsistent border radius, shadow, or padding" (AI Slop Detection, SKILL.md line 106)

**What's wrong:**
Three different border-radius values across similar component types:
- Cards: some at 8px, others at 16px
- CTA button: 24px

This inconsistency signals the absence of a design system. When identical component types (cards) have different radii, users subconsciously perceive the interface as unreliable — like a restaurant where each table has different silverware.

**The rule:** Border-radius should follow a defined token scale, with each value tied to a component category. The design system spec defines: buttons at 8px, cards at 12px (standard). Mixing values arbitrarily within the same component type is a quality gate failure (Component Quality > Consistent Spacing).

**Fix:**
Define a border-radius token scale and apply consistently:
```
--radius-sm: 4px    (badges, chips, tags)
--radius-md: 8px    (buttons, inputs, small cards)
--radius-lg: 12px   (cards, modals, panels)
--radius-xl: 16px   (hero cards, featured sections)
--radius-full: 9999px  (pills, avatars)
```
All cards should use the same radius. If the CTA needs to feel distinct, differentiate it with color, size, or elevation — not a unique radius.

---

### Issue 3: Purple-to-Pink Gradient Hero Background
**Severity:** High
**Dimension:** Color System
**Anti-Pattern Triggered:** "AI purple gradients everywhere" (Universal Anti-Patterns, severity: High) + "Generic purple/blue gradient hero with no product identity" (AI Slop Detection, SKILL.md line 108)

**What's wrong:**
Purple-to-pink gradients are the single most overused aesthetic in post-2023 web design. Every AI startup, SaaS landing page, and template marketplace defaults to this palette. It communicates nothing about the product's identity — it communicates "we used a template" or "AI generated this."

From the anti-patterns reference: "Generic, indistinguishable from every other AI product launched since 2023. Derive palette from product identity and audience, not trend."

**Fix:**
The hero background should derive from the product's identity, not aesthetic trends:
- Identify the product category and consult the industry design rules
- Choose a palette that reinforces what the product does, not what technology it uses
- If a gradient is desired, build it from the brand's primary and secondary colors
- Solid colors with thoughtful photography or illustration often outperform gradient backgrounds

---

### Issue 4: Body Text at 13px — Below Minimum Readable Size
**Severity:** Critical
**Dimension:** Typography
**Quality Gate Failed:** Typography Scale (design-system-specifications.md)

**What's wrong:**
The design system specification defines the type scale as:
- Body: **16px** (primary reading)
- Body Small: **14px** (secondary info)
- Caption: **12px** (metadata, labels)

At 13px, the body text falls between defined scale stops (it is not on the scale at all) and sits below the 14px minimum for secondary body text. For primary reading content on a landing page, 13px is:
- Below WCAG recommended text sizing for comfortable reading
- Off the 8px-based type scale (13 is not a multiple of any standard increment)
- Likely to fail the text resizing quality gate at 200% zoom on constrained viewports
- A strain to read on low-DPI displays and for users with any visual impairment

**Fix:**
Set body text to **16px** minimum. This is the web's de facto standard body size and the explicit recommendation in the design system spec. If a more compact feel is needed, 15px with 1.6 line-height is the absolute floor — but 16px is strongly preferred.

---

### Issue 5: Section Spacing at 45px — Off the 8px Grid
**Severity:** High
**Dimension:** Spacing
**Quality Gate Failed:** Consistent Spacing (component-benchmarks.md)

**What's wrong:**
The spacing system is built on an 8px base grid:
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```

45px does not appear on this scale. It sits awkwardly between 32px (spacious) and 48px (generous). Ad-hoc spacing values (13px, 17px, 23px, 45px) are called out explicitly in UX Guideline #22 as a "don't" with High severity.

Off-grid spacing creates subtle visual dissonance. The human eye detects rhythmic inconsistency even when it cannot articulate why something feels "off."

**Fix:**
Use **48px** for major section breaks (generous), or **32px** if tighter spacing is desired (spacious). Both are on the 8px grid and create consistent vertical rhythm.

---

### Issue 6: Button Padding at 11px — Off-Grid and Undersized
**Severity:** Medium
**Dimension:** Components / Spacing
**Quality Gate Failed:** Consistent Spacing + Touch Targets

**What's wrong:**
11px is not on the spacing scale (nearest values: 8px, 12px). The design system spec defines button horizontal padding as **16px**. At 11px, the button's internal spacing will feel cramped and the text will crowd the edges.

Combined with the 13px body text, this button likely falls below the 44px minimum touch target height recommended by WCAG and enforced in the Pre-Delivery Quality Gates.

Rough calculation: 13px text + 11px top padding + 11px bottom padding = ~35px total height. This is 9px below the 44px minimum.

**Fix:**
- Set button padding to **12px vertical, 16px horizontal** (both on-grid)
- Ensure total button height reaches **44px minimum** (mobile) / **40px minimum** (desktop)
- With 16px body text: 16px text + 12px top + 12px bottom = 40px (desktop minimum met)

---

### Issue 7: #FFFFFF on #1A1A1A — Contrast Technically Passes but Misses Best Practice
**Severity:** Critical (not for contrast ratio — for the underlying dark mode strategy)
**Dimension:** Dark Mode / Color System

**What's wrong:**
The contrast ratio of #FFFFFF on #1A1A1A is approximately **17.4:1**, which far exceeds the 4.5:1 WCAG AA requirement. However, pure white (#FFFFFF) on near-black (#1A1A1A) creates excessive contrast that causes eye strain during extended reading, particularly in dark environments. This is a known dark mode anti-pattern.

The design system spec for dark mode recommends:
- Primary text: **#FAFAFA** (not pure #FFFFFF)
- Background elevated surfaces: **#1A1A1A**
- The combination of #FAFAFA on #1A1A1A = ~16.6:1 — still excellent contrast but softer on the eyes

Additionally, if this is meant to be a dark theme, the spec calls for a layered background strategy:
```
Base:      #0A0A0A (near-black)
Elevated:  #1A1A1A (cards, modals)
Overlay:   #2A2A2A (dropdowns, tooltips)
```

Using #1A1A1A as the page background without lighter surface layers flattens the visual hierarchy.

**Fix:**
- Soften text from #FFFFFF to **#FAFAFA** for primary text, **#A1A1A1** for secondary
- If dark mode: use **#0A0A0A** as base background, **#1A1A1A** for elevated cards
- If this is the only theme: provide a light mode alternative (dark-only is an anti-pattern for most landing pages unless the product targets developers)

---

## Summary Table

| # | Issue | Severity | Dimension | Fix |
|---|---|---|---|---|
| 1 | 3 font families (Inter + Playfair + Fira Code body) | Critical | Typography | Max 2 families; Fira Code for code only, never body |
| 2 | Mixed border-radius (8/16/24px) | High | Components | Define radius token scale; same radius per component type |
| 3 | Purple-to-pink gradient hero | High | Color | Derive palette from product identity, not AI aesthetic trends |
| 4 | 13px body text | Critical | Typography | Minimum 16px for body; 14px floor for secondary text |
| 5 | 45px section spacing | High | Spacing | Use 48px (on 8px grid) |
| 6 | 11px button padding | Medium | Components | Use 12px vertical / 16px horizontal; ensure 44px min height |
| 7 | Pure #FFFFFF on #1A1A1A | Critical | Dark Mode | Soften to #FAFAFA; add background layer hierarchy |

---

## Recommended Fix Priority

1. **Typography overhaul** (Issues 1 + 4) — Fix first. Pick 2 font families max, set body to 16px. This single change will have the largest impact on perceived quality.
2. **Spacing normalization** (Issues 5 + 6) — Snap all values to the 8px grid. Section spacing to 48px, button padding to 12px/16px.
3. **Border-radius consistency** (Issue 2) — Define token scale, apply uniformly.
4. **Hero background** (Issue 3) — Replace gradient with brand-derived palette.
5. **Dark mode refinement** (Issue 7) — Soften text to #FAFAFA, add background layers.

---

## Anti-Patterns Triggered

| Anti-Pattern | Source | Severity |
|---|---|---|
| Typography using more than 2 font families | AI Slop Detection | Auto-reject |
| Cards with inconsistent border radius | AI Slop Detection | Auto-reject |
| Generic purple/blue gradient hero | AI Slop Detection | Auto-reject |
| AI purple gradients everywhere | Universal Anti-Patterns | High |
| Ad-hoc spacing values | UX Guideline #22 | High |
| Typography scale violation (off-scale sizes) | Quality Gate: Typography Scale | Fail |
| Spacing grid violation (off-grid values) | Quality Gate: Consistent Spacing | Fail |

---

## Production Quality Checklist Status

| Check | Status | Notes |
|---|---|---|
| Color palette 4.5:1 contrast minimum | PASS (with caveat) | 17.4:1 exceeds minimum but causes eye strain |
| Touch targets 44x44px minimum | FAIL | Button likely ~35px with current padding/text size |
| Typography scale consistent | FAIL | 13px is off-scale |
| Spacing follows 8px grid | FAIL | 45px and 11px are off-grid |
| Components have consistent styling | FAIL | Mixed border-radius |
| Anti-pattern check passed | FAIL | 3 auto-reject patterns triggered |
| Dark mode thoughtful, not inverted | WARN | Needs layer hierarchy and softer text |
| Font families <= 2 | FAIL | 3 families used |

**Overall: 1 pass, 1 warning, 6 failures. This design requires significant revision before it meets production quality standards.**
