# Comparison Rubric — Visual QA Reference Standards

Side-by-side quality benchmarks for each design dimension.

---

## Typography

### A-Grade (Reference: Linear.app, Vercel.com)
- 3 distinct size levels clearly visible
- Headline weight ≥ 600, body weight 400
- Line height ratio: headings 1.1-1.2, body 1.5-1.6
- Max 2 font families
- Letter-spacing adjusted per size: tight on large, normal on body

### C-Grade (Common failure)
- Sizes too similar (24px and 28px are NOT distinct levels)
- Body text too heavy (weight 500+ on paragraphs)
- Line heights uniform across all sizes
- 3 fonts or more
- No letter-spacing adjustment

### F-Grade
- Everything same size
- Text below 14px used for body content
- Random weights that don't create hierarchy

---

## Color

### A-Grade (Reference: Raycast.com, Arc browser)
- 5 or fewer total colors
- One brand color used strategically (< 20% of surface area)
- Neutrals handle 80%+ of the palette
- Every text/bg pair passes WCAG AA (4.5:1 for body, 3:1 for large)
- Accent color appears exactly where action is needed

### C-Grade
- 7+ colors competing
- Brand color overused (splashed everywhere)
- Some contrast failures
- Accent color on non-interactive elements

### F-Grade
- Rainbow palette
- Brand color as body text background
- White text on light backgrounds
- Neon on neon

---

## Spacing

### A-Grade (Reference: Apple.com, Stripe.com)
- All values divisible by 8 (except 4px for icon padding)
- Consistent internal padding on all cards (same px value)
- Section gaps ≥ 96px
- Generous white space — elements breathe
- Content → CTA gap ≥ 48px

### C-Grade
- Mix of 8px-grid and random values (15px, 22px, 37px)
- Cards have different internal padding
- Section gaps < 64px
- Elements feel cramped

### F-Grade
- No discernible spacing system
- Elements touching or overlapping
- Different padding on each card

---

## Layout

### A-Grade (Reference: Linear.app, Notion.so)
- Clear invisible grid structure
- All elements align to consistent left/right edges
- Section transitions feel intentional
- Content hierarchy flows top→bottom naturally
- Responsive-ready: would collapse gracefully

### C-Grade
- Some alignment drift (elements off by 4-8px)
- Section transitions abrupt
- Some content hierarchy confusion

### F-Grade
- Visibly misaligned elements
- No grid structure
- Random placement

---

## Polish

### A-Grade
- Single border-radius value across all cards (or deliberate variation: 0 for sharp, 12-16 for soft)
- Shadows consistent (all the same blur/spread, or elevation system)
- Borders consistent weight and opacity
- No orphaned text (single words on a line)
- Hover states would be predictable (consistent transformation)

### C-Grade
- Mixed border-radius (8px here, 12px there, 20px elsewhere)
- Some shadows bigger than others without hierarchy reason
- One or two orphaned words

### F-Grade
- Every element different border-radius
- Random shadows
- Clearly unfinished sections
