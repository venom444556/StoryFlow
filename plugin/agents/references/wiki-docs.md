# Wiki & Documentation Playbook

## When to Use
A decision is discussed, architecture is being designed, or knowledge needs to be persisted across sessions.

## Page Types

### Agent Knowledge Pages (prefix: "Agent:")
These are the agent's persistent memory. Read on boot, updated at session end.
- **Agent: Workflow Rules** — project-specific conventions and patterns
- **Agent: Architecture** — system design decisions and component relationships
- **Agent: Session Log** — running log of cross-session context

```bash
# Read all agent pages on boot
storyflow pages list --json
# Filter for "Agent:" prefix, then read each one
storyflow pages show <id> --json
```

### Architecture Decision Records (ADRs)
Use the `adr` template for technical decisions:
```bash
storyflow pages create --title "ADR: Use PostgreSQL for persistence" --template adr --json
```

Then update with the decision content:
```bash
storyflow pages update <id> --content "# ADR: Use PostgreSQL\n\n## Status\nAccepted\n\n## Context\n...\n\n## Decision\n...\n\n## Consequences\n..." --json
```

Also create a decision record:
```bash
storyflow decisions create --title "Use PostgreSQL for persistence" --status accepted --json
```

### Technical Specs
```bash
storyflow pages create --title "Authentication System Design" --template technical-spec --json
```

### Retrospectives
```bash
storyflow pages create --title "Sprint 3 Retrospective" --template retrospective --json
```

## Available Templates

| Template ID | Use Case |
|-------------|----------|
| `blank` | Free-form content |
| `meeting-notes` | Meeting minutes |
| `technical-spec` | System design documents |
| `requirements-doc` | Feature requirements |
| `api-documentation` | API reference |
| `retrospective` | Sprint retrospectives |
| `adr` | Architecture decision records |

## Session End — Wiki Updates

At session end, update Agent: pages with new knowledge:
1. Check if "Agent: Workflow Rules" exists — update with any new patterns learned
2. Check if "Agent: Architecture" exists — update if architecture changed
3. New decisions → create ADR page + decision record
