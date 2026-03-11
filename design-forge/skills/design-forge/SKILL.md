---
name: design-forge
description: "Build, design, or create websites and web pages — landing pages, portfolios, SaaS sites, blogs, agency sites, documentation sites, or any web design project. Use this skill whenever the user wants to build a website, design a landing page, create a portfolio, make a page look good, redesign a site, set up a new web project, or asks for a design system (DDD). Triggers on: 'build me a site', 'design a landing page', 'create a portfolio', 'forge me a website', 'make this look good', 'redesign my page', 'set up a new Framer project', 'I need a website for...', 'help me design...', 'build something in Framer', any mention of Framer canvas work, or any request to construct a multi-section web page with specific aesthetics. Also triggers on '/forge'. Covers the full pipeline from brief intake through design decisions, canvas construction, visual QA, and publishing."
---

# Design Forge — Orchestrator Skill

Build production-grade websites in Framer via AI-driven design pipeline.

## Pipeline

### 1. Brief Intake

Extract from user input:
- **Site type**: landing page, portfolio, SaaS product, blog, agency, docs
- **Aesthetic direction**: minimal, bold, editorial, playful, corporate, brutalist
- **Audience**: developers, designers, executives, consumers, enterprise
- **Content**: headlines, features, testimonials, CTAs (or generate from context)
- **References**: any URLs, screenshots, or brand assets provided

If the brief is vague, ask 2-3 focused questions. Don't proceed without direction.

### 2. Design Direction

Consult existing skills for strategic alignment:
- **frontend-design**: Bold aesthetic choices, distinctive typography, anti-slop patterns
- **vibe-check**: Production quality checklist, polish calibration, component systems
- **on-brand**: Identity consistency, naming, token governance (if brand context exists)

Synthesize their guidance into a single coherent direction.

### 3. Design Decision Document (DDD)

Produce a concrete DDD with SPECIFIC values — no ambiguity:

```
## DDD: [Project Name]

### Typography
- Display: [exact font name], [weights used] — NOT Space Grotesk (convergence font)
- Body: [exact font name], [weights used]
- Monospace (if needed): [font name] — for code/terminal UI only, does not count toward 2-font limit
- Scale: H1=[size]px, H2=[size]px, H3=[size]px, Body=[size]px — ALL sizes must be on the type scale (12,14,16,18,20,24,28,32,36,40,48,56,64,72)

### Color Palette
- Background: [hex]
- Surface: [hex]
- Border: [hex]
- Text primary: [hex]
- Text secondary: [hex]
- Brand: [hex]
- Accent: [hex]

### Spacing
- Section gap: [N]px — MUST be multiple of 8
- Card padding: [N]px — MUST be multiple of 8
- Element gap: [N]px — MUST be multiple of 8
- Button padding: [V]px [H]px — MUST be multiples of 8 (e.g., 16px 24px, 16px 32px)
- Grid: 8px base — verify EVERY value before finalizing

### Layout
- Max width: [N]px
- Columns: [N]
- Border radius: [N]px

### Sections (ordered)
1. [Section name] — [purpose, key elements]
2. [Section name] — ...
```

Every value must be a specific number or hex code. "Use blue" is not acceptable — "#4F46E5" is.

### 4. Canvas Construction

Delegate to `forge` CLI via Bash. Follow this sequence:
1. `forge connect --launch` — ensure Framer CDP is live
2. `forge create-project` — start fresh canvas
3. Build section by section, following workflow-recipes.md patterns
4. Use DDD values for every style property

Reference `framer-canvas-map.md` for selectors and `framer-shortcuts.md` for fast manipulation.

### 5. Visual QA Loop

After each major section:
1. `forge screenshot -o section-N.png` — capture current state
2. Evaluate the screenshot against the DDD using the **visual-qa** skill
3. Grade: A (ship) / B (minor fix) / C (rework) / D-F (restart section)
4. If B: apply targeted fixes via `forge style` / `forge set-text`
5. If C: rebuild section from scratch
6. Re-screenshot and re-evaluate
7. Maximum 3 iterations per section — if still C after 3, flag for human review

### 6. Polish Pass

Full-page evaluation:
1. `forge screenshot --full-page --2x -o full-qa.png`
2. Check against vibe-check's 22-point production checklist
3. Verify anti-slop checklist (design-principles.md)
4. Fix any issues found
5. Final screenshot

### 7. Publish

1. `forge publish` — trigger Framer publish flow
2. Return the published URL
3. Take a final screenshot of the live site

## Key Rules

- **Never proceed without a DDD.** The DDD is the contract between design-director and canvas-operator.
- **Screenshot after every major change.** Visual QA is continuous, not final.
- **Specific values only.** If you can't name the hex code, you haven't decided.
- **Consult design-principles.md** for every typography, color, and spacing decision.
- **When in doubt, more white space.** Premium design = generous breathing room.
