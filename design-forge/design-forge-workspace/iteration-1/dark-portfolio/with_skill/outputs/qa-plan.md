# QA Plan: Mika Chen Portfolio

Visual QA strategy for each section. Every section gets screenshot -> evaluate -> fix -> re-screenshot, max 3 iterations before escalating to human review.

---

## Grading Scale

| Grade | Meaning | Action |
|-------|---------|--------|
| A | Ship-ready. No issues. | Proceed to next section. |
| B | Minor fixes needed. 1-2 tweaks. | Apply targeted `forge style` / `forge set-text` fixes. Re-screenshot once. |
| C | Structural rework needed. | Rebuild section from scratch using DDD values. |
| D-F | Fundamentally broken. | Restart section entirely. Flag if persists after 3 attempts. |

---

## Section 1: Navigation

**Screenshot**: `step-1-nav.png`

**Evaluate against**:
- [ ] Height exactly 64px, no visual crowding
- [ ] "Mika Chen" left-aligned, Space Grotesk 18px/600, #E8E8E8
- [ ] Links right-aligned, DM Sans 14px/500, #8A8A8A — readable but not dominant
- [ ] Backdrop blur present (rgba overlay + blur(12px))
- [ ] No border-bottom visible (clean float)
- [ ] Horizontal padding 32px both sides
- [ ] Links have even 32px gaps between them
- [ ] Fixed position does not overlap hero content

**Common fixes**:
- If links appear too bright: verify #8A8A8A not accidentally set to #E8E8E8
- If nav feels heavy: reduce background opacity from 0.85 to 0.7
- If text is clipped: verify height accommodates line-height

---

## Section 2: Hero

**Screenshot**: `step-2-hero.png`

**Evaluate against**:
- [ ] Label "PRODUCT DESIGNER" in #C8FF00 — visible but not overwhelming
- [ ] Letter-spacing on label reads as intentionally tracked out (0.08em)
- [ ] Headline is the dominant focal point: 64px, -0.03em tracking, tight line-height 1.05
- [ ] Headline wraps naturally within 800px max-width (should be ~2 lines)
- [ ] 24px gap between label and headline, 24px between headline and subhead
- [ ] Subhead #8A8A8A clearly subordinate to headline — passes squint test
- [ ] Subhead constrained to 560px — no line exceeds ~65 characters
- [ ] Vertical centering feels optically correct (may need slight upward offset)
- [ ] Overall hero occupies full viewport height — generous, not cramped
- [ ] No text is center-aligned wider than 600px (subhead at 560px is fine)
- [ ] WCAG AA: #E8E8E8 on #0A0A0A = 17.5:1 (pass). #8A8A8A on #0A0A0A = 5.3:1 (pass). #C8FF00 on #0A0A0A = 14.1:1 (pass).

**Common fixes**:
- If headline feels cramped: increase padding from 128px to 160px
- If subhead merges with headline: increase gap from 24px to 32px
- If label is too loud: try #A8D600 (muted brand) instead of #C8FF00

---

## Section 3: Selected Work

**Screenshot**: `step-3-work.png`

**Evaluate against**:
- [ ] "SELECTED WORK" label: 12px uppercase, #8A8A8A, proper letter-spacing
- [ ] 2-column grid with 24px gap — cards are equal width
- [ ] All 4 cards have identical structure (image -> title -> desc -> tags)
- [ ] Card backgrounds #111111 with 1px #1E1E1E border — subtle containment
- [ ] Border-radius 12px consistent across all cards
- [ ] Image placeholders are 16:10 aspect ratio, #1A1A1A — distinct from card bg
- [ ] Title (20px Space Grotesk 600) is clearly the card focal point
- [ ] Description text (14px DM Sans 400 #8A8A8A) is subordinate
- [ ] Tag pills have proper padding (4px 12px), border-radius 8px, readable at 12px
- [ ] Tags don't touch card edges — proper margin from card padding
- [ ] 96px vertical padding on section — generous section break
- [ ] 48px gap between section label and first row of cards
- [ ] Cards align to grid — no sub-pixel rendering artifacts
- [ ] Hover state cannot be verified in screenshot — note for interactive QA

**Common fixes**:
- If cards feel too dark/flat: increase surface to #141414
- If tags are illegible: bump to 13px or increase padding
- If grid breaks on narrow viewport: verify responsive behavior at 1200px
- If descriptions run too long: ensure max 2 lines with overflow hidden

---

## Section 4: About

**Screenshot**: `step-4-about.png`

**Evaluate against**:
- [ ] Two-column layout: image left (40%), text right (60%)
- [ ] 64px gap between columns — generous breathing room
- [ ] Image placeholder: 3:4 aspect ratio, #1A1A1A, 12px border-radius
- [ ] "ABOUT" label properly spaced above heading (24px margin-bottom)
- [ ] Heading "Designing with intention" at 44px, -0.02em tracking — clear hierarchy
- [ ] Body paragraphs at 17px, #8A8A8A, 1.6 line-height — comfortable reading
- [ ] Max-width 520px on paragraphs — line length stays under 70 characters
- [ ] 16px gap between paragraphs
- [ ] Text block does not crowd the image — alignment feels balanced
- [ ] Section padding 96px top and bottom
- [ ] No centered text (this section is left-aligned)

**Common fixes**:
- If columns feel unbalanced: adjust from 40/60 to 35/65
- If text block is too narrow: increase max-width to 560px
- If image placeholder disappears into background: add 1px #1E1E1E border

---

## Section 5: Contact / CTA

**Screenshot**: `step-5-contact.png`

**Evaluate against**:
- [ ] Center-aligned layout — all elements on center axis
- [ ] "GET IN TOUCH" label in #C8FF00 — echoes hero label, creates bookend effect
- [ ] Headline at 44px — prominent but not competing with hero H1 (64px)
- [ ] Subhead is clearly secondary at 17px #8A8A8A
- [ ] Email "hello@mikachen.design" in #C8FF00, 20px — the actionable focal point
- [ ] 32px gap between subhead and email link
- [ ] Border-top 1px #1E1E1E separates from About section
- [ ] 128px vertical padding — this section breathes as much as the hero
- [ ] No text wider than 600px center-aligned (check headline width)
- [ ] The brand color (#C8FF00) appears exactly twice: label and email — intentional restraint

**Common fixes**:
- If email link doesn't stand out enough: increase size to 24px
- If section feels empty: it shouldn't — emptiness is the point. Resist adding elements.
- If headline exceeds 600px width: add max-width constraint

---

## Section 6: Footer

**Screenshot**: `step-6-footer.png`

**Evaluate against**:
- [ ] Single-row layout: copyright left, social links right
- [ ] "2026 Mika Chen" at 14px #555555 — lowest emphasis on page
- [ ] Social links at 14px #8A8A8A — slightly more visible than copyright
- [ ] 24px gaps between social links
- [ ] Border-top 1px #1E1E1E — subtle separator
- [ ] 32px vertical padding — compact, not cramped
- [ ] Content stays within 1200px max-width
- [ ] Footer does not draw attention — it exists, nothing more

**Common fixes**:
- If footer feels disconnected: ensure background matches page (#0A0A0A)
- If social links are too prominent: drop to #555555 to match copyright

---

## Full-Page QA

**Screenshot**: `full-page-qa.png` (2x resolution)

### Anti-Slop Checklist
- [ ] No purple-to-pink gradients anywhere
- [ ] No more than 2 typefaces (Space Grotesk + DM Sans only)
- [ ] No text below 12px
- [ ] No center-aligned text wider than 600px
- [ ] No stock photos (placeholder frames only)
- [ ] All spacing on 8px grid
- [ ] No pure #FFFFFF anywhere — max is #E8E8E8
- [ ] No pure #000000 anywhere — min is #0A0A0A
- [ ] Brand color used with restraint (label, email — 2 instances max)

### Vertical Rhythm Check
- [ ] Section gaps are consistent (96px for content sections, 128px for hero/CTA)
- [ ] No two sections feel different in "weight" unless intentionally so
- [ ] Page scrolls as a single coherent piece, not disjointed blocks

### Typography Consistency
- [ ] All labels: 12px uppercase, 0.08em tracking, DM Sans 500
- [ ] All section headings: Space Grotesk 600, letter-spacing -0.02em
- [ ] All body text: DM Sans 400, 1.6 line-height
- [ ] No rogue font weights or sizes

### Color Consistency
- [ ] Background is uniformly #0A0A0A (no section has a different bg unless DDD specifies)
- [ ] Card surfaces are consistently #111111
- [ ] All borders are #1E1E1E
- [ ] Text hierarchy: #E8E8E8 > #8A8A8A > #555555 — no in-between values

### Contrast Verification
| Pair | Ratio | WCAG AA |
|------|-------|---------|
| #E8E8E8 on #0A0A0A | 17.5:1 | Pass (body + large) |
| #8A8A8A on #0A0A0A | 5.3:1 | Pass (body + large) |
| #555555 on #0A0A0A | 2.8:1 | Fail body, pass large (acceptable for copyright only) |
| #C8FF00 on #0A0A0A | 14.1:1 | Pass (body + large) |
| #8A8A8A on #111111 | 4.6:1 | Pass (body + large) |
| #8A8A8A on #1A1A1A | 4.0:1 | Borderline — monitor tag readability |

### Iteration Protocol

1. After full-page screenshot, grade the overall composition A-D
2. If B: list specific elements to fix, apply changes, re-screenshot
3. If C: identify which section(s) failed, rebuild those sections only
4. After fixes, re-run the full anti-slop and contrast checklists
5. Maximum 3 full-page iterations before shipping or escalating
6. Final action: `forge publish` only after achieving grade A
