# DevForge Landing Page -- Build Plan (forge CLI Command Sequence)

All commands assume a 1440x900 canvas. Coordinates are (x, y) from top-left. Sizes are (width, height). Colors reference the design plan tokens.

---

## Phase 1: Page Container & Background

```bash
# 1.1 — Root frame (full page, scrollable)
forge insert frame --name "Page" --x 0 --y 0 --w 1440 --h 4800
forge style "Page" '{"backgroundColor": "#0A0A0F", "overflow": "auto"}'
```

---

## Phase 2: Navbar

```bash
# 2.1 — Navbar container
forge insert frame --name "Navbar" --parent "Page" --x 0 --y 0 --w 1440 --h 64
forge style "Navbar" '{"backgroundColor": "rgba(10,10,15,0.8)", "backdropFilter": "blur(12px)", "borderBottom": "1px solid #1E1E2E", "position": "fixed", "zIndex": 100, "display": "flex", "alignItems": "center", "justifyContent": "space-between", "paddingLeft": "120px", "paddingRight": "120px"}'

# 2.2 — Wordmark
forge insert text --name "NavLogo" --parent "Navbar" --content "DevForge"
forge style "NavLogo" '{"fontFamily": "Inter", "fontWeight": 700, "fontSize": "18px", "color": "#F0F0F5"}'

# 2.3 — Nav links group
forge insert stack --name "NavLinks" --parent "Navbar" --direction "horizontal" --gap 32
forge style "NavLinks" '{"alignItems": "center"}'

forge insert text --name "NavLink1" --parent "NavLinks" --content "Features"
forge style "NavLink1" '{"fontFamily": "Inter", "fontWeight": 500, "fontSize": "14px", "color": "#8B8BA3"}'

forge insert text --name "NavLink2" --parent "NavLinks" --content "Pricing"
forge style "NavLink2" '{"fontFamily": "Inter", "fontWeight": 500, "fontSize": "14px", "color": "#8B8BA3"}'

forge insert text --name "NavLink3" --parent "NavLinks" --content "Docs"
forge style "NavLink3" '{"fontFamily": "Inter", "fontWeight": 500, "fontSize": "14px", "color": "#8B8BA3"}'

# 2.4 — Nav CTA button
forge insert frame --name "NavCTA" --parent "NavLinks"
forge style "NavCTA" '{"backgroundColor": "#6C5CE7", "borderRadius": "8px", "paddingTop": "8px", "paddingBottom": "8px", "paddingLeft": "16px", "paddingRight": "16px", "display": "flex", "alignItems": "center", "justifyContent": "center"}'

forge insert text --name "NavCTAText" --parent "NavCTA" --content "Get Started"
forge style "NavCTAText" '{"fontFamily": "Inter", "fontWeight": 500, "fontSize": "14px", "color": "#FFFFFF"}'
```

---

## Phase 3: Hero Section

```bash
# 3.1 — Hero container
forge insert frame --name "Hero" --parent "Page" --x 0 --y 64 --w 1440 --h 700
forge style "Hero" '{"backgroundColor": "transparent", "display": "flex", "flexDirection": "column", "alignItems": "center", "paddingTop": "96px"}'

# 3.2 — Headline
forge insert text --name "HeroHeadline" --parent "Hero" --content "Code reviews on autopilot."
forge style "HeroHeadline" '{"fontFamily": "Inter", "fontWeight": 700, "fontSize": "64px", "lineHeight": "1.1", "letterSpacing": "-0.03em", "color": "#F0F0F5", "textAlign": "center"}'

# 3.3 — Subheadline
forge insert text --name "HeroSub" --parent "Hero" --content "DevForge analyzes diffs, flags issues, and suggests fixes before your team even opens the PR."
forge style "HeroSub" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "20px", "lineHeight": "1.6", "color": "#8B8BA3", "textAlign": "center", "maxWidth": "600px", "marginTop": "24px"}'

# 3.4 — CTA button group
forge insert stack --name "HeroCTAs" --parent "Hero" --direction "horizontal" --gap 12
forge style "HeroCTAs" '{"marginTop": "32px", "alignItems": "center"}'

# 3.4a — Primary CTA
forge insert frame --name "HeroPrimaryCTA" --parent "HeroCTAs"
forge style "HeroPrimaryCTA" '{"backgroundColor": "#6C5CE7", "borderRadius": "10px", "paddingTop": "12px", "paddingBottom": "12px", "paddingLeft": "24px", "paddingRight": "24px", "display": "flex", "alignItems": "center", "justifyContent": "center"}'

forge insert text --name "HeroPrimaryCTAText" --parent "HeroPrimaryCTA" --content "Start Free"
forge style "HeroPrimaryCTAText" '{"fontFamily": "Inter", "fontWeight": 500, "fontSize": "15px", "color": "#FFFFFF"}'

# 3.4b — Secondary CTA
forge insert frame --name "HeroSecondaryCTA" --parent "HeroCTAs"
forge style "HeroSecondaryCTA" '{"backgroundColor": "transparent", "border": "1px solid #2A2A3C", "borderRadius": "10px", "paddingTop": "12px", "paddingBottom": "12px", "paddingLeft": "24px", "paddingRight": "24px", "display": "flex", "alignItems": "center", "justifyContent": "center"}'

forge insert text --name "HeroSecondaryCTAText" --parent "HeroSecondaryCTA" --content "View Docs"
forge style "HeroSecondaryCTAText" '{"fontFamily": "Inter", "fontWeight": 500, "fontSize": "15px", "color": "#8B8BA3"}'

# 3.5 — Terminal code snippet
forge insert frame --name "TerminalBlock" --parent "Hero"
forge style "TerminalBlock" '{"backgroundColor": "#12121A", "border": "1px solid #2A2A3C", "borderRadius": "12px", "padding": "24px", "marginTop": "32px", "width": "480px"}'

forge insert text --name "TerminalText" --parent "TerminalBlock" --content "$ forge review --pr 142"
forge style "TerminalText" '{"fontFamily": "JetBrains Mono", "fontWeight": 400, "fontSize": "14px", "lineHeight": "1.5", "color": "#8B8BA3"}'

# 3.6 — Product screenshot placeholder
forge insert frame --name "ScreenshotArea" --parent "Hero"
forge style "ScreenshotArea" '{"width": "800px", "height": "450px", "backgroundColor": "#12121A", "border": "1px solid #2A2A3C", "borderRadius": "12px", "marginTop": "48px", "boxShadow": "0 0 60px rgba(108, 92, 231, 0.15)"}'
```

---

## Phase 4: Social Proof Section

```bash
# 4.1 — Social proof container
forge insert frame --name "SocialProof" --parent "Page" --x 0 --y 764 --w 1440 --h 140
forge style "SocialProof" '{"display": "flex", "flexDirection": "column", "alignItems": "center", "paddingTop": "48px", "paddingBottom": "48px"}'

# 4.2 — Label
forge insert text --name "SocialLabel" --parent "SocialProof" --content "TRUSTED BY ENGINEERING TEAMS AT"
forge style "SocialLabel" '{"fontFamily": "Inter", "fontWeight": 500, "fontSize": "13px", "letterSpacing": "1.5px", "color": "#5C5C73", "textTransform": "uppercase"}'

# 4.3 — Logo row
forge insert stack --name "LogoRow" --parent "SocialProof" --direction "horizontal" --gap 48
forge style "LogoRow" '{"marginTop": "24px", "alignItems": "center", "opacity": 0.5}'

# 4.3a-e — Placeholder logo rectangles (5 logos)
forge insert frame --name "Logo1" --parent "LogoRow"
forge style "Logo1" '{"width": "120px", "height": "32px", "backgroundColor": "#5C5C73", "borderRadius": "4px"}'

forge insert frame --name "Logo2" --parent "LogoRow"
forge style "Logo2" '{"width": "120px", "height": "32px", "backgroundColor": "#5C5C73", "borderRadius": "4px"}'

forge insert frame --name "Logo3" --parent "LogoRow"
forge style "Logo3" '{"width": "120px", "height": "32px", "backgroundColor": "#5C5C73", "borderRadius": "4px"}'

forge insert frame --name "Logo4" --parent "LogoRow"
forge style "Logo4" '{"width": "120px", "height": "32px", "backgroundColor": "#5C5C73", "borderRadius": "4px"}'

forge insert frame --name "Logo5" --parent "LogoRow"
forge style "Logo5" '{"width": "120px", "height": "32px", "backgroundColor": "#5C5C73", "borderRadius": "4px"}'
```

---

## Phase 5: Features Grid

```bash
# 5.1 — Features section container
forge insert frame --name "Features" --parent "Page" --x 0 --y 904 --w 1440 --h 500
forge style "Features" '{"display": "flex", "flexDirection": "column", "alignItems": "center", "paddingTop": "96px", "paddingBottom": "96px"}'

# 5.2 — Section heading
forge insert text --name "FeaturesHeading" --parent "Features" --content "Built for how you actually ship code"
forge style "FeaturesHeading" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "36px", "lineHeight": "1.2", "letterSpacing": "-0.02em", "color": "#F0F0F5", "textAlign": "center"}'

# 5.3 — Features grid (3 columns)
forge insert stack --name "FeaturesGrid" --parent "Features" --direction "horizontal" --gap 16
forge style "FeaturesGrid" '{"marginTop": "48px", "paddingLeft": "120px", "paddingRight": "120px", "width": "100%"}'

# --- Feature Card 1: Instant PR Analysis ---
forge insert frame --name "FeatureCard1" --parent "FeaturesGrid"
forge style "FeatureCard1" '{"flex": 1, "backgroundColor": "#12121A", "border": "1px solid #2A2A3C", "borderRadius": "12px", "padding": "32px", "display": "flex", "flexDirection": "column"}'

forge insert frame --name "FeatureIcon1" --parent "FeatureCard1"
forge style "FeatureIcon1" '{"width": "40px", "height": "40px", "borderRadius": "20px", "backgroundColor": "rgba(108, 92, 231, 0.15)"}'

forge insert text --name "FeatureTitle1" --parent "FeatureCard1" --content "Instant PR Analysis"
forge style "FeatureTitle1" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "18px", "letterSpacing": "-0.01em", "color": "#F0F0F5", "marginTop": "12px"}'

forge insert text --name "FeatureDesc1" --parent "FeatureCard1" --content "Reviews every pull request in seconds. Catches bugs, style issues, and security risks automatically."
forge style "FeatureDesc1" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "lineHeight": "1.6", "color": "#8B8BA3", "marginTop": "8px"}'

# --- Feature Card 2: Context-Aware Feedback ---
forge insert frame --name "FeatureCard2" --parent "FeaturesGrid"
forge style "FeatureCard2" '{"flex": 1, "backgroundColor": "#12121A", "border": "1px solid #2A2A3C", "borderRadius": "12px", "padding": "32px", "display": "flex", "flexDirection": "column"}'

forge insert frame --name "FeatureIcon2" --parent "FeatureCard2"
forge style "FeatureIcon2" '{"width": "40px", "height": "40px", "borderRadius": "20px", "backgroundColor": "rgba(108, 92, 231, 0.15)"}'

forge insert text --name "FeatureTitle2" --parent "FeatureCard2" --content "Context-Aware Feedback"
forge style "FeatureTitle2" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "18px", "letterSpacing": "-0.01em", "color": "#F0F0F5", "marginTop": "12px"}'

forge insert text --name "FeatureDesc2" --parent "FeatureCard2" --content "Understands your codebase conventions and flags deviations, not just lint errors."
forge style "FeatureDesc2" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "lineHeight": "1.6", "color": "#8B8BA3", "marginTop": "8px"}'

# --- Feature Card 3: CI/CD Integration ---
forge insert frame --name "FeatureCard3" --parent "FeaturesGrid"
forge style "FeatureCard3" '{"flex": 1, "backgroundColor": "#12121A", "border": "1px solid #2A2A3C", "borderRadius": "12px", "padding": "32px", "display": "flex", "flexDirection": "column"}'

forge insert frame --name "FeatureIcon3" --parent "FeatureCard3"
forge style "FeatureIcon3" '{"width": "40px", "height": "40px", "borderRadius": "20px", "backgroundColor": "rgba(108, 92, 231, 0.15)"}'

forge insert text --name "FeatureTitle3" --parent "FeatureCard3" --content "CI/CD Integration"
forge style "FeatureTitle3" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "18px", "letterSpacing": "-0.01em", "color": "#F0F0F5", "marginTop": "12px"}'

forge insert text --name "FeatureDesc3" --parent "FeatureCard3" --content "Plugs into GitHub Actions, GitLab CI, and Jenkins with a single config line."
forge style "FeatureDesc3" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "lineHeight": "1.6", "color": "#8B8BA3", "marginTop": "8px"}'
```

---

## Phase 6: Pricing Table

```bash
# 6.1 — Pricing section container
forge insert frame --name "Pricing" --parent "Page" --x 0 --y 1404 --w 1440 --h 700
forge style "Pricing" '{"display": "flex", "flexDirection": "column", "alignItems": "center", "paddingTop": "96px", "paddingBottom": "96px"}'

# 6.2 — Section heading
forge insert text --name "PricingHeading" --parent "Pricing" --content "Simple, transparent pricing"
forge style "PricingHeading" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "36px", "lineHeight": "1.2", "letterSpacing": "-0.02em", "color": "#F0F0F5", "textAlign": "center"}'

forge insert text --name "PricingSub" --parent "Pricing" --content "Start free. Scale when you're ready."
forge style "PricingSub" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "16px", "color": "#8B8BA3", "textAlign": "center", "marginTop": "12px"}'

# 6.3 — Pricing grid
forge insert stack --name "PricingGrid" --parent "Pricing" --direction "horizontal" --gap 16
forge style "PricingGrid" '{"marginTop": "48px", "paddingLeft": "120px", "paddingRight": "120px", "width": "100%", "alignItems": "stretch"}'

# --- Tier 1: Starter (Free) ---
forge insert frame --name "TierStarter" --parent "PricingGrid"
forge style "TierStarter" '{"flex": 1, "backgroundColor": "#12121A", "border": "1px solid #2A2A3C", "borderRadius": "12px", "padding": "32px", "display": "flex", "flexDirection": "column"}'

forge insert text --name "TierStarterName" --parent "TierStarter" --content "Starter"
forge style "TierStarterName" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "22px", "letterSpacing": "-0.01em", "color": "#F0F0F5"}'

forge insert text --name "TierStarterPrice" --parent "TierStarter" --content "$0"
forge style "TierStarterPrice" '{"fontFamily": "Inter", "fontWeight": 700, "fontSize": "40px", "lineHeight": "1.1", "letterSpacing": "-0.02em", "color": "#F0F0F5", "marginTop": "16px"}'

forge insert text --name "TierStarterPeriod" --parent "TierStarter" --content "/month"
forge style "TierStarterPeriod" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#5C5C73", "marginTop": "4px"}'

# Starter features list
forge insert stack --name "TierStarterFeatures" --parent "TierStarter" --direction "vertical" --gap 10
forge style "TierStarterFeatures" '{"marginTop": "24px"}'

forge insert text --name "SF1" --parent "TierStarterFeatures" --content "5 repos"
forge style "SF1" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

forge insert text --name "SF2" --parent "TierStarterFeatures" --content "100 reviews/month"
forge style "SF2" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

forge insert text --name "SF3" --parent "TierStarterFeatures" --content "GitHub only"
forge style "SF3" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

forge insert text --name "SF4" --parent "TierStarterFeatures" --content "Community support"
forge style "SF4" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

# Starter CTA
forge insert frame --name "TierStarterCTA" --parent "TierStarter"
forge style "TierStarterCTA" '{"backgroundColor": "transparent", "border": "1px solid #2A2A3C", "borderRadius": "10px", "paddingTop": "12px", "paddingBottom": "12px", "display": "flex", "alignItems": "center", "justifyContent": "center", "marginTop": "auto"}'

forge insert text --name "TierStarterCTAText" --parent "TierStarterCTA" --content "Get Started"
forge style "TierStarterCTAText" '{"fontFamily": "Inter", "fontWeight": 500, "fontSize": "15px", "color": "#8B8BA3"}'

# --- Tier 2: Pro (Highlighted) ---
forge insert frame --name "TierPro" --parent "PricingGrid"
forge style "TierPro" '{"flex": 1, "backgroundColor": "#12121A", "border": "1px solid #6C5CE7", "borderRadius": "12px", "padding": "32px", "display": "flex", "flexDirection": "column", "boxShadow": "0 0 40px rgba(108, 92, 231, 0.1)", "position": "relative"}'

# Popular badge
forge insert frame --name "ProBadge" --parent "TierPro"
forge style "ProBadge" '{"backgroundColor": "#00D68F", "borderRadius": "6px", "paddingTop": "4px", "paddingBottom": "4px", "paddingLeft": "12px", "paddingRight": "12px", "position": "absolute", "top": "-12px", "right": "24px"}'

forge insert text --name "ProBadgeText" --parent "ProBadge" --content "Most Popular"
forge style "ProBadgeText" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "12px", "color": "#0A0A0F"}'

forge insert text --name "TierProName" --parent "TierPro" --content "Pro"
forge style "TierProName" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "22px", "letterSpacing": "-0.01em", "color": "#F0F0F5"}'

forge insert text --name "TierProPrice" --parent "TierPro" --content "$29"
forge style "TierProPrice" '{"fontFamily": "Inter", "fontWeight": 700, "fontSize": "40px", "lineHeight": "1.1", "letterSpacing": "-0.02em", "color": "#F0F0F5", "marginTop": "16px"}'

forge insert text --name "TierProPeriod" --parent "TierPro" --content "/month"
forge style "TierProPeriod" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#5C5C73", "marginTop": "4px"}'

# Pro features list
forge insert stack --name "TierProFeatures" --parent "TierPro" --direction "vertical" --gap 10
forge style "TierProFeatures" '{"marginTop": "24px"}'

forge insert text --name "PF1" --parent "TierProFeatures" --content "Unlimited repos"
forge style "PF1" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

forge insert text --name "PF2" --parent "TierProFeatures" --content "Unlimited reviews"
forge style "PF2" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

forge insert text --name "PF3" --parent "TierProFeatures" --content "GitHub + GitLab"
forge style "PF3" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

forge insert text --name "PF4" --parent "TierProFeatures" --content "Priority support"
forge style "PF4" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

forge insert text --name "PF5" --parent "TierProFeatures" --content "Custom rules"
forge style "PF5" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

# Pro CTA
forge insert frame --name "TierProCTA" --parent "TierPro"
forge style "TierProCTA" '{"backgroundColor": "#6C5CE7", "borderRadius": "10px", "paddingTop": "12px", "paddingBottom": "12px", "display": "flex", "alignItems": "center", "justifyContent": "center", "marginTop": "auto"}'

forge insert text --name "TierProCTAText" --parent "TierProCTA" --content "Start Free Trial"
forge style "TierProCTAText" '{"fontFamily": "Inter", "fontWeight": 500, "fontSize": "15px", "color": "#FFFFFF"}'

# --- Tier 3: Enterprise ---
forge insert frame --name "TierEnterprise" --parent "PricingGrid"
forge style "TierEnterprise" '{"flex": 1, "backgroundColor": "#12121A", "border": "1px solid #2A2A3C", "borderRadius": "12px", "padding": "32px", "display": "flex", "flexDirection": "column"}'

forge insert text --name "TierEntName" --parent "TierEnterprise" --content "Enterprise"
forge style "TierEntName" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "22px", "letterSpacing": "-0.01em", "color": "#F0F0F5"}'

forge insert text --name "TierEntPrice" --parent "TierEnterprise" --content "Custom"
forge style "TierEntPrice" '{"fontFamily": "Inter", "fontWeight": 700, "fontSize": "40px", "lineHeight": "1.1", "letterSpacing": "-0.02em", "color": "#F0F0F5", "marginTop": "16px"}'

forge insert text --name "TierEntPeriod" --parent "TierEnterprise" --content "contact us"
forge style "TierEntPeriod" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#5C5C73", "marginTop": "4px"}'

# Enterprise features list
forge insert stack --name "TierEntFeatures" --parent "TierEnterprise" --direction "vertical" --gap 10
forge style "TierEntFeatures" '{"marginTop": "24px"}'

forge insert text --name "EF1" --parent "TierEntFeatures" --content "Everything in Pro"
forge style "EF1" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

forge insert text --name "EF2" --parent "TierEntFeatures" --content "SSO / SAML"
forge style "EF2" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

forge insert text --name "EF3" --parent "TierEntFeatures" --content "Dedicated support"
forge style "EF3" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

forge insert text --name "EF4" --parent "TierEntFeatures" --content "SLA guarantee"
forge style "EF4" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

forge insert text --name "EF5" --parent "TierEntFeatures" --content "On-prem option"
forge style "EF5" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "15px", "color": "#8B8BA3"}'

# Enterprise CTA
forge insert frame --name "TierEntCTA" --parent "TierEnterprise"
forge style "TierEntCTA" '{"backgroundColor": "transparent", "border": "1px solid #2A2A3C", "borderRadius": "10px", "paddingTop": "12px", "paddingBottom": "12px", "display": "flex", "alignItems": "center", "justifyContent": "center", "marginTop": "auto"}'

forge insert text --name "TierEntCTAText" --parent "TierEntCTA" --content "Contact Sales"
forge style "TierEntCTAText" '{"fontFamily": "Inter", "fontWeight": 500, "fontSize": "15px", "color": "#8B8BA3"}'
```

---

## Phase 7: Footer

```bash
# 7.1 — Footer container
forge insert frame --name "Footer" --parent "Page" --x 0 --y 2104 --w 1440 --h 280
forge style "Footer" '{"borderTop": "1px solid #1E1E2E", "paddingTop": "48px", "paddingBottom": "32px", "paddingLeft": "120px", "paddingRight": "120px", "display": "flex", "flexDirection": "column"}'

# 7.2 — Footer link columns
forge insert stack --name "FooterColumns" --parent "Footer" --direction "horizontal" --gap 64
forge style "FooterColumns" '{"width": "100%"}'

# --- Column 1: Product ---
forge insert stack --name "FooterCol1" --parent "FooterColumns" --direction "vertical" --gap 8
forge insert text --name "FC1Header" --parent "FooterCol1" --content "PRODUCT"
forge style "FC1Header" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "13px", "letterSpacing": "1.5px", "color": "#5C5C73"}'

forge insert text --name "FC1L1" --parent "FooterCol1" --content "Features"
forge style "FC1L1" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "14px", "color": "#8B8BA3"}'
forge insert text --name "FC1L2" --parent "FooterCol1" --content "Pricing"
forge style "FC1L2" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "14px", "color": "#8B8BA3"}'
forge insert text --name "FC1L3" --parent "FooterCol1" --content "Changelog"
forge style "FC1L3" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "14px", "color": "#8B8BA3"}'

# --- Column 2: Resources ---
forge insert stack --name "FooterCol2" --parent "FooterColumns" --direction "vertical" --gap 8
forge insert text --name "FC2Header" --parent "FooterCol2" --content "RESOURCES"
forge style "FC2Header" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "13px", "letterSpacing": "1.5px", "color": "#5C5C73"}'

forge insert text --name "FC2L1" --parent "FooterCol2" --content "Documentation"
forge style "FC2L1" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "14px", "color": "#8B8BA3"}'
forge insert text --name "FC2L2" --parent "FooterCol2" --content "API Reference"
forge style "FC2L2" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "14px", "color": "#8B8BA3"}'
forge insert text --name "FC2L3" --parent "FooterCol2" --content "Blog"
forge style "FC2L3" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "14px", "color": "#8B8BA3"}'

# --- Column 3: Company ---
forge insert stack --name "FooterCol3" --parent "FooterColumns" --direction "vertical" --gap 8
forge insert text --name "FC3Header" --parent "FooterCol3" --content "COMPANY"
forge style "FC3Header" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "13px", "letterSpacing": "1.5px", "color": "#5C5C73"}'

forge insert text --name "FC3L1" --parent "FooterCol3" --content "About"
forge style "FC3L1" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "14px", "color": "#8B8BA3"}'
forge insert text --name "FC3L2" --parent "FooterCol3" --content "Careers"
forge style "FC3L2" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "14px", "color": "#8B8BA3"}'
forge insert text --name "FC3L3" --parent "FooterCol3" --content "Contact"
forge style "FC3L3" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "14px", "color": "#8B8BA3"}'

# --- Column 4: Legal ---
forge insert stack --name "FooterCol4" --parent "FooterColumns" --direction "vertical" --gap 8
forge insert text --name "FC4Header" --parent "FooterCol4" --content "LEGAL"
forge style "FC4Header" '{"fontFamily": "Inter", "fontWeight": 600, "fontSize": "13px", "letterSpacing": "1.5px", "color": "#5C5C73"}'

forge insert text --name "FC4L1" --parent "FooterCol4" --content "Privacy"
forge style "FC4L1" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "14px", "color": "#8B8BA3"}'
forge insert text --name "FC4L2" --parent "FooterCol4" --content "Terms"
forge style "FC4L2" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "14px", "color": "#8B8BA3"}'

# 7.3 — Copyright line
forge insert text --name "Copyright" --parent "Footer" --content "2026 DevForge. All rights reserved."
forge style "Copyright" '{"fontFamily": "Inter", "fontWeight": 400, "fontSize": "13px", "color": "#5C5C73", "textAlign": "center", "marginTop": "48px"}'
```

---

## Phase 8: Final Screenshot

```bash
forge screenshot --name "devforge-landing-full" --format "png"
```

---

## Command Summary

| Phase           | Commands | Elements Created |
|-----------------|----------|------------------|
| Page container  | 2        | 1 frame          |
| Navbar          | 10       | 5 elements       |
| Hero            | 14       | 7 elements       |
| Social proof    | 14       | 8 elements       |
| Features grid   | 18       | 13 elements      |
| Pricing table   | 42       | 27 elements      |
| Footer          | 26       | 19 elements      |
| Screenshot      | 1        | --               |
| **Total**       | **127**  | **80 elements**  |
