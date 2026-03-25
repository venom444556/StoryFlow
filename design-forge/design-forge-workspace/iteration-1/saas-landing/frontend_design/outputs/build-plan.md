# DevForge Landing Page -- Build Plan (Forge CLI Commands)

Commands are ordered sequentially. Each section is built top-to-bottom. Frame IDs are assigned incrementally for reference.

---

## Phase 0: Page Setup

```bash
# Root frame -- full page canvas
forge insert frame --id "page" --name "DevForge Landing" \
  --width 1440 --height 6200

forge style "page" '{
  "backgroundColor": "#0A0A0B",
  "overflow": "hidden"
}'

forge set-layout "page" --mode vertical --align center
```

---

## Phase 1: Navigation Bar

```bash
# Nav container
forge insert frame --id "nav" --parent "page" --name "Nav Bar" \
  --width 1440 --height 64

forge style "nav" '{
  "backgroundColor": "rgba(10,10,11,0.8)",
  "backdropFilter": "blur(12px)",
  "borderBottom": "1px solid #2A2A30",
  "position": "fixed",
  "top": "0",
  "zIndex": "100"
}'

forge set-layout "nav" --mode horizontal --align center --justify space-between \
  --paddingLeft 80 --paddingRight 80

# Wordmark group
forge insert stack --id "nav-left" --parent "nav" --direction horizontal --gap 8 --align center

forge insert text --id "nav-wordmark" --parent "nav-left" --content "DevForge"
forge style "nav-wordmark" '{
  "fontFamily": "Instrument Sans",
  "fontWeight": "700",
  "fontSize": "18px",
  "color": "#EDEDEF",
  "letterSpacing": "-0.02em"
}'

# CLI badge
forge insert frame --id "nav-badge" --parent "nav-left" --width 32 --height 20
forge style "nav-badge" '{
  "backgroundColor": "rgba(34,197,94,0.15)",
  "borderRadius": "4px",
  "display": "flex",
  "alignItems": "center",
  "justifyContent": "center"
}'

forge insert text --id "nav-badge-text" --parent "nav-badge" --content "CLI"
forge style "nav-badge-text" '{
  "fontFamily": "JetBrains Mono",
  "fontWeight": "600",
  "fontSize": "10px",
  "color": "#22C55E",
  "letterSpacing": "0.05em"
}'

# Nav links group
forge insert stack --id "nav-links" --parent "nav" --direction horizontal --gap 32 --align center

forge insert text --id "nav-link-docs" --parent "nav-links" --content "Docs"
forge style "nav-link-docs" '{
  "fontFamily": "Geist",
  "fontWeight": "500",
  "fontSize": "14px",
  "color": "#8B8B96",
  "letterSpacing": "0.02em"
}'

forge insert text --id "nav-link-pricing" --parent "nav-links" --content "Pricing"
forge style "nav-link-pricing" '{
  "fontFamily": "Geist",
  "fontWeight": "500",
  "fontSize": "14px",
  "color": "#8B8B96",
  "letterSpacing": "0.02em"
}'

forge insert text --id "nav-link-blog" --parent "nav-links" --content "Blog"
forge style "nav-link-blog" '{
  "fontFamily": "Geist",
  "fontWeight": "500",
  "fontSize": "14px",
  "color": "#8B8B96",
  "letterSpacing": "0.02em"
}'

forge insert text --id "nav-link-changelog" --parent "nav-links" --content "Changelog"
forge style "nav-link-changelog" '{
  "fontFamily": "Geist",
  "fontWeight": "500",
  "fontSize": "14px",
  "color": "#8B8B96",
  "letterSpacing": "0.02em"
}'

# CTA button
forge insert frame --id "nav-cta" --parent "nav" --width 120 --height 36
forge style "nav-cta" '{
  "backgroundColor": "#6366F1",
  "borderRadius": "8px",
  "display": "flex",
  "alignItems": "center",
  "justifyContent": "center",
  "cursor": "pointer"
}'

forge insert text --id "nav-cta-text" --parent "nav-cta" --content "Get Started"
forge style "nav-cta-text" '{
  "fontFamily": "Geist",
  "fontWeight": "500",
  "fontSize": "14px",
  "color": "#FFFFFF"
}'
```

---

## Phase 2: Hero Section

```bash
# Hero container
forge insert frame --id "hero" --parent "page" --name "Hero" \
  --width 1440 --height 900

forge style "hero" '{
  "paddingTop": "160px",
  "paddingBottom": "80px"
}'

forge set-layout "hero" --mode vertical --align center --gap 0

# Beta badge pill
forge insert frame --id "hero-badge" --parent "hero" --width 180 --height 32
forge style "hero-badge" '{
  "border": "1px solid #2A2A30",
  "borderRadius": "16px",
  "display": "flex",
  "alignItems": "center",
  "justifyContent": "center",
  "marginBottom": "24px"
}'

forge insert text --id "hero-badge-text" --parent "hero-badge" --content "NOW IN PUBLIC BETA"
forge style "hero-badge-text" '{
  "fontFamily": "Geist",
  "fontWeight": "600",
  "fontSize": "12px",
  "color": "#8B8B96",
  "letterSpacing": "0.06em"
}'

# Headline
forge insert text --id "hero-headline" --parent "hero" \
  --content "Code reviews on autopilot."

forge style "hero-headline" '{
  "fontFamily": "Instrument Sans",
  "fontWeight": "700",
  "fontSize": "64px",
  "color": "#EDEDEF",
  "letterSpacing": "-0.03em",
  "textAlign": "center",
  "maxWidth": "720px",
  "marginBottom": "20px",
  "lineHeight": "1.05"
}'

# Subheadline
forge insert text --id "hero-sub" --parent "hero" \
  --content "DevForge analyzes every pull request, catches bugs before humans do, and ships feedback in seconds. Not minutes."

forge style "hero-sub" '{
  "fontFamily": "Geist",
  "fontWeight": "400",
  "fontSize": "18px",
  "color": "#8B8B96",
  "textAlign": "center",
  "maxWidth": "560px",
  "lineHeight": "1.6",
  "marginBottom": "32px"
}'

# CTA button row
forge insert stack --id "hero-ctas" --parent "hero" --direction horizontal --gap 12 --align center

forge insert frame --id "hero-btn-primary" --parent "hero-ctas" --width 140 --height 44
forge style "hero-btn-primary" '{
  "backgroundColor": "#6366F1",
  "borderRadius": "8px",
  "display": "flex",
  "alignItems": "center",
  "justifyContent": "center"
}'
forge insert text --id "hero-btn-primary-text" --parent "hero-btn-primary" --content "Install CLI"
forge style "hero-btn-primary-text" '{
  "fontFamily": "Geist",
  "fontWeight": "500",
  "fontSize": "15px",
  "color": "#FFFFFF"
}'

forge insert frame --id "hero-btn-ghost" --parent "hero-ctas" --width 120 --height 44
forge style "hero-btn-ghost" '{
  "backgroundColor": "transparent",
  "border": "1px solid #2A2A30",
  "borderRadius": "8px",
  "display": "flex",
  "alignItems": "center",
  "justifyContent": "center"
}'
forge insert text --id "hero-btn-ghost-text" --parent "hero-btn-ghost" --content "View docs"
forge style "hero-btn-ghost-text" '{
  "fontFamily": "Geist",
  "fontWeight": "500",
  "fontSize": "15px",
  "color": "#8B8B96"
}'

# Install snippet bar
forge insert frame --id "hero-install" --parent "hero" --width 320 --height 40
forge style "hero-install" '{
  "backgroundColor": "#1A1A1E",
  "borderRadius": "8px",
  "border": "1px solid #2A2A30",
  "display": "flex",
  "alignItems": "center",
  "justifyContent": "center",
  "marginTop": "20px",
  "marginBottom": "48px"
}'
forge insert text --id "hero-install-text" --parent "hero-install" \
  --content "npm install -g devforge"
forge style "hero-install-text" '{
  "fontFamily": "JetBrains Mono",
  "fontWeight": "400",
  "fontSize": "14px",
  "color": "#8B8B96"
}'

# Product screenshot terminal frame
forge insert frame --id "hero-terminal" --parent "hero" --width 960 --height 540
forge style "hero-terminal" '{
  "backgroundColor": "#1A1A1E",
  "borderRadius": "12px",
  "border": "1px solid #2A2A30",
  "overflow": "hidden",
  "position": "relative",
  "boxShadow": "0 0 120px 40px rgba(99,102,241,0.06)"
}'
forge set-layout "hero-terminal" --mode vertical --align stretch

# Terminal chrome header
forge insert frame --id "terminal-chrome" --parent "hero-terminal" --width 960 --height 40
forge style "terminal-chrome" '{
  "backgroundColor": "#111113",
  "borderBottom": "1px solid #2A2A30",
  "paddingLeft": "16px"
}'
forge set-layout "terminal-chrome" --mode horizontal --align center --gap 8

# Traffic light dots
forge insert frame --id "dot-red" --parent "terminal-chrome" --width 12 --height 12
forge style "dot-red" '{ "backgroundColor": "#EF4444", "borderRadius": "50%" }'

forge insert frame --id "dot-amber" --parent "terminal-chrome" --width 12 --height 12
forge style "dot-amber" '{ "backgroundColor": "#F59E0B", "borderRadius": "50%" }'

forge insert frame --id "dot-green" --parent "terminal-chrome" --width 12 --height 12
forge style "dot-green" '{ "backgroundColor": "#22C55E", "borderRadius": "50%" }'

# Terminal body (code diff mockup area)
forge insert frame --id "terminal-body" --parent "hero-terminal" --width 960 --height 500
forge style "terminal-body" '{
  "backgroundColor": "#0A0A0B",
  "padding": "24px"
}'
forge set-layout "terminal-body" --mode vertical --gap 4

# Sample diff lines
forge insert text --id "diff-line-1" --parent "terminal-body" \
  --content "  reviewing pull request #142..."
forge style "diff-line-1" '{
  "fontFamily": "JetBrains Mono", "fontSize": "14px", "color": "#5C5C66"
}'

forge insert text --id "diff-line-2" --parent "terminal-body" \
  --content "- const data = fetch(url)"
forge style "diff-line-2" '{
  "fontFamily": "JetBrains Mono", "fontSize": "14px", "color": "#EF4444"
}'

forge insert text --id "diff-line-3" --parent "terminal-body" \
  --content "+ const data = await fetch(url)"
forge style "diff-line-3" '{
  "fontFamily": "JetBrains Mono", "fontSize": "14px", "color": "#22C55E"
}'

forge insert text --id "diff-line-4" --parent "terminal-body" \
  --content ""
forge style "diff-line-4" '{ "fontSize": "14px" }'

forge insert text --id "diff-line-5" --parent "terminal-body" \
  --content "  [devforge] Bug: missing await on async fetch call."
forge style "diff-line-5" '{
  "fontFamily": "JetBrains Mono", "fontSize": "14px", "color": "#6366F1"
}'

forge insert text --id "diff-line-6" --parent "terminal-body" \
  --content "  [devforge] Severity: high | Auto-fix available"
forge style "diff-line-6" '{
  "fontFamily": "JetBrains Mono", "fontSize": "14px", "color": "#F59E0B"
}'

forge insert text --id "diff-cursor" --parent "terminal-body" --content "|"
forge style "diff-cursor" '{
  "fontFamily": "JetBrains Mono",
  "fontSize": "14px",
  "color": "#22C55E",
  "animation": "blink 1s step-end infinite"
}'
```

---

## Phase 3: Social Proof Logos

```bash
forge insert frame --id "social-proof" --parent "page" --name "Social Proof" \
  --width 1440 --height 160

forge style "social-proof" '{
  "paddingTop": "40px",
  "paddingBottom": "40px"
}'
forge set-layout "social-proof" --mode vertical --align center --gap 32

forge insert text --id "social-label" --parent "social-proof" \
  --content "TRUSTED BY ENGINEERING TEAMS AT"
forge style "social-label" '{
  "fontFamily": "Geist",
  "fontWeight": "500",
  "fontSize": "13px",
  "color": "#5C5C66",
  "letterSpacing": "0.1em",
  "textAlign": "center"
}'

# Logo row
forge insert stack --id "logo-row" --parent "social-proof" \
  --direction horizontal --gap 64 --align center --justify center

# 6 placeholder logos (grey rectangles with company name text)
forge insert frame --id "logo-1" --parent "logo-row" --width 120 --height 28
forge style "logo-1" '{ "opacity": "0.3" }'
forge insert text --id "logo-1-text" --parent "logo-1" --content "Vercel"
forge style "logo-1-text" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "16px", "color": "#5C5C66"
}'

forge insert frame --id "logo-2" --parent "logo-row" --width 120 --height 28
forge style "logo-2" '{ "opacity": "0.3" }'
forge insert text --id "logo-2-text" --parent "logo-2" --content "Stripe"
forge style "logo-2-text" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "16px", "color": "#5C5C66"
}'

forge insert frame --id "logo-3" --parent "logo-row" --width 120 --height 28
forge style "logo-3" '{ "opacity": "0.3" }'
forge insert text --id "logo-3-text" --parent "logo-3" --content "Linear"
forge style "logo-3-text" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "16px", "color": "#5C5C66"
}'

forge insert frame --id "logo-4" --parent "logo-row" --width 120 --height 28
forge style "logo-4" '{ "opacity": "0.3" }'
forge insert text --id "logo-4-text" --parent "logo-4" --content "Supabase"
forge style "logo-4-text" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "16px", "color": "#5C5C66"
}'

forge insert frame --id "logo-5" --parent "logo-row" --width 120 --height 28
forge style "logo-5" '{ "opacity": "0.3" }'
forge insert text --id "logo-5-text" --parent "logo-5" --content "Planetscale"
forge style "logo-5-text" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "16px", "color": "#5C5C66"
}'

forge insert frame --id "logo-6" --parent "logo-row" --width 120 --height 28
forge style "logo-6" '{ "opacity": "0.3" }'
forge insert text --id "logo-6-text" --parent "logo-6" --content "Resend"
forge style "logo-6-text" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "16px", "color": "#5C5C66"
}'

# Divider line
forge insert frame --id "social-divider" --parent "social-proof" --width 64 --height 1
forge style "social-divider" '{ "backgroundColor": "#2A2A30" }'
```

---

## Phase 4: Features Grid

```bash
forge insert frame --id "features" --parent "page" --name "Features" \
  --width 1440 --height 900

forge style "features" '{
  "paddingTop": "120px",
  "paddingBottom": "120px",
  "paddingLeft": "80px",
  "paddingRight": "80px"
}'
forge set-layout "features" --mode vertical --align center --gap 48

# Section label
forge insert text --id "features-label" --parent "features" --content "FEATURES"
forge style "features-label" '{
  "fontFamily": "Geist",
  "fontWeight": "600",
  "fontSize": "12px",
  "color": "#6366F1",
  "letterSpacing": "0.1em"
}'

# Section heading
forge insert text --id "features-heading" --parent "features" \
  --content "Everything your PR workflow needs."
forge style "features-heading" '{
  "fontFamily": "Instrument Sans",
  "fontWeight": "600",
  "fontSize": "36px",
  "color": "#EDEDEF",
  "letterSpacing": "-0.02em",
  "textAlign": "center"
}'

# Grid container (3 columns x 2 rows)
forge insert frame --id "features-grid" --parent "features" --width 1200 --height 520
forge set-layout "features-grid" --mode grid --columns 3 --gap 24

# --- Card 1: Instant PR Analysis ---
forge insert frame --id "feat-1" --parent "features-grid" --width 384 --height 240
forge style "feat-1" '{
  "backgroundColor": "#111113",
  "border": "1px solid #2A2A30",
  "borderRadius": "12px",
  "padding": "32px",
  "transition": "border-color 0.2s ease, transform 0.2s ease"
}'
forge set-layout "feat-1" --mode vertical --gap 12

forge insert frame --id "feat-1-icon" --parent "feat-1" --width 40 --height 40
forge style "feat-1-icon" '{
  "backgroundColor": "#1A1A1E",
  "borderRadius": "8px",
  "border": "1px solid #2A2A30"
}'

forge insert text --id "feat-1-title" --parent "feat-1" --content "Instant PR Analysis"
forge style "feat-1-title" '{
  "fontFamily": "Instrument Sans", "fontWeight": "600", "fontSize": "18px", "color": "#EDEDEF"
}'

forge insert text --id "feat-1-desc" --parent "feat-1" \
  --content "Scans diffs in <3 seconds. Catches type errors, logic bugs, and style violations."
forge style "feat-1-desc" '{
  "fontFamily": "Geist", "fontWeight": "400", "fontSize": "15px", "color": "#8B8B96", "lineHeight": "1.5"
}'

# --- Card 2: Smart Comments ---
forge insert frame --id "feat-2" --parent "features-grid" --width 384 --height 240
forge style "feat-2" '{
  "backgroundColor": "#111113",
  "border": "1px solid #2A2A30",
  "borderRadius": "12px",
  "padding": "32px",
  "transition": "border-color 0.2s ease, transform 0.2s ease"
}'
forge set-layout "feat-2" --mode vertical --gap 12

forge insert frame --id "feat-2-icon" --parent "feat-2" --width 40 --height 40
forge style "feat-2-icon" '{
  "backgroundColor": "#1A1A1E",
  "borderRadius": "8px",
  "border": "1px solid #2A2A30"
}'

forge insert text --id "feat-2-title" --parent "feat-2" --content "Smart Comments"
forge style "feat-2-title" '{
  "fontFamily": "Instrument Sans", "fontWeight": "600", "fontSize": "18px", "color": "#EDEDEF"
}'

forge insert text --id "feat-2-desc" --parent "feat-2" \
  --content "Context-aware feedback posted inline. No more vague 'looks good to me'."
forge style "feat-2-desc" '{
  "fontFamily": "Geist", "fontWeight": "400", "fontSize": "15px", "color": "#8B8B96", "lineHeight": "1.5"
}'

# --- Card 3: CI/CD Integration ---
forge insert frame --id "feat-3" --parent "features-grid" --width 384 --height 240
forge style "feat-3" '{
  "backgroundColor": "#111113",
  "border": "1px solid #2A2A30",
  "borderRadius": "12px",
  "padding": "32px",
  "transition": "border-color 0.2s ease, transform 0.2s ease"
}'
forge set-layout "feat-3" --mode vertical --gap 12

forge insert frame --id "feat-3-icon" --parent "feat-3" --width 40 --height 40
forge style "feat-3-icon" '{
  "backgroundColor": "#1A1A1E",
  "borderRadius": "8px",
  "border": "1px solid #2A2A30"
}'

forge insert text --id "feat-3-title" --parent "feat-3" --content "CI/CD Integration"
forge style "feat-3-title" '{
  "fontFamily": "Instrument Sans", "fontWeight": "600", "fontSize": "18px", "color": "#EDEDEF"
}'

forge insert text --id "feat-3-desc" --parent "feat-3" \
  --content "Plugs into GitHub Actions, GitLab CI, and Buildkite. Zero config."
forge style "feat-3-desc" '{
  "fontFamily": "Geist", "fontWeight": "400", "fontSize": "15px", "color": "#8B8B96", "lineHeight": "1.5"
}'

# --- Card 4: Team Rules Engine ---
forge insert frame --id "feat-4" --parent "features-grid" --width 384 --height 240
forge style "feat-4" '{
  "backgroundColor": "#111113",
  "border": "1px solid #2A2A30",
  "borderRadius": "12px",
  "padding": "32px",
  "transition": "border-color 0.2s ease, transform 0.2s ease"
}'
forge set-layout "feat-4" --mode vertical --gap 12

forge insert frame --id "feat-4-icon" --parent "feat-4" --width 40 --height 40
forge style "feat-4-icon" '{
  "backgroundColor": "#1A1A1E",
  "borderRadius": "8px",
  "border": "1px solid #2A2A30"
}'

forge insert text --id "feat-4-title" --parent "feat-4" --content "Team Rules Engine"
forge style "feat-4-title" '{
  "fontFamily": "Instrument Sans", "fontWeight": "600", "fontSize": "18px", "color": "#EDEDEF"
}'

forge insert text --id "feat-4-desc" --parent "feat-4" \
  --content "Define custom rules in .devforge.yml. Enforce conventions automatically."
forge style "feat-4-desc" '{
  "fontFamily": "Geist", "fontWeight": "400", "fontSize": "15px", "color": "#8B8B96", "lineHeight": "1.5"
}'

# --- Card 5: Security Scanning ---
forge insert frame --id "feat-5" --parent "features-grid" --width 384 --height 240
forge style "feat-5" '{
  "backgroundColor": "#111113",
  "border": "1px solid #2A2A30",
  "borderRadius": "12px",
  "padding": "32px",
  "transition": "border-color 0.2s ease, transform 0.2s ease"
}'
forge set-layout "feat-5" --mode vertical --gap 12

forge insert frame --id "feat-5-icon" --parent "feat-5" --width 40 --height 40
forge style "feat-5-icon" '{
  "backgroundColor": "#1A1A1E",
  "borderRadius": "8px",
  "border": "1px solid #2A2A30"
}'

forge insert text --id "feat-5-title" --parent "feat-5" --content "Security Scanning"
forge style "feat-5-title" '{
  "fontFamily": "Instrument Sans", "fontWeight": "600", "fontSize": "18px", "color": "#EDEDEF"
}'

forge insert text --id "feat-5-desc" --parent "feat-5" \
  --content "Flags credential leaks, SQL injection patterns, and dependency vulnerabilities."
forge style "feat-5-desc" '{
  "fontFamily": "Geist", "fontWeight": "400", "fontSize": "15px", "color": "#8B8B96", "lineHeight": "1.5"
}'

# --- Card 6: Metrics Dashboard ---
forge insert frame --id "feat-6" --parent "features-grid" --width 384 --height 240
forge style "feat-6" '{
  "backgroundColor": "#111113",
  "border": "1px solid #2A2A30",
  "borderRadius": "12px",
  "padding": "32px",
  "transition": "border-color 0.2s ease, transform 0.2s ease"
}'
forge set-layout "feat-6" --mode vertical --gap 12

forge insert frame --id "feat-6-icon" --parent "feat-6" --width 40 --height 40
forge style "feat-6-icon" '{
  "backgroundColor": "#1A1A1E",
  "borderRadius": "8px",
  "border": "1px solid #2A2A30"
}'

forge insert text --id "feat-6-title" --parent "feat-6" --content "Metrics Dashboard"
forge style "feat-6-title" '{
  "fontFamily": "Instrument Sans", "fontWeight": "600", "fontSize": "18px", "color": "#EDEDEF"
}'

forge insert text --id "feat-6-desc" --parent "feat-6" \
  --content "Track review velocity, catch rates, and team bottlenecks over time."
forge style "feat-6-desc" '{
  "fontFamily": "Geist", "fontWeight": "400", "fontSize": "15px", "color": "#8B8B96", "lineHeight": "1.5"
}'
```

---

## Phase 5: Pricing Table

```bash
forge insert frame --id "pricing" --parent "page" --name "Pricing" \
  --width 1440 --height 800

forge style "pricing" '{
  "paddingTop": "120px",
  "paddingBottom": "120px",
  "paddingLeft": "80px",
  "paddingRight": "80px"
}'
forge set-layout "pricing" --mode vertical --align center --gap 48

# Section label
forge insert text --id "pricing-label" --parent "pricing" --content "PRICING"
forge style "pricing-label" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "12px",
  "color": "#6366F1", "letterSpacing": "0.1em"
}'

# Section heading
forge insert text --id "pricing-heading" --parent "pricing" \
  --content "Ship faster at any scale."
forge style "pricing-heading" '{
  "fontFamily": "Instrument Sans", "fontWeight": "600", "fontSize": "36px",
  "color": "#EDEDEF", "letterSpacing": "-0.02em", "textAlign": "center"
}'

# Pricing cards row
forge insert stack --id "pricing-row" --parent "pricing" \
  --direction horizontal --gap 24 --align stretch

# --- Starter Tier ---
forge insert frame --id "price-starter" --parent "pricing-row" --width 384 --height 480
forge style "price-starter" '{
  "backgroundColor": "#111113",
  "border": "1px solid #2A2A30",
  "borderRadius": "12px",
  "padding": "32px"
}'
forge set-layout "price-starter" --mode vertical --gap 16

forge insert text --id "price-starter-name" --parent "price-starter" --content "Starter"
forge style "price-starter-name" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "16px", "color": "#8B8B96"
}'

forge insert stack --id "price-starter-amount" --parent "price-starter" \
  --direction horizontal --gap 4 --align baseline

forge insert text --id "price-starter-dollar" --parent "price-starter-amount" --content "$0"
forge style "price-starter-dollar" '{
  "fontFamily": "Instrument Sans", "fontWeight": "700", "fontSize": "48px", "color": "#EDEDEF"
}'
forge insert text --id "price-starter-period" --parent "price-starter-amount" --content "/month"
forge style "price-starter-period" '{
  "fontFamily": "Geist", "fontSize": "16px", "color": "#5C5C66"
}'

forge insert frame --id "price-starter-divider" --parent "price-starter" --width 320 --height 1
forge style "price-starter-divider" '{ "backgroundColor": "#2A2A30" }'

# Features list
forge insert stack --id "price-starter-features" --parent "price-starter" \
  --direction vertical --gap 12

forge insert text --id "ps-f1" --parent "price-starter-features" --content "50 reviews / month"
forge style "ps-f1" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'
forge insert text --id "ps-f2" --parent "price-starter-features" --content "1 repository"
forge style "ps-f2" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'
forge insert text --id "ps-f3" --parent "price-starter-features" --content "GitHub integration"
forge style "ps-f3" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'
forge insert text --id "ps-f4" --parent "price-starter-features" --content "Community support"
forge style "ps-f4" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'

# CTA button
forge insert frame --id "price-starter-cta" --parent "price-starter" --width 320 --height 44
forge style "price-starter-cta" '{
  "backgroundColor": "transparent",
  "border": "1px solid #2A2A30",
  "borderRadius": "8px",
  "display": "flex",
  "alignItems": "center",
  "justifyContent": "center",
  "marginTop": "auto"
}'
forge insert text --id "price-starter-cta-text" --parent "price-starter-cta" --content "Get Started"
forge style "price-starter-cta-text" '{
  "fontFamily": "Geist", "fontWeight": "500", "fontSize": "15px", "color": "#8B8B96"
}'

# --- Pro Tier (highlighted) ---
forge insert frame --id "price-pro" --parent "pricing-row" --width 384 --height 480
forge style "price-pro" '{
  "backgroundColor": "#111113",
  "border": "2px solid #6366F1",
  "borderRadius": "12px",
  "padding": "32px",
  "position": "relative"
}'
forge set-layout "price-pro" --mode vertical --gap 16

# Popular badge
forge insert frame --id "price-pro-badge" --parent "price-pro" --width 120 --height 24
forge style "price-pro-badge" '{
  "backgroundColor": "#6366F1",
  "borderRadius": "4px",
  "display": "flex",
  "alignItems": "center",
  "justifyContent": "center",
  "position": "absolute",
  "top": "-12px",
  "right": "24px"
}'
forge insert text --id "price-pro-badge-text" --parent "price-pro-badge" --content "MOST POPULAR"
forge style "price-pro-badge-text" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "11px",
  "color": "#FFFFFF", "letterSpacing": "0.06em"
}'

forge insert text --id "price-pro-name" --parent "price-pro" --content "Pro"
forge style "price-pro-name" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "16px", "color": "#EDEDEF"
}'

forge insert stack --id "price-pro-amount" --parent "price-pro" \
  --direction horizontal --gap 4 --align baseline
forge insert text --id "price-pro-dollar" --parent "price-pro-amount" --content "$29"
forge style "price-pro-dollar" '{
  "fontFamily": "Instrument Sans", "fontWeight": "700", "fontSize": "48px", "color": "#EDEDEF"
}'
forge insert text --id "price-pro-period" --parent "price-pro-amount" --content "/month"
forge style "price-pro-period" '{
  "fontFamily": "Geist", "fontSize": "16px", "color": "#5C5C66"
}'

forge insert frame --id "price-pro-divider" --parent "price-pro" --width 320 --height 1
forge style "price-pro-divider" '{ "backgroundColor": "#2A2A30" }'

forge insert stack --id "price-pro-features" --parent "price-pro" --direction vertical --gap 12
forge insert text --id "pp-f1" --parent "price-pro-features" --content "Unlimited reviews"
forge style "pp-f1" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'
forge insert text --id "pp-f2" --parent "price-pro-features" --content "Unlimited repos"
forge style "pp-f2" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'
forge insert text --id "pp-f3" --parent "price-pro-features" --content "All integrations"
forge style "pp-f3" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'
forge insert text --id "pp-f4" --parent "price-pro-features" --content "Custom rules"
forge style "pp-f4" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'
forge insert text --id "pp-f5" --parent "price-pro-features" --content "Priority support"
forge style "pp-f5" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'

forge insert frame --id "price-pro-cta" --parent "price-pro" --width 320 --height 44
forge style "price-pro-cta" '{
  "backgroundColor": "#6366F1",
  "borderRadius": "8px",
  "display": "flex",
  "alignItems": "center",
  "justifyContent": "center",
  "marginTop": "auto"
}'
forge insert text --id "price-pro-cta-text" --parent "price-pro-cta" --content "Start Free Trial"
forge style "price-pro-cta-text" '{
  "fontFamily": "Geist", "fontWeight": "500", "fontSize": "15px", "color": "#FFFFFF"
}'

# --- Enterprise Tier ---
forge insert frame --id "price-ent" --parent "pricing-row" --width 384 --height 480
forge style "price-ent" '{
  "backgroundColor": "#111113",
  "border": "1px solid #2A2A30",
  "borderRadius": "12px",
  "padding": "32px"
}'
forge set-layout "price-ent" --mode vertical --gap 16

forge insert text --id "price-ent-name" --parent "price-ent" --content "Enterprise"
forge style "price-ent-name" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "16px", "color": "#8B8B96"
}'

forge insert stack --id "price-ent-amount" --parent "price-ent" \
  --direction horizontal --gap 4 --align baseline
forge insert text --id "price-ent-dollar" --parent "price-ent-amount" --content "Custom"
forge style "price-ent-dollar" '{
  "fontFamily": "Instrument Sans", "fontWeight": "700", "fontSize": "48px", "color": "#EDEDEF"
}'
forge insert text --id "price-ent-period" --parent "price-ent-amount" --content "per seat/month"
forge style "price-ent-period" '{
  "fontFamily": "Geist", "fontSize": "16px", "color": "#5C5C66"
}'

forge insert frame --id "price-ent-divider" --parent "price-ent" --width 320 --height 1
forge style "price-ent-divider" '{ "backgroundColor": "#2A2A30" }'

forge insert stack --id "price-ent-features" --parent "price-ent" --direction vertical --gap 12
forge insert text --id "pe-f1" --parent "price-ent-features" --content "Everything in Pro"
forge style "pe-f1" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'
forge insert text --id "pe-f2" --parent "price-ent-features" --content "SSO / SAML"
forge style "pe-f2" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'
forge insert text --id "pe-f3" --parent "price-ent-features" --content "Audit logs"
forge style "pe-f3" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'
forge insert text --id "pe-f4" --parent "price-ent-features" --content "SLA guarantee"
forge style "pe-f4" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'
forge insert text --id "pe-f5" --parent "price-ent-features" --content "Dedicated CSM"
forge style "pe-f5" '{ "fontFamily": "Geist", "fontSize": "15px", "color": "#8B8B96" }'

forge insert frame --id "price-ent-cta" --parent "price-ent" --width 320 --height 44
forge style "price-ent-cta" '{
  "backgroundColor": "transparent",
  "border": "1px solid #2A2A30",
  "borderRadius": "8px",
  "display": "flex",
  "alignItems": "center",
  "justifyContent": "center",
  "marginTop": "auto"
}'
forge insert text --id "price-ent-cta-text" --parent "price-ent-cta" --content "Contact Sales"
forge style "price-ent-cta-text" '{
  "fontFamily": "Geist", "fontWeight": "500", "fontSize": "15px", "color": "#8B8B96"
}'
```

---

## Phase 6: Footer

```bash
forge insert frame --id "footer" --parent "page" --name "Footer" \
  --width 1440 --height 280

forge style "footer" '{
  "borderTop": "1px solid #2A2A30",
  "paddingTop": "64px",
  "paddingBottom": "48px",
  "paddingLeft": "80px",
  "paddingRight": "80px"
}'
forge set-layout "footer" --mode vertical --gap 48

# Footer columns row
forge insert stack --id "footer-cols" --parent "footer" \
  --direction horizontal --gap 80 --align start

# Col 1: Brand
forge insert stack --id "footer-brand" --parent "footer-cols" \
  --direction vertical --gap 12 --width 300

forge insert text --id "footer-wordmark" --parent "footer-brand" --content "DevForge"
forge style "footer-wordmark" '{
  "fontFamily": "Instrument Sans", "fontWeight": "700", "fontSize": "18px",
  "color": "#EDEDEF", "letterSpacing": "-0.02em"
}'
forge insert text --id "footer-tagline" --parent "footer-brand" \
  --content "Code reviews on autopilot."
forge style "footer-tagline" '{
  "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66"
}'

# Col 2: Product
forge insert stack --id "footer-product" --parent "footer-cols" --direction vertical --gap 12

forge insert text --id "fp-label" --parent "footer-product" --content "Product"
forge style "fp-label" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "13px",
  "color": "#EDEDEF", "letterSpacing": "0.02em"
}'
forge insert text --id "fp-1" --parent "footer-product" --content "Features"
forge style "fp-1" '{ "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66" }'
forge insert text --id "fp-2" --parent "footer-product" --content "Pricing"
forge style "fp-2" '{ "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66" }'
forge insert text --id "fp-3" --parent "footer-product" --content "Changelog"
forge style "fp-3" '{ "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66" }'
forge insert text --id "fp-4" --parent "footer-product" --content "Docs"
forge style "fp-4" '{ "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66" }'

# Col 3: Company
forge insert stack --id "footer-company" --parent "footer-cols" --direction vertical --gap 12

forge insert text --id "fc-label" --parent "footer-company" --content "Company"
forge style "fc-label" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "13px",
  "color": "#EDEDEF", "letterSpacing": "0.02em"
}'
forge insert text --id "fc-1" --parent "footer-company" --content "About"
forge style "fc-1" '{ "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66" }'
forge insert text --id "fc-2" --parent "footer-company" --content "Blog"
forge style "fc-2" '{ "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66" }'
forge insert text --id "fc-3" --parent "footer-company" --content "Careers"
forge style "fc-3" '{ "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66" }'
forge insert text --id "fc-4" --parent "footer-company" --content "Contact"
forge style "fc-4" '{ "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66" }'

# Col 4: Legal
forge insert stack --id "footer-legal" --parent "footer-cols" --direction vertical --gap 12

forge insert text --id "fl-label" --parent "footer-legal" --content "Legal"
forge style "fl-label" '{
  "fontFamily": "Geist", "fontWeight": "600", "fontSize": "13px",
  "color": "#EDEDEF", "letterSpacing": "0.02em"
}'
forge insert text --id "fl-1" --parent "footer-legal" --content "Privacy"
forge style "fl-1" '{ "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66" }'
forge insert text --id "fl-2" --parent "footer-legal" --content "Terms"
forge style "fl-2" '{ "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66" }'
forge insert text --id "fl-3" --parent "footer-legal" --content "Security"
forge style "fl-3" '{ "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66" }'
forge insert text --id "fl-4" --parent "footer-legal" --content "Status"
forge style "fl-4" '{ "fontFamily": "Geist", "fontSize": "14px", "color": "#5C5C66" }'

# Bottom row: copyright + socials
forge insert stack --id "footer-bottom" --parent "footer" \
  --direction horizontal --justify space-between --align center

forge insert text --id "footer-copyright" --parent "footer-bottom" \
  --content "2026 DevForge, Inc."
forge style "footer-copyright" '{
  "fontFamily": "Geist", "fontSize": "13px", "color": "#5C5C66"
}'

forge insert stack --id "footer-socials" --parent "footer-bottom" \
  --direction horizontal --gap 20

forge insert text --id "social-gh" --parent "footer-socials" --content "GitHub"
forge style "social-gh" '{ "fontFamily": "Geist", "fontSize": "13px", "color": "#5C5C66" }'
forge insert text --id "social-x" --parent "footer-socials" --content "X"
forge style "social-x" '{ "fontFamily": "Geist", "fontSize": "13px", "color": "#5C5C66" }'
forge insert text --id "social-discord" --parent "footer-socials" --content "Discord"
forge style "social-discord" '{ "fontFamily": "Geist", "fontSize": "13px", "color": "#5C5C66" }'
```

---

## Phase 7: Final Screenshot and Publish

```bash
forge screenshot --id "page" --output "devforge-landing-full.png" --scale 2
forge screenshot --id "hero" --output "devforge-hero.png" --scale 2
forge screenshot --id "pricing" --output "devforge-pricing.png" --scale 2

forge publish --name "DevForge Landing Page"
```
