---
name: visual-qa
description: "Review, evaluate, grade, or critique any web design for quality. Use this skill whenever the user asks to check a design, review a screenshot, grade a layout, evaluate a color palette, check contrast ratios, verify spacing consistency, do a visual QA pass, or run an anti-slop check. Triggers on: 'does this look good', 'what's wrong with this design', 'rate this layout', 'review my design', 'grade this design', 'check the contrast', 'is my spacing consistent', 'evaluate my color palette', 'do a visual QA pass', 'forge-review', 'anti-slop check', 'before I publish can you check', any screenshot review request, or any request to assess design quality across typography, color, spacing, layout, or polish. Also triggers on '/forge-review'."
---

# Visual QA — Screenshot Evaluation Skill

Evaluate Framer canvas screenshots for design quality. Grade, diagnose, prescribe fixes.

## Evaluation Method

### Hybrid Approach
1. **Vision analysis** — Look at the screenshot for gestalt, balance, feel, polish
2. **Programmatic checks** — Use `forge evaluate` to read computed styles, contrast ratios, actual pixel values

Both are required. Vision catches "does this look right." Programmatic catches "is this exactly right."

## Grading Rubric

Grade each dimension A-F, then compute overall grade (lowest dimension wins):

### Typography (25%)
| Grade | Criteria |
|-------|----------|
| A | Clear 3-level hierarchy, sizes match DDD, proper line heights, max 2 fonts, good letter-spacing |
| B | Hierarchy present but one level off, or line height slightly wrong |
| C | Weak hierarchy, font sizes inconsistent with DDD, or 3 fonts |
| D | No visible hierarchy, random sizing |
| F | Unreadable text, >3 fonts, text below 14px |

### Color (25%)
| Grade | Criteria |
|-------|----------|
| A | Palette matches DDD exactly, all contrast passes AA, accent usage intentional and restrained |
| B | Palette mostly matches, one contrast issue, accent usage reasonable |
| C | 1-2 off-palette colors, multiple contrast issues |
| D | Random colors, poor contrast throughout |
| F | Illegible text, clashing colors, accessibility failures |

### Spacing (25%)
| Grade | Criteria |
|-------|----------|
| A | All spacing on 8px grid, consistent padding, generous white space, no cramped areas |
| B | Mostly on grid, one spacing inconsistency |
| C | Multiple spacing violations, some cramped areas |
| D | Random spacing, inconsistent padding |
| F | Elements overlapping, no spatial logic |

### Layout (15%)
| Grade | Criteria |
|-------|----------|
| A | Clean alignment, clear section boundaries, logical flow, responsive-ready structure |
| B | Good alignment with minor drift, flow mostly logical |
| C | Misalignment visible, unclear section boundaries |
| D | Broken layout, elements out of place |
| F | Unusable layout |

### Polish (10%)
| Grade | Criteria |
|-------|----------|
| A | Consistent border-radius, shadows, borders. No orphaned text. Hover states implied. Professional finish. |
| B | Mostly consistent, one minor inconsistency |
| C | Mixed border-radius or shadow styles |
| D | Visually rough, unfinished feel |
| F | Clearly broken/unfinished |

## Overall Grade
- **A** → Ship it. Minor tweaks optional.
- **B** → Fix the flagged issues, then ship.
- **C** → Rework the failing section(s). Don't ship.
- **D/F** → Restart the section from scratch.

## Output Format

```
## Visual QA Report

### Overall: [A-F]

| Dimension | Grade | Notes |
|-----------|-------|-------|
| Typography | [A-F] | [specific observation] |
| Color | [A-F] | [specific observation] |
| Spacing | [A-F] | [specific observation] |
| Layout | [A-F] | [specific observation] |
| Polish | [A-F] | [specific observation] |

### Fixes Required
1. [Specific fix with forge command]
2. [Specific fix with forge command]

### Anti-Slop Check
- [ ] No purple-to-pink gradients
- [ ] No generic Inter + timid palette
- [ ] Max 2 fonts
- [ ] No text < 14px
- [ ] No wide centered text
- [ ] Spacing on 8px grid
- [ ] Contrast passes AA
- [ ] No pure white/black in dark mode
- [ ] Icon style consistent
```

## Programmatic Checks

Run these `forge evaluate` commands for precise measurements:

```bash
# Check contrast ratio between two colors
forge evaluate "(() => { const rgb = (h) => { const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16); return [r,g,b]; }; const lum = ([r,g,b]) => { const [rs,gs,bs] = [r,g,b].map(c => { c /= 255; return c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4; }); return 0.2126*rs + 0.7152*gs + 0.0722*bs; }; const l1 = lum(rgb('#E8E8E8')), l2 = lum(rgb('#0A0A0A')); return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2); })()"

# Get all font families used
forge evaluate "new Set(Array.from(document.querySelectorAll('*')).map(e => getComputedStyle(e).fontFamily)).size"

# Get all font sizes used
forge evaluate "Array.from(new Set(Array.from(document.querySelectorAll('*')).map(e => getComputedStyle(e).fontSize))).sort()"

# Check for spacing violations (non-8px values)
forge evaluate "Array.from(document.querySelectorAll('*')).map(e => parseInt(getComputedStyle(e).padding)).filter(v => v > 0 && v % 8 !== 0 && v !== 4)"
```
