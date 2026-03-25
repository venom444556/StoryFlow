# Build Plan: DevForge Landing Page — Forge CLI Commands

Ordered sequence of `forge` commands to construct the DevForge landing page from scratch. Each section is built top-to-bottom, left-to-right. Commands reference the design system defined in `ddd.md`.

---

## Phase 0: Page Setup

```bash
# Set the root frame (artboard) for the full landing page
forge insert frame --name "DevForge-Landing" --width 1440 --height 5600
forge style "DevForge-Landing" '{"backgroundColor": "#0B0F19"}'
```

---

## Phase 1: Navigation Bar

```bash
# Nav container
forge insert frame --name "Nav" --parent "DevForge-Landing" --width 1440 --height 64
forge style "Nav" '{
  "backgroundColor": "#0B0F19",
  "borderBottom": "1px solid #1E293B",
  "position": "fixed",
  "top": 0,
  "zIndex": 100
}'
forge set-layout "Nav" '{"type": "horizontal", "align": "center", "justify": "space-between", "paddingX": 80}'

# Logo
forge insert text --name "Nav-Logo" --parent "Nav" --content ">_ DevForge"
forge style "Nav-Logo" '{
  "fontFamily": "JetBrains Mono, monospace",
  "fontSize": 18,
  "fontWeight": 700,
  "color": "#F1F5F9"
}'

# Nav links container
forge insert stack --name "Nav-Links" --parent "Nav" --direction "horizontal" --gap 32
forge insert text --name "Nav-Link-Features" --parent "Nav-Links" --content "Features"
forge style "Nav-Link-Features" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 500, "color": "#94A3B8"}'
forge insert text --name "Nav-Link-Pricing" --parent "Nav-Links" --content "Pricing"
forge style "Nav-Link-Pricing" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 500, "color": "#94A3B8"}'
forge insert text --name "Nav-Link-Docs" --parent "Nav-Links" --content "Docs"
forge style "Nav-Link-Docs" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 500, "color": "#94A3B8"}'

# Nav CTA
forge insert frame --name "Nav-CTA" --parent "Nav" --width 120 --height 36
forge style "Nav-CTA" '{
  "backgroundColor": "#10B981",
  "borderRadius": 8,
  "cursor": "pointer"
}'
forge set-layout "Nav-CTA" '{"type": "horizontal", "align": "center", "justify": "center"}'
forge insert text --name "Nav-CTA-Text" --parent "Nav-CTA" --content "Get Started"
forge style "Nav-CTA-Text" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 600, "color": "#FFFFFF"}'
```

---

## Phase 2: Hero Section

```bash
# Hero container
forge insert frame --name "Hero" --parent "DevForge-Landing" --width 1440 --height 800
forge move "Hero" '{"x": 0, "y": 64}'
forge style "Hero" '{"backgroundColor": "transparent"}'
forge set-layout "Hero" '{"type": "vertical", "align": "center", "justify": "center", "paddingTop": 120, "paddingBottom": 80}'

# Ambient glow (background element)
forge insert frame --name "Hero-Glow" --parent "Hero" --width 600 --height 400
forge move "Hero-Glow" '{"x": 420, "y": 0}'
forge style "Hero-Glow" '{
  "background": "radial-gradient(ellipse 600px 400px at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
  "position": "absolute",
  "pointerEvents": "none"
}'

# Headline
forge insert text --name "Hero-Headline" --parent "Hero" --content "Code reviews on autopilot."
forge style "Hero-Headline" '{
  "fontFamily": "Inter",
  "fontSize": 64,
  "fontWeight": 700,
  "color": "#F1F5F9",
  "letterSpacing": "-0.03em",
  "lineHeight": 1.1,
  "textAlign": "center"
}'

# Subheadline
forge insert text --name "Hero-Sub" --parent "Hero" --content "DevForge scans every pull request, catches bugs before humans do, and ships feedback in seconds. Not minutes."
forge style "Hero-Sub" '{
  "fontFamily": "Inter",
  "fontSize": 18,
  "fontWeight": 400,
  "color": "#94A3B8",
  "lineHeight": 1.6,
  "textAlign": "center",
  "maxWidth": 560,
  "marginTop": 24
}'

# CTA row
forge insert stack --name "Hero-CTAs" --parent "Hero" --direction "horizontal" --gap 16
forge move "Hero-CTAs" '{"marginTop": 40}'

# Primary CTA — Install CLI
forge insert frame --name "Hero-CTA-Primary" --parent "Hero-CTAs" --width 160 --height 44
forge style "Hero-CTA-Primary" '{"backgroundColor": "#10B981", "borderRadius": 8, "cursor": "pointer"}'
forge set-layout "Hero-CTA-Primary" '{"type": "horizontal", "align": "center", "justify": "center", "paddingX": 24}'
forge insert text --name "Hero-CTA-Primary-Text" --parent "Hero-CTA-Primary" --content "Install CLI"
forge style "Hero-CTA-Primary-Text" '{"fontFamily": "Inter", "fontSize": 16, "fontWeight": 600, "color": "#FFFFFF"}'

# Secondary CTA — npm install command
forge insert frame --name "Hero-CTA-Secondary" --parent "Hero-CTAs" --width 280 --height 44
forge style "Hero-CTA-Secondary" '{
  "backgroundColor": "#131927",
  "borderRadius": 8,
  "border": "1px solid #1E293B",
  "cursor": "pointer"
}'
forge set-layout "Hero-CTA-Secondary" '{"type": "horizontal", "align": "center", "justify": "center", "paddingX": 16, "gap": 8}'
forge insert text --name "Hero-CTA-Cmd" --parent "Hero-CTA-Secondary" --content "npm install -g devforge"
forge style "Hero-CTA-Cmd" '{"fontFamily": "JetBrains Mono", "fontSize": 14, "fontWeight": 500, "color": "#06B6D4"}'

# Terminal mockup (product screenshot area)
forge insert frame --name "Hero-Terminal" --parent "Hero" --width 800 --height 480
forge style "Hero-Terminal" '{
  "backgroundColor": "#131927",
  "borderRadius": 12,
  "border": "1px solid #1E293B",
  "boxShadow": "0 24px 48px rgba(0,0,0,0.3)",
  "marginTop": 48,
  "overflow": "hidden"
}'

# Terminal title bar
forge insert frame --name "Terminal-TitleBar" --parent "Hero-Terminal" --width 800 --height 40
forge style "Terminal-TitleBar" '{
  "backgroundColor": "#0B0F19",
  "borderBottom": "1px solid #1E293B"
}'
forge set-layout "Terminal-TitleBar" '{"type": "horizontal", "align": "center", "paddingX": 16, "gap": 8}'

# Traffic light dots
forge insert frame --name "Dot-Red" --parent "Terminal-TitleBar" --width 8 --height 8
forge style "Dot-Red" '{"backgroundColor": "#EF4444", "borderRadius": 4}'
forge insert frame --name "Dot-Amber" --parent "Terminal-TitleBar" --width 8 --height 8
forge style "Dot-Amber" '{"backgroundColor": "#F59E0B", "borderRadius": 4}'
forge insert frame --name "Dot-Green" --parent "Terminal-TitleBar" --width 8 --height 8
forge style "Dot-Green" '{"backgroundColor": "#10B981", "borderRadius": 4}'

# Terminal content area
forge insert frame --name "Terminal-Content" --parent "Hero-Terminal" --width 800 --height 440
forge style "Terminal-Content" '{"backgroundColor": "#131927"}'
forge set-layout "Terminal-Content" '{"type": "vertical", "paddingX": 24, "paddingY": 24, "gap": 4}'

# Terminal lines
forge insert text --name "Term-Line-1" --parent "Terminal-Content" --content "$ devforge review --pr 142"
forge style "Term-Line-1" '{"fontFamily": "JetBrains Mono", "fontSize": 14, "fontWeight": 500, "color": "#10B981"}'

forge insert text --name "Term-Line-2" --parent "Terminal-Content" --content ""
forge style "Term-Line-2" '{"height": 8}'

forge insert text --name "Term-Line-3" --parent "Terminal-Content" --content "  Scanning 14 files changed across 3 commits..."
forge style "Term-Line-3" '{"fontFamily": "JetBrains Mono", "fontSize": 14, "fontWeight": 500, "color": "#94A3B8"}'

forge insert text --name "Term-Line-4" --parent "Terminal-Content" --content "  Found 2 issues, 1 suggestion"
forge style "Term-Line-4" '{"fontFamily": "JetBrains Mono", "fontSize": 14, "fontWeight": 500, "color": "#F59E0B"}'

forge insert text --name "Term-Line-5" --parent "Terminal-Content" --content ""
forge style "Term-Line-5" '{"height": 8}'

forge insert text --name "Term-Line-6" --parent "Terminal-Content" --content "  ISSUE  src/auth.ts:47 — SQL injection via unsanitized input"
forge style "Term-Line-6" '{"fontFamily": "JetBrains Mono", "fontSize": 14, "fontWeight": 500, "color": "#EF4444"}'

forge insert text --name "Term-Line-7" --parent "Terminal-Content" --content "  ISSUE  src/api/users.ts:12 — Missing null check on response.data"
forge style "Term-Line-7" '{"fontFamily": "JetBrains Mono", "fontSize": 14, "fontWeight": 500, "color": "#EF4444"}'

forge insert text --name "Term-Line-8" --parent "Terminal-Content" --content "  SUGGESTION  src/utils.ts:89 — Consider extracting to shared helper"
forge style "Term-Line-8" '{"fontFamily": "JetBrains Mono", "fontSize": 14, "fontWeight": 500, "color": "#06B6D4"}'

forge insert text --name "Term-Line-9" --parent "Terminal-Content" --content ""
forge style "Term-Line-9" '{"height": 8}'

forge insert text --name "Term-Line-10" --parent "Terminal-Content" --content "  Review complete in 8.3s. Comment posted to PR #142."
forge style "Term-Line-10" '{"fontFamily": "JetBrains Mono", "fontSize": 14, "fontWeight": 500, "color": "#10B981"}'
```

---

## Phase 3: Social Proof Logos

```bash
# Social proof container
forge insert frame --name "SocialProof" --parent "DevForge-Landing" --width 1440 --height 140
forge move "SocialProof" '{"x": 0, "y": 864}'
forge style "SocialProof" '{
  "backgroundColor": "transparent",
  "borderTop": "1px solid #1E293B",
  "borderBottom": "1px solid #1E293B"
}'
forge set-layout "SocialProof" '{"type": "vertical", "align": "center", "justify": "center", "paddingY": 48}'

# Label
forge insert text --name "SocialProof-Label" --parent "SocialProof" --content "TRUSTED BY ENGINEERING TEAMS AT"
forge style "SocialProof-Label" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "fontWeight": 500,
  "color": "#64748B",
  "letterSpacing": "0.05em",
  "textAlign": "center"
}'

# Logos row
forge insert stack --name "SocialProof-Logos" --parent "SocialProof" --direction "horizontal" --gap 48
forge move "SocialProof-Logos" '{"marginTop": 24}'

# 6 logo placeholders (monochrome text placeholders representing company names)
forge insert frame --name "Logo-1" --parent "SocialProof-Logos" --width 120 --height 32
forge style "Logo-1" '{"backgroundColor": "transparent"}'
forge insert text --name "Logo-1-Text" --parent "Logo-1" --content "Acme Corp"
forge style "Logo-1-Text" '{"fontFamily": "Inter", "fontSize": 16, "fontWeight": 600, "color": "#64748B", "textAlign": "center"}'

forge insert frame --name "Logo-2" --parent "SocialProof-Logos" --width 120 --height 32
forge style "Logo-2" '{"backgroundColor": "transparent"}'
forge insert text --name "Logo-2-Text" --parent "Logo-2" --content "TechStart"
forge style "Logo-2-Text" '{"fontFamily": "Inter", "fontSize": 16, "fontWeight": 600, "color": "#64748B", "textAlign": "center"}'

forge insert frame --name "Logo-3" --parent "SocialProof-Logos" --width 120 --height 32
forge style "Logo-3" '{"backgroundColor": "transparent"}'
forge insert text --name "Logo-3-Text" --parent "Logo-3" --content "CloudBase"
forge style "Logo-3-Text" '{"fontFamily": "Inter", "fontSize": 16, "fontWeight": 600, "color": "#64748B", "textAlign": "center"}'

forge insert frame --name "Logo-4" --parent "SocialProof-Logos" --width 120 --height 32
forge style "Logo-4" '{"backgroundColor": "transparent"}'
forge insert text --name "Logo-4-Text" --parent "Logo-4" --content "DevStack"
forge style "Logo-4-Text" '{"fontFamily": "Inter", "fontSize": 16, "fontWeight": 600, "color": "#64748B", "textAlign": "center"}'

forge insert frame --name "Logo-5" --parent "SocialProof-Logos" --width 120 --height 32
forge style "Logo-5" '{"backgroundColor": "transparent"}'
forge insert text --name "Logo-5-Text" --parent "Logo-5" --content "Nexlayer"
forge style "Logo-5-Text" '{"fontFamily": "Inter", "fontSize": 16, "fontWeight": 600, "color": "#64748B", "textAlign": "center"}'

forge insert frame --name "Logo-6" --parent "SocialProof-Logos" --width 120 --height 32
forge style "Logo-6" '{"backgroundColor": "transparent"}'
forge insert text --name "Logo-6-Text" --parent "Logo-6" --content "Buildkit"
forge style "Logo-6-Text" '{"fontFamily": "Inter", "fontSize": 16, "fontWeight": 600, "color": "#64748B", "textAlign": "center"}'
```

---

## Phase 4: Features Grid

```bash
# Features section container
forge insert frame --name "Features" --parent "DevForge-Landing" --width 1440 --height 820
forge move "Features" '{"x": 0, "y": 1004}'
forge style "Features" '{"backgroundColor": "transparent"}'
forge set-layout "Features" '{"type": "vertical", "align": "center", "paddingTop": 120, "paddingBottom": 120, "paddingX": 120}'

# Section title
forge insert text --name "Features-Title" --parent "Features" --content "Why engineers choose DevForge"
forge style "Features-Title" '{
  "fontFamily": "Inter",
  "fontSize": 48,
  "fontWeight": 700,
  "color": "#F1F5F9",
  "letterSpacing": "-0.02em",
  "lineHeight": 1.15,
  "textAlign": "center"
}'

# Section subtitle
forge insert text --name "Features-Sub" --parent "Features" --content "Automated code review that actually understands your codebase."
forge style "Features-Sub" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#94A3B8",
  "textAlign": "center",
  "marginTop": 24
}'

# Features grid container (2 rows x 3 columns)
forge insert frame --name "Features-Grid" --parent "Features" --width 1200 --height 500
forge move "Features-Grid" '{"marginTop": 64}'
forge set-layout "Features-Grid" '{"type": "grid", "columns": 3, "gap": 24}'

# --- Card 1: Instant PR Analysis ---
forge insert frame --name "Feature-1" --parent "Features-Grid" --width 384 --height 220
forge style "Feature-1" '{
  "backgroundColor": "#131927",
  "borderRadius": 12,
  "border": "1px solid #1E293B",
  "padding": 24
}'
forge set-layout "Feature-1" '{"type": "vertical", "gap": 0}'

forge insert text --name "F1-Icon" --parent "Feature-1" --content "[scan]"
forge style "F1-Icon" '{"fontSize": 32, "color": "#10B981", "marginBottom": 16}'

forge insert text --name "F1-Title" --parent "Feature-1" --content "Instant PR Analysis"
forge style "F1-Title" '{"fontFamily": "Inter", "fontSize": 24, "fontWeight": 600, "color": "#F1F5F9"}'

forge insert text --name "F1-Desc" --parent "Feature-1" --content "Scans every pull request in under 10 seconds. Catches bugs, style violations, and security issues automatically."
forge style "F1-Desc" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8", "lineHeight": 1.5, "marginTop": 8}'

# --- Card 2: Context-Aware Reviews ---
forge insert frame --name "Feature-2" --parent "Features-Grid" --width 384 --height 220
forge style "Feature-2" '{
  "backgroundColor": "#131927",
  "borderRadius": 12,
  "border": "1px solid #1E293B",
  "padding": 24
}'
forge set-layout "Feature-2" '{"type": "vertical", "gap": 0}'

forge insert text --name "F2-Icon" --parent "Feature-2" --content "[git-branch]"
forge style "F2-Icon" '{"fontSize": 32, "color": "#10B981", "marginBottom": 16}'

forge insert text --name "F2-Title" --parent "Feature-2" --content "Context-Aware Reviews"
forge style "F2-Title" '{"fontFamily": "Inter", "fontSize": 24, "fontWeight": 600, "color": "#F1F5F9"}'

forge insert text --name "F2-Desc" --parent "Feature-2" --content "Understands your codebase structure, naming conventions, and team patterns. Reviews like a senior engineer."
forge style "F2-Desc" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8", "lineHeight": 1.5, "marginTop": 8}'

# --- Card 3: CLI-Native Workflow ---
forge insert frame --name "Feature-3" --parent "Features-Grid" --width 384 --height 220
forge style "Feature-3" '{
  "backgroundColor": "#131927",
  "borderRadius": 12,
  "border": "1px solid #1E293B",
  "padding": 24
}'
forge set-layout "Feature-3" '{"type": "vertical", "gap": 0}'

forge insert text --name "F3-Icon" --parent "Feature-3" --content "[terminal]"
forge style "F3-Icon" '{"fontSize": 32, "color": "#10B981", "marginBottom": 16}'

forge insert text --name "F3-Title" --parent "Feature-3" --content "CLI-Native Workflow"
forge style "F3-Title" '{"fontFamily": "Inter", "fontSize": 24, "fontWeight": 600, "color": "#F1F5F9"}'

forge insert text --name "F3-Desc" --parent "Feature-3" --content "Runs from your terminal. No browser tabs, no context switching. devforge review and done."
forge style "F3-Desc" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8", "lineHeight": 1.5, "marginTop": 8}'

# --- Card 4: Security Scanning ---
forge insert frame --name "Feature-4" --parent "Features-Grid" --width 384 --height 220
forge style "Feature-4" '{
  "backgroundColor": "#131927",
  "borderRadius": 12,
  "border": "1px solid #1E293B",
  "padding": 24
}'
forge set-layout "Feature-4" '{"type": "vertical", "gap": 0}'

forge insert text --name "F4-Icon" --parent "Feature-4" --content "[shield-check]"
forge style "F4-Icon" '{"fontSize": 32, "color": "#06B6D4", "marginBottom": 16}'

forge insert text --name "F4-Title" --parent "Feature-4" --content "Security Scanning"
forge style "F4-Title" '{"fontFamily": "Inter", "fontSize": 24, "fontWeight": 600, "color": "#F1F5F9"}'

forge insert text --name "F4-Desc" --parent "Feature-4" --content "Detects exposed secrets, SQL injection, XSS, and dependency vulnerabilities before they hit production."
forge style "F4-Desc" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8", "lineHeight": 1.5, "marginTop": 8}'

# --- Card 5: CI/CD Integration ---
forge insert frame --name "Feature-5" --parent "Features-Grid" --width 384 --height 220
forge style "Feature-5" '{
  "backgroundColor": "#131927",
  "borderRadius": 12,
  "border": "1px solid #1E293B",
  "padding": 24
}'
forge set-layout "Feature-5" '{"type": "vertical", "gap": 0}'

forge insert text --name "F5-Icon" --parent "Feature-5" --content "[zap]"
forge style "F5-Icon" '{"fontSize": 32, "color": "#06B6D4", "marginBottom": 16}'

forge insert text --name "F5-Title" --parent "Feature-5" --content "CI/CD Integration"
forge style "F5-Title" '{"fontFamily": "Inter", "fontSize": 24, "fontWeight": 600, "color": "#F1F5F9"}'

forge insert text --name "F5-Desc" --parent "Feature-5" --content "GitHub Actions, GitLab CI, Jenkins. One-line setup. Reviews run as part of your existing pipeline."
forge style "F5-Desc" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8", "lineHeight": 1.5, "marginTop": 8}'

# --- Card 6: Team Standards ---
forge insert frame --name "Feature-6" --parent "Features-Grid" --width 384 --height 220
forge style "Feature-6" '{
  "backgroundColor": "#131927",
  "borderRadius": 12,
  "border": "1px solid #1E293B",
  "padding": 24
}'
forge set-layout "Feature-6" '{"type": "vertical", "gap": 0}'

forge insert text --name "F6-Icon" --parent "Feature-6" --content "[users]"
forge style "F6-Icon" '{"fontSize": 32, "color": "#06B6D4", "marginBottom": 16}'

forge insert text --name "F6-Title" --parent "Feature-6" --content "Team Standards"
forge style "F6-Title" '{"fontFamily": "Inter", "fontSize": 24, "fontWeight": 600, "color": "#F1F5F9"}'

forge insert text --name "F6-Desc" --parent "Feature-6" --content "Define your team's rules in .devforge.yml. Every review enforces your standards consistently."
forge style "F6-Desc" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8", "lineHeight": 1.5, "marginTop": 8}'
```

---

## Phase 5: Pricing Table

```bash
# Pricing section container
forge insert frame --name "Pricing" --parent "DevForge-Landing" --width 1440 --height 900
forge move "Pricing" '{"x": 0, "y": 1824}'
forge style "Pricing" '{"backgroundColor": "transparent"}'
forge set-layout "Pricing" '{"type": "vertical", "align": "center", "paddingTop": 120, "paddingBottom": 120}'

# Section title
forge insert text --name "Pricing-Title" --parent "Pricing" --content "Simple, transparent pricing"
forge style "Pricing-Title" '{
  "fontFamily": "Inter",
  "fontSize": 48,
  "fontWeight": 700,
  "color": "#F1F5F9",
  "letterSpacing": "-0.02em",
  "textAlign": "center"
}'

# Section subtitle
forge insert text --name "Pricing-Sub" --parent "Pricing" --content "Start free. Scale when you're ready."
forge style "Pricing-Sub" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#94A3B8",
  "textAlign": "center",
  "marginTop": 16
}'

# Monthly/Annual toggle
forge insert frame --name "Pricing-Toggle" --parent "Pricing" --width 240 --height 40
forge move "Pricing-Toggle" '{"marginTop": 48}'
forge style "Pricing-Toggle" '{
  "backgroundColor": "#131927",
  "borderRadius": 8,
  "border": "1px solid #1E293B"
}'
forge set-layout "Pricing-Toggle" '{"type": "horizontal", "align": "center", "justify": "center", "gap": 0}'

forge insert frame --name "Toggle-Monthly" --parent "Pricing-Toggle" --width 120 --height 40
forge style "Toggle-Monthly" '{"backgroundColor": "#1A2236", "borderRadius": 8}'
forge set-layout "Toggle-Monthly" '{"type": "horizontal", "align": "center", "justify": "center"}'
forge insert text --name "Toggle-Monthly-Text" --parent "Toggle-Monthly" --content "Monthly"
forge style "Toggle-Monthly-Text" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 500, "color": "#F1F5F9"}'

forge insert frame --name "Toggle-Annual" --parent "Pricing-Toggle" --width 120 --height 40
forge style "Toggle-Annual" '{"backgroundColor": "transparent", "borderRadius": 8}'
forge set-layout "Toggle-Annual" '{"type": "horizontal", "align": "center", "justify": "center", "gap": 4}'
forge insert text --name "Toggle-Annual-Text" --parent "Toggle-Annual" --content "Annual"
forge style "Toggle-Annual-Text" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 500, "color": "#94A3B8"}'
forge insert text --name "Toggle-Save-Badge" --parent "Toggle-Annual" --content "Save 20%"
forge style "Toggle-Save-Badge" '{
  "fontFamily": "Inter",
  "fontSize": 10,
  "fontWeight": 600,
  "color": "#F59E0B",
  "backgroundColor": "rgba(245, 158, 11, 0.1)",
  "borderRadius": 4,
  "paddingX": 6,
  "paddingY": 2
}'

# Pricing cards row
forge insert stack --name "Pricing-Cards" --parent "Pricing" --direction "horizontal" --gap 24
forge move "Pricing-Cards" '{"marginTop": 48}'

# --- Starter Card ---
forge insert frame --name "Price-Starter" --parent "Pricing-Cards" --width 304 --height 520
forge style "Price-Starter" '{
  "backgroundColor": "#131927",
  "borderRadius": 12,
  "border": "1px solid #1E293B",
  "padding": 32
}'
forge set-layout "Price-Starter" '{"type": "vertical", "gap": 0}'

forge insert text --name "PS-Name" --parent "Price-Starter" --content "Starter"
forge style "PS-Name" '{"fontFamily": "Inter", "fontSize": 24, "fontWeight": 600, "color": "#F1F5F9"}'

forge insert stack --name "PS-Price-Row" --parent "Price-Starter" --direction "horizontal" --gap 4
forge move "PS-Price-Row" '{"marginTop": 16}'
forge insert text --name "PS-Price" --parent "PS-Price-Row" --content "$0"
forge style "PS-Price" '{"fontFamily": "Inter", "fontSize": 48, "fontWeight": 700, "color": "#F1F5F9"}'
forge insert text --name "PS-Period" --parent "PS-Price-Row" --content "/mo"
forge style "PS-Period" '{"fontFamily": "Inter", "fontSize": 16, "fontWeight": 400, "color": "#64748B", "alignSelf": "flex-end", "paddingBottom": 8}'

forge insert text --name "PS-Desc" --parent "Price-Starter" --content "For individual developers"
forge style "PS-Desc" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8", "marginTop": 8}'

# Divider
forge insert frame --name "PS-Divider" --parent "Price-Starter" --width 240 --height 1
forge style "PS-Divider" '{"backgroundColor": "#1E293B", "marginTop": 24, "marginBottom": 24}'

# Feature list
forge insert stack --name "PS-Features" --parent "Price-Starter" --direction "vertical" --gap 12
forge insert text --name "PS-F1" --parent "PS-Features" --content "  5 repositories"
forge style "PS-F1" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "PS-F2" --parent "PS-Features" --content "  100 reviews/month"
forge style "PS-F2" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "PS-F3" --parent "PS-Features" --content "  Basic rule engine"
forge style "PS-F3" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "PS-F4" --parent "PS-Features" --content "  Community support"
forge style "PS-F4" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'

# CTA
forge insert frame --name "PS-CTA" --parent "Price-Starter" --width 240 --height 44
forge move "PS-CTA" '{"marginTop": "auto"}'
forge style "PS-CTA" '{
  "backgroundColor": "transparent",
  "borderRadius": 8,
  "border": "1px solid #1E293B",
  "cursor": "pointer"
}'
forge set-layout "PS-CTA" '{"type": "horizontal", "align": "center", "justify": "center"}'
forge insert text --name "PS-CTA-Text" --parent "PS-CTA" --content "Get Started Free"
forge style "PS-CTA-Text" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 600, "color": "#F1F5F9"}'

# --- Pro Card (Recommended) ---
forge insert frame --name "Price-Pro" --parent "Pricing-Cards" --width 304 --height 540
forge style "Price-Pro" '{
  "backgroundColor": "#131927",
  "borderRadius": 12,
  "border": "1px solid #10B981",
  "boxShadow": "0 0 24px rgba(16, 185, 129, 0.1)",
  "padding": 32
}'
forge set-layout "Price-Pro" '{"type": "vertical", "gap": 0}'

# Popular badge
forge insert text --name "PP-Badge" --parent "Price-Pro" --content "MOST POPULAR"
forge style "PP-Badge" '{
  "fontFamily": "Inter",
  "fontSize": 10,
  "fontWeight": 700,
  "color": "#F59E0B",
  "letterSpacing": "0.05em",
  "backgroundColor": "rgba(245, 158, 11, 0.1)",
  "borderRadius": 4,
  "paddingX": 8,
  "paddingY": 4,
  "alignSelf": "flex-start",
  "marginBottom": 16
}'

forge insert text --name "PP-Name" --parent "Price-Pro" --content "Pro"
forge style "PP-Name" '{"fontFamily": "Inter", "fontSize": 24, "fontWeight": 600, "color": "#F1F5F9"}'

forge insert stack --name "PP-Price-Row" --parent "Price-Pro" --direction "horizontal" --gap 4
forge move "PP-Price-Row" '{"marginTop": 16}'
forge insert text --name "PP-Price" --parent "PP-Price-Row" --content "$29"
forge style "PP-Price" '{"fontFamily": "Inter", "fontSize": 48, "fontWeight": 700, "color": "#F1F5F9"}'
forge insert text --name "PP-Period" --parent "PP-Price-Row" --content "/mo"
forge style "PP-Period" '{"fontFamily": "Inter", "fontSize": 16, "fontWeight": 400, "color": "#64748B", "alignSelf": "flex-end", "paddingBottom": 8}'

forge insert text --name "PP-Desc" --parent "Price-Pro" --content "For professional teams"
forge style "PP-Desc" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8", "marginTop": 8}'

forge insert frame --name "PP-Divider" --parent "Price-Pro" --width 240 --height 1
forge style "PP-Divider" '{"backgroundColor": "#1E293B", "marginTop": 24, "marginBottom": 24}'

forge insert stack --name "PP-Features" --parent "Price-Pro" --direction "vertical" --gap 12
forge insert text --name "PP-F1" --parent "PP-Features" --content "  Unlimited repositories"
forge style "PP-F1" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "PP-F2" --parent "PP-Features" --content "  Unlimited reviews"
forge style "PP-F2" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "PP-F3" --parent "PP-Features" --content "  Custom rule engine"
forge style "PP-F3" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "PP-F4" --parent "PP-Features" --content "  Priority support"
forge style "PP-F4" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "PP-F5" --parent "PP-Features" --content "  Team analytics"
forge style "PP-F5" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'

forge insert frame --name "PP-CTA" --parent "Price-Pro" --width 240 --height 44
forge move "PP-CTA" '{"marginTop": "auto"}'
forge style "PP-CTA" '{
  "backgroundColor": "#10B981",
  "borderRadius": 8,
  "cursor": "pointer"
}'
forge set-layout "PP-CTA" '{"type": "horizontal", "align": "center", "justify": "center"}'
forge insert text --name "PP-CTA-Text" --parent "PP-CTA" --content "Start Pro Trial"
forge style "PP-CTA-Text" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 600, "color": "#FFFFFF"}'

# --- Enterprise Card ---
forge insert frame --name "Price-Enterprise" --parent "Pricing-Cards" --width 304 --height 520
forge style "Price-Enterprise" '{
  "backgroundColor": "#131927",
  "borderRadius": 12,
  "border": "1px solid #1E293B",
  "padding": 32
}'
forge set-layout "Price-Enterprise" '{"type": "vertical", "gap": 0}'

forge insert text --name "PE-Name" --parent "Price-Enterprise" --content "Enterprise"
forge style "PE-Name" '{"fontFamily": "Inter", "fontSize": 24, "fontWeight": 600, "color": "#F1F5F9"}'

forge insert text --name "PE-Price" --parent "Price-Enterprise" --content "Custom"
forge style "PE-Price" '{"fontFamily": "Inter", "fontSize": 48, "fontWeight": 700, "color": "#F1F5F9", "marginTop": 16}'

forge insert text --name "PE-Desc" --parent "Price-Enterprise" --content "For organizations at scale"
forge style "PE-Desc" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8", "marginTop": 8}'

forge insert frame --name "PE-Divider" --parent "Price-Enterprise" --width 240 --height 1
forge style "PE-Divider" '{"backgroundColor": "#1E293B", "marginTop": 24, "marginBottom": 24}'

forge insert stack --name "PE-Features" --parent "Price-Enterprise" --direction "vertical" --gap 12
forge insert text --name "PE-F1" --parent "PE-Features" --content "  Everything in Pro"
forge style "PE-F1" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "PE-F2" --parent "PE-Features" --content "  SSO / SAML"
forge style "PE-F2" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "PE-F3" --parent "PE-Features" --content "  Audit logs"
forge style "PE-F3" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "PE-F4" --parent "PE-Features" --content "  99.9% SLA"
forge style "PE-F4" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "PE-F5" --parent "PE-Features" --content "  On-premise option"
forge style "PE-F5" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "PE-F6" --parent "PE-Features" --content "  Dedicated support"
forge style "PE-F6" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'

forge insert frame --name "PE-CTA" --parent "Price-Enterprise" --width 240 --height 44
forge move "PE-CTA" '{"marginTop": "auto"}'
forge style "PE-CTA" '{
  "backgroundColor": "transparent",
  "borderRadius": 8,
  "border": "1px solid #1E293B",
  "cursor": "pointer"
}'
forge set-layout "PE-CTA" '{"type": "horizontal", "align": "center", "justify": "center"}'
forge insert text --name "PE-CTA-Text" --parent "PE-CTA" --content "Contact Sales"
forge style "PE-CTA-Text" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 600, "color": "#F1F5F9"}'
```

---

## Phase 6: Footer

```bash
# Footer container
forge insert frame --name "Footer" --parent "DevForge-Landing" --width 1440 --height 320
forge move "Footer" '{"x": 0, "y": 2724}'
forge style "Footer" '{
  "backgroundColor": "#0B0F19",
  "borderTop": "1px solid #1E293B"
}'
forge set-layout "Footer" '{"type": "vertical", "paddingTop": 64, "paddingBottom": 48, "paddingX": 120}'

# Footer columns row
forge insert stack --name "Footer-Cols" --parent "Footer" --direction "horizontal" --gap 80

# Column 1: Brand
forge insert stack --name "Footer-Brand" --parent "Footer-Cols" --direction "vertical" --gap 8
forge insert text --name "Footer-Logo" --parent "Footer-Brand" --content ">_ DevForge"
forge style "Footer-Logo" '{"fontFamily": "JetBrains Mono", "fontSize": 18, "fontWeight": 700, "color": "#F1F5F9"}'
forge insert text --name "Footer-Tagline" --parent "Footer-Brand" --content "Code reviews on autopilot."
forge style "Footer-Tagline" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#64748B"}'

# Column 2: Product
forge insert stack --name "Footer-Product" --parent "Footer-Cols" --direction "vertical" --gap 12
forge insert text --name "FP-Label" --parent "Footer-Product" --content "PRODUCT"
forge style "FP-Label" '{"fontFamily": "Inter", "fontSize": 12, "fontWeight": 500, "color": "#64748B", "letterSpacing": "0.05em"}'
forge insert text --name "FP-1" --parent "Footer-Product" --content "Features"
forge style "FP-1" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "FP-2" --parent "Footer-Product" --content "Pricing"
forge style "FP-2" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "FP-3" --parent "Footer-Product" --content "Docs"
forge style "FP-3" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "FP-4" --parent "Footer-Product" --content "Changelog"
forge style "FP-4" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'

# Column 3: Developers
forge insert stack --name "Footer-Dev" --parent "Footer-Cols" --direction "vertical" --gap 12
forge insert text --name "FD-Label" --parent "Footer-Dev" --content "DEVELOPERS"
forge style "FD-Label" '{"fontFamily": "Inter", "fontSize": 12, "fontWeight": 500, "color": "#64748B", "letterSpacing": "0.05em"}'
forge insert text --name "FD-1" --parent "Footer-Dev" --content "Documentation"
forge style "FD-1" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "FD-2" --parent "Footer-Dev" --content "API Reference"
forge style "FD-2" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "FD-3" --parent "Footer-Dev" --content "GitHub"
forge style "FD-3" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "FD-4" --parent "Footer-Dev" --content "Status"
forge style "FD-4" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'

# Column 4: Company
forge insert stack --name "Footer-Company" --parent "Footer-Cols" --direction "vertical" --gap 12
forge insert text --name "FC-Label" --parent "Footer-Company" --content "COMPANY"
forge style "FC-Label" '{"fontFamily": "Inter", "fontSize": 12, "fontWeight": 500, "color": "#64748B", "letterSpacing": "0.05em"}'
forge insert text --name "FC-1" --parent "Footer-Company" --content "About"
forge style "FC-1" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "FC-2" --parent "Footer-Company" --content "Blog"
forge style "FC-2" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "FC-3" --parent "Footer-Company" --content "Careers"
forge style "FC-3" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'
forge insert text --name "FC-4" --parent "Footer-Company" --content "Contact"
forge style "FC-4" '{"fontFamily": "Inter", "fontSize": 14, "fontWeight": 400, "color": "#94A3B8"}'

# Bottom bar
forge insert frame --name "Footer-Bottom" --parent "Footer" --width 1200 --height 40
forge move "Footer-Bottom" '{"marginTop": 32}'
forge style "Footer-Bottom" '{"borderTop": "1px solid #1E293B", "paddingTop": 24}'
forge set-layout "Footer-Bottom" '{"type": "horizontal", "align": "center", "justify": "space-between"}'

forge insert text --name "Footer-Copyright" --parent "Footer-Bottom" --content "(c) 2026 DevForge. All rights reserved."
forge style "Footer-Copyright" '{"fontFamily": "Inter", "fontSize": 12, "fontWeight": 500, "color": "#64748B"}'

# Social icons row
forge insert stack --name "Footer-Social" --parent "Footer-Bottom" --direction "horizontal" --gap 16
forge insert text --name "Social-GH" --parent "Footer-Social" --content "[github]"
forge style "Social-GH" '{"fontSize": 20, "color": "#64748B"}'
forge insert text --name "Social-X" --parent "Footer-Social" --content "[twitter]"
forge style "Social-X" '{"fontSize": 20, "color": "#64748B"}'
forge insert text --name "Social-Discord" --parent "Footer-Social" --content "[message-circle]"
forge style "Social-Discord" '{"fontSize": 20, "color": "#64748B"}'
```

---

## Phase 7: Final Review

```bash
# Take a screenshot to verify the complete page
forge screenshot "DevForge-Landing" --output "devforge-landing-v1.png"

# Publish when approved
forge publish "DevForge-Landing" --domain "devforge.dev"
```

---

## Command Summary

| Phase | Section | Commands | Key Decisions |
|-------|---------|----------|---------------|
| 0 | Page setup | 2 | 1440x5600 artboard, #0B0F19 base |
| 1 | Navigation | 12 | Fixed 64px bar, green CTA, monospace logo |
| 2 | Hero | 22 | 64px headline, terminal mockup with live CLI output |
| 3 | Social proof | 16 | 6 monochrome logo placeholders, bordered section |
| 4 | Features | 30 | 3x2 grid, green icons row 1, cyan icons row 2 |
| 5 | Pricing | 38 | 3 tiers, Pro highlighted with green border + glow |
| 6 | Footer | 28 | 4-column layout, social icons, copyright |
| 7 | Review | 2 | Screenshot + publish |
| **Total** | | **~150** | |
