# Figma + Framer Workflow

How to use Figma and Framer together in the Design Forge pipeline.
Figma owns design (components, tokens, source of truth). Framer owns build (interactions, CMS, publishing).

---

## The Pipeline

```
Figma Design → Extract Tokens → Generate DDD → Build in Framer → Visual QA → Publish
     │              │                │               │              │
     │         forge figma       AI fills in     forge insert    forge screenshot
     │         tokens/ddd       specifics        forge style     → visual-qa skill
     │                                           forge set-text
     ▼
  Source of truth                              Production site
```

### Step-by-step

1. **Design in Figma** — create layouts, components, define variables (design tokens)
2. **Extract tokens**: `forge figma tokens <fileKey> --format css -o tokens.css`
3. **Generate DDD scaffold**: `forge figma ddd <fileKey> -o ddd.md`
4. **AI completes the DDD** — fills in gaps, makes opinionated choices where Figma is ambiguous
5. **Build in Framer** — `forge create-project` → insert sections → apply DDD values
6. **QA loop** — `forge screenshot` → visual-qa skill grades → iterate
7. **Publish** — `forge publish`

---

## Design Token Sync

### What transfers from Figma to Framer

| Figma Concept | Framer Equivalent | Sync Method |
|---------------|-------------------|-------------|
| Color variables | Color styles | `forge figma tokens` → CSS vars → apply via `forge style` |
| Spacing variables | Layout values | `forge figma tokens` → DDD spacing section |
| Typography styles | Text styles | Font name, size, weight, line-height extracted |
| Components | Components/frames | Recreated via `forge insert` + `forge style` |
| Auto Layout | Stack/Flex layout | `forge set-layout` with gap and padding values |
| Constraints | Responsive settings | Manual mapping via `forge style` |

### What does NOT transfer automatically
- **Fonts** — Framer has its own font library; manual matching required
- **Interactions/prototyping** — Figma prototype flows don't export; rebuild in Framer
- **Plugins/widgets** — Figma-specific; no Framer equivalent
- **Comments** — Stay in Figma (use `forge figma comments` to read)

---

## Framer Import Engine (Native)

Framer has a built-in Figma import feature (separate from our CLI pipeline):

1. In Framer: **File → Import from Figma** (or use the Figma plugin for Framer)
2. Paste a Figma URL or use the file picker
3. Framer converts: layouts → frames, auto-layout → stacks, fills → styles
4. **Limitations of native import:**
   - Loses some layout nuances
   - Font matching is imperfect
   - Complex gradients may simplify
   - No CMS mapping
   - Interaction states don't transfer

**Our CLI pipeline is better for production because:**
- DDD gives explicit control over every value
- Visual QA catches import artifacts
- Section-by-section build allows iteration
- Anti-slop checks prevent generic results

---

## Figma as Design Review Reference

Even when not using Figma tokens directly, Figma designs serve as the visual reference:

```bash
# Capture the reference from Figma
forge figma export <fileKey> <nodeId> --format png --scale 2 -o reference/hero.png

# Build the section in Framer
forge insert frame
forge style '{"width":"1440px","height":"800px"}'
# ... build out the section ...

# Capture current state
forge screenshot -o current/hero.png

# Compare (visually or programmatically)
# The visual-qa skill can grade against a reference image
```

---

## Common Workflows

### 1. Brand-new site from Figma designs

```bash
# Extract everything from Figma
forge figma file <fileKey>              # Understand structure
forge figma tokens <fileKey> -o tokens.json  # Get tokens
forge figma ddd <fileKey> -o ddd.md     # Generate DDD scaffold

# Build in Framer
forge connect --launch
forge create-project
# Build section by section following DDD
# QA each section with forge screenshot
forge publish
```

### 2. Redesign: update Framer site from new Figma designs

```bash
# Compare old tokens vs new
forge figma tokens <newFileKey> --format css -o new-tokens.css
# Diff against existing DDD
# Update DDD with new values
# Apply changes via forge style commands
```

### 3. Design system audit

```bash
# Extract what's defined in Figma
forge figma components <fileKey> --json > figma-components.json
forge figma styles <fileKey> --json > figma-styles.json
forge figma tokens <fileKey> --json > figma-tokens.json

# Compare against what's built in Framer
forge read-canvas --json > framer-state.json

# Identify gaps:
# - Components in Figma but not in Framer
# - Styles in Figma that don't match Framer values
# - Missing tokens
```

### 4. Figma → DDD → Visual QA (no Framer build)

Even without building in Framer, the pipeline can QA a design in Figma:

```bash
# Export the Figma design as an image
forge figma export <fileKey> <nodeId> --format png --scale 2 -o design.png

# Use visual-qa skill to grade the design
# (The agent reads the image and applies the grading rubric)
```

---

## Design Token Mapping: Figma Variables → DDD

### Color Variables
```
Figma: primary/500 (COLOR) = rgba(79, 70, 229, 1)
DDD:   Brand: #4F46E5
```

### Spacing Variables
```
Figma: spacing/md (FLOAT) = 16
DDD:   Element gap: 16px
```

### Typography
```
Figma: Text style "Heading/H1" = Inter 48px/56px Bold
DDD:   H1: Inter, 48px, weight 700, line-height 1.17
```

### Auto Layout → Framer Layout
```
Figma: layoutMode="VERTICAL", itemSpacing=24, paddingTop=32
DDD:   Section: vertical stack, gap 24px, padding 32px
Forge: forge set-layout vertical --gap 24 --padding 32
```

---

## MCP vs CLI Decision Matrix

| Scenario | Use MCP (`get_design_context`) | Use CLI (`forge figma`) |
|----------|-------------------------------|------------------------|
| Implement a specific component from Figma URL | ✓ — returns structured code + screenshot | |
| Batch export all page screenshots | | ✓ — `forge figma export` loops |
| Extract design tokens for DDD | | ✓ — `forge figma tokens --format css` |
| Quick visual reference while building | ✓ — inline screenshot | |
| CI/CD design token sync | | ✓ — headless, scriptable |
| Map Figma components to code | ✓ — Code Connect tools | |
| Audit design system completeness | | ✓ — components + styles + tokens |
| Read file structure | | ✓ — `forge figma file` with depth control |

**General rule:** MCP for rich design-to-code translation, CLI for token extraction, export, and automation.

---

## Figma Account: @sasdev

Profile: https://www.figma.com/@sasdev

To connect:
1. Generate a PAT at **figma.com → Settings → Personal Access Tokens**
2. `export FIGMA_TOKEN=<your-pat>`
3. `forge figma auth` — verify connection
4. All `forge figma` commands now work against your files
