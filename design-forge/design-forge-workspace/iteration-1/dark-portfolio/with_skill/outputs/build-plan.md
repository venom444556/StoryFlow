# Build Plan: Mika Chen Portfolio

Ordered `forge` CLI command sequence. Each section follows the pattern: build -> screenshot -> QA -> fix -> re-screenshot.

---

## Step 0: Project Setup

```bash
forge connect --launch
forge create-project --template blank
forge screenshot -o step-0-blank.png
```

---

## Section 1: Navigation

```bash
# 1. Nav container frame
forge insert frame
forge style '{"width":"100%","height":"64px","backgroundColor":"rgba(10,10,10,0.85)","backdropFilter":"blur(12px)","display":"flex","alignItems":"center","justifyContent":"space-between","padding":"0 32px","position":"fixed","top":"0","zIndex":"100"}'

# 2. Logo / Name (left)
forge insert text
forge set-text "Mika Chen" --font "Space Grotesk" --size 18 --weight 600 --color "#E8E8E8"

# 3. Nav links (right group)
forge insert stack
forge set-layout horizontal --gap 32

forge insert text
forge set-text "Work" --font "DM Sans" --size 14 --weight 500 --color "#8A8A8A"

forge insert text
forge set-text "About" --font "DM Sans" --size 14 --weight 500 --color "#8A8A8A"

forge insert text
forge set-text "Contact" --font "DM Sans" --size 14 --weight 500 --color "#8A8A8A"

# 4. Screenshot & QA
forge screenshot -o step-1-nav.png
```

---

## Section 2: Hero

```bash
# 1. Hero container
forge insert frame
forge style '{"width":"100%","minHeight":"100vh","backgroundColor":"#0A0A0A","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","padding":"128px 32px"}'

# 2. Label
forge insert text
forge set-text "PRODUCT DESIGNER" --font "DM Sans" --size 12 --weight 500 --color "#C8FF00"
forge style '{"letterSpacing":"0.08em","textTransform":"uppercase"}'

# 3. Headline
forge insert text
forge set-text "I design SaaS products that people actually enjoy using" --font "Space Grotesk" --size 64 --weight 600 --color "#E8E8E8"
forge style '{"maxWidth":"800px","textAlign":"center","marginTop":"24px","letterSpacing":"-0.03em","lineHeight":"1.05"}'

# 4. Subhead
forge insert text
forge set-text "Currently crafting interfaces at the intersection of clarity and delight. Previously at Linear, Vercel, and Stripe." --font "DM Sans" --size 17 --weight 400 --color "#8A8A8A"
forge style '{"maxWidth":"560px","textAlign":"center","marginTop":"24px","lineHeight":"1.6"}'

# 5. Screenshot & QA
forge screenshot -o step-2-hero.png
```

---

## Section 3: Selected Work

```bash
# 1. Section container
forge insert frame
forge style '{"width":"100%","maxWidth":"1200px","margin":"0 auto","padding":"96px 32px","backgroundColor":"#0A0A0A"}'

# 2. Section label
forge insert text
forge set-text "SELECTED WORK" --font "DM Sans" --size 12 --weight 500 --color "#8A8A8A"
forge style '{"letterSpacing":"0.08em","textTransform":"uppercase","marginBottom":"48px"}'

# 3. Project grid container
forge insert frame
forge style '{"display":"grid","gridTemplateColumns":"repeat(2, 1fr)","gap":"24px"}'

# --- Project Card 1 ---
forge insert frame
forge style '{"backgroundColor":"#111111","borderRadius":"12px","border":"1px solid #1E1E1E","overflow":"hidden","cursor":"pointer"}'

# Card image placeholder
forge insert frame
forge style '{"width":"100%","aspectRatio":"16/10","backgroundColor":"#1A1A1A"}'

# Card text area
forge insert frame
forge style '{"padding":"24px 32px 32px"}'

forge insert text
forge set-text "Acme Dashboard" --font "Space Grotesk" --size 20 --weight 600 --color "#E8E8E8"

forge insert text
forge set-text "Redesigning the analytics experience for a B2B SaaS platform serving 10k+ teams." --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"8px","lineHeight":"1.5"}'

# Tags row
forge insert stack
forge set-layout horizontal --gap 8
forge style '{"marginTop":"16px"}'

forge insert frame
forge style '{"backgroundColor":"#1A1A1A","border":"1px solid #1E1E1E","borderRadius":"8px","padding":"4px 12px"}'
forge insert text
forge set-text "Product Design" --font "DM Sans" --size 12 --weight 500 --color "#8A8A8A"

forge insert frame
forge style '{"backgroundColor":"#1A1A1A","border":"1px solid #1E1E1E","borderRadius":"8px","padding":"4px 12px"}'
forge insert text
forge set-text "Design System" --font "DM Sans" --size 12 --weight 500 --color "#8A8A8A"

# --- Project Card 2 ---
forge insert frame
forge style '{"backgroundColor":"#111111","borderRadius":"12px","border":"1px solid #1E1E1E","overflow":"hidden","cursor":"pointer"}'

forge insert frame
forge style '{"width":"100%","aspectRatio":"16/10","backgroundColor":"#1A1A1A"}'

forge insert frame
forge style '{"padding":"24px 32px 32px"}'

forge insert text
forge set-text "Nebula Onboarding" --font "Space Grotesk" --size 20 --weight 600 --color "#E8E8E8"

forge insert text
forge set-text "Reducing time-to-value from 14 days to 3 with a guided onboarding flow." --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"8px","lineHeight":"1.5"}'

forge insert stack
forge set-layout horizontal --gap 8
forge style '{"marginTop":"16px"}'

forge insert frame
forge style '{"backgroundColor":"#1A1A1A","border":"1px solid #1E1E1E","borderRadius":"8px","padding":"4px 12px"}'
forge insert text
forge set-text "UX Research" --font "DM Sans" --size 12 --weight 500 --color "#8A8A8A"

forge insert frame
forge style '{"backgroundColor":"#1A1A1A","border":"1px solid #1E1E1E","borderRadius":"8px","padding":"4px 12px"}'
forge insert text
forge set-text "Interaction Design" --font "DM Sans" --size 12 --weight 500 --color "#8A8A8A"

# --- Project Card 3 ---
forge insert frame
forge style '{"backgroundColor":"#111111","borderRadius":"12px","border":"1px solid #1E1E1E","overflow":"hidden","cursor":"pointer"}'

forge insert frame
forge style '{"width":"100%","aspectRatio":"16/10","backgroundColor":"#1A1A1A"}'

forge insert frame
forge style '{"padding":"24px 32px 32px"}'

forge insert text
forge set-text "Relay Messaging" --font "Space Grotesk" --size 20 --weight 600 --color "#E8E8E8"

forge insert text
forge set-text "A real-time collaboration tool built for distributed engineering teams." --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"8px","lineHeight":"1.5"}'

forge insert stack
forge set-layout horizontal --gap 8
forge style '{"marginTop":"16px"}'

forge insert frame
forge style '{"backgroundColor":"#1A1A1A","border":"1px solid #1E1E1E","borderRadius":"8px","padding":"4px 12px"}'
forge insert text
forge set-text "Product Design" --font "DM Sans" --size 12 --weight 500 --color "#8A8A8A"

forge insert frame
forge style '{"backgroundColor":"#1A1A1A","border":"1px solid #1E1E1E","borderRadius":"8px","padding":"4px 12px"}'
forge insert text
forge set-text "Prototyping" --font "DM Sans" --size 12 --weight 500 --color "#8A8A8A"

# --- Project Card 4 ---
forge insert frame
forge style '{"backgroundColor":"#111111","borderRadius":"12px","border":"1px solid #1E1E1E","overflow":"hidden","cursor":"pointer"}'

forge insert frame
forge style '{"width":"100%","aspectRatio":"16/10","backgroundColor":"#1A1A1A"}'

forge insert frame
forge style '{"padding":"24px 32px 32px"}'

forge insert text
forge set-text "Clearpath Finance" --font "Space Grotesk" --size 20 --weight 600 --color "#E8E8E8"

forge insert text
forge set-text "Simplifying expense management for startups with fewer than 50 employees." --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"8px","lineHeight":"1.5"}'

forge insert stack
forge set-layout horizontal --gap 8
forge style '{"marginTop":"16px"}'

forge insert frame
forge style '{"backgroundColor":"#1A1A1A","border":"1px solid #1E1E1E","borderRadius":"8px","padding":"4px 12px"}'
forge insert text
forge set-text "Mobile Design" --font "DM Sans" --size 12 --weight 500 --color "#8A8A8A"

forge insert frame
forge style '{"backgroundColor":"#1A1A1A","border":"1px solid #1E1E1E","borderRadius":"8px","padding":"4px 12px"}'
forge insert text
forge set-text "Design System" --font "DM Sans" --size 12 --weight 500 --color "#8A8A8A"

# 4. Screenshot & QA
forge screenshot -o step-3-work.png
```

---

## Section 4: About

```bash
# 1. Section container
forge insert frame
forge style '{"width":"100%","maxWidth":"1200px","margin":"0 auto","padding":"96px 32px","backgroundColor":"#0A0A0A"}'

# 2. Two-column layout
forge insert frame
forge style '{"display":"flex","gap":"64px","alignItems":"flex-start"}'

# 3. Left column: image placeholder
forge insert frame
forge style '{"width":"40%","flexShrink":"0","aspectRatio":"3/4","backgroundColor":"#1A1A1A","borderRadius":"12px"}'

# 4. Right column: text content
forge insert frame
forge style '{"flex":"1"}'

forge insert text
forge set-text "ABOUT" --font "DM Sans" --size 12 --weight 500 --color "#8A8A8A"
forge style '{"letterSpacing":"0.08em","textTransform":"uppercase","marginBottom":"24px"}'

forge insert text
forge set-text "Designing with intention" --font "Space Grotesk" --size 44 --weight 600 --color "#E8E8E8"
forge style '{"letterSpacing":"-0.02em","lineHeight":"1.1","marginBottom":"24px"}'

forge insert text
forge set-text "I'm a product designer who believes great software should feel invisible. My work focuses on reducing complexity, not adding features. Every interaction should serve the person using it." --font "DM Sans" --size 17 --weight 400 --color "#8A8A8A"
forge style '{"lineHeight":"1.6","maxWidth":"520px","marginBottom":"16px"}'

forge insert text
forge set-text "Over the past eight years, I've helped SaaS companies ship products used by millions. I care about typographic systems, information density, and making enterprise tools feel as good as consumer apps." --font "DM Sans" --size 17 --weight 400 --color "#8A8A8A"
forge style '{"lineHeight":"1.6","maxWidth":"520px"}'

# 5. Screenshot & QA
forge screenshot -o step-4-about.png
```

---

## Section 5: Contact / CTA

```bash
# 1. Section container
forge insert frame
forge style '{"width":"100%","padding":"128px 32px","backgroundColor":"#0A0A0A","borderTop":"1px solid #1E1E1E","display":"flex","flexDirection":"column","alignItems":"center"}'

# 2. Label
forge insert text
forge set-text "GET IN TOUCH" --font "DM Sans" --size 12 --weight 500 --color "#C8FF00"
forge style '{"letterSpacing":"0.08em","textTransform":"uppercase"}'

# 3. Headline
forge insert text
forge set-text "Let's build something great" --font "Space Grotesk" --size 44 --weight 600 --color "#E8E8E8"
forge style '{"letterSpacing":"-0.02em","lineHeight":"1.1","marginTop":"24px","textAlign":"center"}'

# 4. Subhead
forge insert text
forge set-text "Always open to interesting projects and collaborations." --font "DM Sans" --size 17 --weight 400 --color "#8A8A8A"
forge style '{"marginTop":"16px","textAlign":"center"}'

# 5. Email link
forge insert text
forge set-text "hello@mikachen.design" --font "Space Grotesk" --size 20 --weight 500 --color "#C8FF00"
forge style '{"marginTop":"32px"}'

# 6. Screenshot & QA
forge screenshot -o step-5-contact.png
```

---

## Section 6: Footer

```bash
# 1. Footer container
forge insert frame
forge style '{"width":"100%","maxWidth":"1200px","margin":"0 auto","padding":"32px","borderTop":"1px solid #1E1E1E","display":"flex","justifyContent":"space-between","alignItems":"center"}'

# 2. Copyright (left)
forge insert text
forge set-text "2026 Mika Chen" --font "DM Sans" --size 14 --weight 400 --color "#555555"

# 3. Social links (right)
forge insert stack
forge set-layout horizontal --gap 24

forge insert text
forge set-text "Twitter" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"

forge insert text
forge set-text "Dribbble" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"

forge insert text
forge set-text "LinkedIn" --font "DM Sans" --size 14 --weight 400 --color "#8A8A8A"

# 4. Screenshot & QA
forge screenshot -o step-6-footer.png
```

---

## Final QA & Publish

```bash
# Full-page screenshot at 2x for crisp evaluation
forge screenshot --full-page --2x -o full-page-qa.png

# After QA pass completes with A grade:
forge publish
forge screenshot --full-page --2x -o final-live.png
```
