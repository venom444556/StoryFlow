# DevForge Landing Page -- Design Document

## Concept Direction

**Tone:** Industrial precision meets terminal aesthetics. Inspired by Linear's surgical minimalism and Raycast's keyboard-first density. The page should feel like a well-configured IDE -- dark, crisp, information-dense, zero waste.

**Differentiation:** The hero section features a live terminal animation aesthetic -- the product screenshot area is framed as a terminal window with a blinking cursor and syntax-highlighted code review output. This isn't another gradient-blob SaaS page; it's a page that looks like it was built by the tool it sells.

**Audience:** Senior developers, team leads, DevOps engineers. They distrust marketing fluff. Every element earns its pixel.

---

## Color Palette

| Token              | Value       | Usage                                      |
|--------------------|-------------|---------------------------------------------|
| `--bg-primary`     | `#0A0A0B`   | Page background, true dark                  |
| `--bg-secondary`   | `#111113`   | Card backgrounds, sections                  |
| `--bg-tertiary`    | `#1A1A1E`   | Elevated surfaces, terminal chrome          |
| `--border-subtle`  | `#2A2A30`   | Card borders, dividers                      |
| `--border-active`  | `#3A3A44`   | Hover states, active borders                |
| `--text-primary`   | `#EDEDEF`   | Headings, primary content                   |
| `--text-secondary` | `#8B8B96`   | Body text, descriptions                     |
| `--text-tertiary`  | `#5C5C66`   | Muted labels, footnotes                     |
| `--accent-primary` | `#6366F1`   | Indigo -- CTA buttons, active states        |
| `--accent-hover`   | `#818CF8`   | Indigo light -- hover states                |
| `--accent-green`   | `#22C55E`   | Terminal cursor, success indicators         |
| `--accent-amber`   | `#F59E0B`   | Warning accents, badge highlights           |
| `--accent-red`     | `#EF4444`   | Terminal close dot, error states             |

## Typography

| Role             | Font                  | Weight | Size   | Letter-spacing |
|------------------|-----------------------|--------|--------|----------------|
| Display heading  | **Instrument Sans**   | 700    | 64px   | -0.03em        |
| Section heading  | **Instrument Sans**   | 600    | 36px   | -0.02em        |
| Subheading       | **Instrument Sans**   | 500    | 20px   | -0.01em        |
| Body             | **Geist**             | 400    | 16px   | 0              |
| Code / terminal  | **JetBrains Mono**    | 400    | 14px   | 0              |
| Button           | **Geist**             | 500    | 15px   | 0.01em         |
| Nav link         | **Geist**             | 500    | 14px   | 0.02em         |
| Badge / label    | **Geist**             | 600    | 12px   | 0.06em         |

Instrument Sans provides geometric sharpness without the overuse of Inter/Space Grotesk. Geist (from Vercel) is native to the developer ecosystem. JetBrains Mono is the gold standard for code display.

## Spacing System

Base unit: 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120, 160.

| Context                  | Value   |
|--------------------------|---------|
| Page horizontal padding  | 80px    |
| Section vertical padding | 120px   |
| Card internal padding    | 32px    |
| Grid gap (features)      | 24px    |
| Element micro-gap        | 8-12px  |
| Max content width        | 1200px  |

## Layout Structure (Top to Bottom)

### 1. Navigation Bar (fixed, 64px height)
- Left: DevForge wordmark (Instrument Sans 700, 18px) + "CLI" badge (accent-green bg, 10px mono text)
- Center-right: nav links -- Docs, Pricing, Blog, Changelog
- Right: "Get Started" button (accent-primary bg, 36px height, 8px radius)
- Background: `bg-primary` with 80% opacity + backdrop-blur(12px)
- Border-bottom: 1px `border-subtle`

### 2. Hero Section (viewport height minus nav)
- Top badge: "Now in public beta" pill (border-subtle border, text-secondary, 12px uppercase)
- Headline: "Code reviews on autopilot." (64px, text-primary, max-width 720px, centered)
- Subheadline: "DevForge analyzes every pull request, catches bugs before humans do, and ships feedback in seconds. Not minutes." (18px, text-secondary, max-width 560px, centered)
- CTA row: [Install CLI] primary button + [View docs] ghost button
- Install snippet: `npm install -g devforge` in a terminal-styled inline block (bg-tertiary, mono font, copy icon)
- Product screenshot area: 960x540 container, bg-tertiary, 12px radius, 1px border-subtle, terminal chrome header (3 dots: red/amber/green, 8px circles). Interior shows a stylized code diff with green/red lines and a "DevForge" comment annotation.
- Faint radial gradient glow behind the screenshot (accent-primary at 6% opacity, 600px radius)

### 3. Social Proof Logos (80px vertical padding)
- Muted text: "Trusted by engineering teams at" (text-tertiary, 13px, uppercase, 0.1em tracking)
- Logo row: 6 placeholder logo rectangles (120x32, text-tertiary opacity, evenly spaced with flex justify-between)
- Divider: 1px border-subtle, 64px max-width centered, below logos

### 4. Features Grid (3 columns, 24px gap)
- Section label: "FEATURES" (accent-primary, 12px, uppercase, 0.1em tracking)
- Section heading: "Everything your PR workflow needs." (36px, text-primary)
- 6 feature cards (2 rows x 3 cols):
  - Each card: bg-secondary, 1px border-subtle, 24px padding, 12px radius
  - Icon: 40x40 container, bg-tertiary with accent-primary icon silhouette
  - Title: 18px Instrument Sans 600, text-primary, 12px below icon
  - Description: 15px Geist, text-secondary, 8px below title
  - Hover: border transitions to border-active, subtle translate-y(-2px)
- Feature list:
  1. Instant PR Analysis -- "Scans diffs in <3 seconds. Catches type errors, logic bugs, and style violations."
  2. Smart Comments -- "Context-aware feedback posted inline. No more vague 'looks good to me'."
  3. CI/CD Integration -- "Plugs into GitHub Actions, GitLab CI, and Buildkite. Zero config."
  4. Team Rules Engine -- "Define custom rules in `.devforge.yml`. Enforce conventions automatically."
  5. Security Scanning -- "Flags credential leaks, SQL injection patterns, and dependency vulnerabilities."
  6. Metrics Dashboard -- "Track review velocity, catch rates, and team bottlenecks over time."

### 5. Pricing Table (3 tiers, side by side)
- Section label: "PRICING" (accent-primary, 12px, uppercase)
- Section heading: "Ship faster at any scale." (36px, text-primary)
- 3 cards, equal width, 24px gap:

**Starter (Free)**
- bg-secondary, border-subtle
- Price: "$0" (48px Instrument Sans 700) + "/month" (text-secondary)
- Features: 50 reviews/mo, 1 repo, GitHub integration, Community support
- CTA: "Get Started" ghost button

**Pro ($29/mo) -- POPULAR**
- bg-secondary, border accent-primary (2px), badge "MOST POPULAR" (accent-primary bg, white text, top-right)
- Price: "$29" (48px) + "/month" (text-secondary)
- Features: Unlimited reviews, Unlimited repos, All integrations, Custom rules, Priority support
- CTA: "Start Free Trial" primary button (accent-primary bg)

**Enterprise (Custom)**
- bg-secondary, border-subtle
- Price: "Custom" (48px) + "per seat/month" (text-secondary)
- Features: Everything in Pro, SSO/SAML, Audit logs, SLA guarantee, Dedicated CSM
- CTA: "Contact Sales" ghost button

### 6. Footer (96px top padding, 48px bottom padding)
- Top border: 1px border-subtle
- 4-column grid:
  - Col 1: DevForge wordmark + "Code reviews on autopilot." tagline (text-tertiary, 14px)
  - Col 2: Product -- Features, Pricing, Changelog, Docs
  - Col 3: Company -- About, Blog, Careers, Contact
  - Col 4: Legal -- Privacy, Terms, Security, Status
- Bottom row: "(c) 2026 DevForge, Inc." (text-tertiary) + social icons (GitHub, X/Twitter, Discord)

## Visual Effects

- **Terminal glow:** Radial gradient behind hero screenshot, accent-primary at 4-6% opacity
- **Grain overlay:** Full-page SVG noise filter at 3% opacity for analog texture
- **Card hover:** 200ms ease border-color + translateY transition
- **Scroll fade-in:** Elements enter with opacity 0 -> 1 + translateY(20px -> 0), staggered 80ms per item
- **Cursor blink:** CSS animation on terminal cursor element, 1s step-end infinite
- **Nav blur:** backdrop-filter: blur(12px) on sticky nav

## Responsive Breakpoints

| Breakpoint | Behavior                                        |
|------------|--------------------------------------------------|
| > 1280px   | Full layout, 80px page padding                   |
| 768-1280   | Features 2-col, pricing stack, 48px padding       |
| < 768      | Single column, 24px padding, stacked pricing      |
