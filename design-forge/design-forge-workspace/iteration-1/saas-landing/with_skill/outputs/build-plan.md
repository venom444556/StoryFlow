# Build Plan: DevForge Landing Page

Ordered `forge` CLI command sequence for each section. Execute sequentially, screenshot after each section for QA.

---

## Step 0: Project Setup

```bash
forge connect --launch
forge create-project --template blank
forge screenshot -o step-0-blank.png
```

---

## Step 1: Navigation Bar

```bash
# 1. Create nav container
forge insert frame
forge style '{"width":"100%","height":"64px","backgroundColor":"rgba(10,10,10,0.8)","backdropFilter":"blur(12px)","display":"flex","alignItems":"center","justifyContent":"space-between","padding":"0 32px","position":"fixed","top":"0","zIndex":"100"}'

# 2. Logo
forge insert text
forge set-text "DevForge" --font "Space Grotesk" --size 20 --weight 700 --color "#E8E8E8"

# 3. Nav links (center group)
forge insert stack
forge set-layout horizontal --gap 32
forge insert text
forge set-text "Features" --font "DM Sans" --size 14 --weight 500 --color "#8A8A8A"
forge insert text
forge set-text "Pricing" --font "DM Sans" --size 14 --weight 500 --color "#8A8A8A"
forge insert text
forge set-text "Docs" --font "DM Sans" --size 14 --weight 500 --color "#8A8A8A"
forge insert text
forge set-text "GitHub" --font "DM Sans" --size 14 --weight 500 --color "#8A8A8A"

# 4. CTA button (right)
forge insert frame
forge style '{"backgroundColor":"#6366F1","borderRadius":"8px","padding":"10px 20px"}'
forge insert text
forge set-text "Get Started" --font "DM Sans" --size 14 --weight 600 --color "#FFFFFF"

# 5. Verify
forge screenshot -o step-1-nav.png
```

---

## Step 2: Hero Section

```bash
# 1. Hero container
forge insert frame
forge style '{"width":"100%","height":"800px","backgroundColor":"#0A0A0A","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","padding":"48px"}'

# 2. Eyebrow badge
forge insert frame
forge style '{"backgroundColor":"transparent","border":"1px solid rgba(99,102,241,0.3)","borderRadius":"8px","padding":"6px 12px","marginBottom":"24px"}'
forge insert text
forge set-text "FOR DEVELOPERS" --font "JetBrains Mono" --size 12 --weight 500 --color "#6366F1"
forge style '{"letterSpacing":"0.05em"}'

# 3. Headline
forge insert text
forge set-text "Code reviews on autopilot." --font "Space Grotesk" --size 64 --weight 700 --color "#E8E8E8"
forge style '{"letterSpacing":"-0.02em","lineHeight":"1.05","textAlign":"center"}'

# 4. Subhead
forge insert text
forge set-text "DevForge analyzes your PRs, flags issues, suggests fixes, and auto-approves clean code. Ship faster with AI-powered reviews." --font "DM Sans" --size 18 --weight 400 --color "#8A8A8A"
forge style '{"maxWidth":"580px","textAlign":"center","marginTop":"24px","lineHeight":"1.5"}'

# 5. CTA button group
forge insert stack
forge set-layout horizontal --gap 16
forge style '{"marginTop":"32px"}'

# Primary CTA
forge insert frame
forge style '{"backgroundColor":"#6366F1","borderRadius":"12px","padding":"14px 28px","cursor":"pointer"}'
forge insert text
forge set-text "Start Free" --font "DM Sans" --size 16 --weight 600 --color "#FFFFFF"

# Secondary CTA
forge insert frame
forge style '{"backgroundColor":"transparent","border":"1px solid #2A2A2A","borderRadius":"12px","padding":"14px 28px","cursor":"pointer"}'
forge insert text
forge set-text "View Demo" --font "DM Sans" --size 16 --weight 600 --color "#E8E8E8"

# 6. Product screenshot placeholder
forge insert frame
forge style '{"width":"960px","height":"540px","backgroundColor":"#141414","borderRadius":"16px","border":"1px solid rgba(255,255,255,0.06)","marginTop":"64px","overflow":"hidden","position":"relative"}'

# Gradient glow behind screenshot
forge insert frame
forge style '{"width":"100%","height":"100%","position":"absolute","top":"0","left":"0","background":"radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)","zIndex":"0"}'

# Terminal content inside screenshot
forge insert frame
forge style '{"padding":"32px","position":"relative","zIndex":"1"}'

# Terminal title bar
forge insert frame
forge style '{"display":"flex","gap":"8px","marginBottom":"24px"}'
forge insert frame
forge style '{"width":"12px","height":"12px","borderRadius":"6px","backgroundColor":"#FF5F57"}'
forge insert frame
forge style '{"width":"12px","height":"12px","borderRadius":"6px","backgroundColor":"#FFBD2E"}'
forge insert frame
forge style '{"width":"12px","height":"12px","borderRadius":"6px","backgroundColor":"#28C840"}'

# Terminal lines
forge insert text
forge set-text "$ devforge review --pr 247" --font "JetBrains Mono" --size 14 --weight 400 --color "#22D3EE"
forge style '{"marginBottom":"8px"}'
forge insert text
forge set-text "Analyzing 12 files... 3 issues found" --font "JetBrains Mono" --size 14 --weight 400 --color "#8A8A8A"
forge style '{"marginBottom":"4px"}'
forge insert text
forge set-text "Auto-approved: 9 clean files" --font "JetBrains Mono" --size 14 --weight 400 --color "#34D399"

# 7. Verify
forge screenshot -o step-2-hero.png
```

---

## Step 3: Social Proof / Logo Bar

```bash
# 1. Section container
forge insert frame
forge style '{"width":"100%","padding":"96px 32px","backgroundColor":"#0A0A0A","display":"flex","flexDirection":"column","alignItems":"center"}'

# 2. Label
forge insert text
forge set-text "Trusted by engineering teams at" --font "DM Sans" --size 14 --weight 400 --color "#555555"
forge style '{"textAlign":"center","marginBottom":"48px"}'

# 3. Logo row
forge insert stack
forge set-layout horizontal --gap 48
forge style '{"alignItems":"center","opacity":"0.4"}'

# 6 logo placeholders (grayscale boxes representing company logos)
forge insert frame
forge style '{"width":"120px","height":"40px","backgroundColor":"#1C1C1C","borderRadius":"8px"}'
forge insert frame
forge style '{"width":"120px","height":"40px","backgroundColor":"#1C1C1C","borderRadius":"8px"}'
forge insert frame
forge style '{"width":"120px","height":"40px","backgroundColor":"#1C1C1C","borderRadius":"8px"}'
forge insert frame
forge style '{"width":"120px","height":"40px","backgroundColor":"#1C1C1C","borderRadius":"8px"}'
forge insert frame
forge style '{"width":"120px","height":"40px","backgroundColor":"#1C1C1C","borderRadius":"8px"}'
forge insert frame
forge style '{"width":"120px","height":"40px","backgroundColor":"#1C1C1C","borderRadius":"8px"}'

# 4. Verify
forge screenshot -o step-3-logos.png
```

---

## Step 4: Features Grid (3 columns, 6 cards)

```bash
# 1. Section container
forge insert frame
forge style '{"width":"100%","padding":"128px 32px","backgroundColor":"#0A0A0A"}'

# 2. Heading group (centered)
forge insert frame
forge style '{"maxWidth":"1200px","margin":"0 auto","display":"flex","flexDirection":"column","alignItems":"center","marginBottom":"64px"}'

forge insert text
forge set-text "Built for your workflow" --font "Space Grotesk" --size 44 --weight 700 --color "#E8E8E8"
forge style '{"textAlign":"center","lineHeight":"1.15"}'

forge insert text
forge set-text "DevForge integrates with your existing tools and gets smarter with every review." --font "DM Sans" --size 18 --weight 400 --color "#8A8A8A"
forge style '{"textAlign":"center","maxWidth":"560px","marginTop":"16px","lineHeight":"1.5"}'

# 3. Grid container
forge insert frame
forge style '{"maxWidth":"1200px","margin":"0 auto","display":"grid","gridTemplateColumns":"repeat(3, 1fr)","gap":"24px"}'

# --- Card 1: Instant PR Analysis ---
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid rgba(255,255,255,0.06)"}'
forge insert frame
forge style '{"width":"48px","height":"48px","borderRadius":"24px","backgroundColor":"#1C1C1C"}'
forge insert text
forge set-text "Instant PR Analysis" --font "Space Grotesk" --size 24 --weight 600 --color "#E8E8E8"
forge style '{"marginTop":"24px"}'
forge insert text
forge set-text "Every pull request scanned in seconds. Catch bugs, security issues, and style violations before they reach main." --font "DM Sans" --size 16 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"12px","lineHeight":"1.6"}'

# --- Card 2: Auto-Approve Clean Code ---
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid rgba(255,255,255,0.06)"}'
forge insert frame
forge style '{"width":"48px","height":"48px","borderRadius":"24px","backgroundColor":"#1C1C1C"}'
forge insert text
forge set-text "Auto-Approve Clean Code" --font "Space Grotesk" --size 24 --weight 600 --color "#E8E8E8"
forge style '{"marginTop":"24px"}'
forge insert text
forge set-text "When code meets your standards, DevForge approves automatically. No bottlenecks, no waiting." --font "DM Sans" --size 16 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"12px","lineHeight":"1.6"}'

# --- Card 3: Smart Suggestions ---
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid rgba(255,255,255,0.06)"}'
forge insert frame
forge style '{"width":"48px","height":"48px","borderRadius":"24px","backgroundColor":"#1C1C1C"}'
forge insert text
forge set-text "Smart Suggestions" --font "Space Grotesk" --size 24 --weight 600 --color "#E8E8E8"
forge style '{"marginTop":"24px"}'
forge insert text
forge set-text "Context-aware fix suggestions that understand your codebase, conventions, and past decisions." --font "DM Sans" --size 16 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"12px","lineHeight":"1.6"}'

# --- Card 4: GitHub & GitLab Native ---
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid rgba(255,255,255,0.06)"}'
forge insert frame
forge style '{"width":"48px","height":"48px","borderRadius":"24px","backgroundColor":"#1C1C1C"}'
forge insert text
forge set-text "GitHub & GitLab Native" --font "Space Grotesk" --size 24 --weight 600 --color "#E8E8E8"
forge style '{"marginTop":"24px"}'
forge insert text
forge set-text "First-class integrations with GitHub, GitLab, and Bitbucket. Install in 2 minutes." --font "DM Sans" --size 16 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"12px","lineHeight":"1.6"}'

# --- Card 5: Custom Rulesets ---
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid rgba(255,255,255,0.06)"}'
forge insert frame
forge style '{"width":"48px","height":"48px","borderRadius":"24px","backgroundColor":"#1C1C1C"}'
forge insert text
forge set-text "Custom Rulesets" --font "Space Grotesk" --size 24 --weight 600 --color "#E8E8E8"
forge style '{"marginTop":"24px"}'
forge insert text
forge set-text "Define your team's standards in code. DevForge enforces them consistently across every PR." --font "DM Sans" --size 16 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"12px","lineHeight":"1.6"}'

# --- Card 6: Review Analytics ---
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid rgba(255,255,255,0.06)"}'
forge insert frame
forge style '{"width":"48px","height":"48px","borderRadius":"24px","backgroundColor":"#1C1C1C"}'
forge insert text
forge set-text "Review Analytics" --font "Space Grotesk" --size 24 --weight 600 --color "#E8E8E8"
forge style '{"marginTop":"24px"}'
forge insert text
forge set-text "Track review velocity, catch rates, and team patterns. Data-driven engineering culture." --font "DM Sans" --size 16 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"12px","lineHeight":"1.6"}'

# 4. Verify
forge screenshot -o step-4-features.png
```

---

## Step 5: Pricing Table (3 tiers)

```bash
# 1. Section container
forge insert frame
forge style '{"width":"100%","padding":"128px 32px","backgroundColor":"#0A0A0A"}'

# 2. Heading group
forge insert frame
forge style '{"display":"flex","flexDirection":"column","alignItems":"center","marginBottom":"64px"}'

forge insert text
forge set-text "Simple, transparent pricing" --font "Space Grotesk" --size 44 --weight 700 --color "#E8E8E8"
forge style '{"textAlign":"center","lineHeight":"1.15"}'

forge insert text
forge set-text "Start free. Scale when you're ready." --font "DM Sans" --size 18 --weight 400 --color "#8A8A8A"
forge style '{"textAlign":"center","marginTop":"16px"}'

# 3. Pricing grid
forge insert frame
forge style '{"maxWidth":"1080px","margin":"0 auto","display":"grid","gridTemplateColumns":"repeat(3, 1fr)","gap":"24px","alignItems":"start"}'

# --- Tier 1: Starter ---
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid rgba(255,255,255,0.06)"}'

forge insert text
forge set-text "Starter" --font "Space Grotesk" --size 20 --weight 600 --color "#E8E8E8"

forge insert frame
forge style '{"display":"flex","alignItems":"baseline","gap":"4px","marginTop":"16px"}'
forge insert text
forge set-text "$0" --font "Space Grotesk" --size 48 --weight 700 --color "#E8E8E8"
forge insert text
forge set-text "/mo" --font "DM Sans" --size 18 --weight 400 --color "#8A8A8A"

forge insert text
forge set-text "For side projects and solo devs" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"8px"}'

# Divider
forge insert frame
forge style '{"width":"100%","height":"1px","backgroundColor":"#2A2A2A","margin":"24px 0"}'

# Feature list
forge insert stack
forge set-layout vertical --gap 12
forge insert text
forge set-text "1 repository" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "50 reviews / month" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "GitHub only" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "Community support" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"

# CTA
forge insert frame
forge style '{"backgroundColor":"transparent","border":"1px solid #2A2A2A","borderRadius":"12px","padding":"14px 0","marginTop":"24px","width":"100%","display":"flex","justifyContent":"center","cursor":"pointer"}'
forge insert text
forge set-text "Get Started Free" --font "DM Sans" --size 14 --weight 600 --color "#E8E8E8"

# --- Tier 2: Pro (highlighted) ---
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"2px solid #6366F1","position":"relative","boxShadow":"0 0 40px rgba(99,102,241,0.15)"}'

# Popular badge
forge insert frame
forge style '{"position":"absolute","top":"-12px","right":"24px","backgroundColor":"#6366F1","borderRadius":"8px","padding":"4px 12px"}'
forge insert text
forge set-text "MOST POPULAR" --font "DM Sans" --size 12 --weight 600 --color "#FFFFFF"
forge style '{"letterSpacing":"0.05em"}'

forge insert text
forge set-text "Pro" --font "Space Grotesk" --size 20 --weight 600 --color "#E8E8E8"

forge insert frame
forge style '{"display":"flex","alignItems":"baseline","gap":"4px","marginTop":"16px"}'
forge insert text
forge set-text "$29" --font "Space Grotesk" --size 48 --weight 700 --color "#E8E8E8"
forge insert text
forge set-text "/mo" --font "DM Sans" --size 18 --weight 400 --color "#8A8A8A"

forge insert text
forge set-text "For growing teams" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"8px"}'

# Divider
forge insert frame
forge style '{"width":"100%","height":"1px","backgroundColor":"#2A2A2A","margin":"24px 0"}'

# Feature list
forge insert stack
forge set-layout vertical --gap 12
forge insert text
forge set-text "Unlimited repositories" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "Unlimited reviews" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "GitHub + GitLab" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "Custom rulesets" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "Priority support" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "Review analytics" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"

# CTA
forge insert frame
forge style '{"backgroundColor":"#6366F1","borderRadius":"12px","padding":"14px 0","marginTop":"24px","width":"100%","display":"flex","justifyContent":"center","cursor":"pointer"}'
forge insert text
forge set-text "Start Pro Trial" --font "DM Sans" --size 14 --weight 600 --color "#FFFFFF"

# --- Tier 3: Enterprise ---
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid rgba(255,255,255,0.06)"}'

forge insert text
forge set-text "Enterprise" --font "Space Grotesk" --size 20 --weight 600 --color "#E8E8E8"

forge insert frame
forge style '{"marginTop":"16px"}'
forge insert text
forge set-text "Custom" --font "Space Grotesk" --size 48 --weight 700 --color "#E8E8E8"

forge insert text
forge set-text "For organizations at scale" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"8px"}'

# Divider
forge insert frame
forge style '{"width":"100%","height":"1px","backgroundColor":"#2A2A2A","margin":"24px 0"}'

# Feature list
forge insert stack
forge set-layout vertical --gap 12
forge insert text
forge set-text "Everything in Pro" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "SSO / SAML" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "Dedicated support" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "SLA guarantee" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "Custom integrations" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge insert text
forge set-text "Self-hosted option" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"

# CTA
forge insert frame
forge style '{"backgroundColor":"transparent","border":"1px solid #2A2A2A","borderRadius":"12px","padding":"14px 0","marginTop":"24px","width":"100%","display":"flex","justifyContent":"center","cursor":"pointer"}'
forge insert text
forge set-text "Contact Sales" --font "DM Sans" --size 14 --weight 600 --color "#E8E8E8"

# 4. Verify
forge screenshot -o step-5-pricing.png
```

---

## Step 6: Footer

```bash
# 1. Footer container
forge insert frame
forge style '{"width":"100%","backgroundColor":"#0A0A0A","borderTop":"1px solid #1C1C1C","padding":"64px 32px 32px"}'

# 2. Footer grid (4 columns)
forge insert frame
forge style '{"maxWidth":"1200px","margin":"0 auto","display":"grid","gridTemplateColumns":"2fr 1fr 1fr 1fr","gap":"48px"}'

# 3. Brand column
forge insert frame
forge insert text
forge set-text "DevForge" --font "Space Grotesk" --size 20 --weight 700 --color "#E8E8E8"
forge insert text
forge set-text "Code reviews on autopilot." --font "DM Sans" --size 14 --weight 400 --color "#555555"
forge style '{"marginTop":"12px"}'

# 4. Product column
forge insert frame
forge insert text
forge set-text "PRODUCT" --font "DM Sans" --size 12 --weight 600 --color "#8A8A8A"
forge style '{"textTransform":"uppercase","letterSpacing":"0.05em","marginBottom":"16px"}'
forge insert stack
forge set-layout vertical --gap 12
forge insert text
forge set-text "Features" --font "DM Sans" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Pricing" --font "DM Sans" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Docs" --font "DM Sans" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Changelog" --font "DM Sans" --size 14 --weight 400 --color "#555555"

# 5. Developers column
forge insert frame
forge insert text
forge set-text "DEVELOPERS" --font "DM Sans" --size 12 --weight 600 --color "#8A8A8A"
forge style '{"textTransform":"uppercase","letterSpacing":"0.05em","marginBottom":"16px"}'
forge insert stack
forge set-layout vertical --gap 12
forge insert text
forge set-text "API Reference" --font "DM Sans" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "GitHub" --font "DM Sans" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Status" --font "DM Sans" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "CLI Docs" --font "DM Sans" --size 14 --weight 400 --color "#555555"

# 6. Company column
forge insert frame
forge insert text
forge set-text "COMPANY" --font "DM Sans" --size 12 --weight 600 --color "#8A8A8A"
forge style '{"textTransform":"uppercase","letterSpacing":"0.05em","marginBottom":"16px"}'
forge insert stack
forge set-layout vertical --gap 12
forge insert text
forge set-text "About" --font "DM Sans" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Blog" --font "DM Sans" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Careers" --font "DM Sans" --size 14 --weight 400 --color "#555555"
forge insert text
forge set-text "Contact" --font "DM Sans" --size 14 --weight 400 --color "#555555"

# 7. Copyright bar
forge insert frame
forge style '{"maxWidth":"1200px","margin":"32px auto 0","paddingTop":"32px","borderTop":"1px solid #1C1C1C"}'
forge insert text
forge set-text "2026 DevForge. All rights reserved." --font "DM Sans" --size 14 --weight 400 --color "#383838"

# 8. Verify
forge screenshot -o step-6-footer.png
```

---

## Step 7: Full-Page QA

```bash
# Full-page screenshot for final review
forge screenshot --full-page --2x -o full-page-qa.png
```

---

## Step 8: Publish

```bash
forge publish
forge screenshot --full-page -o final-published.png
```
