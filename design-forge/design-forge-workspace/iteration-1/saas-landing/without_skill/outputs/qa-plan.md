# DevForge Landing Page -- Quality Evaluation Plan

## Overview

This QA plan evaluates the built landing page across five dimensions: visual fidelity, layout correctness, content accuracy, design system compliance, and production readiness. Each dimension has specific pass/fail criteria and a method for verification.

---

## 1. Visual Fidelity (Does it look like the design plan?)

### Method
Take a full-page screenshot (`forge screenshot`) and evaluate against the design plan specifications.

### Checks

| ID   | Check                                            | Pass Criteria                                                        | How to Verify                              |
|------|--------------------------------------------------|----------------------------------------------------------------------|--------------------------------------------|
| VF-1 | Background color                                 | Page bg is `#0A0A0F` (near-black, not pure black)                    | Screenshot pixel sample at empty area      |
| VF-2 | Card backgrounds                                 | All cards use `#12121A`, visually distinct from page bg               | Pixel sample inside any card               |
| VF-3 | Accent color                                     | CTAs and highlights use `#6C5CE7` purple                             | Pixel sample on primary CTA                |
| VF-4 | Text contrast                                    | Headings are bright (`#F0F0F5`), body is muted (`#8B8BA3`)          | Visual comparison of heading vs body text  |
| VF-5 | Pro tier highlight                               | Pro card has purple border + glow, visually distinct from other tiers | Side-by-side comparison of 3 tier cards    |
| VF-6 | "Most Popular" badge                             | Green badge visible on Pro tier, text is dark on green               | Visual inspection                          |
| VF-7 | Border subtlety                                  | Card borders are visible but not dominant (`#2A2A3C`)                | Zoom to card edge                          |
| VF-8 | Overall "Linear/Raycast" feel                    | Dark, minimal, typographic, no bright decorative elements            | Subjective review by designer              |

### Scoring
- 8/8 = Pass
- 6-7/8 = Pass with minor fixes
- Below 6 = Fail, iterate

---

## 2. Layout Correctness (Is the structure right?)

### Method
Use `forge screenshot` at 1440px width. Optionally resize to 1024px and 768px to check narrower viewports if responsive behavior is in scope.

### Checks

| ID   | Check                                     | Pass Criteria                                                    |
|------|-------------------------------------------|------------------------------------------------------------------|
| LC-1 | Navbar sticky at top                      | Navbar is 64px tall, spans full width, fixed position            |
| LC-2 | Hero centered                             | Headline, subhead, CTAs, and screenshot are horizontally centered|
| LC-3 | CTA buttons side by side                  | Primary and secondary CTAs on same row with 12px gap             |
| LC-4 | Screenshot placeholder dimensions         | 800x450px, centered below terminal block                         |
| LC-5 | Social proof horizontally centered        | Label centered, 5 logo placeholders in a row with equal spacing  |
| LC-6 | Features grid: 3 equal columns            | All 3 cards same width, 16px gap between them                    |
| LC-7 | Pricing grid: 3 equal columns             | All 3 tier cards same width, aligned tops, CTAs at card bottom   |
| LC-8 | Footer: 4 link columns                    | 4 columns visible, evenly distributed                            |
| LC-9 | Section vertical spacing                  | Consistent 96px padding between major sections                   |
| LC-10| Content max-width                         | No content extends beyond 1200px centered area                   |

### Scoring
- 10/10 = Pass
- 8-9/10 = Pass with minor fixes
- Below 8 = Fail, iterate

---

## 3. Content Accuracy (Is the copy correct?)

### Method
Read all text elements from the canvas (either visually from screenshot or via `forge` inspection commands if available).

### Checks

| ID   | Check                              | Expected Value                                                       |
|------|------------------------------------|----------------------------------------------------------------------|
| CA-1 | Hero headline                      | "Code reviews on autopilot."                                         |
| CA-2 | Hero subhead                       | "DevForge analyzes diffs, flags issues, and suggests fixes before your team even opens the PR." |
| CA-3 | Terminal snippet                   | "$ forge review --pr 142"                                            |
| CA-4 | Social proof label                 | "TRUSTED BY ENGINEERING TEAMS AT"                                    |
| CA-5 | Features section heading           | "Built for how you actually ship code"                               |
| CA-6 | Feature titles (3)                 | "Instant PR Analysis", "Context-Aware Feedback", "CI/CD Integration" |
| CA-7 | Pricing heading                    | "Simple, transparent pricing"                                        |
| CA-8 | Tier names                         | "Starter", "Pro", "Enterprise"                                       |
| CA-9 | Tier prices                        | "$0", "$29", "Custom"                                                |
| CA-10| CTA labels                        | "Get Started", "Start Free Trial", "Contact Sales"                   |
| CA-11| Copyright                         | "2026 DevForge. All rights reserved."                                |

### Scoring
- All 11 must match exactly = Pass
- Any mismatch = Fix before proceeding

---

## 4. Design System Compliance (Are tokens used consistently?)

### Method
Audit every `forge style` command in the build plan against the design plan token table.

### Checks

| ID   | Check                                     | Rule                                                              |
|------|-------------------------------------------|-------------------------------------------------------------------|
| DS-1 | No hardcoded colors outside palette       | Every color value must match a token from the design plan         |
| DS-2 | Font family consistency                   | Only `Inter` and `JetBrains Mono` used                            |
| DS-3 | Font size scale adherence                 | All sizes must match the typography table (no arbitrary values)   |
| DS-4 | Spacing scale adherence                   | Margins/paddings use 4/8/12/16/24/32/48/64/96/120px only         |
| DS-5 | Border radius consistency                 | Cards: 12px. Buttons: 10px. Badges: 6px. Logo placeholders: 4px. |
| DS-6 | No orphan styles                          | Every styled element has a corresponding `forge insert`           |

### Scoring
- 6/6 = Pass
- Any violation = Fix the offending command

---

## 5. Production Readiness (Is it shippable?)

### Method
Evaluate the final screenshot and command sequence for completeness and polish.

### Checks

| ID   | Check                                     | Criteria                                                          |
|------|-------------------------------------------|-------------------------------------------------------------------|
| PR-1 | No missing sections                       | All 6 sections present: navbar, hero, social proof, features, pricing, footer |
| PR-2 | No overlapping elements                   | No visual overlap between any elements in screenshot              |
| PR-3 | No clipped text                           | All text fully visible, no truncation                             |
| PR-4 | Visual hierarchy clear                    | Eye flows: headline > subhead > CTAs > screenshot > sections     |
| PR-5 | CTA visibility                            | Primary CTAs are the most visually prominent interactive elements |
| PR-6 | Pricing tier comparison easy              | A user can compare all 3 tiers at a glance without scrolling     |
| PR-7 | No placeholder text left unresolved       | All text is final copy (no "Lorem ipsum" or "TODO")              |
| PR-8 | Element naming convention                 | All `--name` values are descriptive and follow PascalCase         |

### Scoring
- 8/8 = Ship it
- 6-7/8 = Minor polish needed
- Below 6 = Needs another iteration

---

## Evaluation Workflow

```
Step 1: Build all sections (Phases 1-7 from build-plan.md)
Step 2: Take full-page screenshot (Phase 8)
Step 3: Run all 5 evaluation dimensions against the screenshot
Step 4: Score each dimension
Step 5: If any dimension fails → identify failing checks → fix → re-screenshot → re-evaluate
Step 6: When all dimensions pass → forge publish
```

## Overall Pass Gate

| Dimension               | Minimum Score |
|-------------------------|---------------|
| Visual Fidelity         | 6/8           |
| Layout Correctness      | 8/10          |
| Content Accuracy        | 11/11         |
| Design System Compliance| 6/6           |
| Production Readiness    | 6/8           |

All five dimensions must meet their minimum score for the page to be considered ready for review. Content accuracy is non-negotiable -- every text element must match the spec exactly.
