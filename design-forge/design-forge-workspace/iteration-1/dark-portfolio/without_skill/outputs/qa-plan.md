# Quality Evaluation Plan: Mika Chen Portfolio

## Evaluation Method

After `forge screenshot`, evaluate the rendered output against the design plan using a structured rubric. Each dimension is scored 1-5 (1 = failing, 3 = acceptable, 5 = premium-grade).

---

## Dimension 1: Visual Hierarchy

**What to check:**
- Display headline is the most prominent element on the page (largest size, highest contrast)
- Clear size/weight progression: Display > H1 > H2 > H3 > Body > Caption
- Section labels ("SELECTED WORK", "ABOUT") are visually subordinate to content
- The eye follows a natural path: Hero headline -> subtext -> CTA -> project cards -> about -> contact

**Pass criteria:** Score >= 4. The headline should be unmissable. No two elements should compete for attention at the same level.

**How to verify:**
- Squint test: blur the screenshot and confirm the headline, project cards, and contact headline are the three focal points
- Grayscale test: convert screenshot to grayscale and verify hierarchy holds without color

---

## Dimension 2: Spacing & Alignment

**What to check:**
- All content is left-aligned within the 1120px content area (160px margins on 1440px canvas)
- Vertical spacing between sections follows the plan: Hero 128/96, Work 64/96, About 96/96, Contact 96/128
- Card grid has consistent 24px gaps both horizontally and vertically
- Internal card padding is uniform (24px sides/bottom, 20px top for text area)
- Nav elements vertically centered within 64px bar
- Footer elements vertically centered within 64px bar

**Pass criteria:** Score >= 4. No visible misalignment. Spacing should feel generous but intentional.

**How to verify:**
- Overlay an 8px grid on the screenshot to check alignment
- Measure gutters between cards -- both columns and rows should be exactly 24px
- Check that text blocks respect their max-width constraints (520px for body, 700px for headline)

---

## Dimension 3: Typography

**What to check:**
- Inter renders correctly at all specified sizes
- Negative letter-spacing is visible on headlines (tight, editorial feel)
- Body text at 16px/1.6 line-height is comfortable to read
- Caption text (12px) is legible but clearly subordinate
- No orphaned words on key headlines
- Text color contrast ratios meet WCAG AA (verify `#888888` on `#0A0A0A` = 5.3:1, passes AA for normal text)

**Pass criteria:** Score >= 4. Typography should feel like the primary design element, not an afterthought.

**How to verify:**
- Read all body text at 100% zoom -- it should be effortless
- Check headline rendering at retina vs non-retina for anti-aliasing quality
- Verify no text is clipped, overlapping, or wrapping unexpectedly

---

## Dimension 4: Color & Contrast

**What to check:**
- Background is a true near-black (`#0A0A0A`), not washed out
- Card backgrounds (`#141414`) are distinguishable from page background but not jarring
- Accent purple (`#7C6AFF`) appears exactly 3 times: hero CTA, about availability, contact email
- No unintended color outside the defined palette
- Borders (`#222222`) are subtle -- visible but not heavy

**Contrast ratios to verify:**
| Pair                          | Ratio  | Required |
|-------------------------------|--------|----------|
| `#FAFAFA` on `#0A0A0A`       | 19.4:1 | AAA      |
| `#888888` on `#0A0A0A`       | 5.3:1  | AA       |
| `#555555` on `#0A0A0A`       | 3.1:1  | AA Large |
| `#7C6AFF` on `#0A0A0A`       | 4.8:1  | AA       |
| `#FAFAFA` on `#141414`       | 17.1:1 | AAA      |

**Pass criteria:** Score >= 4. All text meets at minimum WCAG AA for its size category. Accent color pops without screaming.

---

## Dimension 5: Composition & Balance

**What to check:**
- Page does not feel top-heavy or bottom-heavy
- The 2x2 project grid creates a strong visual center
- About section's asymmetric layout (40/60 split) adds variety without disrupting flow
- Contact section's centered alignment creates a natural conclusion
- Footer is minimal and does not draw attention

**Pass criteria:** Score >= 4. The page should feel like a single cohesive piece, not stacked sections.

**How to verify:**
- View the full-page screenshot at 25% zoom -- does it read as one unified composition?
- Check that the visual weight is distributed: heavy top (hero), structured middle (cards), open bottom (contact)

---

## Dimension 6: Premium Feel (Subjective)

**What to check:**
- Does this look like it belongs alongside Linear.app, Vercel.com, or Raycast.com?
- Is there anything that looks "template-y" or generic?
- Does the restraint feel confident or just empty?
- Would a hiring manager at a top-tier SaaS company take this seriously?

**Pass criteria:** Score >= 4. First impression should be "this person has taste."

**Red flags that drop the score:**
- Any element that looks like a Bootstrap/Tailwind default
- Rounded corners that are too large (>16px feels playful, not premium)
- Too many font sizes or weights creating visual noise
- Accent color used too liberally (more than 3-4 instances)

---

## Scoring Summary

| Dimension                  | Weight | Target |
|----------------------------|--------|--------|
| Visual Hierarchy           | 20%    | >= 4   |
| Spacing & Alignment        | 20%    | >= 4   |
| Typography                 | 20%    | >= 4   |
| Color & Contrast           | 15%    | >= 4   |
| Composition & Balance      | 15%    | >= 4   |
| Premium Feel (Subjective)  | 10%    | >= 4   |

**Overall pass threshold:** Weighted average >= 4.0 (out of 5.0)

---

## Iteration Protocol

If any dimension scores below 4:

1. Identify the specific failing elements (not vague "spacing feels off" -- which element, which measurement)
2. Write the corrective `forge style` or `forge move` commands
3. Re-screenshot and re-evaluate only the affected dimensions
4. Maximum 3 iteration rounds before reconsidering the design plan itself

---

## Automated Checks (Pre-Screenshot)

Before taking the screenshot, run these validation commands:

```bash
# Verify all elements exist
forge screenshot --name "qa-check" --format png

# Check for overlapping elements (if forge supports it)
# forge validate --check overlap

# Verify text content is correct
forge set-text "HeroHeadline" --verify "Designing systems\nthat scale."
forge set-text "ContactEmail" --verify "hello@mikachen.design"
```

These catch build errors (missing elements, wrong text) before the visual evaluation begins.
