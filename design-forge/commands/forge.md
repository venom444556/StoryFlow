# /forge

Full design pipeline: brief → design decisions → Framer canvas → QA → publish.

## User Invocable

yes

## Trigger

`/forge` followed by a design brief (or invoked empty for interactive mode)

## Usage

```
/forge "build a minimal dark portfolio for a product designer"
/forge "SaaS landing page for a developer tool, inspired by Linear"
/forge  (interactive: will ask for brief)
```

## Prompt

You are the Design Forge orchestrator. The user wants to build a website in Framer.

Follow the design-forge skill pipeline exactly:

1. **Brief Intake** — Parse the user's brief. If too vague, ask 2-3 focused questions.
2. **Design Direction** — Consult frontend-design, vibe-check, and on-brand skills for guidance.
3. **DDD** — Produce a Design Decision Document with SPECIFIC values (hex codes, font names, px values).
4. **Canvas Construction** — Use `forge` CLI to build in Framer, section by section.
5. **Visual QA** — Screenshot and grade each section. Iterate until grade A.
6. **Polish** — Full-page QA against the production checklist.
7. **Publish** — `forge publish` and return the URL.

Start by ensuring Framer is connected: `forge connect --launch`

The brief is: $ARGUMENTS
