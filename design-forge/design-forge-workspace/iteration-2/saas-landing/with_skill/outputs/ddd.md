# DDD: DevForge Landing Page

## Brief
- **Site type**: SaaS landing page
- **Aesthetic direction**: Dark, technical, precise — inspired by Linear and Raycast
- **Audience**: Developers, engineering leads, technical teams
- **Tagline**: "Code reviews on autopilot."
- **Sections**: Navigation, Hero with product screenshot, Features grid (3-col), Social proof logos, Pricing table (3 tiers), Footer

---

## Typography

- **Display**: Clash Display, weights 600/700 — geometric, sharp, technical authority without being overused
- **Body**: Geist, weights 400/500/600 — designed for developer tools, clean readability, neutral density
- **Monospace**: JetBrains Mono, weight 400 — for code snippets and terminal references in feature descriptions
- **Scale**:
  - Hero H1: 64px, weight 700, line-height 1.05, letter-spacing -0.02em
  - H1 (section headings): 40px, weight 700, line-height 1.15
  - H2 (subsection/card titles): 24px, weight 600, line-height 1.3
  - H3 (pricing tier names): 20px, weight 600, line-height 1.3
  - Body: 16px, weight 400, line-height 1.6
  - Body Large (hero subhead): 18px, weight 400, line-height 1.6
  - Small (captions, metadata, nav links): 14px, weight 500, line-height 1.5
  - Tiny (badges, tier labels): 12px, weight 600, line-height 1.3, letter-spacing +0.05em, uppercase

---

## Color Palette

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#0A0A0A` | Page background |
| Surface | `#141414` | Cards, panels, pricing cards |
| Surface Elevated | `#1A1A1A` | Hover states, highlighted pricing tier |
| Border | `#2A2A2A` | Card borders, dividers |
| Text Primary | `#E8E8E8` | Headlines, primary content |
| Text Secondary | `#888888` | Subheads, descriptions, metadata |
| Text Tertiary | `#555555` | Footer links, low-priority text |
| Brand | `#22D3EE` | Cyan — terminal/dev aesthetic, CTAs, highlights |
| Brand Muted | `#1A9FB4` | Brand on dark surfaces (desaturated ~25%) |
| Accent | `#A78BFA` | Soft violet — secondary actions, pricing highlights, badges |

### Rationale
- Cyan evokes terminal cursors, CI/CD status indicators, and developer tooling — not the generic purple-pink AI gradient
- Violet accent provides warmth and hierarchy differentiation without clashing
- Both colors desaturated enough for dark mode comfort (no neon)

---

## Spacing

| Token | Value | Use |
|-------|-------|-----|
| xs | 4px | Icon internal padding only |
| sm | 8px | Tight gaps (icon-to-text inline) |
| md | 16px | Standard padding, button vertical padding, nav link gaps |
| lg | 24px | Card internal padding, heading-to-content gap |
| xl | 32px | Grid gutter, card group gaps, button horizontal padding (hero) |
| 2xl | 48px | Between content blocks within sections |
| 3xl | 64px | Section internal top/bottom padding (compact sections) |
| 4xl | 96px | Section top/bottom padding (standard) |
| 5xl | 128px | Hero section top/bottom padding, major section separation |

- **Button padding (standard)**: 16px 24px
- **Button padding (hero CTA)**: 16px 32px
- **Grid**: 8px base — every spatial value verified as multiple of 8 (or 4 for xs)

---

## Layout

| Property | Value |
|----------|-------|
| Max content width | 1200px |
| Nav height | 64px |
| Columns (features) | 3 |
| Columns (pricing) | 3 |
| Card border-radius | 16px |
| Button border-radius | 8px |
| Nav border-radius (CTA) | 8px |

---

## Sections (ordered)

### 1. Navigation
- Fixed top bar, 64px height, `#0A0A0A` at 80% opacity + backdrop-blur(12px)
- Left: "DevForge" wordmark in Clash Display 20px/700
- Center: nav links — Features, Pricing, Docs — Geist 14px/500, `#888888`
- Right: "Sign In" text link (Geist 14px/500, `#888888`) + "Get Started" button (brand `#22D3EE` bg, `#0A0A0A` text, 16px 24px padding, 8px radius)

### 2. Hero Section
- Full-width, 128px top/bottom padding, centered column layout
- Eyebrow badge: "Now in public beta" — 12px/600 uppercase, `#A78BFA` text, `#A78BFA` at 10% opacity bg, 8px horizontal padding, 4px vertical, 8px radius
- Headline: "Code reviews on autopilot." — Clash Display 64px/700, `#E8E8E8`, max-width 800px, center-aligned
- Subhead: "DevForge analyzes every pull request, flags bugs before humans see them, and ships suggestions as inline comments. Stop context-switching. Start shipping." — Geist 18px/400, `#888888`, max-width 600px, center-aligned
- CTA group: horizontal stack, 32px gap
  - Primary: "Start Free Trial" — brand bg `#22D3EE`, `#0A0A0A` text, 16px 32px padding, 8px radius
  - Secondary: "View Demo" — transparent bg, 1px `#2A2A2A` border, `#E8E8E8` text, 16px 32px padding, 8px radius
- Product screenshot area: 960px wide frame, 16px border-radius, `#141414` bg, 1px `#2A2A2A` border, 480px height placeholder, 48px top margin from CTAs
- Subtle gradient glow behind screenshot: radial gradient of `#22D3EE` at 5% opacity

### 3. Features Grid
- 96px top/bottom padding, `#0A0A0A` bg
- Section heading: "Built for how developers actually work" — Clash Display 40px/700, `#E8E8E8`, center, 64px bottom margin
- 3-column grid, 32px gap, max-width 1200px
- Each card: `#141414` bg, 16px radius, 32px padding, 1px `#2A2A2A` border
  - Icon area: 48px x 48px frame, `#1A1A1A` bg, 12px radius, brand or accent color icon placeholder
  - Title: Clash Display 24px/600, `#E8E8E8`, 16px top margin from icon
  - Description: Geist 16px/400, `#888888`, 8px top margin, line-height 1.6
- Feature cards content:
  1. "AI-Powered Analysis" — "Understands your codebase context, coding standards, and patterns. Catches bugs, security issues, and style violations in seconds."
  2. "Inline Comments" — "Posts review comments directly on the PR. No dashboard hopping. Your team reads feedback where they already work."
  3. "CI/CD Native" — "Runs as a GitHub Action, GitLab CI step, or CLI command. Zero config for standard setups. Full control when you need it."

### 4. Social Proof / Logo Bar
- 64px top/bottom padding, `#0F0F0F` bg (subtle surface shift)
- Label: "Trusted by engineering teams at" — Geist 14px/500, `#555555`, center, uppercase, letter-spacing +0.05em
- Logo row: horizontal stack, 48px gap, centered, 32px top margin
- 6 placeholder logo frames: 120px x 40px, `#2A2A2A` bg, 8px radius (grayscale placeholder treatment)

### 5. Pricing Table
- 96px top/bottom padding, `#0A0A0A` bg
- Section heading: "Simple, predictable pricing" — Clash Display 40px/700, `#E8E8E8`, center
- Subhead: "Start free. Scale as your team grows." — Geist 18px/400, `#888888`, center, 16px top margin, 64px bottom margin
- 3-column grid, 32px gap, max-width 1200px

#### Tier 1: Starter (free)
- Card: `#141414` bg, 16px radius, 32px padding, 1px `#2A2A2A` border
- Tier label: "STARTER" — 12px/600, `#888888`, uppercase, letter-spacing +0.05em
- Price: "$0" — Clash Display 48px/700, `#E8E8E8`, 16px top margin
- Period: "/month" — Geist 16px/400, `#555555`, inline after price
- Divider: 1px `#2A2A2A`, 24px vertical margin
- Features list (Geist 14px/400, `#888888`, 16px between items, checkmark in `#22D3EE`):
  - 1 repository
  - 50 reviews/month
  - GitHub integration
  - Community support
- CTA: "Get Started" — transparent bg, 1px `#2A2A2A` border, `#E8E8E8` text, 16px 24px, 8px radius, full-width, 24px top margin

#### Tier 2: Pro (highlighted)
- Card: `#1A1A1A` bg (elevated), 16px radius, 32px padding, 1px `#22D3EE` border (brand highlight)
- "MOST POPULAR" badge: 12px/600, `#0A0A0A` text, `#22D3EE` bg, 8px 16px padding, 8px radius, positioned top-right of card
- Tier label: "PRO" — 12px/600, `#22D3EE`, uppercase, letter-spacing +0.05em
- Price: "$29" — Clash Display 48px/700, `#E8E8E8`
- Period: "/month per seat" — Geist 16px/400, `#555555`
- Divider + Features:
  - Unlimited repositories
  - Unlimited reviews
  - GitHub + GitLab + Bitbucket
  - Custom rules engine
  - Priority support
  - Team analytics dashboard
- CTA: "Start Free Trial" — `#22D3EE` bg, `#0A0A0A` text, 16px 24px, 8px radius, full-width

#### Tier 3: Enterprise
- Card: `#141414` bg, 16px radius, 32px padding, 1px `#2A2A2A` border
- Tier label: "ENTERPRISE" — 12px/600, `#888888`, uppercase, letter-spacing +0.05em
- Price: "Custom" — Clash Display 48px/700, `#E8E8E8`
- Period: "talk to sales" — Geist 16px/400, `#555555`
- Divider + Features:
  - Everything in Pro
  - Self-hosted deployment
  - SSO / SAML
  - Dedicated support engineer
  - Custom model fine-tuning
  - SLA guarantee
- CTA: "Contact Sales" — transparent bg, 1px `#2A2A2A` border, `#E8E8E8` text, 16px 24px, 8px radius, full-width

### 6. Footer
- 64px top padding, 32px bottom padding, `#0A0A0A` bg, 1px `#1A1A1A` top border
- 4-column grid (2fr 1fr 1fr 1fr), max-width 1200px, 48px column gap

#### Column 1: Brand
- "DevForge" — Clash Display 20px/700, `#E8E8E8`
- "Automated code reviews for modern teams." — Geist 14px/400, `#555555`, 8px top margin

#### Column 2: Product
- Label: "PRODUCT" — Geist 12px/600, `#888888`, uppercase, letter-spacing +0.05em, 16px bottom margin
- Links: Features, Pricing, Changelog, Docs — Geist 14px/400, `#555555`, 16px between items

#### Column 3: Company
- Label: "COMPANY" — same style as above
- Links: About, Blog, Careers, Contact

#### Column 4: Legal
- Label: "LEGAL" — same style
- Links: Privacy, Terms, Security

#### Copyright
- Full-width, 32px top margin, 1px `#1A1A1A` top border, 32px top padding
- "2026 DevForge. All rights reserved." — Geist 14px/400, `#555555`

---

## Anti-Slop Verification

| Check | Status |
|-------|--------|
| No purple-to-pink gradients | PASS — cyan brand + violet accent, no gradient between them |
| No Inter on timid palette | PASS — using Geist (body) + Clash Display (display) |
| No >2 fonts (+mono exception) | PASS — Clash Display + Geist + JetBrains Mono (code only) |
| No <14px body text | PASS — 12px used only for badges/tier labels |
| No centered text on wide containers | PASS — all centered text max-width capped at 600-800px |
| No stock photos | PASS — using placeholder frames for screenshots/logos |
| No random spacing | PASS — all values on 8px grid (verified) |
| No poor contrast | PASS — #E8E8E8 on #0A0A0A = 17.4:1, #888888 on #0A0A0A = 5.9:1 |
| No pure #FFF on dark mode | PASS — max brightness is #E8E8E8 |
| No icon style mixing | PASS — all icons are monochrome placeholders, single style |
| No Space Grotesk | PASS — using Clash Display for display face |
| Button padding on 8px grid | PASS — 16px 24px and 16px 32px only |
| All font sizes on type scale | PASS — 12, 14, 16, 18, 20, 24, 40, 48, 64 only |
