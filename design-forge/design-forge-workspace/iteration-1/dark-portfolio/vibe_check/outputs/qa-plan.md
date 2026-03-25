# Quality Evaluation Plan: Mika Chen Portfolio

Structured QA against the vibe-check production quality checklist, pre-delivery gates, and anti-pattern guard.

---

## 1. Visual Quality Gates

| # | Gate | Method | Pass Criteria | How to Verify |
|---|------|--------|---------------|---------------|
| 1 | **Text Contrast** | Measure all text/background pairs | 4.5:1 normal, 3:1 large (>=18pt) | Check: #FAFAFA/#0A0A0A (19.3:1), #A1A1A1/#0A0A0A (7.5:1), #666666/#0A0A0A (4.6:1), #E8C547/#0A0A0A (10.2:1), #0A0A0A/#E8C547 (10.2:1 --- CTA text). All pass AA. |
| 2 | **UI Component Contrast** | Measure card borders, button edges | 3:1 against adjacent | Check: #262626 border on #0A0A0A bg = 1.7:1 --- this is decorative, not functional. Card surface #141414 on #0A0A0A = 1.4:1 --- subtle but content inside cards has full contrast. Acceptable: borders are supplementary, not sole indicators. |
| 3 | **Focus States** | Tab through all interactive elements | 2px+ outline, 3:1 contrast | Verify: CTA button focus = 2px #E8C547 outline offset 3px. Nav links focus = same. Card focus-visible = 2px #E8C547 offset 2px. Email link focus = same. All gold outlines on #0A0A0A = 10.2:1. Pass. |
| 4 | **Touch Targets** | Measure interactive element sizes | >=44x44px | CTA button = 44px height. Nav links = 16px text but hit area needs 44px min-height (verify padding). Social links same. Flag if nav link tap area is under 44px. |
| 5 | **Motion Safety** | Toggle `prefers-reduced-motion` | All non-essential animation disabled | Verify all CSS animations have `@media (prefers-reduced-motion: reduce)` override to `animation: none; transition: none;`. |
| 6 | **Responsive** | Test at 320px, 375px, 768px, 1024px, 1440px | No broken layouts, readable text | See breakpoint checklist below. |
| 7 | **Loading States** | Throttle network in DevTools | Skeleton or placeholder for async content | Portfolio thumbnails should show #1A1A1A placeholder during image load. Fonts: `display=swap` prevents FOIT. |
| 8 | **Empty States** | View with no project images loaded | No blank white rectangles | Thumbnail areas default to #1A1A1A fill --- never white on dark page. Pass by design. |

---

## 2. Typography Audit

| Check | Expected | Verify |
|-------|----------|--------|
| All sizes from defined scale | 12, 13, 16, 18, 20, 32, 48, 64px only | `forge screenshot` then measure --- no rogue sizes |
| Font families | Syne (headings) + Inter (everything else) only | Grep all text elements for fontFamily |
| Weight usage | Syne: 600, 700. Inter: 400, 500, 600 | No thin weights (< 400) anywhere |
| Line heights | 1.1 (display), 1.15 (H1), 1.2 (H2), 1.4 (H3/caption), 1.6 (body), 1.7 (about body) | All from system, no ad-hoc values |
| Letter spacing | -0.03em (display), -0.02em (H1), -0.01em (H2), 0 (body), 0.04em (caption), 0.06em (label) | Consistent scale |

---

## 3. Spacing Audit

| Check | Expected | Verify |
|-------|----------|--------|
| All spacing from 8px grid | 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px | Measure all gaps between elements |
| Page max-width | 1200px | Content sections are 1200px, nav is full-width 1440px |
| Side padding | 120px at 1440px (= 120 + 1200 + 120) | Nav and footer use 120px left/right |
| Card internal padding | 24px | All card content areas |
| Grid gap | 24px | Between project cards |

---

## 4. Color Token Audit

| Check | Expected | Verify |
|-------|----------|--------|
| No hardcoded colors outside system | Only 8 defined colors used | Scan all `forge style` calls for hex values not in token set |
| Accent usage discipline | #E8C547 appears ONLY on: CTA button bg, active nav underline, focus outlines | Count accent color instances --- should be exactly 3 usage contexts |
| Grayscale consistency | All grays are from: #0A0A0A, #141414, #1A1A1A, #262626, #333333, #666666, #A1A1A1, #FAFAFA | No off-system grays |

---

## 5. Responsive Breakpoint Checklist

### 1440px (Desktop)
- [ ] Content centered at 1200px max-width
- [ ] 2-column project grid with 24px gap
- [ ] Hero display text at 64px
- [ ] Generous 128px hero top padding

### 1024px (Small Desktop)
- [ ] Layout unchanged, slightly tighter spacing acceptable
- [ ] All text remains readable without horizontal scroll

### 768px (Tablet)
- [ ] Project grid collapses to 1 column (full width cards)
- [ ] About section collapses to single column (no 60/40 split)
- [ ] Nav links either stay or collapse to hamburger
- [ ] Touch targets remain 44px+

### 375px (Mobile)
- [ ] Display font reduces to 40px
- [ ] H1 reduces to 32px
- [ ] Page side padding reduces to 16px
- [ ] Hero top padding reduces to 80px
- [ ] Cards are full-width with proper padding
- [ ] Email and social links are tappable (44px+ height)

### 320px (Small Mobile)
- [ ] Display font reduces to 36px
- [ ] No text overflow or horizontal scroll
- [ ] All content fits within viewport width

---

## 6. Anti-Pattern Guard

| Anti-Pattern | Status | Evidence |
|---|---|---|
| AI purple gradients | PASS | Gold accent (#E8C547), no purple anywhere |
| Color-only information | PASS | Active nav uses underline + color. Focus uses outline + color. No state relies on color alone. |
| More than 2 accent colors | PASS | Single accent (#E8C547). All other colors are neutral grayscale. |
| Thin fonts for data | PASS | Minimum weight is Inter 400 (regular). Display uses 600-700. |
| No loading states | PASS | Font swap + placeholder thumbnails cover load states. |
| Placeholder marketing copy | PASS | All text is specific to Mika Chen's work --- no "revolutionize your workflow" language. |
| Generated SVG icons | PASS | No icons used. Design is purely typographic. |
| Inconsistent icon stroke weight | N/A | No icons in design. |
| More than 2 font families | PASS | Exactly 2: Syne + Inter. |
| Horizontal scroll on mobile | VERIFY | Must test at 320px --- all elements should wrap or resize. |

---

## 7. Accessibility Compliance (WCAG 2.2 AA)

| Criterion | Requirement | Status |
|-----------|-------------|--------|
| 1.4.3 Contrast (Minimum) | 4.5:1 text, 3:1 large | PASS --- all ratios verified |
| 1.4.11 Non-text Contrast | 3:1 for UI components | VERIFY --- card borders are decorative, focus outlines pass |
| 2.1.1 Keyboard | All functionality via keyboard | VERIFY --- tab order: nav links, CTA, cards, email, social links |
| 2.4.7 Focus Visible | Visible focus indicator | PASS --- 2px gold outline on all interactive elements |
| 2.3.1 Three Flashes | No flashing >3/sec | PASS --- no flashing animations |
| 1.4.12 Text Spacing | Line-height >=1.5x, paragraph >=2x, letter >=0.12x, word >=0.16x | PASS --- body line-height 1.6, all spacing generous |
| 2.5.5 Target Size | >=24x24px min | PASS --- all targets 44px+, social links need verification |

---

## 8. Performance Checklist

| Check | Expectation |
|-------|-------------|
| GPU-friendly animations | Only `transform` and `opacity` animated --- no layout-triggering properties |
| Font loading | 2 Google Fonts with `display=swap`, preconnect to fonts.googleapis.com |
| Image optimization | Thumbnails lazy-loaded, served at 2x in WebP/AVIF with fallback |
| No JavaScript animation library | CSS-only animations with `@keyframes` + `animation-delay` |
| Total page weight target | <500KB without images, <2MB with images |

---

## 9. QA Execution Sequence

1. **`forge screenshot --scale 2`** --- capture full page at 2x for pixel review
2. **Visual scan** --- verify hierarchy, spacing rhythm, color discipline
3. **Contrast check** --- run WebAIM tool on all text/bg pairs (already calculated but verify rendered)
4. **Tab-through test** --- keyboard navigate the entire page, verify focus ring visibility
5. **Resize test** --- manually test at each breakpoint (1440, 1024, 768, 375, 320)
6. **Reduced motion test** --- enable `prefers-reduced-motion`, verify all animation stops
7. **Font fallback test** --- block Google Fonts, verify system fallback renders acceptably
8. **Network throttle test** --- slow 3G, verify placeholder states appear
9. **Color blindness simulation** --- run through protanopia, deuteranopia, tritanopia filters to verify no information loss

---

## 10. Scoring Rubric

Each dimension scored 1-5 (5 = Linear/Vercel level):

| Dimension | Target | Fail If |
|-----------|--------|---------|
| Color discipline | 5 | More than 1 accent used, or any off-system color |
| Typography | 5 | Any rogue size, weight < 400, or third font family |
| Spacing rhythm | 5 | Any spacing not from 8px grid system |
| Visual hierarchy | 5 | Hero and CTA do not dominate, or sections feel flat |
| Contrast / accessibility | 4+ | Any text below 4.5:1, or missing focus states |
| Responsive | 4+ | Broken layout at any breakpoint, or horizontal scroll |
| Animation | 4+ | Janky transitions, no reduced-motion support |
| Performance | 4+ | Page weight > 2MB, or layout shift visible |
| Overall impression | 5 | Does not feel like it belongs next to linear.app or vercel.com |

**Minimum passing score:** 4.0 average across all dimensions. Any single dimension at 2 or below is a blocker.
