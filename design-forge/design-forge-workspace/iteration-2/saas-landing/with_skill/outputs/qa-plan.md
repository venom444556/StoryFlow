# QA Plan: DevForge Landing Page

Evaluation criteria and iteration strategy for each section, following the visual-qa loop from the skill pipeline.

---

## Grading Scale

| Grade | Action |
|-------|--------|
| **A** | Ship — meets all DDD specs, anti-slop clean |
| **B** | Minor fix — targeted `forge style` / `forge set-text` adjustments |
| **C** | Rework — rebuild section from scratch |
| **D-F** | Restart — fundamental design problem, revisit DDD for this section |

Maximum 3 iterations per section. If still C after 3, flag for human review.

---

## Section 1: Navigation

### Screenshot: `step-1-nav.png`

### Checklist
- [ ] Bar height exactly 64px, not collapsing or overflowing
- [ ] Logo "DevForge" renders in Clash Display 20px/700, positioned left with 32px padding
- [ ] Nav links centered horizontally, 32px gap between items, Geist 14px/500 in `#888888`
- [ ] CTA button right-aligned, `#22D3EE` bg visible, text `#0A0A0A`, 8px radius
- [ ] Backdrop blur visible if page has content behind it
- [ ] No horizontal overflow at 1440px viewport

### Common Issues to Watch
- Flex justification not applying (links not centering) — fix: verify `justifyContent: space-between` and that the three groups (logo, links, right-group) are direct children
- CTA text color blending into background — ensure `#0A0A0A` on `#22D3EE` has sufficient contrast (15.8:1, well above AA)
- Font fallback rendering if Clash Display not loaded — verify Google Fonts or Framer font library availability

### Iteration Strategy
- B fix: `forge style` to adjust padding/gap values
- C fix: rebuild nav as flat Stack with explicit widths instead of space-between Frame

---

## Section 2: Hero

### Screenshot: `step-2-hero.png`

### Checklist
- [ ] Eyebrow badge visible: violet text on violet-tinted bg, rounded, above headline
- [ ] Headline "Code reviews on autopilot." renders at 64px, centered, within 800px max-width
- [ ] Headline does not wrap to 3+ lines at 1440px viewport (should be 1 line)
- [ ] Subhead at 18px, `#888888`, max 2 lines within 600px constraint
- [ ] Both CTAs visible side-by-side, 32px gap
- [ ] Primary CTA: cyan bg with dark text, clearly the dominant action
- [ ] Secondary CTA: ghost style with visible border, not competing with primary
- [ ] Screenshot placeholder frame: 960px wide, 480px tall, subtle border, centered
- [ ] Glow effect behind screenshot visible but subtle (5% opacity max)
- [ ] Overall vertical rhythm: badge -> 24px -> headline -> 24px -> subhead -> 32px -> CTAs -> 48px -> screenshot
- [ ] Total hero height feels generous (at least 800px effective)
- [ ] No text wider than 800px centered

### Common Issues to Watch
- 64px headline may wrap at narrow viewports — this QA is desktop-first, but note for responsive pass
- Cyan glow behind screenshot can look garish if opacity too high — verify it reads as ambient light, not a border
- Badge padding too tight making text cramped — verify 4px/8px renders with breathing room around text

### Iteration Strategy
- B fix: adjust marginTop values between elements, tweak glow opacity
- C fix: simplify to no glow, reduce headline to 56px if wrapping

---

## Section 3: Features Grid

### Screenshot: `step-3-features.png`

### Checklist
- [ ] Section heading centered, 40px Clash Display, 64px margin below
- [ ] 3 cards render in equal-width columns with 32px gap
- [ ] Cards have consistent height (flex stretch or explicit min-height)
- [ ] Each card: `#141414` bg clearly distinguishable from `#0A0A0A` page bg
- [ ] 1px `#2A2A2A` border visible on each card
- [ ] Icon placeholder: 48x48, `#1A1A1A` bg, 12px radius
- [ ] Monospace characters in icon frames render in JetBrains Mono, colored correctly (brand/accent)
- [ ] Card titles in Clash Display 24px, 16px below icon
- [ ] Card descriptions in Geist 16px, `#888888`, 8px below title
- [ ] All text left-aligned within cards (not centered)
- [ ] Section padding: 96px top and bottom
- [ ] No orphaned words in descriptions (single word on last line)

### Common Issues to Watch
- Cards not equal height — if one description wraps more, cards look uneven. Fix: use `alignItems: stretch` on grid
- Icon monospace characters may not center within the 48px frame — verify flex centering
- Card border barely visible — `#2A2A2A` on `#141414` is subtle by design, but should be perceptible

### Iteration Strategy
- B fix: adjust description text or card padding for consistency
- C fix: switch from grid to explicit 3-column stack with fixed-width cards

---

## Section 4: Social Proof / Logo Bar

### Screenshot: `step-4-logos.png`

### Checklist
- [ ] Background `#0F0F0F` creates subtle visual break from `#0A0A0A` sections above/below
- [ ] "TRUSTED BY ENGINEERING TEAMS AT" label: uppercase, letter-spaced, `#555555`, centered
- [ ] 6 logo placeholders visible in horizontal row, 48px gap
- [ ] Each placeholder: 120x40px, `#2A2A2A` bg, 8px radius
- [ ] Row is horizontally centered
- [ ] Section padding: 64px top/bottom (more compact than feature sections — intentional)
- [ ] No overflow or wrapping of logo row at 1440px

### Common Issues to Watch
- Logo row may overflow if viewport narrower than expected — 6 x 120px + 5 x 48px = 960px, fits in 1200px container
- Background color shift too subtle to notice — acceptable, it's meant to be a texture break not a statement
- Label text too dim — `#555555` on `#0F0F0F` = ~3.4:1, borderline for AA on small text. If failing, bump to `#666666`

### Iteration Strategy
- B fix: adjust label color for contrast, tweak gap
- C fix: reduce to 5 logos or use 2-row grid layout

---

## Section 5: Pricing Table

### Screenshot: `step-5-pricing.png`

### Checklist
- [ ] Section heading + subhead centered, proper spacing (16px between, 64px to cards)
- [ ] 3 pricing cards in equal columns, 32px gap
- [ ] Pro card visually dominant: `#1A1A1A` bg + `#22D3EE` border
- [ ] "MOST POPULAR" badge positioned top-right of Pro card, negative top offset
- [ ] Badge text readable: `#0A0A0A` on `#22D3EE` bg
- [ ] All tier labels uppercase, letter-spaced, correct colors (gray for Starter/Enterprise, cyan for Pro)
- [ ] Price numbers: 48px Clash Display, visually heavy and scannable
- [ ] "/month" and "/month per seat" in Geist 16px, muted color, baseline-aligned with price
- [ ] Divider lines: 1px `#2A2A2A`, 24px vertical margin above and below
- [ ] Feature lists: 14px Geist, 16px between items, left-aligned
- [ ] Pro card has more features than Starter (visual anchoring for value)
- [ ] CTA buttons: full-width within cards, correct styling per tier
- [ ] Pro CTA is the only filled button (cyan bg) — Starter and Enterprise use ghost style
- [ ] All button padding: 16px 24px (on grid)
- [ ] Cards top-aligned (`alignItems: start` on grid)

### Common Issues to Watch
- "MOST POPULAR" badge may overlap card content if positioned absolutely — verify it sits above the card cleanly
- "Custom" price in Enterprise may look awkward at 48px if it wraps — single word, should be fine
- Feature list alignment inconsistency between tiers — ensure all use same stack with same gap
- Pro card border color may make it look like an error/selection state — `#22D3EE` is intentional brand color, not blue/error

### Iteration Strategy
- B fix: badge position adjustment, feature list alignment tweaks
- C fix: rebuild all three cards from a single template with parameter substitution

---

## Section 6: Footer

### Screenshot: `step-6-footer.png`

### Checklist
- [ ] Top border: 1px `#1A1A1A`, subtle separator from pricing section
- [ ] 4-column grid renders correctly: brand column wider (2fr), link columns equal (1fr each)
- [ ] "DevForge" in Clash Display 20px/700, left-aligned
- [ ] Tagline below in Geist 14px, `#555555`
- [ ] Column labels "PRODUCT", "COMPANY", "LEGAL": 12px uppercase, letter-spaced, `#888888`
- [ ] 16px margin below labels before first link
- [ ] Link items: 14px Geist, `#555555`, 16px gap between items
- [ ] Copyright line: separated by 1px `#1A1A1A` border, 32px margin above, 32px padding above
- [ ] Copyright text: 14px Geist, `#555555`
- [ ] Footer doesn't feel cramped — 64px top padding, 32px bottom padding
- [ ] 48px gap between columns

### Common Issues to Watch
- 4-column grid may collapse if container too narrow — at 1200px max-width with 48px gaps, total gap = 144px, leaving ~1056px for columns. Fine.
- Footer link color `#555555` on `#0A0A0A` = ~3.7:1, just above 3:1 for large text but these are 14px (small). May need bump to `#666666` for AA compliance.
- Brand column taking 2fr may look disproportionately wide if tagline is short — acceptable, it's the anchor

### Iteration Strategy
- B fix: bump link color for accessibility, adjust gap
- C fix: restructure to 3-column (merge brand into a full-width row above link columns)

---

## Full-Page QA

### Screenshot: `full-page-qa.png`

### Global Checklist (22-point production check)
1. [ ] **Visual flow**: Eye moves naturally from nav -> hero -> features -> logos -> pricing -> footer
2. [ ] **Color consistency**: `#0A0A0A` / `#141414` / `#1A1A1A` layers are distinct but cohesive
3. [ ] **Typography hierarchy**: Only two visible typefaces (Clash Display + Geist), monospace limited to code contexts
4. [ ] **Spacing rhythm**: No cramped sections, no excessively empty ones — generous but purposeful
5. [ ] **CTA hierarchy**: Hero primary CTA is the strongest visual magnet on the page
6. [ ] **Brand color usage**: Cyan appears in CTAs, Pro pricing border, icon accents — not overused
7. [ ] **Accent color usage**: Violet appears in eyebrow badge only — restrained
8. [ ] **Contrast verification**: All text/bg pairs pass WCAG AA
9. [ ] **No pure white**: Brightest text is `#E8E8E8`
10. [ ] **No pure black**: Darkest bg is `#0A0A0A` (not `#000000`)
11. [ ] **Border radius consistency**: 16px on cards, 8px on buttons/badges — two levels only
12. [ ] **Section separation clear**: Each section has distinct padding, some with bg color shifts
13. [ ] **No orphan text**: No single words on their own line in any paragraph
14. [ ] **Icon consistency**: All feature icons are monospace characters in same style frames
15. [ ] **Button consistency**: Same padding, radius, font across all instances of each button type
16. [ ] **Grid alignment**: All columns align, no staggering
17. [ ] **Content width**: No text exceeds 1200px container, hero text within 800px
18. [ ] **Vertical rhythm**: Consistent spacing patterns between heading -> subhead -> content -> CTA
19. [ ] **No Space Grotesk**: Verified absent from all elements
20. [ ] **All sizes on type scale**: 12, 14, 16, 18, 20, 24, 40, 48, 64 only
21. [ ] **All spacing on 8px grid**: No off-grid values anywhere
22. [ ] **Page loads fast**: No heavy assets, placeholder images are CSS frames

### Anti-Slop Final Check
- [ ] No purple-to-pink gradients anywhere
- [ ] No generic "Welcome" or "Learn more" copy
- [ ] No stock photography
- [ ] No carousel/slider hero
- [ ] No auto-playing media
- [ ] No more than 2 typefaces + monospace
- [ ] No centered text wider than 600px

---

## Accessibility Notes

| Element | Current | WCAG AA (4.5:1 body, 3:1 large) | Status |
|---------|---------|------|--------|
| `#E8E8E8` on `#0A0A0A` | 17.4:1 | 4.5:1 | PASS |
| `#888888` on `#0A0A0A` | 5.9:1 | 4.5:1 | PASS |
| `#555555` on `#0A0A0A` | 3.7:1 | 3:1 (large only) | WARN — used at 14px, needs 4.5:1. Bump to `#666666` (4.6:1) if flagged |
| `#555555` on `#0F0F0F` | 3.4:1 | 3:1 (large only) | WARN — same issue. Bump to `#6B6B6B` for safety |
| `#0A0A0A` on `#22D3EE` | 15.8:1 | 4.5:1 | PASS |
| `#A78BFA` on `rgba(167,139,250,0.1)` | ~4.8:1 | 4.5:1 | PASS (estimated, bg resolves to ~#1A1620 on #0A0A0A) |
| `#888888` on `#141414` | 4.5:1 | 4.5:1 | BORDERLINE — monitor |

### Recommended Fix
During QA, if any `#555555` text at 14px fails automated contrast check, globally replace with `#6B6B6B` via:
```bash
# Find and replace #555555 instances in footer and logo section
forge style '{"color":"#6B6B6B"}' --selector "[color='#555555']"
```

---

## Iteration Log Template

Use this template after each screenshot review:

```
### Section: [name]
**Screenshot**: [filename]
**Grade**: A / B / C
**Issues found**:
1. [issue description]
2. [issue description]

**Fixes applied**:
1. `forge style '...'` — [what it fixed]
2. `forge set-text '...'` — [what it fixed]

**Re-screenshot**: [filename]
**Final grade**: A / B
**Iteration count**: 1 / 3
```
