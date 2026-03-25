# DDD: Mika Chen Portfolio

## Brief
Dark minimal portfolio for product designer Mika Chen, specializing in SaaS product design. Aesthetic inspired by Linear and Vercel — premium, restrained, typographically driven. No decoration for decoration's sake. Every element earns its space.

---

## Typography

- Display: **Space Grotesk**, weights 500, 600, 700
- Body: **DM Sans**, weights 400, 500
- Scale:
  - Hero H1: 64px / line-height 1.05 / weight 600 / letter-spacing -0.03em
  - H1 (section): 44px / line-height 1.1 / weight 600 / letter-spacing -0.02em
  - H2 (subsection): 28px / line-height 1.25 / weight 600 / letter-spacing -0.01em
  - H3 (card title): 20px / line-height 1.3 / weight 600
  - Body: 17px / line-height 1.6 / weight 400
  - Small: 14px / line-height 1.5 / weight 400
  - Label (uppercase): 12px / line-height 1.3 / weight 500 / letter-spacing 0.08em / uppercase

## Color Palette

| Token            | Hex       | Use                                      |
|------------------|-----------|------------------------------------------|
| Background       | `#0A0A0A` | Page background                          |
| Surface 1        | `#111111` | Card backgrounds, nav backdrop           |
| Surface 2        | `#1A1A1A` | Elevated cards, hover states             |
| Border           | `#1E1E1E` | Subtle separators, card borders          |
| Border hover     | `#2A2A2A` | Interactive border on hover              |
| Text primary     | `#E8E8E8` | Headlines, primary body text             |
| Text secondary   | `#8A8A8A` | Descriptions, captions, metadata         |
| Text tertiary    | `#555555` | Timestamps, copyright, least-emphasis    |
| Brand            | `#C8FF00` | Accent highlight — sharp chartreuse-lime |
| Brand muted      | `#A8D600` | Brand at reduced intensity for tags      |

### Why chartreuse?
Linear uses violet. Vercel uses white-on-black. To avoid mimicry while preserving premium feel, a desaturated chartreuse (#C8FF00) provides sharp, energetic contrast against near-black without falling into purple-pink AI-slop territory. It reads as intentional and distinctive.

## Spacing

| Token     | Value  | Use                                    |
|-----------|--------|----------------------------------------|
| xs        | 4px    | Icon padding                           |
| sm        | 8px    | Tight element gaps                     |
| md        | 16px   | Standard padding, inline gaps          |
| lg        | 24px   | Heading-to-body, internal card spacing |
| xl        | 32px   | Between card groups, nav padding       |
| 2xl       | 48px   | CTA spacing, inter-group breathing     |
| 3xl       | 64px   | Card internal padding on hero cards    |
| 4xl       | 96px   | Between major page sections            |
| 5xl       | 128px  | Hero vertical padding, section breaks  |

## Layout

- Max content width: 1200px
- Columns: 2 (projects grid), 1 (hero, about, contact)
- Border radius: 12px (cards), 8px (buttons, tags)
- Grid gap: 24px (project grid)
- Page horizontal padding: 32px (desktop), 16px (mobile)
- Nav height: 64px

## Sections (ordered)

1. **Navigation** — Minimal fixed bar. "Mika Chen" left (Space Grotesk 18px/600, #E8E8E8). Links right: Work, About, Contact (DM Sans 14px/500, #8A8A8A). No background until scroll, then rgba(10,10,10,0.85) + blur(12px). No CTA button — portfolio, not SaaS.

2. **Hero** — Full viewport height minus nav. Center-aligned vertical stack. Label: "PRODUCT DESIGNER" (12px uppercase, #C8FF00, letter-spacing 0.08em). Headline: "I design SaaS products that people actually enjoy using" (64px, Space Grotesk 600, #E8E8E8, max-width 800px). Subhead: "Currently crafting interfaces at the intersection of clarity and delight. Previously at Linear, Vercel, and Stripe." (17px, DM Sans 400, #8A8A8A, max-width 560px). Vertical rhythm: label -> 24px -> headline -> 24px -> subhead. Padding: 128px top, 128px bottom.

3. **Selected Work** — Section label: "SELECTED WORK" (12px uppercase, #8A8A8A, letter-spacing 0.08em). 2-column grid of project cards. Each card: Surface 1 background (#111111), border 1px solid #1E1E1E, border-radius 12px. Image area: 100% width, aspect-ratio 16/10, #1A1A1A placeholder. Below image: 32px padding. Project title (20px, Space Grotesk 600, #E8E8E8). Description (14px, DM Sans 400, #8A8A8A). Tags row: pill badges (background #1A1A1A, border 1px solid #1E1E1E, border-radius 8px, padding 4px 12px, DM Sans 12px/500 #8A8A8A). Hover: border shifts to #2A2A2A, translateY(-2px), transition 200ms ease. Section padding: 96px vertical. 4 projects total.

4. **About** — Two-column layout: left 40% image placeholder (rounded 12px, #1A1A1A, aspect-ratio 3/4), right 60% text. Label: "ABOUT" (12px uppercase, #8A8A8A). Heading: "Designing with intention" (44px, Space Grotesk 600, #E8E8E8). Body paragraph (17px, DM Sans 400, #8A8A8A, max-width 520px). Second paragraph same styling. Gap between columns: 64px. Section padding: 96px vertical.

5. **Contact / CTA** — Center-aligned. Label: "GET IN TOUCH" (12px uppercase, #C8FF00). Headline: "Let's build something great" (44px, Space Grotesk 600, #E8E8E8). Subhead (17px, DM Sans 400, #8A8A8A). Email link styled as text: "hello@mikachen.design" (20px, Space Grotesk 500, #C8FF00, underline on hover). Section padding: 128px vertical. Border-top: 1px solid #1E1E1E.

6. **Footer** — Minimal single row. Left: "2026 Mika Chen" (14px, DM Sans 400, #555555). Right: social links "Twitter, Dribbble, LinkedIn" (14px, DM Sans 400, #8A8A8A). Border-top: 1px solid #1E1E1E. Padding: 32px vertical.
