# Quality Evaluation Plan: DevForge Landing Page

Structured QA across all 8+1 design dimensions, anti-pattern checks, accessibility conformance, and usability heuristics.

---

## 1. Visual Quality Gates

### Contrast Ratio Verification

| Test | Element Pair | Expected Ratio | Tool | Pass Criteria |
|------|-------------|----------------|------|---------------|
| V-01 | `text-primary` (#F1F5F9) on `bg-base` (#0B0F19) | 15.3:1 | WebAIM Checker | >= 4.5:1 (AAA) |
| V-02 | `text-secondary` (#94A3B8) on `bg-base` (#0B0F19) | 7.2:1 | WebAIM Checker | >= 4.5:1 (AA) |
| V-03 | `text-tertiary` (#64748B) on `bg-base` (#0B0F19) | 4.6:1 | WebAIM Checker | >= 4.5:1 (AA) |
| V-04 | `text-secondary` (#94A3B8) on `bg-surface` (#131927) | 6.1:1 | WebAIM Checker | >= 4.5:1 (AA) |
| V-05 | `accent-green` (#10B981) on `bg-base` (#0B0F19) | 8.1:1 | WebAIM Checker | >= 3:1 (UI component) |
| V-06 | White (#FFFFFF) on `accent-green` (#10B981) | 4.5:1 | WebAIM Checker | >= 4.5:1 (button text) |
| V-07 | `accent-cyan` (#06B6D4) on `bg-surface` (#131927) | 6.5:1 | WebAIM Checker | >= 4.5:1 (AA) |
| V-08 | `accent-amber` (#F59E0B) on `bg-surface` (#131927) | 7.8:1 | WebAIM Checker | >= 3:1 (badge) |

### Focus State Verification

| Test | Element | Method | Pass Criteria |
|------|---------|--------|---------------|
| F-01 | Nav CTA button | Tab navigation | 2px+ outline visible, 3:1 contrast against adjacent |
| F-02 | Hero primary CTA | Tab navigation | Visible focus ring, distinct from hover state |
| F-03 | Hero secondary CTA (npm command) | Tab navigation | Focus ring visible on dark surface |
| F-04 | Pricing card CTAs (all 3) | Tab navigation | Each CTA receives focus sequentially |
| F-05 | Pricing toggle | Tab + Enter/Space | Toggle activates on keyboard, focus visible |
| F-06 | Footer links | Tab navigation | All links focusable, visible indicator |
| F-07 | Social icons | Tab navigation | Focus ring + tooltip shown |

### Touch Target Verification

| Test | Element | Expected Size | Pass Criteria |
|------|---------|--------------|---------------|
| T-01 | Nav CTA | 120x36px | >= 24x24px minimum (needs 44px on mobile) |
| T-02 | Hero primary CTA | 160x44px | >= 44x44px |
| T-03 | Hero secondary CTA | 280x44px | >= 44x44px |
| T-04 | Pricing card CTAs | 240x44px | >= 44x44px |
| T-05 | Footer social icons | 20x20px hit area | Needs 44x44px tap target (add padding) |
| T-06 | Nav links (mobile hamburger) | TBD | >= 44x44px per menu item |

**Action items from touch targets:**
- T-01: Nav CTA height is 36px desktop — acceptable, but mobile version must be 44px+
- T-05: Social icons are 20px visual size — wrap in 44x44px tap target frames with transparent padding

---

## 2. Design System Dimension Checks (8+1)

### Dimension 1: Color

| Check | Status | Notes |
|-------|--------|-------|
| Palette derived from product identity, not trend | VERIFY | Green/cyan = terminal/CLI aesthetic = appropriate |
| Max 2 accent colors | VERIFY | Green (primary) + Cyan (secondary) — count |
| No hex literals in implementation | VERIFY | All colors must use token names |
| Success/Warning/Error semantically correct | VERIFY | Green=success, Amber=warning, Red=error |
| No color-only information | VERIFY | All states pair color with icon or label |

### Dimension 2: Typography

| Check | Status | Notes |
|-------|--------|-------|
| Max 2 font families (+ 1 monospace) | VERIFY | Inter + JetBrains Mono = pass |
| All sizes from defined scale | VERIFY | No ad-hoc sizes (check every text element) |
| Line heights within 1.1-1.8 range | VERIFY | Display 1.1, body 1.5, relaxed 1.6 |
| Letter spacing consistent | VERIFY | Tight for display, normal for body, wide for caps |
| Font weight range reasonable | VERIFY | 400-700 for Inter, 500 for JetBrains Mono |

### Dimension 3: Spacing

| Check | Status | Notes |
|-------|--------|-------|
| All spacing from 8px base grid | VERIFY | 4/8/12/16/24/32/48/64/80/120 |
| No arbitrary spacing values | VERIFY | Audit all margin/padding values |
| Consistent card padding | VERIFY | All cards = 24px or 32px padding |
| Section padding consistent | VERIFY | 120px for major sections, 48px for minor |

### Dimension 4: Components

| Check | Status | Notes |
|-------|--------|-------|
| All buttons have hover + active + focus + disabled states | VERIFY | Primary, secondary, CTA variants |
| Cards have hover state | VERIFY | Feature cards: translate-y + border change |
| Toggle has both states visually distinct | VERIFY | Monthly = active bg, Annual = transparent |
| Icons from established library (Lucide) | VERIFY | No generated SVGs |
| Consistent border-radius | VERIFY | 8px (buttons), 12px (cards), 4px (badges) |

### Dimension 5: Data Visualization

| Check | Status | Notes |
|-------|--------|-------|
| N/A — landing page has no charts | SKIP | Terminal mockup is static content, not data viz |

### Dimension 6: Interaction & Animation

| Check | Status | Notes |
|-------|--------|-------|
| All animations < 400ms | VERIFY | Longest is 400ms scroll-in |
| GPU-accelerated properties only | VERIFY | transform + opacity only, no layout thrash |
| `prefers-reduced-motion` respected | VERIFY | All animations must have reduced motion fallback |
| No auto-playing animations | VERIFY | Terminal is static, no typing effect auto-play |
| Hover states have 150-200ms transition | VERIFY | Consistent easing across elements |

### Dimension 7: Responsive

| Check | Status | Notes |
|-------|--------|-------|
| Tested at 320px | VERIFY | Minimum viewport — no horizontal scroll |
| Tested at 375px | VERIFY | iPhone SE — hero headline wraps cleanly |
| Tested at 768px | VERIFY | Tablet — features 2-col, pricing 3-col compact |
| Tested at 1024px | VERIFY | Small desktop — all content fits |
| Tested at 1440px | VERIFY | Design target — pixel-perfect |
| No horizontal scrolling at any breakpoint | VERIFY | Critical check |
| Font sizes scale down appropriately | VERIFY | 64px hero -> 48px tablet -> 36px mobile |

### Dimension 8: Dark Mode

| Check | Status | Notes |
|-------|--------|-------|
| Page is dark-native (not inverted light) | VERIFY | Built dark-first, no light mode inversion needed |
| Surface colors create depth hierarchy | VERIFY | base < surface < surface-hover creates layering |
| Text hierarchy preserved in dark context | VERIFY | primary > secondary > tertiary all readable |
| Green accent legible on dark backgrounds | VERIFY | 8.1:1 on base, 6.5:1 on surface |
| No pure black (#000000) backgrounds | VERIFY | Using #0B0F19 — navy tint for depth |

### Dimension +1: Design Token Interchange (W3C DTCG)

| Check | Status | Notes |
|-------|--------|-------|
| Tokens exportable to JSON format | VERIFY | All colors, spacing, typography defined as tokens |
| Token naming follows semantic convention | VERIFY | `bg-base`, `text-primary`, `accent-green` pattern |
| No hard-coded values in implementation | VERIFY | All values reference token names |

---

## 3. Anti-Pattern Audit

| # | Anti-Pattern | Check | Expected Result |
|---|-------------|-------|-----------------|
| AP-01 | AI purple gradients | No purple in palette | PASS — green/cyan palette, zero purple |
| AP-02 | Color-only information | All states have icon+label | VERIFY all feature checkmarks, pricing badges |
| AP-03 | More than 2 accent colors | Count distinct accents | PASS — green + cyan only (amber is semantic, not accent) |
| AP-04 | No loading states | N/A for static landing | SKIP — static page, no async content |
| AP-05 | Thin fonts for data | Check font weights on metrics | PASS — JetBrains Mono 500, Inter 600+ for metrics |
| AP-06 | Consumer onboarding patterns | No signup wizard, no gamification | PASS — CLI-first, `npm install` is the onboarding |
| AP-07 | Placeholder-as-label | No form fields on landing page | SKIP |
| AP-08 | Icon-only navigation without labels | Check footer social icons | FLAG — social icons need aria-labels + tooltips |
| AP-09 | Generated SVG icons | Verify Lucide usage | VERIFY — all icons must reference Lucide set |
| AP-10 | Inconsistent icon stroke weight | Audit all icons for 2px consistency | VERIFY — all Lucide icons default to 2px |
| AP-11 | Stock illustration inconsistency | No illustrations used | PASS — terminal mockup is CSS/HTML, not illustration |
| AP-12 | Generic marketing copy | Check all text for substance | VERIFY — "10 seconds", "8.3s", specific metrics, not vague |

---

## 4. Accessibility Conformance (WCAG 2.2 AA)

### POUR Principles

| Principle | Test | Method | Pass Criteria |
|-----------|------|--------|---------------|
| **Perceivable** | All text meets contrast ratios | Automated contrast checker | See V-01 through V-08 above |
| **Perceivable** | Images have alt text | Code review | Terminal mockup needs aria-label describing CLI output |
| **Perceivable** | Text spacing adjustable | Zoom to 200% | Layout doesn't break at 200% zoom |
| **Operable** | Full keyboard navigation | Tab through page top-to-bottom | All interactive elements reachable, logical order |
| **Operable** | No keyboard traps | Tab through modals/toggles | Can always escape to next element |
| **Operable** | Focus order matches visual order | Tab and verify sequence | Nav -> Hero CTAs -> Pricing toggle -> Pricing CTAs -> Footer |
| **Understandable** | Language attribute set | Code review | `<html lang="en">` present |
| **Understandable** | Consistent navigation | Review nav bar vs footer links | Same page sections linked consistently |
| **Robust** | Valid HTML | W3C validator | No parsing errors |
| **Robust** | ARIA roles on custom components | Code review | Toggle has `role="tablist"`, pricing cards use proper headings |

### Specific Accessibility Tests

| Test | Element | Check | Action if Fail |
|------|---------|-------|----------------|
| A-01 | Pricing toggle | Can activate with keyboard (Space/Enter) | Add keyboard event handler |
| A-02 | Copy CLI command button | Announces "Copied" to screen reader | Add `aria-live="polite"` region |
| A-03 | Social icons | Have descriptive aria-labels | Add `aria-label="GitHub"` etc. |
| A-04 | Feature card icons | Decorative, not informational | Add `aria-hidden="true"` to icon elements |
| A-05 | "MOST POPULAR" badge | Readable by screen reader in pricing context | Verify it's part of card heading hierarchy |
| A-06 | Section headings | Proper heading hierarchy (h1 -> h2 -> h3) | No heading level skips |
| A-07 | Reduced motion | Animations disabled | Test with `prefers-reduced-motion: reduce` active |

---

## 5. Usability Heuristics (NNG 10)

| # | Heuristic | Assessment | Severity | Notes |
|---|-----------|------------|----------|-------|
| 1 | Visibility of system status | PASS | 0 | Static page, no async states needed |
| 2 | Match between system and real world | PASS | 0 | CLI terminology matches developer mental model |
| 3 | User control and freedom | VERIFY | 1 | Ensure pricing toggle is reversible (no lock-in to annual view) |
| 4 | Consistency and standards | VERIFY | 1 | Check all button styles follow same pattern, no one-offs |
| 5 | Error prevention | N/A | 0 | No form inputs on landing page |
| 6 | Recognition rather than recall | PASS | 0 | Nav links always visible, section titles descriptive |
| 7 | Flexibility and efficiency of use | PASS | 0 | CLI command in hero = power user shortcut |
| 8 | Aesthetic and minimalist design | VERIFY | 1 | Audit for any unnecessary decorative elements |
| 9 | Help users recognize/recover from errors | N/A | 0 | No error-producing interactions |
| 10 | Help and documentation | VERIFY | 1 | "Docs" link in nav should be prominent for developer audience |

---

## 6. Performance Quality Gates

| Test | Check | Tool | Pass Criteria |
|------|-------|------|---------------|
| P-01 | Hero fully visible < 1.5s on 4G | Lighthouse | First Contentful Paint < 1.5s |
| P-02 | Total page weight < 500KB | DevTools Network | No heavy images, no video |
| P-03 | No layout shift on load | Core Web Vitals | CLS < 0.1 |
| P-04 | Font loading doesn't cause FOUT | Font display swap | Verify `font-display: swap` on Inter + JetBrains Mono |
| P-05 | No JavaScript for above-the-fold | Code review | Hero renders without JS (SSR/static) |
| P-06 | Images lazy-loaded below fold | Code review | Logo images + any below-fold content use `loading="lazy"` |

---

## 7. Screenshot-Based Visual Review Checklist

After running `forge screenshot`, evaluate the following by visual inspection:

| # | Check | What to Look For |
|---|-------|-----------------|
| S-01 | Visual hierarchy | Can you identify the most important element in 2 seconds? (Should be: headline) |
| S-02 | Breathing room | Does the page feel cramped anywhere? Especially between features grid and pricing. |
| S-03 | Alignment | Are all elements on the 8px grid? Check card edges, text baselines, icon alignment. |
| S-04 | Color balance | Is green used sparingly (CTAs only) or bleeding everywhere? |
| S-05 | Typography rhythm | Do heading sizes step down consistently? No jarring size jumps? |
| S-06 | Card consistency | Are all 6 feature cards identical in height, padding, and text alignment? |
| S-07 | Pricing card emphasis | Does the Pro card clearly stand out from Starter and Enterprise? |
| S-08 | Terminal mockup | Does it look like a real terminal, not a marketing illustration? |
| S-09 | Footer density | Is the footer information-dense without being cluttered? |
| S-10 | Overall vibe | Does it feel like Linear/Raycast? Developer-serious, not consumer-playful? |

---

## 8. Cross-Browser and Device Matrix

| Browser/Device | Test | Priority |
|---------------|------|----------|
| Chrome 120+ (Mac) | Full functionality | P0 |
| Firefox 120+ (Mac) | Layout + fonts | P0 |
| Safari 17+ (Mac) | Backdrop-filter, fonts | P0 |
| Chrome (Android, Pixel) | Responsive, touch | P1 |
| Safari (iOS 17, iPhone 15) | Responsive, touch | P1 |
| Edge (Windows) | Layout + fonts | P2 |

---

## 9. QA Execution Order

1. **Automated checks first:** Contrast ratios (V-01 to V-08), HTML validation, Lighthouse
2. **Keyboard walkthrough:** Tab through entire page, verify focus order and visibility
3. **Visual review:** Screenshot analysis (S-01 to S-10)
4. **Responsive sweep:** Resize browser 320px -> 1440px, check for breakage
5. **Anti-pattern audit:** Walk through AP-01 to AP-12 systematically
6. **Performance budget:** Lighthouse run, check CWV metrics
7. **Cross-browser spot check:** Safari font rendering, Firefox grid layout

---

## 10. Known Issues to Watch

| Issue | Risk | Mitigation |
|-------|------|------------|
| Footer social icons too small for mobile touch | Medium | Wrap in 44x44 tap target with transparent padding |
| Nav CTA at 36px height on mobile | Low | Increase to 44px in mobile breakpoint |
| Terminal mockup readability on small screens | Medium | Reduce font size to 12px or allow horizontal scroll within terminal only |
| Pricing cards stacking on mobile | Low | Verify card order: Starter, Pro (highlighted), Enterprise top-to-bottom |
| `text-tertiary` at 4.6:1 — close to AA floor | Low | Monitor; if any text uses this on `bg-surface` instead of `bg-base`, recheck ratio |
