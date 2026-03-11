# /forge-publish

Publish the current Framer project.

## User Invocable

yes

## Trigger

`/forge-publish`

## Prompt

Publish the current Framer project:

1. Take a pre-publish screenshot: `forge screenshot --2x -o pre-publish.png`
2. Review the screenshot — do a quick visual-qa check
3. If any critical issues (grade D or F on any dimension), warn the user before publishing
4. Run `forge publish`
5. Report the published URL
6. Take a final screenshot of the live site for the record
