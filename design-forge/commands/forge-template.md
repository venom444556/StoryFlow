# /forge-template

Start from a Framer template and customize it.

## User Invocable

yes

## Trigger

`/forge-template` followed by template name or style direction

## Usage

```
/forge-template portfolio
/forge-template landing --dark
/forge-template "SaaS product page"
```

## Prompt

The user wants to start from a template and customize it.

1. Run `forge connect --launch` to ensure Framer is connected
2. Run `forge create-project --template $ARGUMENTS` (or blank if no template specified)
3. Take an initial screenshot: `forge screenshot -o template-start.png`
4. Ask the user what customizations they want (colors, content, layout changes)
5. Produce a mini-DDD with the customization values
6. Apply customizations via `forge` CLI commands
7. Screenshot and QA each change

Template argument: $ARGUMENTS
