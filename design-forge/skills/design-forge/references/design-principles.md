# Design Principles — The Knowledge Base

Actionable rules the agent follows for every design decision. Not theory — specific values.

---

## Visual Hierarchy

Every section needs exactly ONE clear focal point. Build hierarchy with 3+ of these 4 tools:

| Tool | Low emphasis | High emphasis |
|------|-------------|---------------|
| Size | 14-16px | 48-72px |
| Contrast | gray-400 | white / brand |
| Weight | 400 (regular) | 700-900 (bold) |
| Space | tight, grouped | generous isolation |

**Rule**: If it needs attention, apply 3+ tools. If 2, it blends. If 1, invisible.

---

## The 8px Grid

All spacing = multiples of 8. No exceptions. No "close enough." This includes padding, margin, gap, width, height — every spatial value.

**If you're tempted to write 14px, 11px, 28px, 45px — stop. Find the nearest 8px multiple.**

| Token | Value | Use |
|-------|-------|-----|
| xs | 4px | Icon padding only |
| sm | 8px | Tight element gaps |
| md | 16px | Standard padding, button vertical padding |
| lg | 24px | Section internal spacing, button horizontal padding |
| xl | 32px | Between card groups, large button horizontal padding |
| 2xl | 48px | Between major sections |
| 3xl | 64px | Hero/section margins |
| 4xl | 96px | Page-level breathing room |
| 5xl | 128px | Maximum section separation |

**Button padding specifically**: Use `16px 24px` (md/lg) for standard buttons, `16px 32px` (md/xl) for hero CTAs. Never 14px, 11px, or 28px.

---

## Typography

### Scale
| Level | Size | Line Height | Weight | Use |
|-------|------|-------------|--------|-----|
| Hero H1 | 56-72px | 1.05-1.1 | 600-800 | One per page, above fold |
| H1 | 40-48px | 1.1-1.2 | 600-700 | Section headings |
| H2 | 28-36px | 1.2-1.3 | 600 | Subsection headings |
| H3 | 20-24px | 1.3-1.4 | 600 | Card titles, labels |
| Body | 16-18px | 1.5-1.6 | 400 | Paragraphs |
| Small | 14px | 1.4-1.5 | 400 | Captions, metadata |
| Tiny | 12px | 1.3 | 500 | Badges, tags only |

### Rules
- **Max 2 typefaces + 1 monospace**. One display, one body. A monospace font for code snippets/terminal UI is allowed as the sole exception — it does NOT count toward the 2-typeface limit.
- Max line width: 65-75 characters (~600-700px at 16px)
- Never center-align text wider than 600px
- Mobile: scale down 20-30%, never below 14px
- Letter-spacing: -0.02em for large headings, 0 for body, +0.05em for ALL CAPS labels
- **Font sizes must be on the 8px grid**: 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72px. No 13px, 15px, 42px.

### Safe Pairings
- Display: Instrument Serif, Syne, Cabinet Grotesk, Clash Display, Satoshi, Instrument Sans
- Body: DM Sans, Plus Jakarta Sans, General Sans, Geist
- Monospace: JetBrains Mono, Fira Code, IBM Plex Mono
- **Convergence fonts to avoid**: Space Grotesk, Inter (on timid palettes) — overused in AI-generated designs, signals "template" not "designed"

---

## Color System

### Structure
- 1 brand color
- 2-3 neutrals (background, surface, border)
- 1 accent (CTA, links, highlights)
- = 5 colors maximum in base palette

### Dark Mode Specific
| Layer | Hex Range | Use |
|-------|-----------|-----|
| Base | #0A0A0A - #0F0F0F | Page background |
| Surface 1 | #141414 - #1A1A1A | Cards, panels |
| Surface 2 | #1F1F1F - #242424 | Elevated elements |
| Surface 3 | #2A2A2A - #303030 | Hover states |
| Border | #2E2E2E - #383838 | Subtle separators |
| Text primary | #E8E8E8 - #ECECEC | NOT pure white |
| Text secondary | #888888 - #999999 | Supporting text |

- Desaturate brand colors 20-30% for dark backgrounds
- Never use pure #000000 or #FFFFFF
- Elevation = color layers, not box-shadow

### Contrast
- WCAG AA minimum: 4.5:1 for body text, 3:1 for large text
- Check every text/background pair. No exceptions.

---

## White Space

**More is more.** Premium = generous space. If it feels cramped, add 50%.

- Apple.com hero: ~200px top/bottom padding. That's the bar.
- Linear.app cards: 32px internal padding, 24px gaps. Breathes.
- Between major sections: minimum 96px, prefer 128px
- Between heading and content: 24-32px
- Content to CTA: 48px minimum

**Rule**: If you think "maybe that's too much space" — it's probably right.

---

## Hero Sections

Answer 3 questions in 5 seconds:
1. **What is this?** (headline)
2. **Who is it for?** (subhead or social proof)
3. **What do I do next?** (CTA button)

### Structure
- Headline: 48-72px, max 8 words, specific not generic
- Subhead: 18-20px, max 2 lines, explains the mechanism
- CTA: high-contrast button, action verb ("Start building", not "Learn more")
- Optional: visual proof (screenshot, demo, video)
- Vertical rhythm: headline → 24px → subhead → 32px → CTA

### Anti-patterns
- "Welcome to our website" (says nothing)
- CTA below the fold (invisible)
- Auto-playing video with sound (hostile)
- Carousel/slider hero (indecisive)

---

## Gradients Done Right

| Rule | Detail |
|------|--------|
| Colors | 2-3 max, from brand palette |
| Direction | Consistent per section (usually top-left → bottom-right) |
| Saturation | Desaturated 20% from brand in dark mode |
| Usage | ONE gradient element per section maximum |
| Texture | Add grain/noise at 2-5% opacity for depth |
| Never | Purple-to-pink. Neon rainbow. Full-element gradient text (1 word max). |

---

## Shadows & Borders

### Dark mode
- Shadows barely visible — use border + background elevation instead
- `border: 1px solid rgba(255,255,255,0.06)` for subtle containment
- Inner glow: `box-shadow: inset 0 1px 0 rgba(255,255,255,0.03)`

### Light mode
- `box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` (card)
- `box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)` (elevated)
- Never more than 2 shadow layers

---

## Anti-Slop Checklist

Before shipping, verify NONE of these exist:

1. **No purple-to-pink gradients** — the #1 "AI made this" signal
2. **No Inter on timid palettes** — Inter needs BOLD brand colors to not look generic
3. **No >2 fonts** — 3+ fonts = chaos
4. **No <14px text** — 12px is for badges/tags only, never body text
5. **No centered text on wide containers** — center-align max 600px
6. **No stock photos** — use illustrations, 3D renders, or real screenshots
7. **No random spacing** — everything on 8px grid
8. **No poor contrast** — test every text/bg pair
9. **No pure white (#FFF) on dark mode** — use #E8E8E8 max
10. **No icon style mixing** — all filled OR all outlined, one weight, one source

---

## Component Patterns

### Cards
- Border-radius: 12-16px (consistent across all cards)
- Internal padding: 24-32px
- Hover: subtle lift (translateY(-2px)) + border color shift, 200ms ease
- Never: different border-radius on same page

### Buttons
- Primary: brand color, high contrast text, 12-16px horizontal padding, 44px min height
- Secondary: ghost/outline, 1px border, same dimensions
- Border-radius: 8-12px (match card radius or half it)
- Hover: darken 10% or shift shade, 150ms ease
- Disabled: 40% opacity, no pointer events

### Navigation
- Height: 56-64px fixed
- Logo left, links center or right, CTA far right
- Backdrop blur on scroll: `backdrop-filter: blur(12px)` + semi-transparent bg
- Mobile: hamburger at 768px breakpoint
- Active state: underline, color shift, or subtle background — pick ONE

---

## Responsive Strategy

| Breakpoint | Width | Columns | Gutter |
|------------|-------|---------|--------|
| Mobile | < 640px | 1 | 16px |
| Tablet | 640-1024px | 2 | 24px |
| Desktop | 1024-1440px | 3-4 | 32px |
| Wide | > 1440px | max-width container | 32px |

- Max content width: 1200-1440px, always centered
- Images: lazy-load, srcset, aspect-ratio set
- Touch targets: minimum 44x44px on mobile
