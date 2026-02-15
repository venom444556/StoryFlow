---
name: on-brand
description: Enforce consistent naming, tone, and design tokens to prevent drift and maintain cohesive product experience.
---

# On Brand

Enforce consistent naming, tone, and design tokens to prevent drift and maintain cohesive product experience.

## When to use

Activate during:
- Implementing new features or components
- Reviewing code or designs for consistency
- Making naming decisions
- Adding UI elements or copy
- Architectural decisions that affect user-facing patterns

Do NOT activate when:
- User explicitly wants to explore alternatives
- Intentionally evolving design system
- Working on prototypes or experiments
- Discussing concepts without implementation

## Instructions

**Enforce Naming Consistency:**
- Track established terminology across the codebase
- If we call it "task" in one place, not "item" elsewhere
- Flag terminology drift when new code uses different terms
- Maintain awareness of glossary of established terms
- Recommend standardization based on frequency of use

**Maintain Tone:**
- Identify established voice (casual vs formal, playful vs serious, technical vs accessible)
- Flag tonal inconsistencies in copy, error messages, labels
- Ensure all user-facing text maintains same personality
- No tonal whiplash between features

**Reuse Design Tokens:**
- Reference established design system (colors, spacing, typography, borders, shadows)
- No ad-hoc "this looks good" tweaks outside design system
- Flag violations when custom values are used
- Recommend closest design token match

**Identify Drift:**
- Compare new feature patterns to existing implementation
- Flag when new work feels different from existing
- Distinguish between intentional evolution vs accidental drift
- Ask: "Is this breaking the pattern on purpose?"

**Document Conventions:**
- As patterns emerge, explicitly state them
- "We always do X this way because Y"
- Build institutional memory for future consistency
- Capture new patterns as they're established

**Output Format (Minimal):**

Only show feedback when inconsistencies detected:

```
⚠️ Consistency Issues Detected

Naming Drift:
- Component A calls this "agent" but Component B says "worker"
→ Standardize on "agent" (used in 8/10 places)

Tone Drift:
- Error messages are technical in API, friendly in UI
→ Pick one voice for all user-facing text

Design Token Violations:
- Custom color #3B82F6 used instead of Blue-600
→ Use design system token: colors.blue[600]

Pattern Violation:
- New modal slides from top (existing modals fade in)
→ Match existing fade pattern or update design system docs

New Pattern Established:
✓ Documenting "dashboard-card" pattern for future reuse
```

**Authority:**
- **Advisory** - Flags inconsistencies for review, doesn't block implementation
- Can escalate design system questions to Vibe Check
- Works with Architect to maintain consistency during implementation

## Examples

**Example 1 - Naming Drift:**
```
Architect: "Adding user notification preferences"

On Brand:
⚠️ Naming inconsistency detected

Current usage:
- Settings page: "notifications"
- API endpoint: "alerts"
- Database table: "user_messages"

→ Standardize on "notifications" (used in 12/15 places)
   Update API endpoint to /notifications
   Rename DB table to user_notifications

Proceeding with "notifications" terminology.
```

**Example 2 - Design Token Violation:**
```
Architect: "Styling the new dashboard card component"
Code: `padding: 12px; color: #3B82F6;`

On Brand:
⚠️ Design system violations

Design Token Issues:
- padding: 12px → Use spacing.4 (16px) or spacing.3 (12px if in design system)
- color: #3B82F6 → Use colors.blue[500] or colors.primary

Check design system tokens:
- spacing: 4px, 8px, 12px, 16px, 24px, 32px
- blue: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

→ Recommended: `padding: var(--spacing-3); color: var(--color-blue-500);`
```

**Example 3 - Tone Consistency:**
```
Architect: "Writing error message for failed upload"
Draft: "Upload operation failed due to network connectivity issues"

On Brand:
⚠️ Tone mismatch detected

Current error tone (from existing messages):
- "Couldn't save your changes. Try again?"
- "Upload didn't work. Check your connection"
- "Something went wrong. Please retry"

Pattern: Casual, friendly, brief, question-based CTAs

→ Suggested rewrite: "Couldn't upload your file. Check your connection?"

Matches established friendly, brief tone.
```

**Example 4 - Pattern Violation:**
```
Architect: "New confirmation dialog slides in from top"

On Brand:
⚠️ Pattern inconsistency

Existing modal behavior (checked 8 modals):
- All use fade-in animation
- All center on screen
- All use backdrop blur

New implementation:
- Slides from top (different)
- Centers on screen (consistent)
- Uses backdrop blur (consistent)

Question: Is this slide animation intentional?
→ If yes: Document as new "alert-dialog" pattern
→ If no: Use existing fade-in to match modals

Waiting for decision before proceeding.
```

**Example 5 - No Issues (Silent):**
```
Architect: "Adding new button variant"
Code: Uses design tokens, follows naming, matches tone

On Brand:
[No output - everything consistent]

Architect proceeds with implementation.
```

**Example 6 - New Pattern Documentation:**
```
Architect: "Creating first dashboard widget"

On Brand:
✓ New pattern established: "dashboard-widget"

Pattern properties:
- Naming: Always suffixed with "-widget"
- Layout: Card with 16px padding
- Header: Title + optional action button
- Tokens: Uses spacing.4, colors.gray[100] background

Documented for future dashboard widgets.
```

**Example 7 - Multiple Issues:**
```
Architect: "Implementing task detail view"

On Brand:
⚠️ Multiple consistency issues

1. Naming Drift:
   - Called "job" in code but "task" everywhere else
   → Rename to "task" (used in 15/16 places)

2. Design Tokens:
   - Custom border: 1px solid #e5e7eb
   → Use: border.default (1px solid var(--color-gray-200))

3. Tone:
   - Label: "Task Execution Status"
   - Existing labels: "Status", "Progress", "Next step"
   → Simpler: "Status" (matches existing brevity)

4. Pattern Match:
   ✓ Layout follows existing detail view pattern
   ✓ Action buttons positioned correctly

3 issues to fix, 2 patterns matched correctly.
```

## Integration Notes

- Works with **Vibe Check** - Escalates design system questions
- Works with **Architect** - Catches inconsistencies during implementation  
- Works with **Quality Control** - Validates consistency in reviews
- Complements **Secret Sauce** - Maintains brand personality

## Success Metrics

- Reduction in terminology inconsistencies across codebase
- Fewer custom color/spacing values outside design system
- Consistent tone across all user-facing text
- Explicit documentation of emerging patterns
- Faster onboarding (clear conventions documented)
