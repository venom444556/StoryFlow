---
name: vibe-check
description: >
  Production-grade design vision matching Vibecode, UX Pilot, and Bevel quality.
  Covers visual direction, interaction patterns, data visualization, and component
  systems. Hybrid approach: prescriptive when obvious, generative when exploring.
---

# Vibe Check

Creates production-grade design vision with the polish of Vibecode, UX Pilot, and Bevel. Goes beyond aesthetics to include interactions, data viz, and component architecture.

## When to use

**TRIGGERS:**
- Designing new features, screens, or applications
- User wants "make this look professional", "production quality", "app store ready"
- Need design direction for UI/UX work
- Building dashboards, data visualizations, or complex interfaces
- User references high-quality apps (Stripe, Linear, Notion, Bevel, Athlytic)

## Instructions

**Core Principle: Production Quality by Default**
Every design should feel like it came from a $10M funded startup with a full design team. No shortcuts, no "good enough" - production polish from the start.

### Design Thinking Process

**Step 1: Understand Context**
- **Purpose**: What problem does this solve? What's the user's goal?
- **Audience**: Technical users? Consumers? Health enthusiasts? Designers?
- **Platform**: iOS app? Web dashboard? Desktop tool?
- **Data complexity**: Simple CRUD? Real-time metrics? Complex analytics?
- **Brand position**: Premium? Accessible? Technical? Playful?

**Step 2: Choose Design Approach**

**Prescriptive (when path is obvious):**
- Health/fitness app → Bevel-style gradient rings + clean metrics
- Developer tool → Dark UI with syntax highlighting colors
- Recipe app → Warm, food-focused with orange accent
- Analytics dashboard → UX Pilot style with purple/blue gradients
- Mobile onboarding → Vibecode/HYPRX polished brand colors

**Generative (when exploring):**
Present 2-3 distinct directions:
- **Option A**: [Clear aesthetic with rationale]
- **Option B**: [Alternative approach with trade-offs]
- **Option C**: [Bold/unexpected direction]

Each option includes: visual mockup description, color palette, typography, interaction style, and what it communicates.

**Step 3: Define Complete Design System**

Not just colors and fonts - a complete visual language:

**1. Color System**
```
Primary: [Brand color with specific hex]
Secondary: [Supporting color]
Accent: [Call-to-action color]
Success: [Green for positive states]
Warning: [Orange/yellow for caution]
Error: [Red for errors]
Neutral scale: [8-step gray scale from near-white to near-black]

Gradients: [Specific gradient formulas]
- Header gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- Success glow: radial-gradient(circle, #10b981 0%, transparent 70%)

Dark mode: [Complete dark palette with adjusted colors]
```

**2. Typography Scale**
```
Display: 48-72px (hero headers)
H1: 36-48px (page titles)
H2: 24-32px (section headers)
H3: 20-24px (subsection headers)
Body Large: 18px (emphasis text)
Body: 16px (primary reading)
Body Small: 14px (secondary info)
Caption: 12px (metadata, labels)

Font pairing:
- Display/Headers: [Specific font with weights]
- Body: [Specific font with weights]
- Monospace: [For code/data]

Line heights: 1.2 (tight), 1.5 (normal), 1.8 (relaxed)
Letter spacing: -0.02em (large), 0 (normal), 0.05em (uppercase)
```

**3. Spacing System (8px base)**
```
4px  - Tight (icon padding, close elements)
8px  - Close (form field internal padding)
12px - Compact (small card padding)
16px - Default (standard element spacing)
24px - Comfortable (section internal spacing)
32px - Spacious (between sections)
48px - Generous (major section breaks)
64px - Dramatic (page-level separation)
```

**4. Component Specifications**

**Buttons:**
```
Primary:
- Height: 44px (mobile) / 40px (desktop)
- Padding: 16px horizontal
- Border radius: 8px
- Background: Primary color
- Text: White, 16px, semibold
- Hover: Darken 10% + lift 2px
- Active: Scale 0.98
- Disabled: 40% opacity

Secondary:
- Background: Transparent
- Border: 1px solid neutral-300
- Text: Neutral-900
- Hover: Background neutral-100

Tertiary:
- Background: None
- Text: Primary color
- Hover: Underline
```

**Cards:**
```
Standard:
- Background: White (light) / Neutral-900 (dark)
- Border: 1px solid neutral-200
- Border radius: 12px
- Padding: 20px
- Shadow: 0 2px 8px rgba(0,0,0,0.08)
- Hover: Shadow 0 4px 16px rgba(0,0,0,0.12) + lift 2px
```

**Input Fields:**
```
Default:
- Height: 44px
- Padding: 12px
- Border: 1px solid neutral-300
- Border radius: 8px
- Focus: Border primary-500 + ring 3px primary-100
- Error: Border error-500 + ring 3px error-100
- Label: 14px, semibold, neutral-700, 8px margin bottom
- Helper text: 12px, neutral-600, 4px margin top
```

**5. Data Visualization Patterns**

**Gradient Ring Charts (Bevel/Athlytic style):**
```
Structure:
- SVG circle with stroke-dasharray for progress
- Gradient stroke: linear-gradient matching brand
- Background ring: 10% opacity of gradient
- Center metric: Large number (48px) + label (14px)
- Smooth animation: 1000ms ease-out on mount

Example (Heart Rate):
- Outer ring: 120px diameter, 12px stroke
- Gradient: linear-gradient(135deg, #ef4444, #f97316)
- Value: 72 bpm (center, 48px bold)
- Label: "Resting HR" (14px, below value)
```

**Line Charts (Trend data):**
```
Style:
- Smooth curves (not jagged)
- Gradient fill below line (10% opacity)
- Dots on data points (4px radius)
- Hover: Enlarge dot to 8px + show tooltip
- Grid: Subtle (5% opacity horizontal lines)
- Axis labels: 12px, neutral-600
```

**Bar Charts (Comparisons):**
```
Style:
- Rounded tops (4px radius)
- Gradient fill (vertical gradient)
- Spacing: 8px between bars
- Hover: Brighten 20% + lift effect
- Labels: Inside bars (white) or below (neutral-900)
```

**Stat Cards (Key Metrics):**
```
Layout:
- Icon (24px) + Label (12px caps) in header
- Value: 36px bold, primary color
- Change indicator: +5% (green) / -2% (red) with arrow
- Sparkline: Tiny trend line below value (optional)
```

**6. Interaction & Animation**

**Timing Functions:**
```
Instant: 0ms (immediate feedback)
Fast: 150ms (hover states)
Normal: 300ms (standard transitions)
Slow: 500ms (page transitions)
Dramatic: 800ms (major state changes)

Easing:
- ease-out: Most transitions (feels snappy)
- ease-in-out: Smooth movements
- spring: Playful interactions (CSS: cubic-bezier(0.68, -0.55, 0.265, 1.55))
```

**Micro-interactions:**
```
Button press:
- Scale 0.95 on mousedown
- Return to 1.0 with spring easing
- Haptic feedback on mobile

Toggle switch:
- Circle slides with ease-out (300ms)
- Background color fades (200ms)
- Slight scale on interaction (1.05)

Loading states:
- Skeleton shimmer: Moving gradient (1500ms infinite)
- Spinner: Rotate 360deg (800ms infinite ease-in-out)
- Progress bar: Width transition (300ms ease-out)

Success states:
- Checkmark scale in (spring effect)
- Green glow pulse (500ms)
- Haptic success feedback
```

**Gesture Patterns (Mobile):**
```
Swipe to delete:
- Swipe left reveals red background + trash icon
- Threshold: 60% width = confirm delete
- Spring back if <60%

Pull to refresh:
- Pull down shows spinner
- Release triggers refresh
- Spinner animates while loading

Pinch to zoom (images/charts):
- 2-finger pinch scales content
- Max zoom: 3x
- Return to 1x with double-tap
```

**7. Responsive Behavior**

**Breakpoints:**
```
Mobile: 320-767px
Tablet: 768-1023px
Desktop: 1024-1439px
Large: 1440px+

Navigation:
- Mobile: Bottom tab bar (5 items max)
- Tablet: Side rail (collapsed by default)
- Desktop: Full sidebar (expanded)

Grids:
- Mobile: 1 column (full width)
- Tablet: 2 columns (50/50)
- Desktop: 3-4 columns (responsive)

Typography:
- Mobile: -20% from base sizes
- Desktop: Base sizes
- Large: +10% for comfortable reading
```

**8. Dark Mode Strategy**

Not just inverted colors - thoughtful dark design:

```
Background layers:
- Base: #0a0a0a (near black, not pure black)
- Elevated: #1a1a1a (cards, modals)
- Overlay: #2a2a2a (dropdowns, tooltips)

Text:
- Primary: #fafafa (high contrast)
- Secondary: #a1a1a1 (medium contrast)
- Tertiary: #737373 (low contrast, metadata)

Colors adjustments:
- Desaturate by 20% (less harsh)
- Reduce brightness of accent colors
- Increase contrast for accessibility

Shadows:
- Light mode: 0 4px 16px rgba(0,0,0,0.12)
- Dark mode: 0 4px 16px rgba(0,0,0,0.5) + highlight glow

Borders:
- Light mode: Neutral-200
- Dark mode: Neutral-800 (darker, subtle)
```

### Reference Quality Standards

**Bevel/Athlytic (Health & Fitness):**
- Gradient ring charts for metrics
- Clean stat cards with change indicators
- Smooth animations on data updates
- Purple/cyan gradient accent colors
- Clear hierarchy (large numbers, small labels)

**UX Pilot (Dashboards):**
- Dark UI with purple/blue accents
- Sophisticated data visualizations
- Hover states reveal detail
- Grid-based layouts
- Status badges (success, in-progress, scheduled)

**Vibecode/HYPRX (Mobile Apps):**
- Strong brand color (orange, pink-purple)
- Polished onboarding flows
- Clear value proposition cards
- Sign-in with Apple/Google buttons (standard iOS/Android patterns)
- Smooth page transitions

**Sous Chef (Food & Recipe):**
- Warm orange accent (#FF6B35)
- Clean white backgrounds
- Food photography hero images
- Simple ingredient lists (clean typography)
- Bottom tab navigation (standard iOS pattern)

### Output Format

```
Design System: [Project Name]

Context:
- Purpose: [What this solves]
- Audience: [Who uses this]
- Platform: [iOS/Web/Desktop]
- Quality bar: [Bevel-level polish / Vibecode-level brand / UX Pilot-level data viz]

Design Direction:
[If prescriptive: Single clear direction with rationale]
[If generative: 2-3 options with mockup descriptions and trade-offs]

Color System:
Primary: #667eea (Vibrant purple)
Accent: #10b981 (Success green)
[Complete palette with hex codes]

Typography:
Display: SF Pro Display, 48px, Bold
Body: SF Pro Text, 16px, Regular
[Complete scale]

Components:
[Detailed specs for buttons, cards, inputs, etc.]

Data Visualization:
[Specific chart types with styling details]

Interactions:
[Micro-interactions, animations, gestures]

Responsive:
[Mobile/tablet/desktop adaptations]

Dark Mode:
[Complete dark palette and adjustments]

Implementation Notes:
[Key details for frontend-design to execute]
```

### Production Quality Checklist

Before delivering, verify:
- ✅ Color palette has 4.5:1 contrast minimum (text)
- ✅ Touch targets are 44x44px minimum (mobile)
- ✅ Animations use GPU-accelerated properties (transform, opacity)
- ✅ Dark mode is thoughtful, not just inverted
- ✅ Typography scale is consistent (no random sizes)
- ✅ Spacing follows 8px grid system
- ✅ Components have all states (default, hover, active, disabled, error)
- ✅ Data viz has smooth animations and hover details
- ✅ Loading states are polished (not just spinners)
- ✅ Mobile gestures follow platform conventions
- ✅ Feels like a $10M funded product

**Authority:**
Design systems lead - defines visual language and component specs. Feeds direction to frontend-design for implementation. Advisory to Architect for UX decisions.

## Examples

**Example 1: Health & Fitness Dashboard (Bevel-style)**
```
User: "Design a fitness tracking dashboard showing workout stats"

Vibe Check:

Context:
- Purpose: Daily fitness metrics and progress tracking
- Audience: Health-conscious users, 25-45 years old
- Platform: iOS mobile app
- Quality bar: Bevel/Athlytic polish with gradient data viz

Design Direction: (Prescriptive - health app pattern is established)

Gradient ring charts for key metrics (Heart Rate, Steps, Calories)
Clean stat cards with change indicators
Purple-to-cyan gradient theme (energetic, modern)
Dark mode friendly

Color System:
Primary gradient: linear-gradient(135deg, #667eea 0%, #06b6d4 100%)
Success: #10b981 (green for achievements)
Warning: #f59e0b (orange for alerts)
Background: #fafafa (light) / #0a0a0a (dark)
Card: #ffffff (light) / #1a1a1a (dark)

Typography:
Display: SF Pro Display, Bold
- Metric values: 48px
Body: SF Pro Text, Regular
- Labels: 14px
- Descriptions: 16px

Key Metrics Section (Top):
Layout: 3 gradient ring charts in horizontal scroll
Each ring:
- 120px diameter, 12px stroke width
- Gradient stroke: Matches primary gradient
- Background ring: 10% opacity
- Center value: 48px bold, primary color
- Label below: 14px, neutral-600

Ring 1 - Heart Rate:
- Value: 72 bpm
- Gradient: #ef4444 to #f97316 (red-orange)
- Progress: 85% of healthy range

Ring 2 - Steps:
- Value: 8,432
- Gradient: #10b981 to #06b6d4 (green-cyan)
- Progress: 84% of 10k goal

Ring 3 - Calories:
- Value: 1,847
- Gradient: #f59e0b to #ef4444 (orange-red)
- Progress: 92% of 2000 goal

Animations:
- Rings animate on mount: 1000ms ease-out
- Values count up from 0: 800ms
- Hover: Scale 1.05 + glow effect

Workout History Section:
Card style:
- White background, 12px border radius
- 1px border neutral-200
- 20px padding
- Shadow: 0 2px 8px rgba(0,0,0,0.08)

Each workout item:
- Icon (24px) + workout type
- Duration + date (14px, neutral-600)
- Effort indicator: Colored bar (green/yellow/red)
- Swipe left to delete (mobile gesture)

Weekly Trend Chart:
- Line chart with gradient fill
- Smooth curves (not jagged)
- Data points: 4px dots
- Hover: Enlarge to 8px + tooltip
- X-axis: Days (Mon-Sun)
- Y-axis: Activity level
- Grid: Subtle 5% opacity lines

Bottom Navigation (iOS standard):
- 5 tabs: Today, Trends, Workouts, Journal, More
- Icon + label
- Active state: Primary gradient color
- Inactive: Neutral-600

Dark Mode Adjustments:
- Background: #0a0a0a
- Cards: #1a1a1a with 1px #2a2a2a border
- Text: #fafafa (primary), #a1a1a1 (secondary)
- Gradients: Same but 20% desaturated
- Shadows: Stronger (rgba(0,0,0,0.5))

Implementation Notes:
- Use SVG for gradient rings (CSS conic-gradient has poor browser support)
- Animate stroke-dashoffset for smooth progress
- Store gradient colors in CSS variables for easy theming
- Use Intersection Observer to trigger animations on scroll
```

**Example 2: Analytics Dashboard (UX Pilot-style)**
```
User: "Create a dashboard for tracking software development metrics"

Vibe Check:

Context:
- Purpose: Team productivity and code quality metrics
- Audience: Engineering managers and developers
- Platform: Web desktop application
- Quality bar: UX Pilot sophisticated data viz

Design Direction: (Prescriptive - developer tool pattern)

Dark UI with purple-blue gradient accents
Grid-based card layout
Multiple chart types for different metrics
Status badges for pipeline states

Color System:
Background: #0f172a (dark navy)
Surface: #1e293b (cards, elevated)
Primary: #8b5cf6 (purple)
Secondary: #06b6d4 (cyan)
Success: #10b981
Warning: #f59e0b
Error: #ef4444
Text: #f8fafc (primary), #cbd5e1 (secondary)

Typography:
Display: Inter, 600 (semibold)
Body: Inter, 400 (regular)
Mono: JetBrains Mono (for metrics)

Dashboard Layout:
Grid: 4 columns, 24px gap
Responsive: 2 columns on tablet, 1 on mobile

Top Row - Key Metrics (4 cards):

Card 1 - Total Commits:
- Icon: Git branch (purple)
- Label: "Total Commits" (12px caps, neutral-400)
- Value: 1,834 (36px, JetBrains Mono)
- Change: +12% ↑ (green, 14px)
- Sparkline: Tiny trend line (purple gradient)

Card 2 - Active PRs:
- Icon: Pull request (cyan)
- Value: 286
- Change: +8% this month
- Status breakdown: Small dots (green/yellow/red) with counts

Card 3 - Build Success Rate:
- Icon: Checkmark (green)
- Value: 98.7%
- Change: +2.1% (trend improving)
- Mini bar chart: Last 7 days success rate

Card 4 - Code Review Time:
- Icon: Clock (orange)
- Value: 4.2h (average)
- Change: -0.5h (improving, green)
- Target line: 6h goal (dotted line on mini chart)

Middle Row - Charts (2 large cards):

Card 1 - Commit Activity Over Time:
Chart type: Multi-line chart
Lines:
- Main branch: Purple line
- Feature branches: Cyan line (dashed)
- Hotfixes: Orange line (dotted)

Styling:
- Dark background (#1e293b)
- Grid lines: #334155 (subtle)
- Smooth curves with gradient fill below (10% opacity)
- Hover: Crosshair + tooltip showing all values
- Legend: Top right, 12px, colored dots + labels

Card 2 - Performance Funnel:
Chart type: Horizontal funnel
Stages:
- Code pushed: 100% (1000 commits) - Blue
- Tests passed: 85% (850) - Cyan
- Review approved: 65% (650) - Purple
- Deployed: 55% (550) - Green

Styling:
- Gradient fills for each stage
- Smooth transitions between stages
- Hover: Highlight stage + show dropoff %
- Annotations: "15% drop" between stages

Bottom Row - Recent Activity:

Table style:
- Transparent background
- Row hover: #1e293b
- Borders: #334155 (1px, subtle)
- Header: 12px caps, neutral-400
- Cell padding: 12px vertical, 16px horizontal

Columns:
1. Mission name + avatar
2. Status badge (success/in-progress/scheduled/cancelled)
3. Launch date (relative time: "5 days ago")
4. Payload (satellites, equipment)

Status Badges:
- Success: Green bg, white text, checkmark icon
- In Progress: Blue bg, animated pulse
- Scheduled: Purple bg, clock icon
- Cancelled: Red bg, X icon
- Rounded: 16px border radius, 6px padding

Interactions:
- Row click: Open detail modal (slide in from right)
- Status hover: Show full status message in tooltip
- Sort: Click column header (arrow indicator)

Animations:
- Charts load: Stagger by 100ms
- Lines draw: 1000ms ease-out
- Cards appear: Fade in + slide up (200ms delay between each)
- Hover states: 150ms ease-out

Implementation Notes:
- Use Recharts library for React charts
- CSS Grid for layout (grid-template-columns: repeat(4, 1fr))
- Framer Motion for animations
- Dark scrollbar styling to match theme
```

**Example 3: Recipe App Mobile (Sous Chef-style)**
```
User: "Design a recipe detail screen for a cooking app"

Vibe Check:

Context:
- Purpose: Show recipe details, ingredients, instructions
- Audience: Home cooks, food enthusiasts
- Platform: iOS mobile app
- Quality bar: Sous Chef warm and approachable

Design Direction: (Prescriptive - food app pattern)

Warm orange accent color
Hero food photography
Clean ingredient lists
Bottom tab navigation (iOS standard)

Color System:
Primary: #FF6B35 (warm orange)
Background: #FFFCF9 (warm white)
Card: #FFFFFF
Text: #1a1a1a (dark, readable)
Secondary: #8B7355 (warm brown)
Success: #7CB342 (fresh green)

Typography:
Display: Recoleta (warm serif for recipe titles)
Body: Inter (clean sans for readability)

Recipe Detail Screen:

Hero Image:
- Full width, 320px height
- Food photography (top down or 45° angle)
- Gradient overlay at bottom: linear-gradient(transparent, rgba(0,0,0,0.4))
- Back button (top left, white with shadow)
- Favorite heart (top right, white)

Recipe Title Section:
- Background: White card overlapping hero (-40px margin top)
- Border radius: 20px top corners
- Padding: 24px

Title: "Pickled Grapes" (28px, Recoleta, dark)
Category badge: "Easy" (orange bg, 12px caps, white, rounded-full)
Meta info: "15 mins prep + 15 mins cook" (14px, neutral-600)
Servings: "4 servings" (14px, neutral-600)

Time Icons:
- Clock icon + "15 mins" (prep)
- Chef hat icon + "15 mins" (cook)
- Users icon + "4" (serves)
- Icons: 24px, orange color, aligned horizontally

Ingredients Section:
Header: "INGREDIENTS" (12px caps, neutral-600, 24px margin top)

Servings Adjuster:
- Minus button | "4 servings" | Plus button
- Buttons: 32px circles, orange border, orange icon
- Center text: 16px, neutral-900
- Tap: Haptic feedback + recalculate quantities

"Convert" button: (top right)
- Text: "Imperial ⇄ Metric"
- Style: Text button, orange color, 14px

Ingredient List:
Each item:
- Checkbox (24px, orange when checked)
- Quantity: "1 cups" (16px, semibold, orange)
- Ingredient: "Grapes" (16px, neutral-900)
- Spacing: 12px between items
- Tap checkbox: Check off + haptic + subtle strikethrough

Special handling:
- "🍬 1 cups Sugar" (emoji prefix for emphasis items)

"Add to Grocery List" button:
- Full width, orange background
- Icon: Shopping cart + "Add to Grocery List"
- Height: 48px, rounded 12px
- Tap: Expand to show added confirmation (green checkmark)

Instructions Section:
Header: "INSTRUCTIONS" (12px caps, neutral-600)

Each step:
- Number circle: "1" (32px circle, orange bg, white text)
- Instruction: "Combine all ingredients" (16px, neutral-900)
- Spacing: 20px between steps
- Layout: Flex row with number + text

Visual style:
- Clean, no borders
- Generous whitespace (20px between steps)
- Number aligned top (not centered)

Bottom Padding:
- 120px (space for tab bar + gesture area)

Bottom Tab Navigation (iOS standard):
- 5 tabs: Sous Chef (AI), Recipes, Grocery, Settings
- Active: Orange color + slight scale
- Inactive: Neutral-600
- Icons: SF Symbols style, 24px
- Labels: 11px, below icon

Dark Mode Adjustments:
- Background: #1a1a1a
- Cards: #2a2a2a
- Text: #fafafa
- Orange: Slightly desaturated (#FF7F50)
- Food photo: Slight brightness reduction (overlay)

Interactions:
- Pull down: Dismiss to previous screen
- Ingredient tap: Check off with haptic
- Servings adjust: Animate number change
- Add to grocery: Expand + success animation (checkmark scale in)

Implementation Notes:
- Use native iOS navigation (swipe back)
- Store checked ingredients in AsyncStorage
- Lazy load hero image with blur placeholder
- Use native haptics (UIImpactFeedbackGenerator)
```

**Example 4: Onboarding Flow (Vibecode/HYPRX-style)**
```
User: "Create an onboarding screen for a fitness coaching app"

Vibe Check:

Context:
- Purpose: User sign-up and value proposition
- Audience: Fitness beginners to enthusiasts
- Platform: iOS mobile app
- Quality bar: Vibecode/HYPRX polished brand experience

Design Direction: (Prescriptive - mobile onboarding best practice)

Strong brand color (gradient pink to purple)
Clear value proposition with numbered benefits
Standard sign-in buttons (Apple/Google)
Smooth page transitions

Color System:
Primary gradient: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)
Background: Dark (#1a1a1a) or Light (#ffffff) based on brand
Text: White (on dark) or Dark (#1a1a1a) (on light)
Accent: Cyan (#06b6d4) for highlights

Typography:
Display: SF Pro Display, Bold
Body: SF Pro Text, Regular

Onboarding Screen 1 (Welcome):

Background:
- Full screen gradient (primary gradient)
- OR: Dark background with gradient app icon

App Icon:
- 120px rounded square
- Drop shadow for depth
- Centered, 60px from top

App Name: "HYPRX" (48px, white, bold, centered)
Tagline: "AI-Powered Personal Training" (16px, white 80% opacity)

Value Propositions (3 cards):
Card style:
- Semi-transparent white background (20% opacity)
- Backdrop blur
- 16px border radius
- 20px padding
- Stacked vertically, 12px gap

Card 1:
- Number badge: "1" (32px circle, cyan bg, white text)
- Title: "Personalized Workouts" (18px, white, semibold)
- Description: "AI-generated programs based on your goals" (14px, white 80%)

Card 2:
- Number: "2"
- Title: "Real-Time Coaching"
- Description: "Chat with your AI trainer anytime"

Card 3:
- Number: "3"
- Title: "Track Everything"
- Description: "Progress, PRs, and body metrics"

Bottom Actions:

"Sign in with Apple" button:
- Background: White
- Icon: Apple logo (black, 20px)
- Text: "Sign in with Apple" (16px, black, semibold)
- Height: 54px, full width minus 32px margin
- Border radius: 12px
- Shadow: 0 4px 12px rgba(0,0,0,0.15)

"Sign in with Google" button:
- Background: #1a1a1a (dark)
- Icon: Google "G" (color, 20px)
- Text: "Sign in with Google" (16px, white, semibold)
- Same dimensions as Apple button
- 12px gap between buttons

Legal text:
- "By continuing, you agree to our Terms of Service and Privacy Policy"
- 12px, white 60% opacity, centered
- Links: Underlined on "Terms" and "Privacy"
- 16px below buttons

Safe Area:
- 32px bottom padding (for iPhone home indicator)

Transitions:
- Fade in on load: Cards stagger by 100ms
- Button press: Scale 0.95 + haptic
- Sign-in success: Fade to next screen (300ms)

Onboarding Screen 2 (Setup Profile):
[After successful sign-in]

Similar gradient background
Progress indicator: 3 dots (1 filled, 2 outlined)

Form fields:
- Name input
- Age input
- Fitness level (Beginner/Intermediate/Advanced buttons)
- Goal selection (Lose weight/Build muscle/Get fit)

Each input:
- White semi-transparent background
- 16px padding
- Rounded 12px
- White text
- Placeholder: white 60% opacity

"Continue" button:
- Cyan background
- White text, bold
- Full width, 54px height
- Bottom of screen

Screen 3 (Preferences):
...

Implementation Notes:
- Use AuthenticationServices framework for Sign in with Apple
- Google Sign-In SDK for Google button
- Animate progress dots (scale + color change)
- Store onboarding completion in UserDefaults
- Haptic feedback on all button taps (medium impact)
```
