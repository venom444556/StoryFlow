# Build Plan: Mika Chen Portfolio --- Forge CLI Commands

Ordered sequence of `forge` commands to construct every element. Each section is built top-to-bottom, parent frames first, then children.

---

## Phase 0: Page Setup

```bash
# Root frame --- full page container
forge insert frame \
  --name "Page" \
  --width 1440 \
  --height 4800

forge style "Page" '{
  "backgroundColor": "#0A0A0A",
  "overflow": "hidden"
}'

forge set-layout "Page" '{
  "mode": "vertical",
  "primaryAxisAlignItems": "center",
  "counterAxisAlignItems": "center",
  "itemSpacing": 0
}'
```

---

## Phase 1: Navigation

```bash
# Nav container
forge insert frame \
  --name "Nav" \
  --parent "Page" \
  --width 1440 \
  --height 64

forge style "Nav" '{
  "backgroundColor": "#0A0A0A",
  "borderBottomWidth": 1,
  "borderColor": "#262626"
}'

forge set-layout "Nav" '{
  "mode": "horizontal",
  "primaryAxisAlignItems": "space-between",
  "counterAxisAlignItems": "center",
  "paddingLeft": 120,
  "paddingRight": 120
}'

# Nav left --- wordmark
forge insert text \
  --name "NavWordmark" \
  --parent "Nav" \
  --content "MIKA CHEN"

forge style "NavWordmark" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "fontWeight": 500,
  "letterSpacing": 0.06,
  "textTransform": "uppercase",
  "color": "#FAFAFA"
}'

# Nav right --- link group
forge insert stack \
  --name "NavLinks" \
  --parent "Nav" \
  --direction "horizontal" \
  --spacing 32

forge insert text \
  --name "NavLink_Work" \
  --parent "NavLinks" \
  --content "Work"

forge style "NavLink_Work" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#FAFAFA",
  "textDecoration": "underline",
  "textDecorationColor": "#E8C547",
  "textUnderlineOffset": 6
}'

forge insert text \
  --name "NavLink_About" \
  --parent "NavLinks" \
  --content "About"

forge style "NavLink_About" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#A1A1A1"
}'

forge insert text \
  --name "NavLink_Contact" \
  --parent "NavLinks" \
  --content "Contact"

forge style "NavLink_Contact" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#A1A1A1"
}'
```

---

## Phase 2: Hero Section

```bash
# Hero container
forge insert frame \
  --name "Hero" \
  --parent "Page" \
  --width 1200 \
  --height "auto"

forge style "Hero" '{
  "paddingTop": 128,
  "paddingBottom": 96
}'

forge set-layout "Hero" '{
  "mode": "vertical",
  "primaryAxisAlignItems": "flex-start",
  "itemSpacing": 0
}'

# Hero headline line 1
forge insert text \
  --name "HeroLine1" \
  --parent "Hero" \
  --content "Product designer"

forge style "HeroLine1" '{
  "fontFamily": "Syne",
  "fontSize": 64,
  "fontWeight": 700,
  "lineHeight": 1.1,
  "letterSpacing": -0.03,
  "color": "#FAFAFA"
}'

# Hero headline line 2
forge insert text \
  --name "HeroLine2" \
  --parent "Hero" \
  --content "crafting SaaS interfaces that feel inevitable."

forge style "HeroLine2" '{
  "fontFamily": "Syne",
  "fontSize": 64,
  "fontWeight": 700,
  "lineHeight": 1.1,
  "letterSpacing": -0.03,
  "color": "#666666"
}'

# Hero body text
forge insert text \
  --name "HeroBody" \
  --parent "Hero" \
  --content "Currently shaping products at the intersection of design systems, user research, and engineering."

forge style "HeroBody" '{
  "fontFamily": "Inter",
  "fontSize": 18,
  "fontWeight": 400,
  "lineHeight": 1.6,
  "color": "#A1A1A1",
  "maxWidth": 640,
  "marginTop": 32
}'

# Hero CTA button
forge insert frame \
  --name "HeroCTA" \
  --parent "Hero" \
  --width "auto" \
  --height 44

forge style "HeroCTA" '{
  "backgroundColor": "#E8C547",
  "borderRadius": 6,
  "paddingLeft": 24,
  "paddingRight": 24,
  "marginTop": 48,
  "cursor": "pointer"
}'

forge set-layout "HeroCTA" '{
  "mode": "horizontal",
  "counterAxisAlignItems": "center",
  "primaryAxisAlignItems": "center"
}'

forge insert text \
  --name "HeroCTAText" \
  --parent "HeroCTA" \
  --content "View selected work"

forge style "HeroCTAText" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 500,
  "color": "#0A0A0A"
}'
```

---

## Phase 3: Selected Work Section

```bash
# Section container
forge insert frame \
  --name "WorkSection" \
  --parent "Page" \
  --width 1200 \
  --height "auto"

forge style "WorkSection" '{
  "paddingTop": 96
}'

forge set-layout "WorkSection" '{
  "mode": "vertical",
  "itemSpacing": 48
}'

# Section label
forge insert text \
  --name "WorkLabel" \
  --parent "WorkSection" \
  --content "SELECTED WORK"

forge style "WorkLabel" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "fontWeight": 500,
  "letterSpacing": 0.06,
  "textTransform": "uppercase",
  "color": "#666666"
}'

# Project grid (2x2)
forge insert frame \
  --name "ProjectGrid" \
  --parent "WorkSection" \
  --width 1200 \
  --height "auto"

forge set-layout "ProjectGrid" '{
  "mode": "horizontal",
  "wrap": true,
  "itemSpacing": 24,
  "crossAxisSpacing": 24
}'

# --- Project Card 1: Dashboard Redesign ---
forge insert frame \
  --name "Card1" \
  --parent "ProjectGrid" \
  --width 588 \
  --height "auto"

forge style "Card1" '{
  "backgroundColor": "#141414",
  "borderWidth": 1,
  "borderColor": "#262626",
  "borderRadius": 12,
  "overflow": "hidden"
}'

forge set-layout "Card1" '{
  "mode": "vertical",
  "itemSpacing": 0
}'

# Card 1 thumbnail
forge insert frame \
  --name "Card1Thumb" \
  --parent "Card1" \
  --width 588 \
  --height 368

forge style "Card1Thumb" '{
  "backgroundColor": "#1A1A1A"
}'

# Card 1 content area
forge insert frame \
  --name "Card1Content" \
  --parent "Card1" \
  --width 588 \
  --height "auto"

forge style "Card1Content" '{
  "padding": 24
}'

forge set-layout "Card1Content" '{
  "mode": "vertical",
  "itemSpacing": 8
}'

forge insert text \
  --name "Card1Title" \
  --parent "Card1Content" \
  --content "Dashboard Redesign"

forge style "Card1Title" '{
  "fontFamily": "Inter",
  "fontSize": 20,
  "fontWeight": 600,
  "color": "#FAFAFA"
}'

forge insert text \
  --name "Card1Desc" \
  --parent "Card1Content" \
  --content "Reimagined the analytics experience for 50K+ daily users"

forge style "Card1Desc" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#A1A1A1"
}'

forge insert text \
  --name "Card1Tags" \
  --parent "Card1Content" \
  --content "Product Design / Design Systems"

forge style "Card1Tags" '{
  "fontFamily": "Inter",
  "fontSize": 13,
  "fontWeight": 500,
  "letterSpacing": 0.04,
  "textTransform": "uppercase",
  "color": "#666666",
  "marginTop": 8
}'

# --- Project Card 2: Design System ---
forge insert frame \
  --name "Card2" \
  --parent "ProjectGrid" \
  --width 588 \
  --height "auto"

forge style "Card2" '{
  "backgroundColor": "#141414",
  "borderWidth": 1,
  "borderColor": "#262626",
  "borderRadius": 12,
  "overflow": "hidden"
}'

forge set-layout "Card2" '{
  "mode": "vertical",
  "itemSpacing": 0
}'

forge insert frame \
  --name "Card2Thumb" \
  --parent "Card2" \
  --width 588 \
  --height 368

forge style "Card2Thumb" '{
  "backgroundColor": "#1A1A1A"
}'

forge insert frame \
  --name "Card2Content" \
  --parent "Card2" \
  --width 588 \
  --height "auto"

forge style "Card2Content" '{
  "padding": 24
}'

forge set-layout "Card2Content" '{
  "mode": "vertical",
  "itemSpacing": 8
}'

forge insert text \
  --name "Card2Title" \
  --parent "Card2Content" \
  --content "Design System"

forge style "Card2Title" '{
  "fontFamily": "Inter",
  "fontSize": 20,
  "fontWeight": 600,
  "color": "#FAFAFA"
}'

forge insert text \
  --name "Card2Desc" \
  --parent "Card2Content" \
  --content "Built a component library serving 12 product teams"

forge style "Card2Desc" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#A1A1A1"
}'

forge insert text \
  --name "Card2Tags" \
  --parent "Card2Content" \
  --content "Systems / Documentation"

forge style "Card2Tags" '{
  "fontFamily": "Inter",
  "fontSize": 13,
  "fontWeight": 500,
  "letterSpacing": 0.04,
  "textTransform": "uppercase",
  "color": "#666666",
  "marginTop": 8
}'

# --- Project Card 3: Onboarding Flow ---
forge insert frame \
  --name "Card3" \
  --parent "ProjectGrid" \
  --width 588 \
  --height "auto"

forge style "Card3" '{
  "backgroundColor": "#141414",
  "borderWidth": 1,
  "borderColor": "#262626",
  "borderRadius": 12,
  "overflow": "hidden"
}'

forge set-layout "Card3" '{
  "mode": "vertical",
  "itemSpacing": 0
}'

forge insert frame \
  --name "Card3Thumb" \
  --parent "Card3" \
  --width 588 \
  --height 368

forge style "Card3Thumb" '{
  "backgroundColor": "#1A1A1A"
}'

forge insert frame \
  --name "Card3Content" \
  --parent "Card3" \
  --width 588 \
  --height "auto"

forge style "Card3Content" '{
  "padding": 24
}'

forge set-layout "Card3Content" '{
  "mode": "vertical",
  "itemSpacing": 8
}'

forge insert text \
  --name "Card3Title" \
  --parent "Card3Content" \
  --content "Onboarding Flow"

forge style "Card3Title" '{
  "fontFamily": "Inter",
  "fontSize": 20,
  "fontWeight": 600,
  "color": "#FAFAFA"
}'

forge insert text \
  --name "Card3Desc" \
  --parent "Card3Content" \
  --content "Reduced time-to-value from 8 minutes to 90 seconds"

forge style "Card3Desc" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#A1A1A1"
}'

forge insert text \
  --name "Card3Tags" \
  --parent "Card3Content" \
  --content "UX Research / Prototyping"

forge style "Card3Tags" '{
  "fontFamily": "Inter",
  "fontSize": 13,
  "fontWeight": 500,
  "letterSpacing": 0.04,
  "textTransform": "uppercase",
  "color": "#666666",
  "marginTop": 8
}'

# --- Project Card 4: Mobile App ---
forge insert frame \
  --name "Card4" \
  --parent "ProjectGrid" \
  --width 588 \
  --height "auto"

forge style "Card4" '{
  "backgroundColor": "#141414",
  "borderWidth": 1,
  "borderColor": "#262626",
  "borderRadius": 12,
  "overflow": "hidden"
}'

forge set-layout "Card4" '{
  "mode": "vertical",
  "itemSpacing": 0
}'

forge insert frame \
  --name "Card4Thumb" \
  --parent "Card4" \
  --width 588 \
  --height 368

forge style "Card4Thumb" '{
  "backgroundColor": "#1A1A1A"
}'

forge insert frame \
  --name "Card4Content" \
  --parent "Card4" \
  --width 588 \
  --height "auto"

forge style "Card4Content" '{
  "padding": 24
}'

forge set-layout "Card4Content" '{
  "mode": "vertical",
  "itemSpacing": 8
}'

forge insert text \
  --name "Card4Title" \
  --parent "Card4Content" \
  --content "Mobile App"

forge style "Card4Title" '{
  "fontFamily": "Inter",
  "fontSize": 20,
  "fontWeight": 600,
  "color": "#FAFAFA"
}'

forge insert text \
  --name "Card4Desc" \
  --parent "Card4Content" \
  --content "Native iOS experience for field teams"

forge style "Card4Desc" '{
  "fontFamily": "Inter",
  "fontSize": 16,
  "fontWeight": 400,
  "color": "#A1A1A1"
}'

forge insert text \
  --name "Card4Tags" \
  --parent "Card4Content" \
  --content "Mobile / Interaction Design"

forge style "Card4Tags" '{
  "fontFamily": "Inter",
  "fontSize": 13,
  "fontWeight": 500,
  "letterSpacing": 0.04,
  "textTransform": "uppercase",
  "color": "#666666",
  "marginTop": 8
}'
```

---

## Phase 4: About Section

```bash
# About container
forge insert frame \
  --name "AboutSection" \
  --parent "Page" \
  --width 1200 \
  --height "auto"

forge style "AboutSection" '{
  "paddingTop": 96
}'

forge set-layout "AboutSection" '{
  "mode": "vertical",
  "itemSpacing": 24
}'

# Section label
forge insert text \
  --name "AboutLabel" \
  --parent "AboutSection" \
  --content "ABOUT"

forge style "AboutLabel" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "fontWeight": 500,
  "letterSpacing": 0.06,
  "textTransform": "uppercase",
  "color": "#666666"
}'

# About body --- paragraph 1
forge insert text \
  --name "AboutP1" \
  --parent "AboutSection" \
  --content "I design products that get out of the way. For the past 8 years, I have worked with SaaS companies to turn complex workflows into interfaces people actually enjoy using."

forge style "AboutP1" '{
  "fontFamily": "Inter",
  "fontSize": 18,
  "fontWeight": 400,
  "lineHeight": 1.7,
  "color": "#A1A1A1",
  "maxWidth": 560
}'

# About body --- paragraph 2
forge insert text \
  --name "AboutP2" \
  --parent "AboutSection" \
  --content "My process is research-led and systems-oriented. I believe the best design is invisible --- it feels so natural that users never think about it."

forge style "AboutP2" '{
  "fontFamily": "Inter",
  "fontSize": 18,
  "fontWeight": 400,
  "lineHeight": 1.7,
  "color": "#A1A1A1",
  "maxWidth": 560
}'

# Capabilities grid
forge insert frame \
  --name "CapGrid" \
  --parent "AboutSection" \
  --width 560 \
  --height "auto"

forge style "CapGrid" '{
  "marginTop": 8
}'

forge set-layout "CapGrid" '{
  "mode": "horizontal",
  "wrap": true,
  "itemSpacing": 48,
  "crossAxisSpacing": 12
}'

# Capabilities column 1
forge insert stack \
  --name "CapCol1" \
  --parent "CapGrid" \
  --direction "vertical" \
  --spacing 12

forge insert text --name "Cap1" --parent "CapCol1" --content "Product Strategy"
forge style "Cap1" '{"fontFamily":"Inter","fontSize":13,"fontWeight":500,"letterSpacing":0.04,"textTransform":"uppercase","color":"#666666"}'

forge insert text --name "Cap2" --parent "CapCol1" --content "Design Systems"
forge style "Cap2" '{"fontFamily":"Inter","fontSize":13,"fontWeight":500,"letterSpacing":0.04,"textTransform":"uppercase","color":"#666666"}'

forge insert text --name "Cap3" --parent "CapCol1" --content "User Research"
forge style "Cap3" '{"fontFamily":"Inter","fontSize":13,"fontWeight":500,"letterSpacing":0.04,"textTransform":"uppercase","color":"#666666"}'

# Capabilities column 2
forge insert stack \
  --name "CapCol2" \
  --parent "CapGrid" \
  --direction "vertical" \
  --spacing 12

forge insert text --name "Cap4" --parent "CapCol2" --content "Prototyping"
forge style "Cap4" '{"fontFamily":"Inter","fontSize":13,"fontWeight":500,"letterSpacing":0.04,"textTransform":"uppercase","color":"#666666"}'

forge insert text --name "Cap5" --parent "CapCol2" --content "Interaction Design"
forge style "Cap5" '{"fontFamily":"Inter","fontSize":13,"fontWeight":500,"letterSpacing":0.04,"textTransform":"uppercase","color":"#666666"}'

forge insert text --name "Cap6" --parent "CapCol2" --content "Frontend Collaboration"
forge style "Cap6" '{"fontFamily":"Inter","fontSize":13,"fontWeight":500,"letterSpacing":0.04,"textTransform":"uppercase","color":"#666666"}'
```

---

## Phase 5: Contact Section

```bash
# Contact container
forge insert frame \
  --name "ContactSection" \
  --parent "Page" \
  --width 1200 \
  --height "auto"

forge style "ContactSection" '{
  "paddingTop": 96,
  "paddingBottom": 128
}'

forge set-layout "ContactSection" '{
  "mode": "vertical",
  "counterAxisAlignItems": "center",
  "itemSpacing": 24
}'

# Section label
forge insert text \
  --name "ContactLabel" \
  --parent "ContactSection" \
  --content "GET IN TOUCH"

forge style "ContactLabel" '{
  "fontFamily": "Inter",
  "fontSize": 12,
  "fontWeight": 500,
  "letterSpacing": 0.06,
  "textTransform": "uppercase",
  "color": "#666666",
  "textAlign": "center"
}'

# Contact headline
forge insert text \
  --name "ContactHeadline" \
  --parent "ContactSection" \
  --content "Let's build something"

forge style "ContactHeadline" '{
  "fontFamily": "Syne",
  "fontSize": 48,
  "fontWeight": 700,
  "lineHeight": 1.15,
  "letterSpacing": -0.02,
  "color": "#FAFAFA",
  "textAlign": "center"
}'

# Email link
forge insert text \
  --name "ContactEmail" \
  --parent "ContactSection" \
  --content "hello@mikachen.design"

forge style "ContactEmail" '{
  "fontFamily": "Inter",
  "fontSize": 18,
  "fontWeight": 400,
  "color": "#A1A1A1",
  "textAlign": "center"
}'

# Social links row
forge insert stack \
  --name "SocialLinks" \
  --parent "ContactSection" \
  --direction "horizontal" \
  --spacing 24

forge style "SocialLinks" '{
  "marginTop": 8
}'

forge insert text --name "Social1" --parent "SocialLinks" --content "LinkedIn"
forge style "Social1" '{"fontFamily":"Inter","fontSize":13,"fontWeight":500,"letterSpacing":0.04,"textTransform":"uppercase","color":"#666666"}'

forge insert text --name "Social2" --parent "SocialLinks" --content "Dribbble"
forge style "Social2" '{"fontFamily":"Inter","fontSize":13,"fontWeight":500,"letterSpacing":0.04,"textTransform":"uppercase","color":"#666666"}'

forge insert text --name "Social3" --parent "SocialLinks" --content "Read.cv"
forge style "Social3" '{"fontFamily":"Inter","fontSize":13,"fontWeight":500,"letterSpacing":0.04,"textTransform":"uppercase","color":"#666666"}'
```

---

## Phase 6: Footer

```bash
# Footer container
forge insert frame \
  --name "Footer" \
  --parent "Page" \
  --width 1440 \
  --height "auto"

forge style "Footer" '{
  "borderTopWidth": 1,
  "borderColor": "#262626",
  "paddingTop": 24,
  "paddingBottom": 24,
  "paddingLeft": 120,
  "paddingRight": 120
}'

forge set-layout "Footer" '{
  "mode": "horizontal",
  "primaryAxisAlignItems": "space-between",
  "counterAxisAlignItems": "center"
}'

forge insert text \
  --name "FooterLeft" \
  --parent "Footer" \
  --content "2026 Mika Chen"

forge style "FooterLeft" '{
  "fontFamily": "Inter",
  "fontSize": 13,
  "fontWeight": 500,
  "letterSpacing": 0.04,
  "textTransform": "uppercase",
  "color": "#666666"
}'

forge insert text \
  --name "FooterRight" \
  --parent "Footer" \
  --content "Designed in Figma, built with care"

forge style "FooterRight" '{
  "fontFamily": "Inter",
  "fontSize": 13,
  "fontWeight": 500,
  "letterSpacing": 0.04,
  "textTransform": "uppercase",
  "color": "#666666"
}'
```

---

## Phase 7: Screenshot and Review

```bash
# Take a full-page screenshot for QA review
forge screenshot \
  --name "mika-chen-portfolio-v1" \
  --format "png" \
  --scale 2

# If all QA passes, publish
forge publish \
  --name "mika-chen-portfolio" \
  --version "1.0"
```

---

## Command Summary

| Phase | Commands | Elements Created |
|-------|----------|-----------------|
| 0. Page Setup | 3 | 1 root frame |
| 1. Navigation | 9 | Nav bar + wordmark + 3 links |
| 2. Hero | 10 | Hero container + headline (2 lines) + body + CTA button |
| 3. Selected Work | 37 | Section label + 4 project cards (thumb + title + desc + tags each) |
| 4. About | 18 | Section label + 2 paragraphs + 6 capability items |
| 5. Contact | 10 | Section label + headline + email + 3 social links |
| 6. Footer | 5 | Footer bar + 2 text elements |
| 7. Screenshot | 2 | Screenshot + publish |
| **Total** | **94** | **~45 visual elements** |
