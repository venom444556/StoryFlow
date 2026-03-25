# DevForge Landing Page -- Design Plan

## Design Direction
Inspired by Linear (information density, monochrome palette with accent pops, surgical typography) and Raycast (dark gradients, glassmorphism, developer-native aesthetic). The page should feel like a tool built by engineers for engineers -- precise, fast, no filler.

---

## Color Palette

| Token              | Value       | Usage                                      |
|--------------------|-------------|---------------------------------------------|
| `--bg-primary`     | `#0A0A0F`   | Page background, deep near-black            |
| `--bg-elevated`    | `#12121A`   | Card backgrounds, pricing tiles             |
| `--bg-surface`     | `#1A1A26`   | Hover states, secondary surfaces            |
| `--border-default` | `#2A2A3C`   | Card borders, dividers                      |
| `--border-subtle`  | `#1E1E2E`   | Faint separators                            |
| `--text-primary`   | `#F0F0F5`   | Headings, primary copy                      |
| `--text-secondary` | `#8B8BA3`   | Body text, descriptions                     |
| `--text-tertiary`  | `#5C5C73`   | Captions, disabled states                   |
| `--accent`         | `#6C5CE7`   | Primary purple accent (CTAs, highlights)    |
| `--accent-hover`   | `#7C6EF7`   | Hover state for accent                      |
| `--accent-glow`    | `rgba(108, 92, 231, 0.15)` | Glow effects behind accent elements |
| `--green`          | `#00D68F`   | Success, "popular" badge, positive signals  |
| `--white`          | `#FFFFFF`   | Logo marks in social proof                  |

## Typography

| Element           | Font              | Weight | Size   | Line Height | Letter Spacing |
|-------------------|-------------------|--------|--------|-------------|----------------|
| Hero headline     | Inter             | 700    | 64px   | 1.1         | -0.03em        |
| Hero tagline      | Inter             | 400    | 20px   | 1.6         | 0              |
| Section heading   | Inter             | 600    | 36px   | 1.2         | -0.02em        |
| Feature title     | Inter             | 600    | 18px   | 1.4         | -0.01em        |
| Feature body      | Inter             | 400    | 15px   | 1.6         | 0              |
| Pricing tier name | Inter             | 600    | 22px   | 1.3         | -0.01em        |
| Pricing price     | Inter             | 700    | 40px   | 1.1         | -0.02em        |
| Code / CLI        | JetBrains Mono    | 400    | 14px   | 1.5         | 0              |
| Button text       | Inter             | 500    | 15px   | 1.0         | 0              |
| Nav links         | Inter             | 500    | 14px   | 1.0         | 0              |

## Spacing System (8px base)

| Token    | Value  | Usage                          |
|----------|--------|--------------------------------|
| `xs`     | 4px    | Inline padding, icon gaps      |
| `sm`     | 8px    | Tight padding                  |
| `md`     | 16px   | Card internal padding          |
| `lg`     | 24px   | Between elements in a group    |
| `xl`     | 32px   | Between groups                 |
| `2xl`    | 48px   | Between sections on mobile     |
| `3xl`    | 64px   | Section padding (top/bottom)   |
| `4xl`    | 96px   | Hero vertical padding          |
| `5xl`    | 120px  | Section vertical padding       |

## Layout

- **Max content width:** 1200px, centered
- **Grid:** 3-column features grid, 16px gap
- **Pricing grid:** 3 columns, 16px gap, middle card slightly elevated (+4px shadow offset)
- **Page sections (top to bottom):**
  1. Navbar (sticky, 64px height, blur backdrop)
  2. Hero (centered text + screenshot placeholder below)
  3. Social proof logos (horizontal strip, grayscale logos)
  4. Features grid (3x1, icon + title + description per card)
  5. Pricing table (3 tiers side by side)
  6. Footer (links + copyright)

## Component Specifications

### Navbar
- Height: 64px
- Background: `rgba(10, 10, 15, 0.8)` + `backdrop-filter: blur(12px)`
- Border bottom: 1px solid `--border-subtle`
- Left: "DevForge" wordmark (Inter 700, 18px, `--text-primary`)
- Right: nav links ("Features", "Pricing", "Docs") + CTA button
- CTA: "Get Started" pill, `--accent` bg, 36px height, 16px horizontal padding, 8px radius

### Hero Section
- Vertical padding: 96px top, 64px bottom
- Headline: "Code reviews on autopilot." -- 64px, 700 weight, `--text-primary`
- Subhead: "DevForge analyzes diffs, flags issues, and suggests fixes before your team even opens the PR." -- 20px, 400 weight, `--text-secondary`, max-width 600px
- CTA group: Two buttons side by side, 12px gap
  - Primary: "Start Free" -- `--accent` bg, white text, 44px height, 24px h-padding, 10px radius
  - Secondary: "View Docs" -- transparent bg, 1px `--border-default` border, `--text-secondary` text, same dimensions
- Below: terminal-style code block showing `$ forge review --pr 142`, monospace, `--bg-elevated` bg, 1px border, 12px radius, 24px padding
- Screenshot area: 800x450px frame, `--bg-elevated` bg, 1px `--border-default` border, 12px radius, subtle `--accent-glow` box-shadow

### Social Proof Section
- Vertical padding: 48px
- Label: "Trusted by engineering teams at" -- 13px, 500 weight, `--text-tertiary`, uppercase, 1.5px letter-spacing
- Logo row: 5-6 placeholder rectangles (120x32px each), `--text-tertiary` fill, 48px gap, horizontally centered
- Opacity: 0.5 on logos (grayscale effect)

### Features Grid
- Vertical padding: 96px
- Section heading: "Built for how you actually ship code" -- 36px, centered
- 3 columns, 16px gap
- Each card:
  - Background: `--bg-elevated`
  - Border: 1px `--border-default`
  - Radius: 12px
  - Padding: 32px
  - Icon: 40x40px circle, `--accent-glow` bg, `--accent` icon color
  - Title: 18px, 600, `--text-primary`, 12px below icon
  - Description: 15px, 400, `--text-secondary`, 8px below title
- Feature 1: "Instant PR Analysis" -- "Reviews every pull request in seconds. Catches bugs, style issues, and security risks automatically."
- Feature 2: "Context-Aware Feedback" -- "Understands your codebase conventions and flags deviations, not just lint errors."
- Feature 3: "CI/CD Integration" -- "Plugs into GitHub Actions, GitLab CI, and Jenkins with a single config line."

### Pricing Table
- Vertical padding: 96px
- Section heading: "Simple, transparent pricing" -- 36px, centered
- Subhead: "Start free. Scale when you're ready." -- 16px, `--text-secondary`
- 3 columns, 16px gap
- Each tier card:
  - Background: `--bg-elevated`
  - Border: 1px `--border-default`
  - Radius: 12px
  - Padding: 32px
- **Tier 1 -- Free:**
  - Name: "Starter", Price: "$0", Period: "/month"
  - Features: "5 repos", "100 reviews/month", "GitHub only", "Community support"
  - CTA: "Get Started" -- outlined style (secondary button)
- **Tier 2 -- Pro (highlighted):**
  - Badge: "Most Popular" -- `--green` bg, black text, 6px v-padding, 12px h-padding, 6px radius, 12px font
  - Border: 1px `--accent` (replaces default border)
  - Box shadow: `0 0 40px rgba(108, 92, 231, 0.1)`
  - Name: "Pro", Price: "$29", Period: "/month"
  - Features: "Unlimited repos", "Unlimited reviews", "GitHub + GitLab", "Priority support", "Custom rules"
  - CTA: "Start Free Trial" -- solid accent style (primary button)
- **Tier 3 -- Enterprise:**
  - Name: "Enterprise", Price: "Custom"
  - Features: "Everything in Pro", "SSO / SAML", "Dedicated support", "SLA guarantee", "On-prem option"
  - CTA: "Contact Sales" -- outlined style

- Feature list items: 15px, `--text-secondary`, 10px vertical gap, checkmark prefix in `--green`

### Footer
- Vertical padding: 48px top, 32px bottom
- Border top: 1px `--border-subtle`
- Two rows:
  - Row 1: 4 columns of links (Product, Resources, Company, Legal)
    - Column header: 13px, 600, `--text-tertiary`, uppercase, 1.5px letter-spacing
    - Links: 14px, 400, `--text-secondary`
  - Row 2: Copyright line centered, 13px, `--text-tertiary`
    - "2026 DevForge. All rights reserved."

## Effects & Polish
- All interactive elements: `transition: all 0.15s ease`
- Cards: subtle hover lift (`transform: translateY(-2px)`) + border brightens to `--border-default` lightened 10%
- Accent CTA buttons: on hover, `--accent-hover` bg + `box-shadow: 0 0 20px rgba(108, 92, 231, 0.3)`
- Screenshot placeholder: faint animated gradient shimmer (optional, skip if complexity budget is tight)
- No decorative gradients or mesh backgrounds -- keep it clean and Linear-like
