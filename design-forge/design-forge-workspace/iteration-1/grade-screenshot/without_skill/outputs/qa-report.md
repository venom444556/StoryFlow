# Design QA Report: Dark-Mode SaaS Landing Page

**Date:** 2026-03-10
**Review type:** Specification-based (no screenshot provided)

---

## Overall Grade: B+

A solid, well-constructed dark-mode landing page with strong fundamentals. The spacing system is clean, contrast ratios genuinely pass AA, and the type pairing is tasteful. A few refinements would push this to A-tier.

---

## 1. Typography

### Headline: 64px Space Grotesk on #0A0A0A
- **Verdict: Strong.** Space Grotesk is a confident geometric sans with just enough personality for a SaaS headline. 64px is assertive without being overwrought.
- **Consideration:** At 64px, letter-spacing can feel loose in Space Grotesk. Tightening tracking to around -0.02em or -0.03em would add density and polish. Test at viewport widths below 768px --- 64px will need a responsive step-down (48px at tablet, 36px at mobile is a common ladder).

### Subhead: 18px DM Sans in #888888
- **Verdict: Good pairing.** DM Sans is a clean geometric complement to Space Grotesk --- similar DNA without being the same face. 18px is comfortable reading size for a subhead.
- **Consideration:** The jump from 64px headline to 18px subhead is a 3.56x ratio. This is on the edge of feeling disconnected. A 20px or 21px subhead would tighten the visual hierarchy without losing subordination. Alternatively, introduce a kicker or eyebrow line above the headline at 14px to create a three-tier hierarchy (industry standard for SaaS hero sections).

### Missing specification
- Body text, card heading, and card body type sizes are not specified. These are critical for evaluating the full type scale.

---

## 2. Color System

### Background layers
| Surface | Value | Role |
|---------|-------|------|
| Page background | #0A0A0A | Near-black, excellent. Avoids pure #000000 which causes halation on OLED screens. |
| Card background | #141414 | Subtle elevation. The 10-unit step from 0A to 14 is minimal but perceptible. |

- **Verdict: Correct approach.** Dark-mode elevation through luminance stepping is the right pattern. The step is subtle enough to feel cohesive while establishing hierarchy.

### Text colors
| Element | Color | On surface | Contrast ratio | AA status |
|---------|-------|------------|---------------|-----------|
| Headline | #E8E8E8 | #0A0A0A | 16.16:1 | PASS (exceeds AAA) |
| Subhead | #888888 | #0A0A0A | 5.58:1 | PASS AA normal text |
| Subhead | #888888 | #141414 | 5.20:1 | PASS AA normal text |
| Card text (assumed #E8E8E8) | #E8E8E8 | #141414 | 15.04:1 | PASS (exceeds AAA) |

- **Verdict: All text contrasts pass AA.** The claim is verified. The headline contrast also passes AAA (7:1 threshold). The subhead at 5.58:1 clears the 4.5:1 AA bar for normal text.

### CTA button: #4F46E5 with 12px border-radius
| Pairing | Contrast ratio | AA status |
|---------|---------------|-----------|
| White text on #4F46E5 | 6.29:1 | PASS AA normal text |
| #4F46E5 button on #0A0A0A | 3.15:1 | PASS (UI component: 3:1 threshold) |

- **Verdict: Passes, but the button-on-background contrast is tight.** At 3.15:1 against #0A0A0A, the CTA just clears the 3:1 UI component threshold. On a real screen with ambient light or color-shifted displays, this could feel low. Consider whether the button has sufficient visual weight to be immediately scannable.

### Accent observations
- #4F46E5 is Indigo-600 from Tailwind's palette. It is well-established in SaaS (Stripe, Linear, Clerk all use nearby indigos). This is safe but not differentiating. If brand distinctiveness matters, consider shifting hue slightly or pairing with a secondary accent.
- The 12px border-radius on the CTA is a moderate rounding --- modern and approachable without being pill-shaped. Consistent with current SaaS conventions.

---

## 3. Spacing & Layout

### 8px grid compliance
- 96px section spacing = 12 units. Compliant.
- 32px card padding = 4 units. Compliant.
- 16px card border-radius = 2 units. Compliant.
- 12px CTA border-radius = 1.5 units. **Not on the 8px grid.**

**Issue:** 12px border-radius breaks the 8px grid. This is a minor inconsistency. Options: round to 8px (sharper, more architectural) or 16px (softer, matches cards). If the design system commits to an 8px grid, every value should honor it. Border-radius is a common exception in practice, but calling it out for completeness.

### Section spacing: 96px
- **Verdict: Generous but appropriate for a landing page.** 96px provides breathing room between hero and features. For a marketing page where scanning speed matters, this works. For a denser product-oriented page, 64px or 72px might be tighter.

### Card grid: 3-column, 32px padding
- 32px internal padding is comfortable. Content won't feel cramped.
- **Missing:** Gap between cards is not specified. If using CSS Grid or Flexbox, a 24px or 32px gap (3 or 4 grid units) would be expected. This should be defined.
- **Missing:** Card max-width and grid container width are not specified. A 3-column grid needs a defined container (typically 1200px or 1280px max) to avoid cards stretching too wide on large displays.

---

## 4. Card Component

### Card specification
- Background: #141414
- Border-radius: 16px
- Padding: 32px
- Border: 1px solid rgba(255,255,255,0.06)

**Verdict: Well-executed.** The 6% white border is a common dark-mode pattern for creating subtle edge definition without introducing harsh lines. At 16px radius with 32px padding, the proportions feel balanced.

**Considerations:**
- The border at 0.06 opacity is extremely subtle. On lower-quality displays or at distance, it may be invisible. Consider testing at 0.08 for slightly more definition while remaining understated.
- No hover state is specified. Cards on a landing page typically serve as links or interactive elements. A hover state (e.g., border brightening to rgba(255,255,255,0.12), subtle translateY, or background lightening to #1A1A1A) should be defined.
- No icon or visual element is mentioned within cards. Pure-text feature cards can feel flat. An icon or illustration at the top of each card adds scannability.

---

## 5. Accessibility

### WCAG AA compliance: VERIFIED
All computed contrast ratios pass WCAG 2.1 AA thresholds:
- Large text (headline): 16.16:1 --- far exceeds 3:1 requirement
- Normal text (subhead at 18px): 5.58:1 --- passes 4.5:1 requirement
- CTA button text: 6.29:1 --- passes 4.5:1 requirement
- CTA button as UI component: 3.15:1 --- passes 3:1 requirement

### Items not evaluable from spec alone
- Focus indicator styles (keyboard navigation)
- Touch target sizes (minimum 44x44px for mobile)
- Reduced-motion preferences
- Screen reader heading hierarchy (is the headline an h1?)

---

## 6. Issues Summary

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| 1 | Low | 12px CTA border-radius breaks 8px grid | Change to 8px or 16px |
| 2 | Low | CTA button-on-background contrast is tight at 3.15:1 | Consider adding a subtle glow, ring, or slightly lighter button shade for better scannability |
| 3 | Medium | Card grid gap not specified | Define explicitly (24px or 32px recommended) |
| 4 | Medium | Container max-width not specified | Define max-width (1200-1280px) to prevent over-stretching |
| 5 | Low | Headline-to-subhead size ratio is steep (3.56x) | Consider 20-21px subhead or adding an eyebrow line |
| 6 | Medium | No hover/focus states defined for cards or CTA | Specify interactive states |
| 7 | Low | Card border opacity (0.06) may be invisible on some displays | Test at 0.08 |
| 8 | Info | No responsive breakpoints specified | Define type scale and layout shifts for tablet/mobile |

---

## 7. What Works Well

1. **Near-black background (#0A0A0A)** avoids the OLED halation problem of pure black. This is a detail that shows awareness.
2. **Type pairing** (Space Grotesk + DM Sans) is geometric-on-geometric with enough distinction. Clean and professional.
3. **8px grid discipline** is maintained across major spacing values. The system is coherent.
4. **Card border treatment** (rgba white at low opacity) is the correct dark-mode pattern --- subtle, modern, no visual noise.
5. **All contrast ratios genuinely pass AA.** The claim holds up under calculation.

---

## 8. Recommendations for Elevation to A-tier

1. **Define the full type scale:** headline, subhead, card heading, card body, caption. Map each to the 8px baseline grid with appropriate line-heights.
2. **Specify interactive states:** hover, focus, active, disabled for CTA and cards.
3. **Add responsive breakpoints:** at minimum 768px and 480px with adjusted type sizes and single-column card layout.
4. **Consider a secondary accent color** for variety across the features section (e.g., different icon tints per card).
5. **Define the CTA button padding** to ensure it meets 44px minimum touch target height on mobile.

---

*Review performed against WCAG 2.1 AA, common SaaS landing page conventions, and 8px grid system principles.*
