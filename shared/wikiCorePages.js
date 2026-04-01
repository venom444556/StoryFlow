export const WIKI_STALE_THRESHOLD_DAYS = 7

export const CORE_WIKI_PAGES = [
  {
    slug: 'dependencies-tech-stack',
    title: 'Dependencies & Tech Stack',
    icon: 'layers',
    template: 'technical-spec',
    purpose:
      'Canonical runtime stack, key dependencies, external services, and version-critical choices.',
  },
  {
    slug: 'architecture-overview',
    title: 'Architecture Overview',
    icon: 'building',
    template: 'technical-spec',
    purpose: 'Current high-level system shape, major components, and ownership boundaries.',
  },
  {
    slug: 'database-schema',
    title: 'Database Schema',
    icon: 'database',
    template: 'technical-spec',
    purpose: 'Actual persisted entities, relationships, and migration notes.',
  },
  {
    slug: 'api-endpoints',
    title: 'API Endpoints',
    icon: 'globe',
    template: 'api-documentation',
    purpose: 'Current HTTP contract, operational endpoints, and agent-critical routes.',
  },
  {
    slug: 'agent-core',
    title: 'Agent Core',
    icon: 'bot',
    template: 'technical-spec',
    purpose: 'How the StoryFlow agent boots, reasons, persists memory, and closes sessions.',
  },
  {
    slug: 'guardrail-service',
    title: 'Guardrail Service',
    icon: 'shield',
    template: 'technical-spec',
    purpose: 'Gate enforcement, confidence rules, intervention model, and safety boundaries.',
  },
  {
    slug: 'cognitive-engine',
    title: 'Cognitive Engine',
    icon: 'brain',
    template: 'technical-spec',
    purpose: 'Planning, evaluation, and intelligence subsystems that drive autonomous behavior.',
  },
  {
    slug: 'deployment-infrastructure',
    title: 'Deployment & Infrastructure',
    icon: 'rocket',
    template: 'technical-spec',
    purpose:
      'Runtime environments, hosting, networking, operational dependencies, and deployment state.',
  },
]

export function normalizeWikiTitle(title) {
  return String(title || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export function buildCoreWikiPageContent(def) {
  return `# ${def.title}

## Purpose

${def.purpose}

## Current State

- Status:
- Owner:
- Last validated:

## What Exists Today

- 

## Open Gaps

- 

## Operational Notes

- Agent impact:
- Human review points:
- Follow-up docs:
`
}
