# Framer Components Reference

Built-in components and marketplace collections for rapid prototyping.

---

## Built-in Components

### Layout
- **Frame** — Base container, absolute or flex positioning
- **Stack** — Auto-layout container (horizontal/vertical with gap)
- **Grid** — CSS Grid layout
- **Scroll** — Scrollable container with overflow control
- **Page** — Swipeable page container for carousels

### Content
- **Text** — Rich text with Framer typography controls
- **Image** — Responsive image with fill/fit/stretch modes
- **Video** — Inline video with autoplay, loop, controls
- **SVG** — Inline SVG with color overrides
- **Code** — Custom React component (code overrides)
- **Link** — Wraps any element with navigation

### Interactive
- **Input** — Form text input
- **Form** — Form container with submission handling
- **Scroll Trigger** — Animate on scroll position
- **Page Transition** — Cross-page animation effects

---

## Marketplace Collections (Premium)

### Frameblox (500+ components)
- Complete UI kit: headers, heroes, features, pricing, CTAs, footers, testimonials
- Dark and light variants
- Best for: rapid full-page builds

### SegmentUI (300+ components)
- Dashboard and SaaS-focused components
- Data tables, charts, metrics, sidebars
- Best for: product/app landing pages

### Framepad
- Marketing-focused sections
- Animated scroll interactions built-in
- Best for: creative/agency sites

---

## Component Usage via forge

### Insert built-in component
```bash
# Most elements via keyboard shortcut
forge insert frame
forge insert text
forge insert stack

# Complex components via search in assets panel
forge key "Meta+/" # Open command palette
forge type "Scroll"  # Search for component
forge key "Enter"    # Insert it
```

### Using marketplace components
1. Components must be installed in the Framer project first
2. Access via Assets panel (`forge click` on assets tab)
3. Search: `forge evaluate 'document.querySelector("[data-testid=assets-tab]")?.click()'`
4. Then use search bar to find component by name

### Style overrides
After inserting any component, modify via the right panel properties:
```bash
forge insert frame
forge style '{"backgroundColor":"#1A1A1A","borderRadius":"16px","padding":"32px"}'
```

---

## Recommended Component Stacks by Page Type

### Landing Page
1. Nav bar (Frame + Stack + Links + CTA button)
2. Hero section (Frame + Stack + Text + Button)
3. Logo bar (Stack + Images)
4. Features grid (Frame + Grid + Feature cards)
5. Testimonials (Frame + Stack + Quote cards)
6. CTA section (Frame + Stack + Text + Button)
7. Footer (Frame + Stack + Link groups)

### Portfolio
1. Nav (minimal, name left, links right)
2. Hero (large text + optional image)
3. Project grid (Grid + Project cards with hover)
4. About section (Text + Image side by side)
5. Contact (Simple form or email link)

### SaaS Product
1. Nav with CTA
2. Hero with product screenshot
3. Social proof (logos)
4. Features (alternating image/text sections)
5. Pricing table
6. FAQ accordion
7. Final CTA + Footer
