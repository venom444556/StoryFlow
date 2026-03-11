# Figma API Reference

How to read, extract, and automate Figma files for the Design Forge pipeline.

---

## Authentication

Two methods:
1. **Personal Access Token (PAT)** — generated at figma.com/developers/api#access-tokens
   - Header: `X-Figma-Token: <token>`
   - Max expiry: 90 days (non-expiring PATs discontinued)
   - Set via: `FIGMA_TOKEN` env var, `--token` flag, or `forge figma auth`
2. **OAuth 2.0** — for multi-user apps (not needed for CLI)

**Rate limits** are per-file-plan, not per-token:
- Starter: ~6 requests/month per file (barely usable)
- Pro/Org/Enterprise: per-minute rate limits (sufficient for automation)

---

## URL Parsing

Extract `fileKey` and `nodeId` from any Figma URL:

| URL Format | fileKey | nodeId |
|-----------|---------|--------|
| `figma.com/design/:fileKey/:name?node-id=1-2` | `:fileKey` | `1:2` (convert `-` to `:`) |
| `figma.com/design/:fileKey/branch/:branchKey/:name` | `:branchKey` | from query param |
| `figma.com/file/:fileKey/:name` (legacy) | `:fileKey` | from query param |

---

## Key Endpoints

### Files
| CLI Command | API Endpoint | What it returns |
|------------|-------------|-----------------|
| `forge figma file <key>` | `GET /v1/files/:key` | Full JSON file tree (pages, frames, styles map, components map) |
| `forge figma nodes <key> <ids>` | `GET /v1/files/:key/nodes?ids=` | Specific nodes by ID (avoids downloading entire file) |

### Export / Images
| CLI Command | API Endpoint | What it returns |
|------------|-------------|-----------------|
| `forge figma export <key> <ids>` | `GET /v1/images/:key` | Rendered PNG/SVG/JPG/PDF at specified scale |

- Image URLs expire after 30 days
- Max resolution: 32 megapixels (auto-scaled if larger)
- Scale: 1x-4x (use 2x for retina quality)
- SVG options: `svg_include_id`, `svg_simplify_stroke`

### Variables (Design Tokens)
| CLI Command | API Endpoint | What it returns |
|------------|-------------|-----------------|
| `forge figma tokens <key>` | `GET /v1/files/:key/variables/local` | All local variables (colors, spacing, fonts) |
| `forge figma tokens <key> --published` | `GET /v1/files/:key/variables/published` | Published library variables |

Variables structure:
```json
{
  "meta": {
    "variableCollections": { "<id>": { "name": "Colors", "modes": [...] } },
    "variables": {
      "<id>": {
        "name": "primary/500",
        "resolvedType": "COLOR",
        "valuesByMode": { "<modeId>": { "r": 0.31, "g": 0.27, "b": 0.9, "a": 1 } }
      }
    }
  }
}
```

Color values are 0-1 floats. Convert: `Math.round(value.r * 255)` → hex.

### Components & Styles
| CLI Command | API Endpoint | What it returns |
|------------|-------------|-----------------|
| `forge figma components <key>` | via file endpoint | Component names, descriptions, IDs |
| `forge figma styles <key>` | via file endpoint | Style names, types (FILL, TEXT, EFFECT) |

### Comments
| CLI Command | API Endpoint | What it returns |
|------------|-------------|-----------------|
| `forge figma comments <key>` | `GET /v1/files/:key/comments` | All comments with authors, dates |
| `forge figma comments <key> --add "msg"` | `POST /v1/files/:key/comments` | Add comment (optionally on specific node) |

### Version History
| CLI Command | API Endpoint | What it returns |
|------------|-------------|-----------------|
| `forge figma versions <key>` | `GET /v1/files/:key/versions` | Paginated version history |

---

## File Structure (JSON response)

```
{
  "name": "My Design",
  "document": {
    "type": "DOCUMENT",
    "children": [                    ← Pages
      {
        "type": "CANVAS",
        "name": "Homepage",
        "children": [                ← Frames (top-level)
          {
            "type": "FRAME",
            "name": "Hero Section",
            "absoluteBoundingBox": { "x": 0, "y": 0, "width": 1440, "height": 800 },
            "children": [...]        ← Nested elements
          }
        ]
      }
    ]
  },
  "components": { "<id>": { "name": "Button", "description": "..." } },
  "styles": { "<id>": { "name": "Heading/H1", "styleType": "TEXT" } }
}
```

### Node Types
| Type | Description |
|------|-------------|
| DOCUMENT | Root node |
| CANVAS | Page |
| FRAME | Container (most common) |
| GROUP | Visual group |
| COMPONENT | Reusable component definition |
| COMPONENT_SET | Component with variants |
| INSTANCE | Component instance |
| TEXT | Text layer |
| RECTANGLE, ELLIPSE, LINE, POLYGON, STAR | Shape primitives |
| VECTOR | Generic vector |
| BOOLEAN_OPERATION | Union/subtract/intersect |
| SECTION | Figma section (organizational) |

### Key Properties on Nodes
- `absoluteBoundingBox` — `{ x, y, width, height }` in absolute coordinates
- `fills` — Array of paint objects (solid, gradient, image)
- `strokes` — Border paints
- `effects` — Shadows, blurs
- `style` — Text style properties (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing)
- `layoutMode` — Auto-layout: "HORIZONTAL", "VERTICAL", or "NONE"
- `itemSpacing` — Gap between auto-layout children
- `paddingLeft/Right/Top/Bottom` — Auto-layout padding
- `primaryAxisAlignItems` — Main axis alignment
- `counterAxisAlignItems` — Cross axis alignment
- `constraints` — Responsive constraints (LEFT, RIGHT, CENTER, SCALE, etc.)

---

## Token Output Formats

### CSS Custom Properties (`--format css`)
```css
:root {
  --primary-500: #4F46E5;
  --surface-dark: #141414;
  --spacing-md: 16px;
}
```

### Tailwind Config (`--format tailwind`)
```json
{
  "colors": { "primary-500": "#4F46E5" },
  "spacing": { "spacing-md": "16px" },
  "fontSize": { "heading-1": "48px" }
}
```

---

## Figma MCP Tools (Available in Claude Code)

When the Figma MCP server is connected, these tools provide richer design context than the REST API alone:

| Tool | Use Case |
|------|----------|
| `get_design_context` | **Primary tool** — returns structured React + Tailwind code, screenshot, and contextual hints |
| `get_screenshot` | Visual screenshot of any node |
| `get_metadata` | Sparse XML of node tree (IDs, names, sizes) — good for structure overview |
| `get_variable_defs` | Design tokens (colors, spacing, typography) |
| `get_code_connect_map` | Figma → code component mappings |

**When to use MCP vs CLI:**
- MCP: Rich design context with code generation hints, screenshot in one call
- CLI: Headless batch operations, CI/CD, token export, composable with shell tools

---

## Common Patterns

### Extract tokens → build in Framer
```bash
forge figma tokens <fileKey> --format css -o tokens.css
# Then reference tokens in DDD and forge build commands
```

### Screenshot a design for QA comparison
```bash
forge figma export <fileKey> <nodeId> --format png --scale 2 -o reference.png
forge screenshot -o current.png
# Compare side-by-side
```

### Generate DDD from Figma file
```bash
forge figma ddd <fileKey> --node <nodeId> -o ddd.md
# Review and fill in TODOs, then use DDD for canvas construction
```

### Audit a file's design system
```bash
forge figma components <fileKey>    # What's reusable?
forge figma styles <fileKey>        # What's standardized?
forge figma tokens <fileKey>        # What's tokenized?
```
