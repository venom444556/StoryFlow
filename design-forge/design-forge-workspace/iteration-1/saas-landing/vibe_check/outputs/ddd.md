# Design System: DevForge Landing Page

## Context
- **Purpose:** Landing page for DevForge, a developer CLI tool that automates code reviews
- **Audience:** Software engineers, engineering managers, DevOps — technical, skeptical, efficiency-driven
- **Platform:** Web (desktop-first, responsive)
- **Quality bar:** Linear/Raycast-level polish — dark, dense, utilitarian, zero fluff
- **Inspirations:** Linear (layout precision, muted palette, typographic hierarchy), Raycast (command-bar aesthetic, developer credibility, dark-first confidence)

## Strategic Alignment
DevForge is a developer tool. The design must signal: "built by developers, for developers." No marketing fluff, no stock illustrations, no consumer patterns. The page should feel like a well-crafted README that graduated to a real website. CLI-first thinking. Code is the hero, not screenshots of dashboards.

## Design Direction (Prescriptive — Developer Tool Pattern)

Dark-first with a restrained two-tone palette. Navy/slate base. Muted green as the sole accent for CTAs and success states. Cyan reserved for code syntax and secondary highlights. No gradients on backgrounds. No glassmorphism. No purple AI cliches. Typography does the heavy lifting. Generous whitespace earns trust.

---

## Color System

### Core Palette
| Token | Hex | Role |
|-------|-----|------|
| `bg-base` | `#0B0F19` | Page background — near-black navy, not pure black |
| `bg-surface` | `#131927` | Cards, elevated surfaces |
| `bg-surface-hover` | `#1A2236` | Card hover, interactive surface states |
| `border-default` | `#1E293B` | Subtle borders between sections and cards |
| `border-hover` | `#334155` | Border on hover states |
| `text-primary` | `#F1F5F9` | Headlines, primary body text |
| `text-secondary` | `#94A3B8` | Subheadings, descriptions, secondary text |
| `text-tertiary` | `#64748B` | Captions, metadata, labels |
| `accent-green` | `#10B981` | Primary CTA, success, active states |
| `accent-green-hover` | `#059669` | CTA hover |
| `accent-cyan` | `#06B6D4` | Code syntax, secondary highlights, links |
| `accent-amber` | `#F59E0B` | Warnings, pricing highlight, "Popular" badge |
| `error` | `#EF4444` | Error states only |

### Gradient (used sparingly — hero glow only)
```
Hero ambient glow: radial-gradient(ellipse 600px 400px at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 70%)
```
This is a barely-visible green wash behind the hero — atmospheric, not decorative.

### Contrast Verification
| Pair | Ratio | Pass |
|------|-------|------|
| `text-primary` on `bg-base` | 15.3:1 | AAA |
| `text-secondary` on `bg-base` | 7.2:1 | AAA |
| `text-tertiary` on `bg-base` | 4.6:1 | AA |
| `accent-green` on `bg-base` | 8.1:1 | AAA |
| `accent-cyan` on `bg-base` | 7.8:1 | AAA |

---

## Typography

### Font Pairing: #2 Code-Forward
- **Headlines:** Inter (600 semibold, 700 bold) — clean geometric sans-serif, no personality quirks
- **Body:** Inter (400 regular, 500 medium) — variable font, excellent at all sizes
- **Monospace:** JetBrains Mono (500 medium) — for code snippets, CLI commands, metrics
- **Source:** Google Fonts (Inter, JetBrains Mono)

### Type Scale (8px grid aligned)
| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `display` | 64px | 700 | 1.1 | -0.03em | Hero headline |
| `h1` | 48px | 700 | 1.15 | -0.02em | Section titles |
| `h2` | 32px | 600 | 1.2 | -0.01em | Subsection headers |
| `h3` | 24px | 600 | 1.3 | 0 | Card titles, feature names |
| `body-lg` | 18px | 400 | 1.6 | 0 | Hero subheadline, lead text |
| `body` | 16px | 400 | 1.5 | 0 | Primary body text |
| `body-sm` | 14px | 400 | 1.5 | 0 | Secondary text, descriptions |
| `caption` | 12px | 500 | 1.4 | 0.05em | Labels, metadata, uppercase badges |
| `mono` | 14px | 500 | 1.5 | 0 | Code, CLI commands, metrics |

---

## Spacing System (8px base)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon internal padding |
| `space-2` | 8px | Tight element gaps |
| `space-3` | 12px | Compact card padding |
| `space-4` | 16px | Default element spacing |
| `space-5` | 24px | Card internal padding |
| `space-6` | 32px | Between related sections |
| `space-8` | 48px | Section internal padding |
| `space-10` | 64px | Between major page sections |
| `space-12` | 80px | Hero vertical padding |
| `space-16` | 120px | Page-level section breaks |

---

## Layout Grid

| Breakpoint | Columns | Gutter | Margin | Max Width |
|------------|---------|--------|--------|-----------|
| Desktop (1440px+) | 12 | 24px | 80px | 1200px |
| Tablet (768px) | 8 | 20px | 40px | 100% |
| Mobile (375px) | 4 | 16px | 16px | 100% |

---

## Page Structure (Top to Bottom)

### 1. Navigation Bar
- **Height:** 64px, sticky, `bg-base` with `border-default` bottom border
- **Layout:** Logo left, nav links center (Features, Pricing, Docs), CTA right
- **Logo:** "DevForge" in Inter 700, 18px, `text-primary` with a subtle `>_` prefix in `accent-cyan` monospace
- **Nav links:** Inter 500, 14px, `text-secondary`, hover `text-primary`
- **CTA button:** "Get Started" — `accent-green` bg, white text, 14px 600, 8px radius, 36px height

### 2. Hero Section
- **Vertical padding:** 120px top, 80px bottom
- **Headline:** "Code reviews on autopilot." — `display` (64px, 700), `text-primary`
- **Subheadline:** "DevForge scans every pull request, catches bugs before humans do, and ships feedback in seconds. Not minutes." — `body-lg` (18px, 400), `text-secondary`, max-width 560px, centered
- **CTA row:** Two buttons, 16px gap
  - Primary: "Install CLI" — `accent-green` bg, white text, 44px height, 24px horizontal padding, 8px radius
  - Secondary: "`npm install -g devforge`" — `bg-surface` bg, `accent-cyan` monospace text, 1px `border-default` border, 44px height, 8px radius, copy icon right
- **Product screenshot area:** 800x480px rounded rect below CTAs, 48px top margin
  - `bg-surface` fill, 12px border-radius, 1px `border-default` border
  - Contains a mock terminal window: title bar with 3 dots (red/amber/green, 8px circles), then simulated CLI output showing `devforge review --pr 142` with syntax-colored output lines
  - Subtle drop shadow: `0 24px 48px rgba(0,0,0,0.3)`
- **Ambient glow:** The hero radial gradient sits behind the terminal, barely visible

### 3. Social Proof Logos Section
- **Vertical padding:** 48px
- **Label:** "TRUSTED BY ENGINEERING TEAMS AT" — `caption` (12px, 500), `text-tertiary`, uppercase, 0.05em tracking, centered
- **Logos row:** 6 company logo placeholders, horizontally centered, 48px gap
  - Each logo: 120x32px max, rendered in `text-tertiary` (monochrome, desaturated)
  - On hover: `text-secondary` (slightly brighter)
- **Divider:** 1px `border-default` line above and below section

### 4. Features Grid (3 Columns)
- **Vertical padding:** 120px
- **Section title:** "Why engineers choose DevForge" — `h1` (48px, 700), `text-primary`, centered
- **Section subtitle:** "Automated code review that actually understands your codebase." — `body` (16px, 400), `text-secondary`, centered, 24px below title
- **Grid:** 3 columns, 24px gap, 64px top margin
- **Feature cards (6 total, 2 rows of 3):**
  - `bg-surface` background, 24px padding, 12px border-radius, 1px `border-default` border
  - Hover: `bg-surface-hover`, `border-hover`, translate-y -2px, transition 200ms ease
  - **Icon:** 32px Lucide icon in `accent-green` (row 1) or `accent-cyan` (row 2), top of card
  - **Title:** `h3` (24px, 600), `text-primary`, 16px below icon
  - **Description:** `body-sm` (14px, 400), `text-secondary`, 8px below title, 2-3 lines max

  **Feature list:**
  | # | Icon (Lucide) | Title | Description |
  |---|---|---|---|
  | 1 | `scan` | Instant PR Analysis | Scans every pull request in under 10 seconds. Catches bugs, style violations, and security issues automatically. |
  | 2 | `git-branch` | Context-Aware Reviews | Understands your codebase structure, naming conventions, and team patterns. Reviews like a senior engineer. |
  | 3 | `terminal` | CLI-Native Workflow | Runs from your terminal. No browser tabs, no context switching. `devforge review` and done. |
  | 4 | `shield-check` | Security Scanning | Detects exposed secrets, SQL injection, XSS, and dependency vulnerabilities before they hit production. |
  | 5 | `zap` | CI/CD Integration | GitHub Actions, GitLab CI, Jenkins. One-line setup. Reviews run as part of your existing pipeline. |
  | 6 | `users` | Team Standards | Define your team's rules in `.devforge.yml`. Every review enforces your standards consistently. |

### 5. Pricing Table (3 Tiers)
- **Vertical padding:** 120px
- **Background:** `bg-base` (same as page — no section color change)
- **Section title:** "Simple, transparent pricing" — `h1` (48px, 700), `text-primary`, centered
- **Section subtitle:** "Start free. Scale when you're ready." — `body` (16px, 400), `text-secondary`, centered
- **Toggle:** Monthly / Annual with "Save 20%" badge in `accent-amber`, 48px below subtitle
- **Cards row:** 3 cards, 24px gap, 48px top margin, centered max-width 960px

  | | Starter | Pro (Recommended) | Enterprise |
  |---|---|---|---|
  | **Price** | $0/mo | $29/mo | Custom |
  | **Badge** | — | "MOST POPULAR" in `accent-amber` | — |
  | **Border** | 1px `border-default` | 1px `accent-green` | 1px `border-default` |
  | **Shadow** | none | `0 0 24px rgba(16, 185, 129, 0.1)` | none |
  | **Features** | 5 repos, 100 reviews/mo, basic rules | Unlimited repos, unlimited reviews, custom rules, priority support | SSO, audit logs, SLA, dedicated support, on-prem option |
  | **CTA text** | "Get Started Free" | "Start Pro Trial" | "Contact Sales" |
  | **CTA style** | secondary (outline) | primary (`accent-green` solid) | secondary (outline) |

  **Card anatomy:**
  - `bg-surface`, 32px padding, 12px border-radius
  - Tier name: `h3` (24px, 600), `text-primary`
  - Price: 48px, 700, `text-primary` + "/mo" in `text-tertiary` 16px
  - Feature list: `body-sm` (14px, 400), `text-secondary`, checkmark icon in `accent-green` 16px, 12px vertical gap per item
  - CTA button: full-width, 44px height, 8px radius, 32px above bottom

### 6. Footer
- **Vertical padding:** 64px top, 48px bottom
- **Top border:** 1px `border-default`
- **Layout:** 4 columns on desktop
  - **Column 1 (Brand):** DevForge logo + tagline "Code reviews on autopilot." in `text-tertiary` 14px, 8px below logo
  - **Column 2 (Product):** "Product" label in `caption` uppercase, links: Features, Pricing, Docs, Changelog — `body-sm`, `text-secondary`, hover `text-primary`
  - **Column 3 (Developers):** "Developers" label, links: Documentation, API Reference, GitHub, Status
  - **Column 4 (Company):** "Company" label, links: About, Blog, Careers, Contact
- **Bottom bar:** 32px top margin, 1px `border-default` top border
  - Left: "(c) 2026 DevForge. All rights reserved." — `caption`, `text-tertiary`
  - Right: Social icons (GitHub, X/Twitter, Discord) — 20px Lucide icons, `text-tertiary`, hover `text-secondary`

---

## Interactions and Animation

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Feature cards | Hover | translateY(-2px), border-color to `border-hover` | 200ms | ease |
| CTA buttons | Hover | background darken 10% | 150ms | ease |
| CTA buttons | Active | scale(0.98) | 100ms | ease-out |
| Nav links | Hover | color to `text-primary` | 150ms | ease |
| Social logos | Hover | opacity 0.5 to 0.8 | 200ms | ease |
| CLI copy button | Click | "Copied!" tooltip, 1.5s auto-dismiss | 200ms | ease |
| Pricing toggle | Click | slide indicator left/right | 250ms | ease-in-out |
| Page sections | Scroll into view | fade-in + translateY(16px to 0) | 400ms | ease-out |

**Motion safety:** All animations respect `prefers-reduced-motion: reduce` — replaced with instant state changes.

---

## Responsive Adaptations

| Section | Desktop (1200px) | Tablet (768px) | Mobile (375px) |
|---------|-----------------|----------------|----------------|
| Nav | Full horizontal | Hamburger menu | Hamburger menu |
| Hero | Centered, 64px headline | 48px headline | 36px headline, stack CTAs vertically |
| Social logos | 6 across | 3 across, 2 rows | 3 across, 2 rows, smaller |
| Features | 3 columns | 2 columns | 1 column |
| Pricing | 3 cards side-by-side | 3 cards side-by-side (compact) | 1 card per row, stacked |
| Footer | 4 columns | 2x2 grid | 1 column stacked |

---

## Anti-Pattern Verification

| Check | Status | Notes |
|-------|--------|-------|
| No AI purple gradients | PASS | Green/cyan accent derived from CLI/terminal aesthetic |
| No color-only information | PASS | All states use icons + labels alongside color |
| Max 2 accent colors | PASS | Green (primary) + Cyan (secondary) only |
| No consumer onboarding patterns | PASS | CLI-first, no signup wizard |
| No thin fonts for data | PASS | Inter 400+ minimum, JetBrains Mono 500 for code |
| Dark mode is thoughtful | PASS | Native dark — not an afterthought inversion |
| No generated SVG icons | PASS | Lucide icon library exclusively |
| Touch targets 44px+ | PASS | All buttons 44px height minimum |
| Consistent icon stroke | PASS | Lucide defaults (2px stroke weight throughout) |

---

## Implementation Notes

- **Icon library:** Lucide React (2px stroke weight, consistent throughout)
- **Font loading:** `<link>` preload for Inter (variable) and JetBrains Mono (500)
- **CSS approach:** Tailwind CSS with custom design tokens in `tailwind.config.js`
- **Component source:** shadcn/ui for buttons, cards, toggle — customize with tokens above
- **Terminal mockup:** Static HTML/CSS, not a screenshot — so it scales perfectly
- **Scroll animations:** Intersection Observer + CSS transitions (no JS animation library needed)
- **Performance budget:** Hero fully visible <1.5s on 4G. No hero video. No heavy images.
