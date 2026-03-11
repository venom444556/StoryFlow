# Framer Canvas Map

Editor UI topology, selectors, and coordinates for CDP automation.
Updated empirically — run `forge evaluate` to re-verify after Framer updates.

---

## Known data-testid Attributes

| Selector | Element | Notes |
|----------|---------|-------|
| `[data-testid="pages-tab"]` | Left panel: Pages tab | |
| `[data-testid="layers-tab"]` | Left panel: Layers tab | |
| `[data-testid="assets-tab"]` | Left panel: Assets tab | |
| `[data-testid="canvas-iframe"]` | Canvas sandbox iframe | Main design surface |
| `[data-testid="page-row"]` | Page list row | Multiple on page |
| `[data-testid="content-panel-search-bar-input"]` | Search bar in content panel | |
| `[data-testid="projectbar-preview-button"]` | Preview/Publish button | Top-right toolbar |

## Editor Layout (approximate)

```
┌─────────────────────────────────────────────────────────┐
│  Toolbar (top bar)        [Preview] [Publish] [Share]   │  ~48px height
├──────────┬──────────────────────────────────┬───────────┤
│          │                                  │           │
│  Left    │       Canvas                     │  Right    │
│  Panel   │       (design surface)           │  Panel    │
│          │                                  │           │
│  ~240px  │       (variable)                 │  ~280px   │
│          │                                  │           │
│  Pages   │                                  │ Properties│
│  Layers  │                                  │ Style     │
│  Assets  │                                  │ Layout    │
│          │                                  │ Effects   │
├──────────┴──────────────────────────────────┴───────────┤
│  Bottom bar (zoom, device preview, etc.)                │  ~32px
└─────────────────────────────────────────────────────────┘
```

## Keyboard Shortcuts

Essential shortcuts for fast element manipulation:

| Key | Action |
|-----|--------|
| `F` | Insert Frame |
| `T` | Insert Text |
| `S` | Insert Stack |
| `L` | Insert Link |
| `I` | Insert Image |
| `V` | Insert Video |
| `C` | Insert Code |
| `Cmd+D` | Duplicate selection |
| `Cmd+G` | Group selection |
| `Cmd+Shift+G` | Ungroup |
| `Cmd+A` | Select all |
| `Cmd+C` / `Cmd+V` | Copy / Paste |
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Backspace` / `Delete` | Delete selection |
| `Cmd+Shift+L` | Lock/unlock |
| `Cmd+Shift+H` | Show/hide |
| `Alt+drag` | Duplicate while dragging |
| `Shift+drag` | Constrain axis |
| `0-9` | Change opacity (1=10%, 5=50%, 0=100%) |

## Canvas Coordinate System

- Origin (0,0) = top-left of the visible canvas viewport
- Coordinates are in CSS pixels (not device pixels)
- Use `forge evaluate 'window.innerWidth'` to get viewport dimensions
- Canvas has its own zoom level — coordinates are viewport-relative, not canvas-relative
- The canvas iframe (`[data-testid="canvas-iframe"]`) contains the actual design — most style reads need to target this iframe's contentDocument

## Discovery Commands

Run these to update this map:

```bash
# List all data-testid attributes on the page
forge evaluate "Array.from(document.querySelectorAll('[data-testid]')).map(e => e.getAttribute('data-testid'))"

# Get viewport dimensions
forge evaluate "JSON.stringify({ w: window.innerWidth, h: window.innerHeight })"

# List all buttons with labels
forge evaluate "Array.from(document.querySelectorAll('button')).map(b => ({ text: b.textContent?.trim(), label: b.getAttribute('aria-label'), testId: b.getAttribute('data-testid') })).filter(b => b.text || b.label)"

# Get left panel width
forge evaluate "document.querySelector('[class*=LeftPanel]')?.getBoundingClientRect()?.width || 'unknown'"
```

## Version Notes

- Last verified: Framer Desktop (March 2026)
- DOM structure may change between Framer versions
- Keyboard shortcuts are most stable — prefer them over DOM selectors
- `forge evaluate` is the escape hatch for anything selectors can't reach
