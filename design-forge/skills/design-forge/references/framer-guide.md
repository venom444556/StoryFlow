# Framer Deep Guide

Comprehensive reference for operating Framer Desktop via the forge CLI.
Not theory — specific workflows, panel locations, and operational knowledge.

---

## Framer Architecture

Framer is an Electron app wrapping a web-based editor. The editor has:
- **Canvas** — the design surface where you build (center area)
- **Left Panel** — Pages, Layers, Assets tabs (~240px wide)
- **Right Panel** — Properties, Style, Layout, Effects (~280px wide)
- **Top Bar** — Toolbar, Preview, Publish, Share buttons
- **Bottom Bar** — Zoom, device preview controls

The canvas contains an iframe (`[data-testid="canvas-iframe"]`) that sandboxes the actual design. Style reads target this iframe's contentDocument.

---

## Project Types

| Type | Use Case | Starting Point |
|------|----------|---------------|
| Blank | Full control, custom design | `forge create-project` |
| Template | Fast start, customize existing | `forge create-project --template portfolio` |
| Import from Figma | Bring in existing designs | Framer File → Import |

---

## Building Blocks

### Frames
The fundamental container. Everything is a frame.
```bash
forge insert frame
forge style '{"width":"1440px","height":"auto","backgroundColor":"#0A0A0A"}'
```

### Text
```bash
forge insert text
forge set-text "Your heading here" --font "Syne" --size 56 --weight 700 --color "#E8E8E8"
```

### Stacks (Auto Layout)
Framer's stack = Figma's auto-layout = CSS flexbox.
```bash
forge insert stack
forge set-layout vertical --gap 24 --padding 32
```

### Links
Navigation elements with hover states.
```bash
forge insert link
forge set-text "About" --size 16 --weight 400
```

### Images
```bash
forge insert image
# Then set source via right panel or forge style
```

### Code Components
Custom React components with props.
```bash
forge insert code
# Opens code editor — use forge evaluate to interact
```

---

## The Right Panel (Properties)

When a frame is selected, the right panel shows:

### Position & Size
- X, Y coordinates (relative to parent)
- Width, Height
- Rotation
- Corner radius (per-corner control available)
- Clip content toggle

### Layout (Auto Layout)
- Direction: Horizontal / Vertical
- Gap (space between children)
- Padding (top, right, bottom, left — can be uniform or per-side)
- Alignment: start, center, end, space-between
- Distribution
- Wrap toggle

### Style
- Fill (background): Solid, Gradient, Image
- Border: color, width, style
- Border radius
- Opacity
- Blend mode

### Typography (when text selected)
- Font family (Framer's font picker)
- Weight
- Size
- Line height
- Letter spacing
- Text alignment
- Text transform
- Text decoration

### Effects
- Shadow: offset X/Y, blur, spread, color
- Inner shadow
- Blur (Gaussian, background)

---

## Framer's Layout System

### Stack (Auto Layout) — The Core
Most Framer layouts use stacks. A stack = flexbox container.

| Property | CSS Equivalent | forge command |
|----------|---------------|---------------|
| Direction | flex-direction | `forge set-layout horizontal\|vertical` |
| Gap | gap | `--gap N` |
| Padding | padding | `--padding N` or `--paddingX N --paddingY N` |
| Align | align-items | `--align start\|center\|end` |
| Distribute | justify-content | via `forge style` |
| Wrap | flex-wrap | via `forge style` |

### Sizing
- **Fixed**: explicit pixel width/height
- **Fill**: expand to fill parent (flex: 1)
- **Hug**: shrink to content (fit-content)

```bash
# Fixed width, hug height
forge style '{"width":"1200px","height":"auto"}'

# Fill parent width
forge style '{"width":"100%"}'
```

### Responsive
Framer uses breakpoints for responsive design:
- Desktop: 1200px+
- Tablet: 810px
- Mobile: 390px

Set via the device preview dropdown in the bottom bar, or:
```bash
forge evaluate "document.querySelector('[data-testid=\"device-selector\"]')?.click()"
```

---

## Page Structure

A typical Framer page (top → bottom):

```
Page
├── Navigation (fixed, top)
│   ├── Logo
│   ├── Nav Links (stack, horizontal, gap: 32px)
│   └── CTA Button
├── Hero Section
│   ├── Heading (48-72px)
│   ├── Subheading (18-20px)
│   └── CTA Button
├── Features Section
│   ├── Section Heading
│   └── Feature Grid (3-col stack with wrap)
│       ├── Feature Card
│       ├── Feature Card
│       └── Feature Card
├── Testimonials
├── Pricing
├── CTA Section
└── Footer
```

Each section is a stack (vertical) with max-width constraint and centered alignment.

---

## CMS (Content Management)

Framer has a built-in CMS for dynamic content:
- **Collections**: Define content types (Blog Posts, Team Members, etc.)
- **Items**: Individual entries with fields
- **Collection Lists**: Components that render items from a collection
- **Detail Pages**: Dynamic pages for individual items

CMS is managed in the Framer UI left panel. The forge CLI interacts via evaluate:
```bash
# Check if CMS is available
forge evaluate "document.querySelector('[data-testid=\"cms-tab\"]') !== null"
```

---

## Components

### Creating a Component
1. Select a frame
2. Right-click → "Create Component" (or Cmd+K, type "component")
3. Component appears in Assets panel with a purple diamond icon

### Component Properties (Variants)
- Text props: allow text content override
- Boolean props: show/hide layers
- Enum props: switch between variants
- Color props: override fill colors

### Design Forge patterns for components:
```bash
# Build a card component
forge insert frame
forge style '{"width":"360px","padding":"24px","borderRadius":"16px","backgroundColor":"#141414","border":"1px solid #2E2E2E"}'
forge set-layout vertical --gap 16

# Add content
forge insert text
forge set-text "Card Title" --size 20 --weight 600 --color "#E8E8E8"

forge insert text
forge set-text "Card description goes here." --size 16 --weight 400 --color "#999999"

# Select the parent frame and make it a component
forge key "Shift+Enter"  # Select parent
# Then use Framer's component creation UI
```

---

## Interactions & Animations

Framer supports interactions without code:
- **Hover**: change any property on hover
- **Tap/Click**: navigate, open overlay, toggle
- **Scroll**: parallax, scroll-based animations
- **Page transitions**: slide, fade, push

Set via the right panel "Events" section when a frame is selected.

For scroll animations:
- Select element → Effects → Scroll Transform
- Set start/end positions and property changes

---

## Publishing

```bash
# Preview (opens in browser)
forge key "Meta+p"  # Or click Preview button

# Publish to Framer subdomain
forge publish

# Custom domain: configure in Project Settings → Custom Domain
```

### Publish options:
- **Framer subdomain**: yoursite.framer.website (free)
- **Custom domain**: Connect via DNS settings
- **SSL**: Automatic via Let's Encrypt

---

## Performance Tips

### Image optimization
- Use WebP format where possible
- Set explicit width/height to prevent layout shift
- Use lazy loading for below-fold images

### Font loading
- Framer loads fonts from Google Fonts or uploaded files
- Limit to 2 font families + 1 monospace (per design-principles.md)
- Prefer variable fonts for fewer network requests

### Page speed
- Minimize layers (flatten decorative groups)
- Use native Framer components over code components where possible
- Avoid excessive effects (shadows, blurs) on mobile

---

## Troubleshooting

### CDP connection fails
```bash
# Check if Framer is running with debug port
forge status

# Relaunch with debug port
forge connect --launch

# Verify port is responding
curl http://127.0.0.1:9222/json/version
```

### Element not selectable
- May be locked: `forge key "Meta+Shift+l"` to unlock all
- May be hidden: check Layers panel visibility toggles
- May be inside a component instance: double-click to enter

### Style not applying
- Check if element has a component override blocking the change
- Verify the element is actually selected: `forge get-selection`
- Some properties require specific parent layouts (e.g., "fill" width needs a stack parent)

### Text not changing
- Ensure you're in text editing mode (double-click the text element)
- `forge set-text` handles this automatically by focusing first

---

## Framer-Specific CSS Properties

Properties that map differently in Framer vs standard CSS:

| Framer Property | CSS Equivalent | Notes |
|----------------|---------------|-------|
| Stack direction | flex-direction | "Horizontal" = row, "Vertical" = column |
| Stack gap | gap | Applies to both axes uniformly |
| Fill sizing | flex: 1 | "Fill" = expand to fill parent |
| Hug sizing | fit-content | "Hug" = shrink to content |
| Fixed sizing | explicit width/height | Pixel values |
| Corner radius | border-radius | Per-corner: top-left, top-right, bottom-right, bottom-left |
| Backdrop filter | backdrop-filter | blur, saturate — used for nav glass effect |
| Clip content | overflow: hidden | Toggle on parent frame |

---

## Version Notes

- Guide based on Framer Desktop March 2026
- Framer updates frequently — DOM selectors may change
- Keyboard shortcuts are the most stable interface
- `forge evaluate` is the escape hatch for anything not covered here
