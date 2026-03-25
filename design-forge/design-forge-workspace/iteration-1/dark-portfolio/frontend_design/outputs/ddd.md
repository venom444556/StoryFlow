# Design Plan: Mika Chen -- Dark Portfolio

## Conceptual Direction

**Tone:** Luxury minimal -- the restraint of a Dieter Rams object rendered as a website. Every element earns its pixel. No decoration for decoration's sake. The site should feel like opening a beautifully bound case study book in a dark room with a single desk lamp.

**Differentiator:** Typographic scale as architecture. The hero section uses a single word per line at enormous scale, creating a vertical rhythm that feels more like a poster than a webpage. White space is not empty -- it is structural.

**Reference Points:** Linear's product pages (density with calm), Vercel's marketing site (monochrome confidence), Tobias van Schneider's portfolio (editorial restraint).

---

## Color System

| Token              | Value       | Usage                                    |
|--------------------|-------------|------------------------------------------|
| `--bg-primary`     | `#0A0A0A`   | Page background -- near-black, not pure  |
| `--bg-surface`     | `#111111`   | Card/section surfaces                    |
| `--bg-elevated`    | `#1A1A1A`   | Hover states, active surfaces            |
| `--border-subtle`  | `#1F1F1F`   | Dividers, card borders                   |
| `--border-visible` | `#2A2A2A`   | Borders that need to read clearly        |
| `--text-primary`   | `#EDEDED`   | Headings, primary copy                   |
| `--text-secondary` | `#888888`   | Body text, descriptions                  |
| `--text-tertiary`  | `#555555`   | Labels, metadata, captions               |
| `--accent`         | `#C8FF00`   | Acid lime -- single accent, used rarely  |
| `--accent-muted`   | `#C8FF0020` | Accent at 12% opacity for subtle glows   |

**Rationale:** The near-black background (`#0A0A0A` instead of `#000000`) avoids the harshness of true black on screens. The acid lime accent (`#C8FF00`) is unexpected against the monochrome palette -- it reads as confident and contemporary without feeling tech-bro. It is used only for the availability indicator and one CTA, never sprayed across the page.

---

## Typography

| Role           | Font                | Weight     | Size   | Line Height | Letter Spacing |
|----------------|---------------------|------------|--------|-------------|----------------|
| Display (hero) | **Instrument Serif** | 400 (Regular) | 96px   | 0.95        | -0.03em        |
| Heading H2     | **Instrument Serif** | 400        | 48px   | 1.1         | -0.02em        |
| Heading H3     | **Satoshi**          | 700 (Bold) | 20px   | 1.3         | -0.01em        |
| Body           | **Satoshi**          | 400        | 16px   | 1.6         | 0              |
| Caption/Label  | **Satoshi**          | 500 (Medium) | 12px | 1.4         | 0.08em         |
| Mono/Tag       | **JetBrains Mono**   | 400        | 12px   | 1.4         | 0              |

**Rationale:**
- *Instrument Serif* (Google Fonts) is a transitional serif with sharp, contemporary inktraps. At display scale it has the editorial gravitas of a magazine masthead. It is distinctive without being eccentric.
- *Satoshi* (Fontshare, free) is a geometric sans with slightly humanist terminals. It pairs with Instrument Serif by providing neutral warmth -- more personality than Inter, less quirky than a display sans.
- *JetBrains Mono* for metadata tags keeps the "builder" identity present.

---

## Spacing Scale

Base unit: 8px. All spacing is a multiple.

| Token   | Value  | Usage                             |
|---------|--------|-----------------------------------|
| `--s-1` | 8px    | Inline gaps, tag padding          |
| `--s-2` | 16px   | Component internal padding        |
| `--s-3` | 24px   | Card padding, small section gaps  |
| `--s-4` | 32px   | Between related elements          |
| `--s-5` | 48px   | Between sections (mobile)         |
| `--s-6` | 64px   | Between sections (tablet)         |
| `--s-7` | 96px   | Between sections (desktop)        |
| `--s-8` | 128px  | Hero top/bottom padding           |
| `--s-9` | 160px  | Page top margin                   |

**Principle:** Generous white space at macro level, tight at micro level. Sections breathe; components are compact. The contrast between these two scales creates the "premium" feel.

---

## Page Sections (Top to Bottom)

### 1. Navigation Bar
- Fixed top, 64px height, `bg-primary` with 80% opacity + backdrop-blur(16px)
- Left: "Mika Chen" in Satoshi Medium 14px, letter-spacing 0.08em, uppercase, `text-secondary`
- Right: links -- "Work", "About", "Contact" in same style
- Far right: green dot (8px, `--accent`) + "Available for Q3" in caption style
- Bottom border: 1px `border-subtle`

### 2. Hero Section
- Full viewport height minus nav
- Vertically centered content, left-aligned at 12-column grid position 2-10
- Line 1: "Product" in Instrument Serif 96px, `text-primary`
- Line 2: "Designer" in Instrument Serif 96px, `text-primary`
- Below (32px gap): one sentence in Satoshi 20px, `text-secondary`, max-width 480px
  - "Crafting interfaces for SaaS products that feel inevitable."
- Below (48px gap): single text link -- "See selected work" with a right arrow, Satoshi Medium 14px, `text-secondary`, hover reveals `accent` color + subtle translate-x

### 3. Selected Work (Case Studies Grid)
- Section label: "Selected Work" -- Satoshi Medium 12px, uppercase, `text-tertiary`, letter-spacing 0.08em
- 2-column grid, 24px gap
- Each card:
  - Aspect ratio 4:3, `bg-surface`, border 1px `border-subtle`, border-radius 12px
  - Inner image placeholder (dark gray gradient, slightly lighter than surface)
  - Below image: project name (Satoshi Bold 20px), client name (caption style), and 2-3 tags in JetBrains Mono 12px with `bg-elevated` pill backgrounds
  - Hover: border transitions to `border-visible`, card translates -2px on Y axis, subtle box-shadow with `accent-muted`
- Four cards total:
  1. "Meridian" -- Fintech SaaS -- Tags: Product Design, Design System
  2. "Canopy" -- HR Platform -- Tags: UX Research, Product Design
  3. "Lumen" -- Analytics Tool -- Tags: Data Visualization, UI Design
  4. "Radius" -- Dev Tools -- Tags: Design System, Interaction Design

### 4. About Section
- 2-column layout: left column is a vertical photo placeholder (aspect 3:4, border-radius 12px), right column is text
- Heading: "Designing products people actually want to use." in Instrument Serif 48px, `text-primary`
- Body paragraph in Satoshi 16px, `text-secondary`, max-width 520px
- Below body: a row of 4 stats in a horizontal line
  - "8+" years, "30+" SaaS products, "3" design systems, "1M+" users impacted
  - Number in Instrument Serif 32px `text-primary`, label in caption style `text-tertiary`

### 5. Approach Section (3-column)
- Section label: "Approach"
- Three columns, each:
  - Step number in Instrument Serif 32px, `text-tertiary`
  - Title in Satoshi Bold 20px
  - Description in Satoshi 16px, `text-secondary`
- Steps: "01 Understand" / "02 Explore" / "03 Refine"

### 6. Contact / Footer
- Centered, generous padding (128px top, 96px bottom)
- "Let's build something" in Instrument Serif 48px
- Email as a text link: "hello@mikachen.design" in Satoshi 20px, `text-secondary`, hover `accent`
- Below (64px): horizontal row of social links (Satoshi Medium 12px, uppercase, letter-spacing 0.08em): "Twitter", "Dribbble", "LinkedIn", "Read.cv"
- Very bottom: copyright in caption style, `text-tertiary`

---

## Motion Principles

- **Page load:** Staggered fade-in from opacity 0 + translateY(16px). Hero text lines stagger at 100ms intervals. Duration 600ms, ease `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Scroll reveals:** Each section fades in on intersection (threshold 0.15). Simple opacity + translateY, no scale transforms.
- **Hover states:** 200ms transitions on border-color, color, and transform. No bounce or overshoot -- linear elegance.
- **No gratuitous animation.** Motion serves clarity, not spectacle.

---

## Texture and Atmosphere

- Extremely subtle noise overlay on `bg-primary` (opacity 0.02) -- adds analog warmth to the flat dark surface
- No gradients on backgrounds (too common in AI-generated sites)
- Card image placeholders use a very subtle radial gradient from `#1A1A1A` center to `#111111` edges -- implies depth without being decorative
- The single accent color (`#C8FF00`) appears in exactly three places: availability dot, CTA hover, email hover. This restraint makes each appearance feel significant.
