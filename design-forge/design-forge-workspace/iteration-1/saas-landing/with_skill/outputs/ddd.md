# DDD: DevForge Landing Page

## Brief
- **Site type**: SaaS landing page
- **Aesthetic direction**: Dark, technical, minimal — inspired by Linear and Raycast
- **Audience**: Developers, engineering leads, DevOps teams
- **Tagline**: "Code reviews on autopilot."
- **Sections**: Navigation, Hero with product screenshot, Features grid (3-col), Social proof logos, Pricing table (3 tiers), Footer

---

## Typography

- **Display**: Space Grotesk, weights 600 and 700
- **Body**: DM Sans, weights 400 and 500
- **Monospace** (code snippets, terminal accents): JetBrains Mono, weight 400
- **Scale**:
  - Hero H1: 64px, line-height 1.05, weight 700, letter-spacing -0.02em
  - H1 (section headings): 44px, line-height 1.15, weight 700
  - H2 (subsection/card titles): 24px, line-height 1.3, weight 600
  - H3 (pricing tier names): 20px, line-height 1.3, weight 600
  - Body: 16px, line-height 1.6, weight 400
  - Subhead (hero): 18px, line-height 1.5, weight 400
  - Small: 14px, line-height 1.5, weight 400
  - Tiny (labels, badges): 12px, line-height 1.3, weight 500, letter-spacing +0.05em, uppercase

---

## Color Palette

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#0A0A0A` | Page background |
| Surface 1 | `#141414` | Cards, pricing panels, feature cards |
| Surface 2 | `#1C1C1C` | Elevated elements, nav on scroll |
| Border | `#2A2A2A` | Card borders, dividers |
| Border subtle | `rgba(255,255,255,0.06)` | Card edge highlight |
| Text primary | `#E8E8E8` | Headlines, primary copy |
| Text secondary | `#8A8A8A` | Subheadings, descriptions |
| Text tertiary | `#555555` | Footer minor links, copyright |
| Brand | `#6366F1` | Primary CTA, active states, key accents (indigo — Linear-inspired) |
| Brand hover | `#5558E6` | CTA hover state (brand darkened 10%) |
| Accent | `#22D3EE` | Terminal cursor, code highlights, secondary accent (cyan) |
| Success | `#34D399` | Pricing checkmarks |
| Pricing highlight border | `#6366F1` | Popular tier outline |

---

## Spacing

- **Grid base**: 8px
- **Section vertical padding**: 128px top/bottom (generous, premium feel)
- **Section internal gap** (heading to content): 64px
- **Card internal padding**: 32px
- **Card gap (grid gutter)**: 24px
- **Element gap (text blocks)**: 16px
- **Hero vertical rhythm**: headline -> 24px -> subhead -> 32px -> CTA -> 64px -> screenshot
- **Nav height**: 64px
- **Button padding**: 14px 28px (primary), 10px 20px (nav CTA)
- **Max content width**: 1200px
- **Footer top padding**: 64px, bottom 32px

---

## Layout

- **Max width**: 1200px, centered
- **Columns**: 3 (features grid, pricing table)
- **Border radius**: 16px (cards), 12px (buttons), 8px (small elements, tags)
- **Content alignment**: Center-aligned headings (max 600px width), left-aligned card content
- **Responsive**: 3-col -> 2-col at 1024px -> 1-col at 640px

---

## Sections (ordered)

### 1. Navigation Bar
- Fixed top, 64px height, semi-transparent background with backdrop blur
- Logo "DevForge" left (Space Grotesk, 20px, weight 700, `#E8E8E8`)
- Links center: Features, Pricing, Docs, GitHub (DM Sans, 14px, weight 500, `#8A8A8A`)
- CTA right: "Get Started" button (`#6366F1` bg, 14px, weight 600, `#FFFFFF`)
- Background: `rgba(10,10,10,0.8)`, `backdrop-filter: blur(12px)`

### 2. Hero Section
- Full-width, 800px height, centered content
- Eyebrow tag: "FOR DEVELOPERS" in monospace badge (JetBrains Mono, 12px, `#6366F1`, border `#6366F1` at 30% opacity, 8px radius, padding 6px 12px)
- Headline: "Code reviews on autopilot." (Space Grotesk, 64px, weight 700, `#E8E8E8`)
- Subhead: "DevForge analyzes your PRs, flags issues, suggests fixes, and auto-approves clean code. Ship faster with AI-powered reviews." (DM Sans, 18px, `#8A8A8A`, max-width 580px, center-aligned)
- CTA group: Primary "Start Free" (`#6366F1`, 16px, weight 600), Secondary "View Demo" (ghost, 1px border `#2A2A2A`, `#E8E8E8`)
- Product screenshot placeholder: 960px wide frame, `#141414` bg, border `rgba(255,255,255,0.06)`, 16px radius, subtle gradient glow behind (radial gradient `#6366F1` at 8% opacity)
- Terminal-style code snippet in screenshot area (JetBrains Mono, `#22D3EE` for commands)

### 3. Social Proof / Logo Bar
- Minimal section, 96px vertical padding
- Label: "Trusted by engineering teams at" (DM Sans, 14px, `#555555`, center)
- Row of 6 logo placeholders (grayscale, 40px height, 48px gap, opacity 0.4)
- No background change — stays `#0A0A0A`, separated by visual breathing room

### 4. Features Grid (3 columns)
- Section padding: 128px vertical
- Section heading: "Built for your workflow" (Space Grotesk, 44px, weight 700, `#E8E8E8`, center)
- Section subhead: "DevForge integrates with your existing tools and gets smarter with every review." (DM Sans, 18px, `#8A8A8A`, center, max-width 560px)
- 64px gap between heading group and grid
- 3-column grid, 24px gap
- Each card: `#141414` bg, 16px radius, 32px padding, `1px solid rgba(255,255,255,0.06)` border
  - Icon area: 48px circle, `#1C1C1C` bg (placeholder for outlined icon)
  - Title: Space Grotesk, 24px, weight 600, `#E8E8E8`, margin-top 24px
  - Description: DM Sans, 16px, `#8A8A8A`, margin-top 12px, line-height 1.6
- **Card 1**: "Instant PR Analysis" — "Every pull request scanned in seconds. Catch bugs, security issues, and style violations before they reach main."
- **Card 2**: "Auto-Approve Clean Code" — "When code meets your standards, DevForge approves automatically. No bottlenecks, no waiting."
- **Card 3**: "Smart Suggestions" — "Context-aware fix suggestions that understand your codebase, conventions, and past decisions."
- **Card 4**: "GitHub & GitLab Native" — "First-class integrations with GitHub, GitLab, and Bitbucket. Install in 2 minutes."
- **Card 5**: "Custom Rulesets" — "Define your team's standards in code. DevForge enforces them consistently across every PR."
- **Card 6**: "Review Analytics" — "Track review velocity, catch rates, and team patterns. Data-driven engineering culture."

### 5. Pricing Table (3 tiers)
- Section padding: 128px vertical, `#0A0A0A` bg
- Section heading: "Simple, transparent pricing" (Space Grotesk, 44px, weight 700, `#E8E8E8`, center)
- Section subhead: "Start free. Scale when you're ready." (DM Sans, 18px, `#8A8A8A`, center)
- 64px gap to pricing cards
- 3-column grid, 24px gap, max-width 1080px
- Each card: `#141414` bg, 16px radius, 32px padding, border `rgba(255,255,255,0.06)`
  - Tier name: Space Grotesk, 20px, weight 600, `#E8E8E8`
  - Price: Space Grotesk, 48px, weight 700, `#E8E8E8` + "/mo" at 18px `#8A8A8A`
  - Description: DM Sans, 14px, `#8A8A8A`, margin-top 8px
  - Divider: 1px `#2A2A2A`, margin 24px 0
  - Feature list: DM Sans, 14px, `#8A8A8A`, checkmark `#34D399`, 12px gap between items
  - CTA button: full-width, 44px height, 12px radius

- **Tier 1 — Starter**: $0/mo, "For side projects and solo devs"
  - 1 repository, 50 reviews/month, GitHub only, Community support
  - Button: ghost style, "Get Started Free", border `#2A2A2A`, text `#E8E8E8`

- **Tier 2 — Pro** (highlighted): $29/mo, "For growing teams"
  - Unlimited repos, unlimited reviews, GitHub + GitLab, Custom rulesets, Priority support, Review analytics
  - Border: 2px solid `#6366F1` (highlight), subtle glow `0 0 40px rgba(99,102,241,0.15)`
  - "MOST POPULAR" badge: 12px text, `#6366F1` bg, `#FFFFFF` text, 8px radius, top-right
  - Button: filled `#6366F1`, "Start Pro Trial", text `#FFFFFF`

- **Tier 3 — Enterprise**: "Custom", "For organizations at scale"
  - Everything in Pro, SSO/SAML, Dedicated support, SLA guarantee, Custom integrations, Self-hosted option
  - Button: ghost style, "Contact Sales", border `#2A2A2A`, text `#E8E8E8`

### 6. Footer
- Background: `#0A0A0A`, top border 1px `#1C1C1C`
- Padding: 64px top, 32px bottom
- Grid: 4 columns (2fr 1fr 1fr 1fr), max-width 1200px centered, gap 48px
- **Column 1 — Brand**: "DevForge" logo text, tagline "Code reviews on autopilot." (14px, `#555555`)
- **Column 2 — Product**: Features, Pricing, Docs, Changelog (category label: 12px uppercase `#8A8A8A`, links: 14px `#555555`)
- **Column 3 — Developers**: API Reference, GitHub, Status, CLI Docs
- **Column 4 — Company**: About, Blog, Careers, Contact
- Copyright bar: 1px `#1C1C1C` top border, 32px margin-top, "2026 DevForge. All rights reserved." (14px, `#383838`)
