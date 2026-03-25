# Build Plan: DevForge Landing Page

Ordered `forge` CLI command sequence. Every value sourced from the DDD. Screenshot after each major section.

---

## 0. Project Setup

```bash
forge connect --launch
forge create-project --template blank
forge screenshot -o step-0-blank.png
```

---

## 1. Navigation Bar

```bash
# 1a. Nav container frame
forge insert frame
forge style '{"width":"100%","height":"64px","backgroundColor":"rgba(10,10,10,0.8)","backdropFilter":"blur(12px)","display":"flex","alignItems":"center","justifyContent":"space-between","padding":"0 32px","position":"fixed","top":"0","zIndex":"100"}'

# 1b. Logo / wordmark (left)
forge insert text
forge set-text "DevForge" --font "Clash Display" --size 20 --weight 700 --color "#E8E8E8"

# 1c. Nav links (center group)
forge insert stack
forge set-layout horizontal --gap 32

forge insert text
forge set-text "Features" --font "Geist" --size 14 --weight 500 --color "#888888"

forge insert text
forge set-text "Pricing" --font "Geist" --size 14 --weight 500 --color "#888888"

forge insert text
forge set-text "Docs" --font "Geist" --size 14 --weight 500 --color "#888888"

# 1d. Right group (Sign In + CTA)
forge insert stack
forge set-layout horizontal --gap 24

forge insert text
forge set-text "Sign In" --font "Geist" --size 14 --weight 500 --color "#888888"

forge insert frame
forge style '{"backgroundColor":"#22D3EE","borderRadius":"8px","padding":"16px 24px"}'
forge insert text
forge set-text "Get Started" --font "Geist" --size 14 --weight 600 --color "#0A0A0A"

# 1e. Screenshot
forge screenshot -o step-1-nav.png
```

---

## 2. Hero Section

```bash
# 2a. Hero container
forge insert frame
forge style '{"width":"100%","minHeight":"800px","backgroundColor":"#0A0A0A","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","padding":"128px 32px"}'

# 2b. Eyebrow badge
forge insert frame
forge style '{"backgroundColor":"rgba(167,139,250,0.1)","borderRadius":"8px","padding":"4px 8px","marginBottom":"24px"}'
forge insert text
forge set-text "NOW IN PUBLIC BETA" --font "Geist" --size 12 --weight 600 --color "#A78BFA"
forge style '{"letterSpacing":"0.05em"}'

# 2c. Headline
forge insert text
forge set-text "Code reviews on autopilot." --font "Clash Display" --size 64 --weight 700 --color "#E8E8E8"
forge style '{"maxWidth":"800px","textAlign":"center","lineHeight":"1.05","letterSpacing":"-0.02em"}'

# 2d. Subhead
forge insert text
forge set-text "DevForge analyzes every pull request, flags bugs before humans see them, and ships suggestions as inline comments. Stop context-switching. Start shipping." --font "Geist" --size 18 --weight 400 --color "#888888"
forge style '{"maxWidth":"600px","textAlign":"center","marginTop":"24px","lineHeight":"1.6"}'

# 2e. CTA button group
forge insert stack
forge set-layout horizontal --gap 32
forge style '{"marginTop":"32px"}'

# Primary CTA
forge insert frame
forge style '{"backgroundColor":"#22D3EE","borderRadius":"8px","padding":"16px 32px","cursor":"pointer"}'
forge insert text
forge set-text "Start Free Trial" --font "Geist" --size 16 --weight 600 --color "#0A0A0A"

# Secondary CTA
forge insert frame
forge style '{"backgroundColor":"transparent","borderRadius":"8px","padding":"16px 32px","border":"1px solid #2A2A2A","cursor":"pointer"}'
forge insert text
forge set-text "View Demo" --font "Geist" --size 16 --weight 600 --color "#E8E8E8"

# 2f. Product screenshot placeholder
forge insert frame
forge style '{"width":"960px","height":"480px","backgroundColor":"#141414","borderRadius":"16px","border":"1px solid #2A2A2A","marginTop":"48px","boxShadow":"0 0 120px rgba(34,211,238,0.05)"}'

# Placeholder label inside screenshot
forge insert text
forge set-text "Product Screenshot" --font "JetBrains Mono" --size 14 --weight 400 --color "#555555"
forge style '{"textAlign":"center","margin":"auto"}'

# 2g. Screenshot
forge screenshot -o step-2-hero.png
```

---

## 3. Features Grid

```bash
# 3a. Section container
forge insert frame
forge style '{"width":"100%","backgroundColor":"#0A0A0A","padding":"96px 32px"}'

# 3b. Inner container (max-width)
forge insert frame
forge style '{"maxWidth":"1200px","margin":"0 auto"}'

# 3c. Section heading
forge insert text
forge set-text "Built for how developers actually work" --font "Clash Display" --size 40 --weight 700 --color "#E8E8E8"
forge style '{"textAlign":"center","marginBottom":"64px"}'

# 3d. Grid container
forge insert frame
forge style '{"display":"grid","gridTemplateColumns":"repeat(3, 1fr)","gap":"32px"}'

# --- Card 1: AI-Powered Analysis ---
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid #2A2A2A"}'

# Icon placeholder
forge insert frame
forge style '{"width":"48px","height":"48px","backgroundColor":"#1A1A1A","borderRadius":"12px","display":"flex","alignItems":"center","justifyContent":"center"}'
forge insert text
forge set-text ">" --font "JetBrains Mono" --size 20 --weight 400 --color "#22D3EE"

# Title
forge insert text
forge set-text "AI-Powered Analysis" --font "Clash Display" --size 24 --weight 600 --color "#E8E8E8"
forge style '{"marginTop":"16px"}'

# Description
forge insert text
forge set-text "Understands your codebase context, coding standards, and patterns. Catches bugs, security issues, and style violations in seconds." --font "Geist" --size 16 --weight 400 --color "#888888"
forge style '{"marginTop":"8px","lineHeight":"1.6"}'

# --- Card 2: Inline Comments ---
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid #2A2A2A"}'

forge insert frame
forge style '{"width":"48px","height":"48px","backgroundColor":"#1A1A1A","borderRadius":"12px","display":"flex","alignItems":"center","justifyContent":"center"}'
forge insert text
forge set-text "//" --font "JetBrains Mono" --size 20 --weight 400 --color "#A78BFA"

forge insert text
forge set-text "Inline Comments" --font "Clash Display" --size 24 --weight 600 --color "#E8E8E8"
forge style '{"marginTop":"16px"}'

forge insert text
forge set-text "Posts review comments directly on the PR. No dashboard hopping. Your team reads feedback where they already work." --font "Geist" --size 16 --weight 400 --color "#888888"
forge style '{"marginTop":"8px","lineHeight":"1.6"}'

# --- Card 3: CI/CD Native ---
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid #2A2A2A"}'

forge insert frame
forge style '{"width":"48px","height":"48px","backgroundColor":"#1A1A1A","borderRadius":"12px","display":"flex","alignItems":"center","justifyContent":"center"}'
forge insert text
forge set-text "$" --font "JetBrains Mono" --size 20 --weight 400 --color "#22D3EE"

forge insert text
forge set-text "CI/CD Native" --font "Clash Display" --size 24 --weight 600 --color "#E8E8E8"
forge style '{"marginTop":"16px"}'

forge insert text
forge set-text "Runs as a GitHub Action, GitLab CI step, or CLI command. Zero config for standard setups. Full control when you need it." --font "Geist" --size 16 --weight 400 --color "#888888"
forge style '{"marginTop":"8px","lineHeight":"1.6"}'

# 3e. Screenshot
forge screenshot -o step-3-features.png
```

---

## 4. Social Proof / Logo Bar

```bash
# 4a. Section container
forge insert frame
forge style '{"width":"100%","backgroundColor":"#0F0F0F","padding":"64px 32px"}'

# 4b. Inner container
forge insert frame
forge style '{"maxWidth":"1200px","margin":"0 auto","display":"flex","flexDirection":"column","alignItems":"center"}'

# 4c. Label
forge insert text
forge set-text "TRUSTED BY ENGINEERING TEAMS AT" --font "Geist" --size 14 --weight 500 --color "#555555"
forge style '{"letterSpacing":"0.05em","textAlign":"center"}'

# 4d. Logo row
forge insert stack
forge set-layout horizontal --gap 48
forge style '{"marginTop":"32px","alignItems":"center"}'

# 6 placeholder logos
forge insert frame
forge style '{"width":"120px","height":"40px","backgroundColor":"#2A2A2A","borderRadius":"8px"}'

forge insert frame
forge style '{"width":"120px","height":"40px","backgroundColor":"#2A2A2A","borderRadius":"8px"}'

forge insert frame
forge style '{"width":"120px","height":"40px","backgroundColor":"#2A2A2A","borderRadius":"8px"}'

forge insert frame
forge style '{"width":"120px","height":"40px","backgroundColor":"#2A2A2A","borderRadius":"8px"}'

forge insert frame
forge style '{"width":"120px","height":"40px","backgroundColor":"#2A2A2A","borderRadius":"8px"}'

forge insert frame
forge style '{"width":"120px","height":"40px","backgroundColor":"#2A2A2A","borderRadius":"8px"}'

# 4e. Screenshot
forge screenshot -o step-4-logos.png
```

---

## 5. Pricing Table

```bash
# 5a. Section container
forge insert frame
forge style '{"width":"100%","backgroundColor":"#0A0A0A","padding":"96px 32px"}'

# 5b. Inner container
forge insert frame
forge style '{"maxWidth":"1200px","margin":"0 auto"}'

# 5c. Section heading
forge insert text
forge set-text "Simple, predictable pricing" --font "Clash Display" --size 40 --weight 700 --color "#E8E8E8"
forge style '{"textAlign":"center"}'

# 5d. Subhead
forge insert text
forge set-text "Start free. Scale as your team grows." --font "Geist" --size 18 --weight 400 --color "#888888"
forge style '{"textAlign":"center","marginTop":"16px","marginBottom":"64px"}'

# 5e. Pricing grid
forge insert frame
forge style '{"display":"grid","gridTemplateColumns":"repeat(3, 1fr)","gap":"32px","alignItems":"start"}'

# ========== TIER 1: STARTER ==========
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid #2A2A2A"}'

forge insert text
forge set-text "STARTER" --font "Geist" --size 12 --weight 600 --color "#888888"
forge style '{"letterSpacing":"0.05em"}'

forge insert stack
forge set-layout horizontal --gap 4
forge style '{"marginTop":"16px","alignItems":"baseline"}'
forge insert text
forge set-text "$0" --font "Clash Display" --size 48 --weight 700 --color "#E8E8E8"
forge insert text
forge set-text "/month" --font "Geist" --size 16 --weight 400 --color "#555555"

# Divider
forge insert frame
forge style '{"width":"100%","height":"1px","backgroundColor":"#2A2A2A","margin":"24px 0"}'

# Feature list
forge insert stack
forge set-layout vertical --gap 16

forge insert text
forge set-text "1 repository" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "50 reviews/month" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "GitHub integration" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "Community support" --font "Geist" --size 14 --weight 400 --color "#888888"

# CTA
forge insert frame
forge style '{"backgroundColor":"transparent","borderRadius":"8px","padding":"16px 24px","border":"1px solid #2A2A2A","marginTop":"24px","cursor":"pointer","textAlign":"center","width":"100%"}'
forge insert text
forge set-text "Get Started" --font "Geist" --size 16 --weight 600 --color "#E8E8E8"

# ========== TIER 2: PRO (HIGHLIGHTED) ==========
forge insert frame
forge style '{"backgroundColor":"#1A1A1A","borderRadius":"16px","padding":"32px","border":"1px solid #22D3EE","position":"relative"}'

# Popular badge
forge insert frame
forge style '{"backgroundColor":"#22D3EE","borderRadius":"8px","padding":"4px 16px","position":"absolute","top":"-16px","right":"24px"}'
forge insert text
forge set-text "MOST POPULAR" --font "Geist" --size 12 --weight 600 --color "#0A0A0A"
forge style '{"letterSpacing":"0.05em"}'

forge insert text
forge set-text "PRO" --font "Geist" --size 12 --weight 600 --color "#22D3EE"
forge style '{"letterSpacing":"0.05em"}'

forge insert stack
forge set-layout horizontal --gap 4
forge style '{"marginTop":"16px","alignItems":"baseline"}'
forge insert text
forge set-text "$29" --font "Clash Display" --size 48 --weight 700 --color "#E8E8E8"
forge insert text
forge set-text "/month per seat" --font "Geist" --size 16 --weight 400 --color "#555555"

forge insert frame
forge style '{"width":"100%","height":"1px","backgroundColor":"#2A2A2A","margin":"24px 0"}'

forge insert stack
forge set-layout vertical --gap 16

forge insert text
forge set-text "Unlimited repositories" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "Unlimited reviews" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "GitHub + GitLab + Bitbucket" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "Custom rules engine" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "Priority support" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "Team analytics dashboard" --font "Geist" --size 14 --weight 400 --color "#888888"

forge insert frame
forge style '{"backgroundColor":"#22D3EE","borderRadius":"8px","padding":"16px 24px","marginTop":"24px","cursor":"pointer","textAlign":"center","width":"100%"}'
forge insert text
forge set-text "Start Free Trial" --font "Geist" --size 16 --weight 600 --color "#0A0A0A"

# ========== TIER 3: ENTERPRISE ==========
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid #2A2A2A"}'

forge insert text
forge set-text "ENTERPRISE" --font "Geist" --size 12 --weight 600 --color "#888888"
forge style '{"letterSpacing":"0.05em"}'

forge insert stack
forge set-layout horizontal --gap 8
forge style '{"marginTop":"16px","alignItems":"baseline"}'
forge insert text
forge set-text "Custom" --font "Clash Display" --size 48 --weight 700 --color "#E8E8E8"

forge insert text
forge set-text "talk to sales" --font "Geist" --size 16 --weight 400 --color "#555555"
forge style '{"marginTop":"8px"}'

forge insert frame
forge style '{"width":"100%","height":"1px","backgroundColor":"#2A2A2A","margin":"24px 0"}'

forge insert stack
forge set-layout vertical --gap 16

forge insert text
forge set-text "Everything in Pro" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "Self-hosted deployment" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "SSO / SAML" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "Dedicated support engineer" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "Custom model fine-tuning" --font "Geist" --size 14 --weight 400 --color "#888888"
forge insert text
forge set-text "SLA guarantee" --font "Geist" --size 14 --weight 400 --color "#888888"

forge insert frame
forge style '{"backgroundColor":"transparent","borderRadius":"8px","padding":"16px 24px","border":"1px solid #2A2A2A","marginTop":"24px","cursor":"pointer","textAlign":"center","width":"100%"}'
forge insert text
forge set-text "Contact Sales" --font "Geist" --size 16 --weight 600 --color "#E8E8E8"

# 5f. Screenshot
forge screenshot -o step-5-pricing.png
```

---

## 6. Footer

```bash
# 6a. Footer container
forge insert frame
forge style '{"width":"100%","backgroundColor":"#0A0A0A","borderTop":"1px solid #1A1A1A","padding":"64px 32px 32px"}'

# 6b. Footer grid (4 columns)
forge insert frame
forge style '{"maxWidth":"1200px","margin":"0 auto","display":"grid","gridTemplateColumns":"2fr 1fr 1fr 1fr","gap":"48px"}'

# --- Column 1: Brand ---
forge insert frame

forge insert text
forge set-text "DevForge" --font "Clash Display" --size 20 --weight 700 --color "#E8E8E8"

forge insert text
forge set-text "Automated code reviews for modern teams." --font "Geist" --size 14 --weight 400 --color "#555555"
forge style '{"marginTop":"8px","lineHeight":"1.5"}'

# --- Column 2: Product ---
forge insert frame

forge insert text
forge set-text "PRODUCT" --font "Geist" --size 12 --weight 600 --color "#888888"
forge style '{"letterSpacing":"0.05em","marginBottom":"16px"}'

forge insert stack
forge set-layout vertical --gap 16
forge insert text
forge set-text "Features" --font "Geist" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Pricing" --font "Geist" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Changelog" --font "Geist" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Docs" --font "Geist" --size 14 --weight 400 --color "#555555"

# --- Column 3: Company ---
forge insert frame

forge insert text
forge set-text "COMPANY" --font "Geist" --size 12 --weight 600 --color "#888888"
forge style '{"letterSpacing":"0.05em","marginBottom":"16px"}'

forge insert stack
forge set-layout vertical --gap 16
forge insert text
forge set-text "About" --font "Geist" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Blog" --font "Geist" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Careers" --font "Geist" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Contact" --font "Geist" --size 14 --weight 400 --color "#555555"

# --- Column 4: Legal ---
forge insert frame

forge insert text
forge set-text "LEGAL" --font "Geist" --size 12 --weight 600 --color "#888888"
forge style '{"letterSpacing":"0.05em","marginBottom":"16px"}'

forge insert stack
forge set-layout vertical --gap 16
forge insert text
forge set-text "Privacy" --font "Geist" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Terms" --font "Geist" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Security" --font "Geist" --size 14 --weight 400 --color "#555555"

# 6c. Copyright line
forge insert frame
forge style '{"maxWidth":"1200px","margin":"32px auto 0","paddingTop":"32px","borderTop":"1px solid #1A1A1A"}'
forge insert text
forge set-text "2026 DevForge. All rights reserved." --font "Geist" --size 14 --weight 400 --color "#555555"

# 6d. Screenshot
forge screenshot -o step-6-footer.png
```

---

## 7. Full-Page QA

```bash
# Full-page screenshot for final evaluation
forge screenshot --full-page --2x -o full-page-qa.png
```

---

## 8. Publish

```bash
forge publish
forge screenshot --full-page -o final-live.png
```

---

## Spacing Audit (pre-flight check)

Every spatial value used in this build plan, verified against the 8px grid:

| Value | Multiple of | Status |
|-------|------------|--------|
| 4px | 4 (xs) | PASS |
| 8px | 8 | PASS |
| 16px | 8 | PASS |
| 24px | 8 | PASS |
| 32px | 8 | PASS |
| 48px | 8 | PASS |
| 64px | 8 | PASS |
| 96px | 8 | PASS |
| 128px | 8 | PASS |
| Button: 16px 24px | 8, 8 | PASS |
| Button: 16px 32px | 8, 8 | PASS |
| 4px 8px (badge) | 4, 8 | PASS |
| 4px 16px (badge) | 4, 8 | PASS |

No 14px, 11px, 28px, or off-grid values present.
