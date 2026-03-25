# Design QA Report: Hero Section Evaluation

## Overall Verdict: Needs Significant Rework

This hero section hits nearly every marker on the "generic AI-generated design" checklist. The individual choices are not bad in isolation, but assembled together they produce something indistinguishable from a thousand template sites. Below is a detailed breakdown.

---

## Issue 1: Purple-to-Pink Gradient Background

**Severity:** High — This is the single most overused color treatment in AI-generated and template web design.

**Problem:** The #8B5CF6-to-#EC4899 gradient (violet-to-pink) has become the default "modern tech" background. It signals "generated, not designed." It carries no meaning specific to your brand, product, or audience. It is the gradient equivalent of Lorem Ipsum — a placeholder that shipped.

**Alternatives:**
- **If the brand is energetic/creative:** Try a warm amber (#F59E0B) to deep coral (#DC2626) diagonal gradient with a grain texture overlay at 4-6% opacity. Adds warmth and grit.
- **If the brand is trustworthy/professional:** Use a single deep navy (#0F172A) or charcoal (#1C1917) background with a single bold accent color for the CTA. Let typography and spacing do the work.
- **If you want color impact:** Try a duotone treatment on the hero image itself instead of a flat gradient behind it. Map shadows to a deep teal and highlights to warm cream.
- **If gradient is non-negotiable:** At minimum, shift to less saturated, less symmetrical color stops. A muted sage (#6B8F71) to soft slate (#475569) reads as intentional and designed rather than default.

---

## Issue 2: Inter at 400 Weight

**Severity:** High — Inter is explicitly called out in the skill guidelines as a generic, overused font to avoid.

**Problem:** Inter is the "safe default" of modern web typography. It was designed to be invisible, which is exactly the problem in a hero section — the one place your typography should have presence and personality. Weight 400 (regular) compounds this: it is the most neutral weight of the most neutral font. Nothing about it communicates a point of view.

**Alternatives:**
- **Editorial/luxury direction:** Playfair Display or Fraunces for the heading (serif with character), paired with DM Sans or Satoshi for body text.
- **Brutalist/raw direction:** Clash Display or Space Mono for headings, with Outfit or General Sans for body.
- **Organic/humanist direction:** Recoleta or Gambarino for the heading, Poppins or Nunito for body.
- **Technical/precise direction:** JetBrains Mono or IBM Plex Mono for headings, IBM Plex Sans for body.
- **Key rule:** The heading font should have *personality*. The body font should be *legible*. They should contrast with each other. A hero heading at weight 400 is a missed opportunity — go bold (700+) or go light (200-300) with large size for drama.

---

## Issue 3: 42px Heading / 12px Body Text — Broken Type Scale

**Severity:** Critical — This is a usability and hierarchy failure, not just an aesthetic one.

**Problem:** The ratio between heading and body is 3.5:1, which sounds dramatic but 12px body text is genuinely hard to read on most screens, especially for users over 35 or on lower-resolution displays. The WCAG recommendation is a minimum of 16px for body text. At 12px, you are actively harming readability for a large portion of your audience.

Meanwhile, 42px for a hero heading is undersized. Hero headings on a 1440px canvas typically land between 56px and 96px. At 42px, the heading lacks the visual weight to anchor the section.

**Recommended type scale:**
- Hero heading: **64px-80px**, weight 700+, tight letter-spacing (-0.02em to -0.04em)
- Hero subheading/body: **18px-20px**, weight 400-450, relaxed line-height (1.5-1.6)
- This gives a ratio closer to 4:1 while keeping both sizes in readable, impactful territory
- Consider a fluid type scale using `clamp()`: e.g., `clamp(2.5rem, 5vw, 5rem)` for the heading

---

## Issue 4: Full-Width Centered Text on 1440px

**Severity:** Medium — A readability and composition problem.

**Problem:** Body text spanning the full 1440px container means line lengths far exceed the optimal 45-75 character range. At 12px (or even 18px), text running 1440px wide is effectively unreadable — the eye cannot track from the end of one line to the beginning of the next. This is a well-documented readability failure.

Centering everything also creates a static, symmetrical layout that lacks visual tension.

**Alternatives:**
- **Constrain the text block:** Set `max-width: 680px` (or `ch`-based: `max-width: 65ch`) on the text container, centered within the 1440px frame. The surrounding negative space becomes a design element.
- **Asymmetric layout:** Place heading and text on the left 60% of the grid, let the image or a decorative element occupy the right 40%. Creates diagonal eye flow.
- **Split layout:** Heading full-width and large, body text in a narrower column below or offset to one side. Creates hierarchy through spatial separation, not just font size.

---

## Issue 5: Stock Photo of People in an Office

**Severity:** High — Generic stock photography actively undermines trust and distinctiveness.

**Problem:** "People smiling in an office" is the most common hero image on the internet. Users have developed banner blindness to it. Studies (notably by NN/g) show that users skip generic stock photos entirely — they do not process them as meaningful content. The image occupies space and bandwidth without contributing to the message.

**Alternatives:**
- **Abstract/geometric art:** A custom SVG illustration or generative pattern that reflects your brand's personality. Zero cheese factor.
- **Product screenshot/UI mockup:** If this is a SaaS or tool, show the actual product. Most compelling hero images are the product itself, styled with a subtle shadow and rotation.
- **Textured background + illustration:** Replace the photo with a hand-drawn or isometric illustration that communicates the specific value prop, not a generic "business" vibe.
- **Photography, done right:** If you must use a photo, invest in one that is contextually specific, has a strong editorial crop (not centered, not everyone looking at camera), and uses real color grading (not the default Unsplash look). Lifestyle photography works when it tells a specific story.
- **No image at all:** Some of the most effective hero sections use typography, color, and spacing alone. Stripe, Linear, and Vercel all prove that a hero does not need an image to be compelling.

---

## Issue 6: Muted Gray Palette

**Severity:** Medium — Safe to the point of invisibility.

**Problem:** A muted gray palette paired with a saturated gradient creates a tonal mismatch. The gradient screams for attention while the rest of the page whispers. Either commit to color or commit to restraint — the combination reads as indecisive.

**Alternatives:**
- **If restraint is the goal:** Drop the gradient. Use the gray palette as your foundation with a single, sharp accent color (one hue, two shades max) for CTAs and key UI elements.
- **If vibrancy is the goal:** Let color extend beyond the gradient. Use tinted grays (warm grays like #78716C or cool grays like #64748B) instead of neutral grays. Tinted grays create cohesion with any color scheme.

---

## Summary of Recommended Changes

| Element | Current | Recommended |
|---|---|---|
| Background | Purple-to-pink gradient | Context-specific: deep solid, duotone image treatment, or desaturated gradient with texture |
| Heading font | Inter 400 | Distinctive display font (Fraunces, Clash Display, etc.) at 700+ weight |
| Body font | Inter 400, 12px | Clean sans-serif at 18-20px, weight 400 |
| Heading size | 42px | 64-80px with tight tracking |
| Text width | Full 1440px | max-width: 65ch (~680px), centered or left-aligned |
| Layout | Centered, symmetrical | Asymmetric or constrained-center with intentional negative space |
| Image | Stock office photo | Product shot, custom illustration, or typography-only hero |
| Color palette | Muted gray + saturated gradient | Tinted grays with a cohesive, restrained accent system |

---

## The Core Problem

Every choice in this hero section is the *default* choice — the one you arrive at by not deciding. Purple gradient, Inter, centered layout, stock photo. Individually forgivable; together, they signal "template." A memorable hero section needs at least one genuinely unexpected choice — an arresting typeface, a bold layout, an unconventional color, a striking image — executed with commitment. Pick one element to make unforgettable and build the rest of the section to support it.
