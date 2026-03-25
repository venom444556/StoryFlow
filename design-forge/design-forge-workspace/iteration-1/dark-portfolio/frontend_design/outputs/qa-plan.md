# Quality Evaluation Plan: Mika Chen Dark Portfolio

## Evaluation Framework

Each checkpoint is scored Pass / Marginal / Fail. The site ships only when all checks are Pass.

---

## 1. Typography Audit

| Check | Criteria | How to Verify |
|-------|----------|---------------|
| Font loading | Instrument Serif, Satoshi, and JetBrains Mono all render correctly | `forge screenshot` hero and card sections at 2x; visually confirm no font fallback (check for serif vs sans mismatch) |
| Display scale | Hero text at 96px reads as confident, not overwhelming | Screenshot hero at 1440px width; text should occupy roughly 40-50% of the horizontal space |
| Line height | Hero lines (0.95) sit tightly without touching; body text (1.6) feels open | Screenshot both; confirm ascenders/descenders do not collide in hero; body text has visible air between lines |
| Letter spacing | Negative tracking on display type is visible but not cramped | Compare hero text against a 0em baseline; letters should overlap optically at joins without merging |
| Caption consistency | All labels (section headers, nav, tags) share identical size/weight/tracking | Side-by-side screenshots of nav, section labels, stat labels, social links -- must be pixel-identical in style |
| Hierarchy clarity | Five distinct levels are readable in a single scroll | Full-page screenshot at 50% zoom: display > H2 > H3 > body > caption must each be immediately distinguishable |

---

## 2. Color and Contrast Audit

| Check | Criteria | How to Verify |
|-------|----------|---------------|
| WCAG AA on primary text | `#EDEDED` on `#0A0A0A` = contrast ratio 17.4:1 | Automated contrast checker (must exceed 4.5:1 for normal text, 3:1 for large text) |
| WCAG AA on secondary text | `#888888` on `#0A0A0A` = contrast ratio 5.2:1 | Same tool; must exceed 4.5:1 for body text at 16px |
| WCAG AA on tertiary text | `#555555` on `#0A0A0A` = contrast ratio 2.6:1 | This is decorative/label text at 12px -- acceptable for non-essential content per WCAG, but flag if any tertiary text carries critical information |
| Accent usage count | `#C8FF00` appears in exactly 3 interactive elements | Grep all style commands for `C8FF00`; must be avail-dot, hero CTA hover, email hover only |
| Surface differentiation | `#0A0A0A` vs `#111111` vs `#1A1A1A` are visually distinct | Screenshot a card on the page background; the three levels must be distinguishable on a calibrated display |
| No pure black | Background is `#0A0A0A`, never `#000000` | Search all style commands for exact `#000` or `#000000` -- must return zero results |

---

## 3. Spacing and Layout Audit

| Check | Criteria | How to Verify |
|-------|----------|---------------|
| 8px grid adherence | Every spacing value is a multiple of 8 | Audit all padding, margin, and gap values in build-plan.md -- none should be off-grid |
| Horizontal margins | Page content sits at 128px left/right padding at 1440px width | Screenshot; content area should be 1184px wide |
| Section breathing room | 96px between major sections (desktop) | Measure vertical gap between hero bottom and work section top, work bottom and about top, etc. |
| Card grid alignment | 2-column grid with 24px gap, both columns equal width | Screenshot work section; overlay a grid -- cards must be 580px each with 24px between |
| Hero vertical centering | Hero content visually centered in its 900px frame | Screenshot hero; content block center should be within 20px of frame center |
| Stats horizontal alignment | All 4 stat blocks align at their number baselines | Screenshot stats row; draw a horizontal line through the "8" -- it must pass through "30", "3", and "1M" |

---

## 4. Component Quality Audit

| Check | Criteria | How to Verify |
|-------|----------|---------------|
| Nav blur | Backdrop blur visible when content scrolls behind | If interactive: scroll content behind nav and screenshot; frosted glass effect must be visible |
| Card border radius | All cards use 12px radius, no exceptions | Visual inspection of all 4 cards + photo placeholder |
| Card hover state | Border brightens to `#2A2A2A`, -2px Y translate, subtle accent shadow | If interactive: hover each card and screenshot; compare to resting state |
| Tag pill consistency | All tags share identical padding (4px 10px), radius (4px), background (`#1A1A1A`) | Side-by-side comparison of all 8 tags across 4 cards |
| CTA arrow | Right arrow sits inline with text, translates right on hover | Screenshot resting and hover states |
| Availability dot | 8px circle with lime color and subtle glow shadow | Screenshot nav at 4x zoom; dot must be perfectly circular with visible ambient glow |

---

## 5. Visual Atmosphere Audit

| Check | Criteria | How to Verify |
|-------|----------|---------------|
| Noise overlay | Barely perceptible texture at 100% zoom, visible at 400% zoom | Screenshot page at both scales; at 100% the surface should feel slightly warm/analog without visible pattern |
| Card image gradients | Radial gradient creates subtle depth, not a visible circle | Screenshot a card image area; gradient center should be ~15% lighter than edges with a smooth falloff |
| No decorative gradients | Zero gradient backgrounds on page sections | Audit all section styles; background must be flat `#0A0A0A` |
| Restrained motion | Transitions are 200ms on interactive elements; no animation on static elements | Review all style commands for `transition` properties; only border-color, color, transform, box-shadow allowed |

---

## 6. Content and Copy Audit

| Check | Criteria | How to Verify |
|-------|----------|---------------|
| Name consistency | "Mika Chen" appears in nav and copyright, nowhere else | Search all set-text commands for "Mika" |
| Tagline tone | "Crafting interfaces for SaaS products that feel inevitable." -- no buzzwords, no exclamation marks | Read the subtitle; it should feel confident, not salesy |
| Project names | Meridian, Canopy, Lumen, Radius -- all fictional, none collide with real companies at first-page Google results | Quick search each name + "SaaS" to confirm no direct collision |
| Stats plausibility | 8+ years, 30+ products, 3 design systems, 1M+ users -- believable for a senior product designer | Sanity check: 30 products over 8 years = ~4/year, reasonable for a freelance/agency designer |
| No typos | All text content is spelled correctly | Read every text string in build-plan.md aloud |

---

## 7. Overall Impression Test

Evaluate the full-page screenshot against these questions (subjective, but critical):

| Question | Target Answer |
|----------|---------------|
| Does this look like it was designed by a human with taste? | Yes -- the serif/sans pairing and acid lime accent are specific choices, not defaults |
| Could this pass for a real designer's portfolio? | Yes -- the restraint and typography feel professional |
| Is there anything that screams "AI generated"? | No -- no purple gradients, no Inter font, no generic card layouts with rounded corners and drop shadows |
| Does the hierarchy guide the eye top-to-bottom? | Yes -- hero text is magnetic, then cards, then about, then CTA |
| Would you remember this site after seeing 20 portfolios? | The acid lime dot and the oversized serif display type should stick |

---

## Defect Response Protocol

| Severity | Definition | Action |
|----------|-----------|--------|
| Critical | Text unreadable, layout broken, wrong content | Fix immediately, re-screenshot, re-evaluate |
| Major | Spacing off-grid, color contrast fails WCAG AA on body text, font fallback visible | Fix before publish |
| Minor | Subjective preference (e.g., "hero could be 10px taller"), tertiary contrast below AA | Log for iteration-2, publish as-is |

---

## Sign-off Criteria

The portfolio is ready to publish when:

1. All typography checks pass
2. All color/contrast checks pass (with documented exception for tertiary decorative text)
3. All spacing values are on the 8px grid
4. All 4 cards render identically in structure
5. The overall impression test yields "yes" on all 5 questions
6. Zero critical or major defects remain open
