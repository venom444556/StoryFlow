# Build Plan: Forge CLI Commands

Ordered sequence of `forge` commands to construct the Mika Chen dark portfolio. Each section is built bottom-up (container first, then children), styled, then positioned.

---

## Phase 0: Page Setup

```bash
# Root frame -- full page canvas
forge insert frame --id "page" --width 1440 --height 5200
forge style "page" '{"backgroundColor": "#0A0A0A", "overflow": "hidden"}'

# Noise texture overlay (full page)
forge insert frame --id "noise-overlay" --parent "page" --width 1440 --height 5200
forge style "noise-overlay" '{
  "backgroundImage": "url(data:image/svg+xml;base64,...)",
  "opacity": 0.02,
  "pointerEvents": "none",
  "position": "absolute",
  "top": 0,
  "left": 0,
  "zIndex": 999
}'
```

---

## Phase 1: Navigation Bar

```bash
# Nav container
forge insert frame --id "nav" --parent "page" --width 1440 --height 64
forge style "nav" '{
  "backgroundColor": "rgba(10,10,10,0.8)",
  "backdropFilter": "blur(16px)",
  "borderBottom": "1px solid #1F1F1F",
  "position": "fixed",
  "top": 0,
  "zIndex": 100,
  "display": "flex",
  "alignItems": "center",
  "justifyContent": "space-between",
  "paddingLeft": "64px",
  "paddingRight": "64px"
}'

# Logo / Name
forge insert text --id "nav-name" --parent "nav" --content "MIKA CHEN"
forge style "nav-name" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "14px",
  "letterSpacing": "0.08em",
  "color": "#888888"
}'

# Nav links container
forge insert stack --id "nav-links" --parent "nav" --direction "horizontal" --gap 32
forge move "nav-links" --align "center-right"

# Nav link items
forge insert text --id "nav-work" --parent "nav-links" --content "WORK"
forge style "nav-work" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "14px",
  "letterSpacing": "0.08em",
  "color": "#888888"
}'

forge insert text --id "nav-about" --parent "nav-links" --content "ABOUT"
forge style "nav-about" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "14px",
  "letterSpacing": "0.08em",
  "color": "#888888"
}'

forge insert text --id "nav-contact" --parent "nav-links" --content "CONTACT"
forge style "nav-contact" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "14px",
  "letterSpacing": "0.08em",
  "color": "#888888"
}'

# Availability indicator
forge insert stack --id "nav-availability" --parent "nav-links" --direction "horizontal" --gap 8
forge insert frame --id "avail-dot" --parent "nav-availability" --width 8 --height 8
forge style "avail-dot" '{
  "backgroundColor": "#C8FF00",
  "borderRadius": "50%",
  "boxShadow": "0 0 8px rgba(200,255,0,0.4)"
}'
forge insert text --id "avail-text" --parent "nav-availability" --content "AVAILABLE Q3"
forge style "avail-text" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555"
}'
```

---

## Phase 2: Hero Section

```bash
# Hero container -- full viewport height minus nav
forge insert frame --id "hero" --parent "page" --width 1440 --height 900
forge style "hero" '{
  "display": "flex",
  "flexDirection": "column",
  "justifyContent": "center",
  "paddingLeft": "128px",
  "paddingTop": "64px"
}'
forge move "hero" --y 64

# Hero heading line 1
forge insert text --id "hero-line1" --parent "hero" --content "Product"
forge style "hero-line1" '{
  "fontFamily": "Instrument Serif, serif",
  "fontWeight": 400,
  "fontSize": "96px",
  "lineHeight": 0.95,
  "letterSpacing": "-0.03em",
  "color": "#EDEDED"
}'

# Hero heading line 2
forge insert text --id "hero-line2" --parent "hero" --content "Designer"
forge style "hero-line2" '{
  "fontFamily": "Instrument Serif, serif",
  "fontWeight": 400,
  "fontSize": "96px",
  "lineHeight": 0.95,
  "letterSpacing": "-0.03em",
  "color": "#EDEDED",
  "marginTop": "8px"
}'

# Hero subtitle
forge insert text --id "hero-subtitle" --parent "hero" --content "Crafting interfaces for SaaS products that feel inevitable."
forge style "hero-subtitle" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 400,
  "fontSize": "20px",
  "lineHeight": 1.6,
  "color": "#888888",
  "maxWidth": "480px",
  "marginTop": "32px"
}'

# Hero CTA link
forge insert stack --id "hero-cta" --parent "hero" --direction "horizontal" --gap 8
forge style "hero-cta" '{
  "marginTop": "48px",
  "cursor": "pointer"
}'
forge insert text --id "hero-cta-text" --parent "hero-cta" --content "See selected work"
forge style "hero-cta-text" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "14px",
  "color": "#888888",
  "transition": "color 200ms ease"
}'
forge insert text --id "hero-cta-arrow" --parent "hero-cta" --content "\u2192"
forge style "hero-cta-arrow" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontSize": "14px",
  "color": "#888888",
  "transition": "transform 200ms ease, color 200ms ease"
}'
```

---

## Phase 3: Selected Work Section

```bash
# Section container
forge insert frame --id "work-section" --parent "page" --width 1440 --height "auto"
forge style "work-section" '{
  "paddingLeft": "128px",
  "paddingRight": "128px",
  "paddingTop": "96px"
}'
forge move "work-section" --y 964

# Section label
forge insert text --id "work-label" --parent "work-section" --content "SELECTED WORK"
forge style "work-label" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555",
  "marginBottom": "48px"
}'

# 2-column grid
forge insert stack --id "work-grid" --parent "work-section" --direction "horizontal" --gap 24 --wrap true
forge set-layout "work-grid" --columns 2 --column-gap 24 --row-gap 24

# --- Card 1: Meridian ---
forge insert frame --id "card-1" --parent "work-grid" --width 580 --height "auto"
forge style "card-1" '{
  "backgroundColor": "#111111",
  "border": "1px solid #1F1F1F",
  "borderRadius": "12px",
  "overflow": "hidden",
  "transition": "border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
  "cursor": "pointer"
}'

# Card 1 image placeholder
forge insert frame --id "card-1-img" --parent "card-1" --width 580 --height 435
forge style "card-1-img" '{
  "background": "radial-gradient(ellipse at center, #1A1A1A 0%, #111111 100%)"
}'

# Card 1 content area
forge insert stack --id "card-1-content" --parent "card-1" --direction "vertical" --gap 8
forge style "card-1-content" '{"padding": "24px"}'

forge insert text --id "card-1-title" --parent "card-1-content" --content "Meridian"
forge style "card-1-title" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 700,
  "fontSize": "20px",
  "color": "#EDEDED",
  "lineHeight": 1.3
}'

forge insert text --id "card-1-client" --parent "card-1-content" --content "Fintech SaaS"
forge style "card-1-client" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555"
}'

# Card 1 tags
forge insert stack --id "card-1-tags" --parent "card-1-content" --direction "horizontal" --gap 8
forge style "card-1-tags" '{"marginTop": "8px"}'

forge insert text --id "card-1-tag1" --parent "card-1-tags" --content "Product Design"
forge style "card-1-tag1" '{
  "fontFamily": "JetBrains Mono, monospace",
  "fontSize": "12px",
  "color": "#888888",
  "backgroundColor": "#1A1A1A",
  "padding": "4px 10px",
  "borderRadius": "4px"
}'

forge insert text --id "card-1-tag2" --parent "card-1-tags" --content "Design System"
forge style "card-1-tag2" '{
  "fontFamily": "JetBrains Mono, monospace",
  "fontSize": "12px",
  "color": "#888888",
  "backgroundColor": "#1A1A1A",
  "padding": "4px 10px",
  "borderRadius": "4px"
}'

# --- Card 2: Canopy ---
forge insert frame --id "card-2" --parent "work-grid" --width 580 --height "auto"
forge style "card-2" '{
  "backgroundColor": "#111111",
  "border": "1px solid #1F1F1F",
  "borderRadius": "12px",
  "overflow": "hidden",
  "transition": "border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
  "cursor": "pointer"
}'

forge insert frame --id "card-2-img" --parent "card-2" --width 580 --height 435
forge style "card-2-img" '{
  "background": "radial-gradient(ellipse at center, #1A1A1A 0%, #111111 100%)"
}'

forge insert stack --id "card-2-content" --parent "card-2" --direction "vertical" --gap 8
forge style "card-2-content" '{"padding": "24px"}'

forge insert text --id "card-2-title" --parent "card-2-content" --content "Canopy"
forge style "card-2-title" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 700,
  "fontSize": "20px",
  "color": "#EDEDED",
  "lineHeight": 1.3
}'

forge insert text --id "card-2-client" --parent "card-2-content" --content "HR Platform"
forge style "card-2-client" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555"
}'

forge insert stack --id "card-2-tags" --parent "card-2-content" --direction "horizontal" --gap 8
forge style "card-2-tags" '{"marginTop": "8px"}'

forge insert text --id "card-2-tag1" --parent "card-2-tags" --content "UX Research"
forge style "card-2-tag1" '{
  "fontFamily": "JetBrains Mono, monospace",
  "fontSize": "12px",
  "color": "#888888",
  "backgroundColor": "#1A1A1A",
  "padding": "4px 10px",
  "borderRadius": "4px"
}'

forge insert text --id "card-2-tag2" --parent "card-2-tags" --content "Product Design"
forge style "card-2-tag2" '{
  "fontFamily": "JetBrains Mono, monospace",
  "fontSize": "12px",
  "color": "#888888",
  "backgroundColor": "#1A1A1A",
  "padding": "4px 10px",
  "borderRadius": "4px"
}'

# --- Card 3: Lumen ---
forge insert frame --id "card-3" --parent "work-grid" --width 580 --height "auto"
forge style "card-3" '{
  "backgroundColor": "#111111",
  "border": "1px solid #1F1F1F",
  "borderRadius": "12px",
  "overflow": "hidden",
  "transition": "border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
  "cursor": "pointer"
}'

forge insert frame --id "card-3-img" --parent "card-3" --width 580 --height 435
forge style "card-3-img" '{
  "background": "radial-gradient(ellipse at center, #1A1A1A 0%, #111111 100%)"
}'

forge insert stack --id "card-3-content" --parent "card-3" --direction "vertical" --gap 8
forge style "card-3-content" '{"padding": "24px"}'

forge insert text --id "card-3-title" --parent "card-3-content" --content "Lumen"
forge style "card-3-title" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 700,
  "fontSize": "20px",
  "color": "#EDEDED",
  "lineHeight": 1.3
}'

forge insert text --id "card-3-client" --parent "card-3-content" --content "Analytics Tool"
forge style "card-3-client" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555"
}'

forge insert stack --id "card-3-tags" --parent "card-3-content" --direction "horizontal" --gap 8
forge style "card-3-tags" '{"marginTop": "8px"}'

forge insert text --id "card-3-tag1" --parent "card-3-tags" --content "Data Visualization"
forge style "card-3-tag1" '{
  "fontFamily": "JetBrains Mono, monospace",
  "fontSize": "12px",
  "color": "#888888",
  "backgroundColor": "#1A1A1A",
  "padding": "4px 10px",
  "borderRadius": "4px"
}'

forge insert text --id "card-3-tag2" --parent "card-3-tags" --content "UI Design"
forge style "card-3-tag2" '{
  "fontFamily": "JetBrains Mono, monospace",
  "fontSize": "12px",
  "color": "#888888",
  "backgroundColor": "#1A1A1A",
  "padding": "4px 10px",
  "borderRadius": "4px"
}'

# --- Card 4: Radius ---
forge insert frame --id "card-4" --parent "work-grid" --width 580 --height "auto"
forge style "card-4" '{
  "backgroundColor": "#111111",
  "border": "1px solid #1F1F1F",
  "borderRadius": "12px",
  "overflow": "hidden",
  "transition": "border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
  "cursor": "pointer"
}'

forge insert frame --id "card-4-img" --parent "card-4" --width 580 --height 435
forge style "card-4-img" '{
  "background": "radial-gradient(ellipse at center, #1A1A1A 0%, #111111 100%)"
}'

forge insert stack --id "card-4-content" --parent "card-4" --direction "vertical" --gap 8
forge style "card-4-content" '{"padding": "24px"}'

forge insert text --id "card-4-title" --parent "card-4-content" --content "Radius"
forge style "card-4-title" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 700,
  "fontSize": "20px",
  "color": "#EDEDED",
  "lineHeight": 1.3
}'

forge insert text --id "card-4-client" --parent "card-4-content" --content "Dev Tools"
forge style "card-4-client" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555"
}'

forge insert stack --id "card-4-tags" --parent "card-4-content" --direction "horizontal" --gap 8
forge style "card-4-tags" '{"marginTop": "8px"}'

forge insert text --id "card-4-tag1" --parent "card-4-tags" --content "Design System"
forge style "card-4-tag1" '{
  "fontFamily": "JetBrains Mono, monospace",
  "fontSize": "12px",
  "color": "#888888",
  "backgroundColor": "#1A1A1A",
  "padding": "4px 10px",
  "borderRadius": "4px"
}'

forge insert text --id "card-4-tag2" --parent "card-4-tags" --content "Interaction Design"
forge style "card-4-tag2" '{
  "fontFamily": "JetBrains Mono, monospace",
  "fontSize": "12px",
  "color": "#888888",
  "backgroundColor": "#1A1A1A",
  "padding": "4px 10px",
  "borderRadius": "4px"
}'
```

---

## Phase 4: About Section

```bash
# About container
forge insert frame --id "about-section" --parent "page" --width 1440 --height "auto"
forge style "about-section" '{
  "paddingLeft": "128px",
  "paddingRight": "128px",
  "paddingTop": "96px",
  "display": "flex",
  "gap": "64px"
}'
forge move "about-section" --y 2200

# Photo placeholder (left column)
forge insert frame --id "about-photo" --parent "about-section" --width 400 --height 533
forge style "about-photo" '{
  "backgroundColor": "#111111",
  "borderRadius": "12px",
  "border": "1px solid #1F1F1F",
  "background": "radial-gradient(ellipse at center, #1A1A1A 0%, #111111 100%)",
  "flexShrink": 0
}'

# Text column (right)
forge insert stack --id "about-text" --parent "about-section" --direction "vertical" --gap 24

# About heading
forge insert text --id "about-heading" --parent "about-text" --content "Designing products people actually want to use."
forge style "about-heading" '{
  "fontFamily": "Instrument Serif, serif",
  "fontWeight": 400,
  "fontSize": "48px",
  "lineHeight": 1.1,
  "letterSpacing": "-0.02em",
  "color": "#EDEDED",
  "maxWidth": "600px"
}'

# About body
forge insert text --id "about-body" --parent "about-text" --content "I partner with SaaS companies to design products that balance business goals with genuine user needs. My process is collaborative, evidence-based, and focused on shipping work that performs -- not just looks good in a portfolio."
forge style "about-body" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 400,
  "fontSize": "16px",
  "lineHeight": 1.6,
  "color": "#888888",
  "maxWidth": "520px"
}'

# Stats row
forge insert stack --id "about-stats" --parent "about-text" --direction "horizontal" --gap 48
forge style "about-stats" '{"marginTop": "24px"}'

# Stat 1
forge insert stack --id "stat-1" --parent "about-stats" --direction "vertical" --gap 4
forge insert text --id "stat-1-num" --parent "stat-1" --content "8+"
forge style "stat-1-num" '{
  "fontFamily": "Instrument Serif, serif",
  "fontSize": "32px",
  "color": "#EDEDED"
}'
forge insert text --id "stat-1-label" --parent "stat-1" --content "YEARS"
forge style "stat-1-label" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555"
}'

# Stat 2
forge insert stack --id "stat-2" --parent "about-stats" --direction "vertical" --gap 4
forge insert text --id "stat-2-num" --parent "stat-2" --content "30+"
forge style "stat-2-num" '{
  "fontFamily": "Instrument Serif, serif",
  "fontSize": "32px",
  "color": "#EDEDED"
}'
forge insert text --id "stat-2-label" --parent "stat-2" --content "SAAS PRODUCTS"
forge style "stat-2-label" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555"
}'

# Stat 3
forge insert stack --id "stat-3" --parent "about-stats" --direction "vertical" --gap 4
forge insert text --id "stat-3-num" --parent "stat-3" --content "3"
forge style "stat-3-num" '{
  "fontFamily": "Instrument Serif, serif",
  "fontSize": "32px",
  "color": "#EDEDED"
}'
forge insert text --id "stat-3-label" --parent "stat-3" --content "DESIGN SYSTEMS"
forge style "stat-3-label" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555"
}'

# Stat 4
forge insert stack --id "stat-4" --parent "about-stats" --direction "vertical" --gap 4
forge insert text --id "stat-4-num" --parent "stat-4" --content "1M+"
forge style "stat-4-num" '{
  "fontFamily": "Instrument Serif, serif",
  "fontSize": "32px",
  "color": "#EDEDED"
}'
forge insert text --id "stat-4-label" --parent "stat-4" --content "USERS IMPACTED"
forge style "stat-4-label" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555"
}'
```

---

## Phase 5: Approach Section

```bash
# Approach container
forge insert frame --id "approach-section" --parent "page" --width 1440 --height "auto"
forge style "approach-section" '{
  "paddingLeft": "128px",
  "paddingRight": "128px",
  "paddingTop": "96px"
}'
forge move "approach-section" --y 3000

# Section label
forge insert text --id "approach-label" --parent "approach-section" --content "APPROACH"
forge style "approach-label" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555",
  "marginBottom": "48px"
}'

# 3-column grid
forge insert stack --id "approach-grid" --parent "approach-section" --direction "horizontal" --gap 48

# Column 1: Understand
forge insert stack --id "approach-1" --parent "approach-grid" --direction "vertical" --gap 16
forge style "approach-1" '{"flex": 1}'

forge insert text --id "approach-1-num" --parent "approach-1" --content "01"
forge style "approach-1-num" '{
  "fontFamily": "Instrument Serif, serif",
  "fontSize": "32px",
  "color": "#555555"
}'

forge insert text --id "approach-1-title" --parent "approach-1" --content "Understand"
forge style "approach-1-title" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 700,
  "fontSize": "20px",
  "color": "#EDEDED",
  "lineHeight": 1.3
}'

forge insert text --id "approach-1-desc" --parent "approach-1" --content "Map the problem space through user research, stakeholder interviews, and competitive analysis. Define success metrics before touching pixels."
forge style "approach-1-desc" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 400,
  "fontSize": "16px",
  "lineHeight": 1.6,
  "color": "#888888"
}'

# Column 2: Explore
forge insert stack --id "approach-2" --parent "approach-grid" --direction "vertical" --gap 16
forge style "approach-2" '{"flex": 1}'

forge insert text --id "approach-2-num" --parent "approach-2" --content "02"
forge style "approach-2-num" '{
  "fontFamily": "Instrument Serif, serif",
  "fontSize": "32px",
  "color": "#555555"
}'

forge insert text --id "approach-2-title" --parent "approach-2" --content "Explore"
forge style "approach-2-title" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 700,
  "fontSize": "20px",
  "color": "#EDEDED",
  "lineHeight": 1.3
}'

forge insert text --id "approach-2-desc" --parent "approach-2" --content "Rapid prototyping across fidelity levels. Test assumptions early with real users. Diverge wide, then converge on what the data supports."
forge style "approach-2-desc" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 400,
  "fontSize": "16px",
  "lineHeight": 1.6,
  "color": "#888888"
}'

# Column 3: Refine
forge insert stack --id "approach-3" --parent "approach-grid" --direction "vertical" --gap 16
forge style "approach-3" '{"flex": 1}'

forge insert text --id "approach-3-num" --parent "approach-3" --content "03"
forge style "approach-3-num" '{
  "fontFamily": "Instrument Serif, serif",
  "fontSize": "32px",
  "color": "#555555"
}'

forge insert text --id "approach-3-title" --parent "approach-3" --content "Refine"
forge style "approach-3-title" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 700,
  "fontSize": "20px",
  "color": "#EDEDED",
  "lineHeight": 1.3
}'

forge insert text --id "approach-3-desc" --parent "approach-3" --content "Polish every interaction, document every component. Hand off production-ready specs and design tokens. Stay involved through launch."
forge style "approach-3-desc" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 400,
  "fontSize": "16px",
  "lineHeight": 1.6,
  "color": "#888888"
}'
```

---

## Phase 6: Contact / Footer

```bash
# Contact section
forge insert frame --id "contact-section" --parent "page" --width 1440 --height "auto"
forge style "contact-section" '{
  "paddingTop": "128px",
  "paddingBottom": "96px",
  "display": "flex",
  "flexDirection": "column",
  "alignItems": "center",
  "textAlign": "center"
}'
forge move "contact-section" --y 3600

# Contact heading
forge insert text --id "contact-heading" --parent "contact-section" --content "Let's build something"
forge style "contact-heading" '{
  "fontFamily": "Instrument Serif, serif",
  "fontWeight": 400,
  "fontSize": "48px",
  "lineHeight": 1.1,
  "letterSpacing": "-0.02em",
  "color": "#EDEDED"
}'

# Email link
forge insert text --id "contact-email" --parent "contact-section" --content "hello@mikachen.design"
forge style "contact-email" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 400,
  "fontSize": "20px",
  "color": "#888888",
  "marginTop": "24px",
  "cursor": "pointer",
  "transition": "color 200ms ease"
}'

# Social links row
forge insert stack --id "contact-socials" --parent "contact-section" --direction "horizontal" --gap 32
forge style "contact-socials" '{"marginTop": "64px"}'

forge insert text --id "social-twitter" --parent "contact-socials" --content "TWITTER"
forge style "social-twitter" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555",
  "cursor": "pointer",
  "transition": "color 200ms ease"
}'

forge insert text --id "social-dribbble" --parent "contact-socials" --content "DRIBBBLE"
forge style "social-dribbble" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555",
  "cursor": "pointer",
  "transition": "color 200ms ease"
}'

forge insert text --id "social-linkedin" --parent "contact-socials" --content "LINKEDIN"
forge style "social-linkedin" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555",
  "cursor": "pointer",
  "transition": "color 200ms ease"
}'

forge insert text --id "social-readcv" --parent "contact-socials" --content "READ.CV"
forge style "social-readcv" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 500,
  "fontSize": "12px",
  "letterSpacing": "0.08em",
  "color": "#555555",
  "cursor": "pointer",
  "transition": "color 200ms ease"
}'

# Copyright
forge insert text --id "copyright" --parent "contact-section" --content "\u00a9 2026 Mika Chen. All rights reserved."
forge style "copyright" '{
  "fontFamily": "Satoshi, sans-serif",
  "fontWeight": 400,
  "fontSize": "12px",
  "color": "#555555",
  "marginTop": "48px"
}'
```

---

## Phase 7: Screenshot and Publish

```bash
# Full-page screenshot for review
forge screenshot --id "page" --output "dark-portfolio-full.png" --scale 2

# Section-level screenshots for QA
forge screenshot --id "nav" --output "qa-nav.png" --scale 2
forge screenshot --id "hero" --output "qa-hero.png" --scale 2
forge screenshot --id "work-section" --output "qa-work.png" --scale 2
forge screenshot --id "about-section" --output "qa-about.png" --scale 2
forge screenshot --id "approach-section" --output "qa-approach.png" --scale 2
forge screenshot --id "contact-section" --output "qa-contact.png" --scale 2

# Publish when approved
forge publish --name "mika-chen-portfolio"
```

---

## Command Count Summary

| Phase           | Commands |
|-----------------|----------|
| Page Setup      | 3        |
| Navigation      | 14       |
| Hero            | 10       |
| Selected Work   | 45       |
| About           | 22       |
| Approach        | 17       |
| Contact/Footer  | 14       |
| Screenshot/Pub  | 8        |
| **Total**       | **133**  |
