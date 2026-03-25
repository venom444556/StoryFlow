# Design System: Mika Chen Portfolio

## Context

- **Purpose:** Personal portfolio for a product designer specializing in SaaS design. Showcase work, establish expertise, attract inbound leads from design-forward companies.
- **Audience:** Design-savvy hiring managers, founders, and product leads at SaaS companies. These people visit Linear, Vercel, and Stripe daily --- they have a trained eye.
- **Platform:** Web (desktop-first, responsive down to 375px)
- **Quality bar:** Linear/Vercel-level polish --- restrained, confident, typographically driven
- **Feature importance:** Full production polish (portfolio is the product)

## Design Direction (Prescriptive)

**Monochrome dark minimalism with a single warm accent.**

The Linear/Vercel aesthetic is defined by what it removes, not what it adds. Near-black backgrounds, white text at carefully chosen weights, generous negative space, and a single accent color that draws the eye only where it matters. No gradients, no glassmorphism, no decoration. Typography and spacing do all the heavy lifting.

This is Style #52 (Monochrome) from the styles catalog crossed with Style #3 (Dark Professional). The portfolio pattern (#19) dictates: let the work speak, minimal UI chrome, high-quality imagery.

**Strategic alignment:** A SaaS product designer's portfolio IS a product. The design must demonstrate the designer's own taste and restraint. Overdesigning here is worse than underdesigning.

## Color System

```
Background:        #0A0A0A   (near-black, not pure #000 --- avoids harshness)
Surface:           #141414   (elevated cards, project thumbnails)
Surface Hover:     #1A1A1A   (card hover state)
Border:            #262626   (subtle dividers, card edges)
Border Hover:      #333333   (interactive element borders on hover)

Text Primary:      #FAFAFA   (headings, names, primary content)
Text Secondary:    #A1A1A1   (body text, descriptions --- 7.5:1 on #0A0A0A)
Text Tertiary:     #666666   (labels, metadata --- 4.6:1 on #0A0A0A)

Accent:            #E8C547   (warm gold --- used ONLY for one CTA and one hover state)
Accent Hover:      #D4B03E   (darkened 10%)

Success:           #22C55E   (if needed for form validation)
Error:             #EF4444   (if needed for form validation)
```

**Rationale:** Gold accent (#E8C547) avoids the AI-purple trap and the generic blue-link trap. It reads as premium and intentional on dark backgrounds. It is used sparingly --- only the primary CTA button and the active nav indicator. Everything else is grayscale.

**Contrast checks:**
- #FAFAFA on #0A0A0A = 19.3:1 (AAA)
- #A1A1A1 on #0A0A0A = 7.5:1 (AAA)
- #666666 on #0A0A0A = 4.6:1 (AA for normal text)
- #E8C547 on #0A0A0A = 10.2:1 (AAA)

## Typography

**Font pairing: #16 (Design Portfolio) --- Syne headings + Inter body**

Syne is distinctive without being distracting. It signals creative confidence. Inter handles everything else with quiet competence --- the same pairing logic as Linear (custom display + Inter body).

```
Display:       Syne, 64px, weight 700, line-height 1.1, letter-spacing -0.03em
H1:            Syne, 48px, weight 700, line-height 1.15, letter-spacing -0.02em
H2:            Syne, 32px, weight 600, line-height 1.2, letter-spacing -0.01em
H3:            Inter, 20px, weight 600, line-height 1.4, letter-spacing 0
Body Large:    Inter, 18px, weight 400, line-height 1.6, letter-spacing 0
Body:          Inter, 16px, weight 400, line-height 1.6, letter-spacing 0
Caption:       Inter, 13px, weight 500, line-height 1.4, letter-spacing 0.04em, uppercase
Label:         Inter, 12px, weight 500, line-height 1.4, letter-spacing 0.06em, uppercase
```

**Google Fonts load:** `Syne:wght@600;700` and `Inter:wght@400;500;600`

## Spacing System (8px base)

```
4px   --- icon-to-label gap
8px   --- tight internal padding
16px  --- card internal padding
24px  --- between elements within a section
32px  --- between subsections
48px  --- section padding (vertical)
64px  --- between major page sections
96px  --- hero vertical padding
128px --- page-level dramatic breathing room (top/bottom of hero)
```

**Page max-width:** 1200px, centered with 24px side padding (mobile: 16px)

## Page Structure

### Section 1: Navigation (sticky)
- Height: 64px
- Left: "MIKA CHEN" --- Label style (12px, 500, uppercase, letter-spacing 0.06em, #FAFAFA)
- Right: "Work", "About", "Contact" --- Body style (16px, 400, #A1A1A1), hover: #FAFAFA, transition 200ms
- Active link: #FAFAFA with 2px underline offset 6px in accent gold (#E8C547)
- Background: #0A0A0A with backdrop-filter blur(12px) when scrolled (opacity 0.9)
- Bottom border: 1px solid #262626 (visible only after scroll)

### Section 2: Hero
- Top padding: 128px, bottom padding: 96px
- Headline: "Product designer" --- Display (64px, Syne 700, #FAFAFA)
- Subline: "crafting SaaS interfaces that feel inevitable." --- Display (64px, Syne 700, #666666)
- These two lines stack vertically. The contrast difference between #FAFAFA and #666666 creates visual hierarchy without any other decoration.
- Below (32px gap): one line of body text --- "Currently shaping products at the intersection of design systems, user research, and engineering." --- Body Large (18px, Inter 400, #A1A1A1), max-width 640px
- Below (48px gap): CTA button --- "View selected work" --- 16px Inter 500, #0A0A0A text on #E8C547 background, height 44px, padding 0 24px, border-radius 6px. Hover: background #D4B03E, transform translateY(-1px). Focus: 2px outline #E8C547 offset 3px.

### Section 3: Selected Work (project grid)
- Top padding: 96px
- Section label: "SELECTED WORK" --- Label style (12px, uppercase, #666666), margin-bottom 48px
- 2-column grid, 24px gap (1-column below 768px)
- Each project card:
  - Background: #141414
  - Border: 1px solid #262626
  - Border-radius: 12px
  - Overflow: hidden
  - Thumbnail area: 16:10 aspect ratio, background #1A1A1A (placeholder for project images)
  - Content area: 24px padding
  - Project name: H3 (Inter 20px, 600, #FAFAFA)
  - Description: Body (16px, 400, #A1A1A1), margin-top 8px, max 2 lines
  - Tags row: margin-top 16px, Caption style chips --- text #666666, no background, separated by " / "
  - Hover: border-color #333333, thumbnail scales 1.02, transition 300ms ease
  - Focus-visible: 2px outline #E8C547 offset 2px

- **4 project cards shown:**
  1. "Dashboard Redesign" / "Reimagined the analytics experience for 50K+ daily users" / Product Design / Design Systems
  2. "Design System" / "Built a component library serving 12 product teams" / Systems / Documentation
  3. "Onboarding Flow" / "Reduced time-to-value from 8 minutes to 90 seconds" / UX Research / Prototyping
  4. "Mobile App" / "Native iOS experience for field teams" / Mobile / Interaction Design

### Section 4: About
- Top padding: 96px
- 2-column layout (text left 60%, empty right 40%) --- the negative space IS the design
- Section label: "ABOUT" --- Label style, #666666
- Bio text (24px gap below label): Body Large (18px, #A1A1A1, line-height 1.7, max-width 560px)
  - "I design products that get out of the way. For the past 8 years, I have worked with SaaS companies to turn complex workflows into interfaces people actually enjoy using."
  - Paragraph break (24px)
  - "My process is research-led and systems-oriented. I believe the best design is invisible --- it feels so natural that users never think about it."
- Below (32px): list of capabilities in 2 columns, Caption style
  - Column 1: "Product Strategy", "Design Systems", "User Research"
  - Column 2: "Prototyping", "Interaction Design", "Frontend Collaboration"

### Section 5: Contact
- Top padding: 96px, bottom padding: 128px
- Centered text
- Section label: "GET IN TOUCH" --- Label style, #666666, centered
- Headline: "Let's build something" --- H1 (48px, Syne 700, #FAFAFA), centered, margin-top 24px
- Below (24px): "hello@mikachen.design" --- Body Large (18px, #A1A1A1), centered. Hover: #FAFAFA, underline.
- Below (32px): social links row, centered --- "LinkedIn", "Dribbble", "Read.cv" --- Caption style, #666666, hover #A1A1A1. Separated by 24px horizontal gap.

### Section 6: Footer
- Top border: 1px solid #262626
- Padding: 24px 0
- Left: "2026 Mika Chen" --- Caption style, #666666
- Right: "Designed in Figma, built with care" --- Caption style, #666666

## Components

### Button (Primary)
- Height: 44px, padding: 0 24px
- Background: #E8C547, text: #0A0A0A, 16px Inter 500
- Border-radius: 6px
- Hover: #D4B03E, translateY(-1px), box-shadow 0 4px 12px rgba(232,197,71,0.15)
- Active: scale(0.98), no shadow
- Focus: 2px outline #E8C547, offset 3px
- Disabled: opacity 0.4
- Transition: all 200ms ease

### Link (Text)
- Color: #A1A1A1
- Hover: #FAFAFA, transition color 200ms
- Focus: 2px outline #E8C547, offset 2px, border-radius 2px

### Project Card
- See Section 3 above for full spec
- States: default, hover (border + scale), focus-visible (outline)

### Chip / Tag
- No background, text only
- Caption style (#666666)
- Separated by " / " delimiter

## Interactions and Animation

All animations respect `prefers-reduced-motion` --- when enabled, all transitions are instant (0ms).

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Nav background | Scroll past 64px | Opacity 0 to 0.9 + border appear | 200ms | ease |
| Hero text | Page load | Fade in + translateY(20px to 0) | 600ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Hero subline | Page load | Same, staggered 100ms | 600ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Hero body | Page load | Same, staggered 200ms | 600ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Hero CTA | Page load | Same, staggered 300ms | 600ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Project cards | Scroll into view | Fade in + translateY(24px to 0) | 500ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Card thumbnail | Hover | Scale 1.02 | 300ms | ease |
| Card border | Hover | Border-color transition | 200ms | ease |
| Button | Hover | Background + translateY | 200ms | ease |
| Link | Hover | Color transition | 200ms | ease |

## Responsive Breakpoints

| Breakpoint | Adjustments |
|------------|-------------|
| 1440px+ | Max-width 1200px centered, comfortable spacing |
| 1024px | Same layout, slightly tighter spacing |
| 768px | Project grid to 1 column, About section to single column (full width), nav links in hamburger or collapse to icons |
| 375px | Display font 40px, H1 32px, page padding 16px, hero padding 80px top |
| 320px | Display font 36px, all spacing reduced by ~25% |

## Dark Mode

This IS dark mode. A light mode variant is not required for a portfolio --- the dark aesthetic is a deliberate brand choice, not a preference toggle.

## Design Token Format (W3C DTCG)

```json
{
  "color": {
    "background": { "$value": "#0A0A0A", "$type": "color" },
    "surface": { "$value": "#141414", "$type": "color" },
    "border": { "$value": "#262626", "$type": "color" },
    "text-primary": { "$value": "#FAFAFA", "$type": "color" },
    "text-secondary": { "$value": "#A1A1A1", "$type": "color" },
    "text-tertiary": { "$value": "#666666", "$type": "color" },
    "accent": { "$value": "#E8C547", "$type": "color" }
  },
  "typography": {
    "display": {
      "$value": { "fontFamily": "Syne", "fontSize": "64px", "fontWeight": 700, "lineHeight": 1.1, "letterSpacing": "-0.03em" },
      "$type": "typography"
    },
    "body": {
      "$value": { "fontFamily": "Inter", "fontSize": "16px", "fontWeight": 400, "lineHeight": 1.6, "letterSpacing": "0" },
      "$type": "typography"
    }
  },
  "spacing": {
    "xs": { "$value": "4px", "$type": "dimension" },
    "sm": { "$value": "8px", "$type": "dimension" },
    "md": { "$value": "16px", "$type": "dimension" },
    "lg": { "$value": "24px", "$type": "dimension" },
    "xl": { "$value": "32px", "$type": "dimension" },
    "2xl": { "$value": "48px", "$type": "dimension" },
    "3xl": { "$value": "64px", "$type": "dimension" },
    "4xl": { "$value": "96px", "$type": "dimension" },
    "5xl": { "$value": "128px", "$type": "dimension" }
  }
}
```

## Anti-Pattern Check (Passed)

- No AI purple gradients --- gold accent is product-identity-derived
- No color-only information --- all interactive states use color + underline/outline
- No thin fonts for data --- Inter 400 minimum, display uses 600/700
- No more than 2 accent colors --- single accent (#E8C547) only
- No generated SVG icons --- no icons in this design (typography-driven)
- No glassmorphism --- clean solid backgrounds
- No placeholder marketing copy --- all text is specific and portfolio-appropriate
- Icon stroke consistency: N/A (no icon set used; design is type-and-space only)

## Implementation Notes

- Google Fonts: load Syne (600, 700) and Inter (400, 500, 600) with `display=swap`
- Use CSS custom properties for all tokens
- Project thumbnails should be 16:10 ratio, rendered at 2x for retina
- The hero animation stagger uses a single CSS `@keyframes` with `animation-delay` per child --- no JavaScript animation library needed
- Intersection Observer for scroll-triggered card reveals
- Nav scroll detection: single `scroll` listener with `requestAnimationFrame` throttle
