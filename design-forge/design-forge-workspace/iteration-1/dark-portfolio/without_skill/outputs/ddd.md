# Design Plan: Mika Chen Portfolio

## Design Direction

Premium, restrained, dark-first. Inspired by Linear's clarity and Vercel's confidence. Every element earns its space. No decoration for decoration's sake.

---

## Color System

| Token            | Value       | Usage                              |
|------------------|-------------|-------------------------------------|
| `bg-primary`     | `#0A0A0A`   | Page background                    |
| `bg-elevated`    | `#141414`   | Card surfaces, hover states        |
| `bg-subtle`      | `#1A1A1A`   | Section alternation, dividers      |
| `border`         | `#222222`   | Subtle borders, separators         |
| `text-primary`   | `#FAFAFA`   | Headlines, primary content         |
| `text-secondary` | `#888888`   | Body text, descriptions            |
| `text-tertiary`  | `#555555`   | Labels, metadata, captions         |
| `accent`         | `#7C6AFF`   | CTAs, links, active states         |
| `accent-hover`   | `#9B8CFF`   | Hover state for accent elements    |
| `accent-subtle`  | `rgba(124,106,255,0.08)` | Accent backgrounds   |

Rationale: The purple accent avoids the overused blue-to-teal SaaS palette. It reads as creative yet professional, appropriate for a product designer.

---

## Typography

| Role            | Font               | Weight | Size  | Line Height | Letter Spacing |
|-----------------|--------------------|--------|-------|-------------|----------------|
| Display         | Inter              | 600    | 64px  | 1.05        | -0.03em        |
| H1              | Inter              | 600    | 48px  | 1.1         | -0.025em       |
| H2              | Inter              | 500    | 32px  | 1.2         | -0.02em        |
| H3              | Inter              | 500    | 20px  | 1.3         | -0.01em        |
| Body            | Inter              | 400    | 16px  | 1.6         | 0              |
| Body Small      | Inter              | 400    | 14px  | 1.5         | 0.005em        |
| Caption         | Inter              | 400    | 12px  | 1.4         | 0.02em         |
| Nav             | Inter              | 500    | 14px  | 1.0         | 0.01em         |
| Mono / Code     | JetBrains Mono     | 400    | 13px  | 1.5         | 0              |

Rationale: Inter is the default for modern product sites. Tight negative letter-spacing on headlines creates the editorial density Linear uses. Single font family keeps load fast and visually cohesive.

---

## Spacing System (8px grid)

| Token   | Value  | Usage                                    |
|---------|--------|------------------------------------------|
| `xs`    | 4px    | Inline gaps, icon padding                |
| `sm`    | 8px    | Tight element gaps                       |
| `md`    | 16px   | Component internal padding               |
| `lg`    | 24px   | Card padding, section element gaps       |
| `xl`    | 32px   | Between content groups                   |
| `2xl`   | 48px   | Between major sections                   |
| `3xl`   | 64px   | Section top/bottom padding               |
| `4xl`   | 96px   | Hero section vertical padding            |
| `5xl`   | 128px  | Page-level vertical breathing room       |

---

## Layout

- **Max content width:** 1120px, centered
- **Grid:** 12-column implicit grid, but content uses narrow measures (max 640px for body text)
- **Page width:** Full viewport, content centered
- **Navbar height:** 64px, fixed top, `bg-primary` with `border-bottom: 1px solid #222222`
- **Mobile breakpoint:** 768px (responsive stacking)

---

## Page Sections (top to bottom)

### 1. Navigation Bar
- Left: "Mika Chen" wordmark in `text-primary`, weight 600, 16px
- Right: "Work", "About", "Contact" links in `text-secondary`, 14px, weight 500
- Full width, 64px tall, border-bottom
- Padding: 0 40px

### 2. Hero Section
- Padding: 128px top, 96px bottom
- Headline: "Designing systems that scale." -- Display size, `text-primary`
- Subheadline: "Product designer specializing in SaaS platforms. I craft interfaces that are clear, systematic, and built to grow." -- Body size, `text-secondary`, max-width 520px
- CTA: "View selected work" -- `accent` color, 14px, weight 500, with right arrow, no button chrome
- Vertical stack, left-aligned within centered container

### 3. Selected Work (Project Grid)
- Section label: "Selected Work" -- Caption size, `text-tertiary`, uppercase, letter-spacing 0.1em
- 2-column grid, 24px gap
- Each card:
  - `bg-elevated` background, 1px `border` border, 12px border-radius
  - Image placeholder: 16:10 aspect ratio, `bg-subtle`
  - Below image: Project title (H3, `text-primary`), description (Body Small, `text-secondary`)
  - Padding: 0 top (image flush), 24px sides and bottom for text
- 4 project cards total:
  1. "Meridian" -- "End-to-end redesign of a B2B analytics dashboard"
  2. "Canopy" -- "Design system for a developer collaboration platform"
  3. "Lumina" -- "Onboarding flow that increased activation by 34%"
  4. "Prism" -- "Mobile-first redesign of a project management tool"

### 4. About Section
- Padding: 96px top/bottom
- Two-column layout: left 40%, right 60%
- Left: Section label "About" (Caption, `text-tertiary`, uppercase)
- Right: 2 paragraphs of body text (`text-secondary`), max-width 520px
  - Para 1: "I'm a product designer with 8 years of experience building SaaS products. I've led design at two venture-backed startups and consulted for companies including Stripe, Notion, and Linear."
  - Para 2: "My approach is systems-first: I design components, patterns, and principles that let teams ship faster without sacrificing coherence. I believe great design disappears into the product."
- Below paragraphs: "Currently available for select projects" in `accent` color

### 5. Contact Section
- Padding: 96px top, 128px bottom
- Centered text
- Headline: "Let's work together" -- H1, `text-primary`
- Email: "hello@mikachen.design" -- H3, `accent` color, underline on hover
- Below: Social links row -- "Twitter", "LinkedIn", "Dribbble" in `text-tertiary`, 14px, spaced 32px apart

### 6. Footer
- Border-top: 1px solid `border`
- Padding: 24px 40px
- Left: "(c) 2026 Mika Chen" in `text-tertiary`, 12px
- Right: "Built with intention" in `text-tertiary`, 12px

---

## Interaction & Motion

- **Hover on nav links:** `text-secondary` to `text-primary`, 150ms ease
- **Hover on project cards:** translate Y -2px, subtle box-shadow `0 8px 32px rgba(0,0,0,0.3)`, 200ms ease
- **Hover on CTA arrow:** translate X +4px, 150ms ease
- **Page load:** Fade-in from opacity 0, translate Y 8px, staggered 50ms per element, 400ms duration

---

## Image Placeholders

Since this is a design system build (no real assets), project card images use solid `bg-subtle` fills with a centered label in `text-tertiary` at Caption size. In production, these become full-bleed project screenshots.
