# QA Plan: DevForge Landing Page

Per-section visual QA strategy following the design-forge skill's screenshot-evaluate-fix loop.

---

## QA Process Per Section

After each section is built, follow this cycle:

1. **Screenshot**: `forge screenshot -o section-N.png`
2. **Evaluate** against the DDD using the visual-qa checklist below
3. **Grade**: A (ship) / B (minor fix) / C (rework) / D-F (restart section)
4. **Fix** if B: targeted `forge style` or `forge set-text` corrections
5. **Rebuild** if C: delete section, re-execute commands from build-plan
6. **Re-screenshot** and re-evaluate
7. **Max 3 iterations** per section — if still C after 3, flag for human review

---

## Section-Specific QA Criteria

### 1. Navigation Bar
| Check | What to verify | Pass criteria |
|-------|---------------|---------------|
| Height | Nav is exactly 64px tall | Visually proportional, not too thick or thin |
| Alignment | Logo left, links center, CTA right | Three-zone layout clearly separated |
| Transparency | Background shows blur effect | Semi-transparent, not opaque block |
| CTA contrast | "Get Started" button readable | White text on `#6366F1` — 4.5:1+ ratio |
| Typography | Font sizes match DDD | Logo 20px bold, links 14px medium |
| Spacing | Consistent gaps between nav links | 32px gap, evenly distributed |

**Common fixes**: CTA button too small (increase padding), links too close to edges (add margin).

### 2. Hero Section
| Check | What to verify | Pass criteria |
|-------|---------------|---------------|
| Headline size | 64px, bold, commanding | Clearly the dominant element on page |
| Hierarchy | Badge -> Headline -> Subhead -> CTA -> Screenshot | Clear visual flow top to bottom |
| Subhead width | Max 580px, center-aligned | No line exceeding ~65 characters |
| CTA pair | Primary filled, secondary ghost | Clear visual distinction between buttons |
| Screenshot area | Product frame visible, terminal content readable | Placeholder communicates "product" not "empty box" |
| Vertical rhythm | Spacing matches DDD (24px, 32px, 64px gaps) | Generous breathing room, not cramped |
| Glow effect | Subtle radial gradient behind screenshot | Barely perceptible, adds depth without gaudiness |
| Eyebrow badge | "FOR DEVELOPERS" legible, monospace | Badge border visible, text not clipped |

**Common fixes**: Headline may need letter-spacing adjustment (-0.02em), screenshot frame may need border visibility boost, subhead may wrap poorly (adjust max-width).

### 3. Social Proof / Logo Bar
| Check | What to verify | Pass criteria |
|-------|---------------|---------------|
| Subtlety | Logos at low opacity, not attention-grabbing | Section serves as social proof without competing with hero/features |
| Label | "Trusted by..." text centered and readable | 14px, muted color, above logos |
| Logo spacing | Even gaps between all 6 placeholders | 48px gaps, horizontally centered |
| Section padding | 96px top/bottom — enough separation | Clear visual boundary from hero and features |

**Common fixes**: Logos too prominent (reduce opacity), section feels too tall or too short (adjust padding).

### 4. Features Grid
| Check | What to verify | Pass criteria |
|-------|---------------|---------------|
| Grid alignment | 3 equal columns, 24px gaps | Cards are same width, evenly spaced |
| Card consistency | All 6 cards identical structure | Same padding, radius, border, icon position |
| Icon circles | 48px circles, consistent color | All `#1C1C1C`, properly rounded |
| Title/body hierarchy | Titles clearly distinct from descriptions | Size + weight + color contrast between H2 and body |
| Section heading | Centered, max 600px if needed | "Built for your workflow" not stretching too wide |
| Card border | Subtle but visible | `rgba(255,255,255,0.06)` — barely there, adds definition |
| Content length | Descriptions roughly similar length | No card significantly taller than others |
| Line height | Body text at 1.6 | Comfortable reading, not cramped |

**Common fixes**: Cards uneven height (normalize description length), grid breaking at edges (check max-width container), heading/subheading gap too tight (increase to 64px).

### 5. Pricing Table
| Check | What to verify | Pass criteria |
|-------|---------------|---------------|
| Three tiers visible | Starter, Pro, Enterprise side by side | Equal column widths within 1080px container |
| Pro highlight | Distinct from other two tiers | `#6366F1` border + glow clearly differentiates |
| Popular badge | "MOST POPULAR" visible, positioned correctly | Top-right of Pro card, not clipped, readable |
| Price hierarchy | Dollar amount is focal point per card | 48px, bold — largest element in each card |
| Feature lists | Aligned, readable, consistent spacing | 12px gap between items, checkmarks if present |
| CTA buttons | Primary on Pro, ghost on Starter/Enterprise | Visual weight draws to Pro tier |
| Divider lines | Consistent across all 3 cards | Same position, same color (`#2A2A2A`) |
| Vertical alignment | Cards align at top | Enterprise "Custom" text aligns with "$0" and "$29" |

**Common fixes**: Badge overlapping card edge (adjust position), price text misaligned (check baseline alignment), feature lists uneven (normalize item count or add spacer).

### 6. Footer
| Check | What to verify | Pass criteria |
|-------|---------------|---------------|
| Grid layout | 4 columns: brand (2fr) + 3 link columns (1fr each) | Brand column clearly wider |
| Top border | 1px `#1C1C1C` separating footer from content | Subtle but present |
| Column headers | Uppercase, 12px, letter-spaced | "PRODUCT", "DEVELOPERS", "COMPANY" distinct from links |
| Link colors | Muted `#555555`, not competing with content | Links readable but subdued |
| Copyright bar | Bottom, separated by own border | Clearly the final element, `#383838` text |
| Brand tagline | "Code reviews on autopilot." below logo text | Reinforces brand, doesn't dominate |

**Common fixes**: Column widths uneven on wide screens (verify grid-template-columns ratio), links too bright (darken to `#555555`), copyright bar border missing (check borderTop).

---

## Full-Page QA Checklist

After all sections are built, run `forge screenshot --full-page --2x -o full-page-qa.png` and evaluate:

### Anti-Slop Checklist (from design-principles.md)
- [ ] No purple-to-pink gradients anywhere
- [ ] No more than 2 typefaces (Space Grotesk + DM Sans + JetBrains Mono is 3, but mono is used minimally for code context only — acceptable)
- [ ] No text smaller than 14px (except 12px badges/labels)
- [ ] No centered text wider than 600px
- [ ] No stock photos (using terminal placeholder instead)
- [ ] All spacing on 8px grid
- [ ] All text/background pairs meet WCAG AA contrast (4.5:1 body, 3:1 large)
- [ ] No pure white (#FFFFFF) on dark backgrounds — max `#E8E8E8`
- [ ] No icon style mixing (all circular placeholders, consistent)

### Visual Hierarchy Check
- [ ] Hero headline is the single most dominant element on the page
- [ ] Each section has exactly ONE focal point
- [ ] CTA buttons draw the eye (brand color contrast)
- [ ] Pro pricing tier clearly stands out from Starter/Enterprise
- [ ] Footer is visually quietest section (lowest contrast, smallest type)

### Spacing & Rhythm Check
- [ ] Consistent 128px gaps between major sections
- [ ] No section feels cramped — "if it feels like too much space, it's right"
- [ ] Cards have consistent 32px internal padding across all sections
- [ ] Grid gutters are consistent (24px)

### Typography Check
- [ ] Headline hierarchy: 64px > 44px > 24px > 20px > 16px > 14px > 12px
- [ ] Letter-spacing: -0.02em on large headings, +0.05em on uppercase labels
- [ ] Line height: 1.05 on hero, 1.15 on section headings, 1.6 on body
- [ ] Max line width ~65 characters on body text

### Color Consistency Check
- [ ] Background consistently `#0A0A0A` — no shifts between sections
- [ ] Card backgrounds consistently `#141414` — features and pricing match
- [ ] Brand color `#6366F1` used only for CTAs, highlights, and the Pro tier accent
- [ ] Text secondary is consistently `#8A8A8A` throughout

### Brand Coherence Check
- [ ] Linear/Raycast inspiration evident: clean, dark, technical, dense-yet-spacious
- [ ] Terminal/code elements (JetBrains Mono, cyan accent) reinforce developer audience
- [ ] No playful or consumer-grade elements — everything feels professional
- [ ] Indigo brand color is confident without being flashy

---

## Iteration Strategy

If full-page QA reveals systemic issues:

1. **Color inconsistency** across sections: Create a single `forge style` batch that resets all background/text colors to DDD values
2. **Spacing drift**: Re-measure section padding, card padding, and gaps — correct any deviations from 8px grid
3. **Typography mismatch**: Verify every text element against the DDD scale — common drift is body text at 15px or 17px instead of 16px
4. **Section weight imbalance**: If one section visually dominates others (besides hero), reduce its padding or contrast

After fixes, re-screenshot and re-evaluate. The page ships when every section grades A and the full-page checklist is 100% clear.
