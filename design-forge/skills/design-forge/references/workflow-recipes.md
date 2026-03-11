# Workflow Recipes

Step-by-step `forge` CLI sequences for common design tasks. Each recipe is a numbered sequence the canvas-operator follows mechanically.

---

## Recipe 1: Hero Section (Dark)

```bash
# 1. Create hero frame
forge insert frame
forge style '{"width":"100%","height":"720px","backgroundColor":"#0A0A0A","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","padding":"48px"}'

# 2. Add headline
forge insert text
forge set-text "Your Headline Here" --font "Space Grotesk" --size 64 --weight 700 --color "#E8E8E8"

# 3. Add subhead
forge insert text
forge set-text "A clear explanation of what you do and who it's for." --font "DM Sans" --size 18 --weight 400 --color "#999999"
forge style '{"maxWidth":"600px","textAlign":"center","marginTop":"24px"}'

# 4. Add CTA button
forge insert frame
forge style '{"backgroundColor":"#4F46E5","borderRadius":"12px","padding":"14px 28px","marginTop":"32px","cursor":"pointer"}'
forge insert text
forge set-text "Get Started" --font "DM Sans" --size 16 --weight 600 --color "#FFFFFF"

# 5. Screenshot and verify
forge screenshot -o hero-check.png
```

## Recipe 2: Navigation Bar

```bash
# 1. Create nav frame
forge insert frame
forge style '{"width":"100%","height":"64px","backgroundColor":"rgba(10,10,10,0.8)","backdropFilter":"blur(12px)","display":"flex","alignItems":"center","justifyContent":"space-between","padding":"0 32px","position":"fixed","top":"0","zIndex":"100"}'

# 2. Logo/brand name (left)
forge insert text
forge set-text "Brand" --font "Space Grotesk" --size 20 --weight 700 --color "#E8E8E8"

# 3. Nav links (center group)
forge insert stack
forge set-layout horizontal --gap 32
# Add individual text links inside the stack
forge insert text
forge set-text "Features" --font "DM Sans" --size 14 --weight 500 --color "#999999"
forge insert text
forge set-text "Pricing" --font "DM Sans" --size 14 --weight 500 --color "#999999"
forge insert text
forge set-text "About" --font "DM Sans" --size 14 --weight 500 --color "#999999"

# 4. CTA button (right)
forge insert frame
forge style '{"backgroundColor":"#4F46E5","borderRadius":"8px","padding":"10px 20px"}'
forge insert text
forge set-text "Sign Up" --font "DM Sans" --size 14 --weight 600 --color "#FFFFFF"

# 5. Verify
forge screenshot -o nav-check.png
```

## Recipe 3: Feature Grid (3 columns)

```bash
# 1. Section container
forge insert frame
forge style '{"width":"100%","maxWidth":"1200px","margin":"0 auto","padding":"96px 32px","backgroundColor":"#0A0A0A"}'

# 2. Section heading
forge insert text
forge set-text "Features" --font "Space Grotesk" --size 40 --weight 700 --color "#E8E8E8"
forge style '{"textAlign":"center","marginBottom":"64px"}'

# 3. Grid container
forge insert frame
forge style '{"display":"grid","gridTemplateColumns":"repeat(3, 1fr)","gap":"32px"}'

# 4. Feature card (repeat 3x, changing content)
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid rgba(255,255,255,0.06)"}'
forge insert text
forge set-text "Feature Title" --font "Space Grotesk" --size 24 --weight 600 --color "#E8E8E8"
forge insert text
forge set-text "Brief description of this feature and why it matters to the user." --font "DM Sans" --size 16 --weight 400 --color "#999999"
forge style '{"marginTop":"12px","lineHeight":"1.6"}'

# 5. Verify
forge screenshot -o features-check.png
```

## Recipe 4: Footer

```bash
# 1. Footer container
forge insert frame
forge style '{"width":"100%","backgroundColor":"#0A0A0A","borderTop":"1px solid #1A1A1A","padding":"64px 32px 32px"}'

# 2. Footer grid (4 columns)
forge insert frame
forge style '{"maxWidth":"1200px","margin":"0 auto","display":"grid","gridTemplateColumns":"2fr 1fr 1fr 1fr","gap":"48px"}'

# 3. Brand column
forge insert frame
forge insert text
forge set-text "Brand" --font "Space Grotesk" --size 20 --weight 700 --color "#E8E8E8"
forge insert text
forge set-text "A brief tagline or description." --font "DM Sans" --size 14 --weight 400 --color "#666666"
forge style '{"marginTop":"12px"}'

# 4. Link columns (repeat pattern)
forge insert frame
forge insert text
forge set-text "Product" --font "DM Sans" --size 12 --weight 600 --color "#999999"
forge style '{"textTransform":"uppercase","letterSpacing":"0.05em","marginBottom":"16px"}'
# Add link items
forge insert text
forge set-text "Features" --font "DM Sans" --size 14 --weight 400 --color "#666666"

# 5. Copyright line
forge insert frame
forge style '{"maxWidth":"1200px","margin":"32px auto 0","paddingTop":"32px","borderTop":"1px solid #1A1A1A"}'
forge insert text
forge set-text "2026 Brand. All rights reserved." --font "DM Sans" --size 14 --weight 400 --color "#444444"

# 6. Verify
forge screenshot -o footer-check.png
```

## Recipe 5: Testimonial Section

```bash
# 1. Section container
forge insert frame
forge style '{"width":"100%","padding":"96px 32px","backgroundColor":"#0F0F0F"}'

# 2. Heading
forge insert text
forge set-text "What people are saying" --font "Space Grotesk" --size 40 --weight 700 --color "#E8E8E8"
forge style '{"textAlign":"center","marginBottom":"64px"}'

# 3. Testimonial grid (3 cards)
forge insert frame
forge style '{"maxWidth":"1200px","margin":"0 auto","display":"grid","gridTemplateColumns":"repeat(3, 1fr)","gap":"24px"}'

# 4. Quote card
forge insert frame
forge style '{"backgroundColor":"#141414","borderRadius":"16px","padding":"32px","border":"1px solid rgba(255,255,255,0.06)"}'
forge insert text
forge set-text "\"This product completely changed how we work. The results speak for themselves.\"" --font "DM Sans" --size 16 --weight 400 --color "#CCCCCC"
forge style '{"lineHeight":"1.6","marginBottom":"24px"}'
# Author
forge insert frame
forge style '{"display":"flex","alignItems":"center","gap":"12px"}'
forge insert frame
forge style '{"width":"40px","height":"40px","borderRadius":"20px","backgroundColor":"#2A2A2A"}'
forge insert frame
forge insert text
forge set-text "Jane Smith" --font "DM Sans" --size 14 --weight 600 --color "#E8E8E8"
forge insert text
forge set-text "CEO at Company" --font "DM Sans" --size 13 --weight 400 --color "#666666"
```

## Recipe 6: Full Page Assembly

The complete sequence for a landing page:

```bash
# 1. Set up page
forge create-project --template blank
forge screenshot -o step-0-blank.png

# 2. Build nav
# [Run Recipe 2]
forge screenshot -o step-1-nav.png

# 3. Build hero
# [Run Recipe 1]
forge screenshot -o step-2-hero.png

# 4. Build features
# [Run Recipe 3]
forge screenshot -o step-3-features.png

# 5. Build testimonials
# [Run Recipe 5]
forge screenshot -o step-4-testimonials.png

# 6. Build footer
# [Run Recipe 4]
forge screenshot -o step-5-footer.png

# 7. Full-page QA
forge screenshot --full-page -o full-page-qa.png

# 8. Publish
forge publish
```

---

## Notes

- Each recipe is a starting point — the design-director customizes colors, fonts, content per the DDD
- Screenshot after each major section for the visual-qa loop
- The canvas-operator executes recipes literally, substituting DDD values
- If a step fails, use `forge evaluate` as escape hatch to inspect/fix DOM state
