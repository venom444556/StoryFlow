# Build Plan: Forge CLI Command Sequence

## Phase 0: Page Setup

```bash
# Root frame — full page canvas
forge insert frame --name "Page" --width 1440 --height 4200
forge style "Page" '{"backgroundColor": "#0A0A0A"}'
```

---

## Phase 1: Navigation Bar

```bash
# Nav container
forge insert frame --name "Nav" --parent "Page" --width 1440 --height 64
forge style "Nav" '{
  "backgroundColor": "#0A0A0A",
  "borderBottom": "1px solid #222222"
}'
forge set-layout "Nav" --direction horizontal --align center --justify space-between --paddingLeft 40 --paddingRight 40

# Nav left — wordmark
forge insert text --name "NavWordmark" --parent "Nav" --content "Mika Chen"
forge style "NavWordmark" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 600,
  "color": "#FAFAFA",
  "letterSpacing": "-0.01em"
}'

# Nav right — links container
forge insert stack --name "NavLinks" --parent "Nav" --direction horizontal --gap 32

forge insert text --name "NavWork" --parent "NavLinks" --content "Work"
forge style "NavWork" '{
  "fontFamily": "Inter",
  "fontSize": 14,
  "fontWeight": 500,
  "color": "#888888",
  "letterSpacing": "0.01em"
}'

forge insert text --name "NavAbout" --parent "NavLinks" --content "About"
forge style "NavAbout" '{
  "fontFamily": "Inter",
  "fontSize": 14,
  "fontWeight": 500,
  "color": "#888888",
  "letterSpacing": "0.01em"
}'

forge insert text --name "NavContact" --parent "NavLinks" --content "Contact"
forge style "NavContact" '{
  "fontFamily": "Inter",
  "fontSize": 14,
  "fontWeight": 500,
  "color": "#888888",
  "letterSpacing": "0.01em"
}'
```

---

## Phase 2: Hero Section

```bash
# Hero container
forge insert frame --name "Hero" --parent "Page" --width 1440
forge style "Hero" '{"backgroundColor": "transparent"}'
forge set-layout "Hero" --direction vertical --align flex-start --paddingTop 128 --paddingBottom 96 --paddingLeft 160 --paddingRight 160 --gap 24
forge move "Hero" --y 64

# Content wrapper (constrain width)
forge insert stack --name "HeroContent" --parent "Hero" --direction vertical --gap 24

# Display headline
forge insert text --name "HeroHeadline" --parent "HeroContent" --content "Designing systems\nthat scale."
forge style "HeroHeadline" '{
  "fontFamily": "Inter",
  "fontSize": 64,
  "fontWeight": 600,
  "color": "#FAFAFA",
  "lineHeight": 1.05,
  "letterSpacing": "-0.03em",
  "maxWidth": 700
}'

# Subheadline
forge insert text --name "HeroSub" --parent "HeroContent" --content "Product designer specializing in SaaS platforms. I craft interfaces that are clear, systematic, and built to grow."
forge style "HeroSub" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#888888",
  "lineHeight": 1.6,
  "maxWidth": 520
}'

# CTA link
forge insert text --name "HeroCTA" --parent "HeroContent" --content "View selected work  ->"
forge style "HeroCTA" '{
  "fontFamily": "Inter",
  "fontSize": 14,
  "fontWeight": 500,
  "color": "#7C6AFF",
  "letterSpacing": "0.01em",
  "marginTop": 8
}'
```

---

## Phase 3: Selected Work Section

```bash
# Section container
forge insert frame --name "Work" --parent "Page" --width 1440
forge style "Work" '{"backgroundColor": "transparent"}'
forge set-layout "Work" --direction vertical --paddingLeft 160 --paddingRight 160 --paddingTop 64 --paddingBottom 96 --gap 48

# Section label
forge insert text --name "WorkLabel" --parent "Work" --content "SELECTED WORK"
forge style "WorkLabel" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "fontWeight": 400,
  "color": "#555555",
  "letterSpacing": "0.1em",
  "lineHeight": 1.4
}'

# Project grid (2x2)
forge insert frame --name "ProjectGrid" --parent "Work" --width 1120
forge set-layout "ProjectGrid" --direction horizontal --wrap wrap --gap 24

# --- Card 1: Meridian ---
forge insert frame --name "Card1" --parent "ProjectGrid" --width 548
forge style "Card1" '{
  "backgroundColor": "#141414",
  "border": "1px solid #222222",
  "borderRadius": 12,
  "overflow": "hidden"
}'
forge set-layout "Card1" --direction vertical --gap 0

forge insert frame --name "Card1Img" --parent "Card1" --width 548 --height 343
forge style "Card1Img" '{"backgroundColor": "#1A1A1A"}'

forge insert text --name "Card1ImgLabel" --parent "Card1Img" --content "Meridian"
forge style "Card1ImgLabel" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "color": "#555555",
  "textAlign": "center"
}'
forge move "Card1ImgLabel" --x 250 --y 162

forge insert frame --name "Card1Text" --parent "Card1" --width 548
forge set-layout "Card1Text" --direction vertical --paddingLeft 24 --paddingRight 24 --paddingTop 20 --paddingBottom 24 --gap 8

forge insert text --name "Card1Title" --parent "Card1Text" --content "Meridian"
forge style "Card1Title" '{
  "fontFamily": "Inter",
  "fontSize": 20,
  "fontWeight": 500,
  "color": "#FAFAFA",
  "letterSpacing": "-0.01em"
}'

forge insert text --name "Card1Desc" --parent "Card1Text" --content "End-to-end redesign of a B2B analytics dashboard"
forge style "Card1Desc" '{
  "fontFamily": "Inter",
  "fontSize": 14,
  "fontWeight": 400,
  "color": "#888888",
  "lineHeight": 1.5
}'

# --- Card 2: Canopy ---
forge insert frame --name "Card2" --parent "ProjectGrid" --width 548
forge style "Card2" '{
  "backgroundColor": "#141414",
  "border": "1px solid #222222",
  "borderRadius": 12,
  "overflow": "hidden"
}'
forge set-layout "Card2" --direction vertical --gap 0

forge insert frame --name "Card2Img" --parent "Card2" --width 548 --height 343
forge style "Card2Img" '{"backgroundColor": "#1A1A1A"}'

forge insert text --name "Card2ImgLabel" --parent "Card2Img" --content "Canopy"
forge style "Card2ImgLabel" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "color": "#555555",
  "textAlign": "center"
}'
forge move "Card2ImgLabel" --x 255 --y 162

forge insert frame --name "Card2Text" --parent "Card2" --width 548
forge set-layout "Card2Text" --direction vertical --paddingLeft 24 --paddingRight 24 --paddingTop 20 --paddingBottom 24 --gap 8

forge insert text --name "Card2Title" --parent "Card2Text" --content "Canopy"
forge style "Card2Title" '{
  "fontFamily": "Inter",
  "fontSize": 20,
  "fontWeight": 500,
  "color": "#FAFAFA",
  "letterSpacing": "-0.01em"
}'

forge insert text --name "Card2Desc" --parent "Card2Text" --content "Design system for a developer collaboration platform"
forge style "Card2Desc" '{
  "fontFamily": "Inter",
  "fontSize": 14,
  "fontWeight": 400,
  "color": "#888888",
  "lineHeight": 1.5
}'

# --- Card 3: Lumina ---
forge insert frame --name "Card3" --parent "ProjectGrid" --width 548
forge style "Card3" '{
  "backgroundColor": "#141414",
  "border": "1px solid #222222",
  "borderRadius": 12,
  "overflow": "hidden"
}'
forge set-layout "Card3" --direction vertical --gap 0

forge insert frame --name "Card3Img" --parent "Card3" --width 548 --height 343
forge style "Card3Img" '{"backgroundColor": "#1A1A1A"}'

forge insert text --name "Card3ImgLabel" --parent "Card3Img" --content "Lumina"
forge style "Card3ImgLabel" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "color": "#555555",
  "textAlign": "center"
}'
forge move "Card3ImgLabel" --x 252 --y 162

forge insert frame --name "Card3Text" --parent "Card3" --width 548
forge set-layout "Card3Text" --direction vertical --paddingLeft 24 --paddingRight 24 --paddingTop 20 --paddingBottom 24 --gap 8

forge insert text --name "Card3Title" --parent "Card3Text" --content "Lumina"
forge style "Card3Title" '{
  "fontFamily": "Inter",
  "fontSize": 20,
  "fontWeight": 500,
  "color": "#FAFAFA",
  "letterSpacing": "-0.01em"
}'

forge insert text --name "Card3Desc" --parent "Card3Text" --content "Onboarding flow that increased activation by 34%"
forge style "Card3Desc" '{
  "fontFamily": "Inter",
  "fontSize": 14,
  "fontWeight": 400,
  "color": "#888888",
  "lineHeight": 1.5
}'

# --- Card 4: Prism ---
forge insert frame --name "Card4" --parent "ProjectGrid" --width 548
forge style "Card4" '{
  "backgroundColor": "#141414",
  "border": "1px solid #222222",
  "borderRadius": 12,
  "overflow": "hidden"
}'
forge set-layout "Card4" --direction vertical --gap 0

forge insert frame --name "Card4Img" --parent "Card4" --width 548 --height 343
forge style "Card4Img" '{"backgroundColor": "#1A1A1A"}'

forge insert text --name "Card4ImgLabel" --parent "Card4Img" --content "Prism"
forge style "Card4ImgLabel" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "color": "#555555",
  "textAlign": "center"
}'
forge move "Card4ImgLabel" --x 256 --y 162

forge insert frame --name "Card4Text" --parent "Card4" --width 548
forge set-layout "Card4Text" --direction vertical --paddingLeft 24 --paddingRight 24 --paddingTop 20 --paddingBottom 24 --gap 8

forge insert text --name "Card4Title" --parent "Card4Text" --content "Prism"
forge style "Card4Title" '{
  "fontFamily": "Inter",
  "fontSize": 20,
  "fontWeight": 500,
  "color": "#FAFAFA",
  "letterSpacing": "-0.01em"
}'

forge insert text --name "Card4Desc" --parent "Card4Text" --content "Mobile-first redesign of a project management tool"
forge style "Card4Desc" '{
  "fontFamily": "Inter",
  "fontSize": 14,
  "fontWeight": 400,
  "color": "#888888",
  "lineHeight": 1.5
}'
```

---

## Phase 4: About Section

```bash
# About container
forge insert frame --name "About" --parent "Page" --width 1440
forge style "About" '{"backgroundColor": "transparent"}'
forge set-layout "About" --direction horizontal --paddingLeft 160 --paddingRight 160 --paddingTop 96 --paddingBottom 96 --gap 80

# About left column — label
forge insert frame --name "AboutLeft" --parent "About" --width 200
forge set-layout "AboutLeft" --direction vertical --paddingTop 4

forge insert text --name "AboutLabel" --parent "AboutLeft" --content "ABOUT"
forge style "AboutLabel" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "fontWeight": 400,
  "color": "#555555",
  "letterSpacing": "0.1em"
}'

# About right column — body
forge insert frame --name "AboutRight" --parent "About" --width 520
forge set-layout "AboutRight" --direction vertical --gap 20

forge insert text --name "AboutP1" --parent "AboutRight" --content "I'm a product designer with 8 years of experience building SaaS products. I've led design at two venture-backed startups and consulted for companies including Stripe, Notion, and Linear."
forge style "AboutP1" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#888888",
  "lineHeight": 1.6
}'

forge insert text --name "AboutP2" --parent "AboutRight" --content "My approach is systems-first: I design components, patterns, and principles that let teams ship faster without sacrificing coherence. I believe great design disappears into the product."
forge style "AboutP2" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#888888",
  "lineHeight": 1.6
}'

forge insert text --name "AboutAvail" --parent "AboutRight" --content "Currently available for select projects"
forge style "AboutAvail" '{
  "fontFamily": "Inter",
  "fontSize": 14,
  "fontWeight": 500,
  "color": "#7C6AFF",
  "marginTop": 12
}'
```

---

## Phase 5: Contact Section

```bash
# Contact container
forge insert frame --name "Contact" --parent "Page" --width 1440
forge style "Contact" '{"backgroundColor": "transparent"}'
forge set-layout "Contact" --direction vertical --align center --paddingTop 96 --paddingBottom 128 --gap 24

# Headline
forge insert text --name "ContactHeadline" --parent "Contact" --content "Let's work together"
forge style "ContactHeadline" '{
  "fontFamily": "Inter",
  "fontSize": 48,
  "fontWeight": 600,
  "color": "#FAFAFA",
  "lineHeight": 1.1,
  "letterSpacing": "-0.025em",
  "textAlign": "center"
}'

# Email
forge insert text --name "ContactEmail" --parent "Contact" --content "hello@mikachen.design"
forge style "ContactEmail" '{
  "fontFamily": "Inter",
  "fontSize": 20,
  "fontWeight": 500,
  "color": "#7C6AFF",
  "letterSpacing": "-0.01em",
  "textAlign": "center"
}'

# Social links row
forge insert stack --name "Socials" --parent "Contact" --direction horizontal --gap 32

forge insert text --name "SocialTwitter" --parent "Socials" --content "Twitter"
forge style "SocialTwitter" '{
  "fontFamily": "Inter",
  "fontSize": 14,
  "fontWeight": 400,
  "color": "#555555"
}'

forge insert text --name "SocialLinkedIn" --parent "Socials" --content "LinkedIn"
forge style "SocialLinkedIn" '{
  "fontFamily": "Inter",
  "fontSize": 14,
  "fontWeight": 400,
  "color": "#555555"
}'

forge insert text --name "SocialDribbble" --parent "Socials" --content "Dribbble"
forge style "SocialDribbble" '{
  "fontFamily": "Inter",
  "fontSize": 14,
  "fontWeight": 400,
  "color": "#555555"
}'
```

---

## Phase 6: Footer

```bash
# Footer container
forge insert frame --name "Footer" --parent "Page" --width 1440 --height 64
forge style "Footer" '{
  "backgroundColor": "transparent",
  "borderTop": "1px solid #222222"
}'
forge set-layout "Footer" --direction horizontal --align center --justify space-between --paddingLeft 40 --paddingRight 40

# Copyright
forge insert text --name "FooterCopy" --parent "Footer" --content "(c) 2026 Mika Chen"
forge style "FooterCopy" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "fontWeight": 400,
  "color": "#555555"
}'

# Tagline
forge insert text --name "FooterTag" --parent "Footer" --content "Built with intention"
forge style "FooterTag" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "fontWeight": 400,
  "color": "#555555"
}'
```

---

## Phase 7: Screenshot & Publish

```bash
# Full-page screenshot for review
forge screenshot --name "dark-portfolio-full" --format png

# Publish to staging
forge publish --name "mika-chen-portfolio"
```

---

## Command Summary

| Phase | Commands | Purpose                  |
|-------|----------|--------------------------|
| 0     | 2        | Page canvas setup        |
| 1     | 11       | Navigation bar           |
| 2     | 9        | Hero section             |
| 3     | 37       | Selected Work (4 cards)  |
| 4     | 9        | About section            |
| 5     | 10       | Contact section          |
| 6     | 5        | Footer                   |
| 7     | 2        | Screenshot and publish   |
| **Total** | **85** | **Full page build**  |
