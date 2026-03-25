# DevForge Landing Page -- Quality Evaluation Plan

## 1. Visual Fidelity Checks

### Typography
- [ ] **Instrument Sans** loads correctly for all headings (hero 64px, section 36px, card 18px)
- [ ] **Geist** loads correctly for body text, nav links, buttons, pricing features
- [ ] **JetBrains Mono** loads correctly in terminal mockup, install snippet, and CLI badge
- [ ] Letter-spacing values render correctly (-0.03em on display, 0.1em on labels)
- [ ] Line heights produce readable text blocks (hero sub at 1.6, feature descriptions at 1.5)
- [ ] No font fallback flashes (check FOUT/FOIT behavior)

### Color Accuracy
- [ ] Page background is true dark `#0A0A0B` (not pure black, not gray)
- [ ] Card surfaces are distinguishable from page bg (`#111113` vs `#0A0A0B`)
- [ ] Accent indigo `#6366F1` is consistent across CTA buttons, Pro tier border, section labels, and terminal annotation
- [ ] Traffic light dots are correct: red `#EF4444`, amber `#F59E0B`, green `#22C55E`
- [ ] Text hierarchy is clear: primary `#EDEDEF` > secondary `#8B8B96` > tertiary `#5C5C66`
- [ ] Borders are subtle but visible at `#2A2A30`

### Spacing & Alignment
- [ ] Max content width is 1200px, horizontally centered
- [ ] Section padding is 120px vertical throughout features and pricing
- [ ] Card padding is 32px on all sides
- [ ] Grid gap between feature cards is 24px
- [ ] Hero headline is optically centered (not just CSS centered)
- [ ] Pricing cards are equal height with CTAs bottom-aligned
- [ ] Footer columns are evenly distributed

---

## 2. Component-Level Review

### Navigation
- [ ] Fixed to viewport top with blur backdrop
- [ ] Wordmark + CLI badge left-aligned, CTA right-aligned
- [ ] Nav links are horizontally centered in available space
- [ ] CTA button has 8px radius, correct indigo fill

### Hero
- [ ] Badge pill is properly centered, border-radius 16px
- [ ] Headline max-width constrains to ~720px
- [ ] Subheadline max-width constrains to ~560px
- [ ] CTA buttons are same height (44px), gap 12px
- [ ] Install snippet has terminal aesthetic (mono font, dark bg, rounded corners)
- [ ] Terminal frame has visible chrome dots and border
- [ ] Radial glow behind terminal is subtle (6% opacity max)
- [ ] Diff lines use correct colors: red for removal, green for addition, indigo for devforge comment

### Social Proof
- [ ] Label text is uppercase with generous letter-spacing
- [ ] Logo placeholders are evenly spaced
- [ ] Overall section is visually quiet -- does not compete with hero or features

### Features Grid
- [ ] 3-column layout with 2 rows
- [ ] All 6 cards are same size
- [ ] Icon containers are 40x40 with bg-tertiary fill
- [ ] Hover state: border-color transitions to `#3A3A44`, element lifts 2px

### Pricing
- [ ] 3 cards side by side, equal height
- [ ] Pro tier has 2px indigo border (others have 1px subtle)
- [ ] "MOST POPULAR" badge is positioned top-right of Pro card
- [ ] Price numbers are 48px, period text is 16px at baseline alignment
- [ ] Feature lists are left-aligned, consistent line spacing
- [ ] CTAs are bottom-pinned: primary (indigo) for Pro, ghost for Starter/Enterprise

### Footer
- [ ] 4-column grid with brand column wider than link columns
- [ ] Column headings are visually distinct from link items
- [ ] Copyright and social links are on the same bottom row, justified apart
- [ ] Top border separates footer from pricing section

---

## 3. Visual Hierarchy & Flow

- [ ] Eye flow follows: badge -> headline -> subheadline -> CTA -> terminal
- [ ] Social proof creates a visual pause between hero and features
- [ ] Feature section label "FEATURES" draws eye to heading below
- [ ] Pricing Pro tier is the obvious focal point (border color, badge, primary CTA)
- [ ] Footer feels like an ending, not a section competing for attention

---

## 4. Aesthetic Consistency

- [ ] **No generic AI slop:** No purple-on-white gradients, no Inter/Roboto, no blob shapes
- [ ] **Tone match:** Page feels like a developer tool, not a consumer SaaS or a design agency
- [ ] **Terminal as hero:** The code diff terminal is the centerpiece, not an afterthought
- [ ] **Information density:** Content is dense but not cramped -- Linear/Raycast density
- [ ] **Color restraint:** Indigo is the only chromatic accent; green/amber/red are functional only
- [ ] **Consistency:** Every card, button, and text element uses the defined token palette

---

## 5. Edge Cases & Robustness

- [ ] Text content does not overflow card boundaries at any feature
- [ ] Price "Custom" text fits the same layout as "$0" and "$29"
- [ ] Long feature names (e.g., "CI/CD Integration") do not wrap awkwardly
- [ ] Terminal diff lines do not exceed terminal body width
- [ ] Footer links with different character lengths still align in columns

---

## 6. Screenshot Validation Sequence

After `forge publish`, capture and verify these screenshots:

| Screenshot | What to check |
|---|---|
| `devforge-landing-full.png` (2x) | Full page: section ordering, overall color consistency, vertical rhythm |
| `devforge-hero.png` (2x) | Hero isolation: terminal glow, badge alignment, CTA button sizing |
| `devforge-pricing.png` (2x) | Pricing isolation: Pro tier emphasis, badge positioning, CTA alignment |

### Review criteria per screenshot:
1. Squint test: Can you identify the page sections at 25% zoom?
2. Contrast test: Is all text readable against its background?
3. Alignment test: Do vertical edges line up across sections?
4. Brand test: Does it feel like Linear/Raycast, not like Wix/Squarespace?
5. Completeness test: Are all 6 sections present and fully populated?

---

## 7. Iteration Triggers

Re-enter a design iteration if any of these are true:
- [ ] Any text fails WCAG AA contrast against its background (4.5:1 body, 3:1 large)
- [ ] More than 2 spacing values deviate from the 4px grid system
- [ ] The terminal hero does not read as the visual centerpiece
- [ ] The Pro pricing tier is not the obvious recommended choice
- [ ] Any section feels visually disconnected from the overall dark terminal aesthetic
- [ ] Font loading issues cause layout shifts or fallback rendering
