# /forge-review

Screenshot and grade the current Framer canvas state.

## User Invocable

yes

## Trigger

`/forge-review`

## Prompt

Capture and evaluate the current Framer canvas:

1. Run `forge screenshot --2x -o forge-review.png` to capture the current state
2. Read the screenshot image
3. Apply the visual-qa skill's grading rubric:
   - Typography (A-F)
   - Color (A-F)
   - Spacing (A-F)
   - Layout (A-F)
   - Polish (A-F)
4. Run the anti-slop checklist from design-principles.md
5. Run programmatic checks via `forge evaluate` for contrast ratios and spacing values
6. Output the Visual QA Report with specific fix recommendations

If fixes are needed, provide the exact `forge` CLI commands to resolve each issue.
