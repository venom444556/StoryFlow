// ---------------------------------------------------------------------------
// Page templates — mirrors src/data/pageTemplates.js for CLI usage
// ---------------------------------------------------------------------------

export const PAGE_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Page',
    icon: 'file-text',
    description: 'Start with a clean slate',
    content: '',
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    icon: 'pencil',
    description: 'Capture meeting discussions and action items',
    content: `# Meeting Notes

**Date:** {date}
**Attendees:**
-

---

## Agenda

1.

## Discussion

### Topic 1



### Topic 2



## Action Items

- [ ]
- [ ]
- [ ]

## Next Meeting

**Date:**
**Topics to cover:**
-
`,
  },
  {
    id: 'technical-spec',
    name: 'Technical Spec',
    icon: 'wrench',
    description: 'Document a technical design or feature specification',
    content: `# Technical Specification

## Overview

Brief description of the feature or system being specified.

## Requirements

### Functional Requirements

1.
2.
3.

### Non-Functional Requirements

- **Performance:**
- **Security:**
- **Scalability:**

## Architecture

### System Design

Describe the high-level architecture and how components interact.

### Component Diagram

\`\`\`
[Component A] --> [Component B] --> [Component C]
\`\`\`

## API Design

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/resource | List resources |
| POST | /api/resource | Create resource |
| PUT | /api/resource/:id | Update resource |
| DELETE | /api/resource/:id | Delete resource |

## Data Model

### Schema

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Display name |
| createdAt | datetime | Creation timestamp |

## Open Questions

-
`,
  },
  {
    id: 'requirements-doc',
    name: 'Requirements Doc',
    icon: 'clipboard-list',
    description: 'Define project or feature requirements',
    content: `# Requirements Document

## Background

Describe the context and motivation for this work.

## User Stories

### Story 1
**As a** [user type],
**I want to** [action],
**so that** [benefit].

### Story 2
**As a** [user type],
**I want to** [action],
**so that** [benefit].

## Acceptance Criteria

### Criteria for Story 1
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]

### Criteria for Story 2
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]

## Out of Scope

-
-
-

## Dependencies

-

## Timeline

| Milestone | Target Date |
|-----------|-------------|
| Design complete | |
| Implementation done | |
| Testing complete | |
| Release | |
`,
  },
  {
    id: 'api-documentation',
    name: 'API Documentation',
    icon: 'globe',
    description: 'Document API endpoints and usage',
    content: `# API Documentation

## Base URL

\`\`\`
https://api.example.com/v1
\`\`\`

## Authentication

All requests require an API key passed in the \`Authorization\` header:

\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Endpoints

### GET /resource

Retrieve a list of resources.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20) |

**Response:**

\`\`\`json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
\`\`\`

### POST /resource

Create a new resource.

**Request Body:**

\`\`\`json
{
  "name": "string (required)",
  "description": "string (optional)"
}
\`\`\`

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
`,
  },
  {
    id: 'retrospective',
    name: 'Retrospective',
    icon: 'refresh-cw',
    description: 'Reflect on a sprint or project phase',
    content: `# Retrospective

**Sprint/Phase:**
**Date:**
**Participants:**
-

---

## What Went Well

-
-
-

## What Didn't Go Well

-
-
-

## Action Items

| Action | Owner | Due Date |
|--------|-------|----------|
| | | |
| | | |
| | | |

## Key Metrics

- **Velocity:**
- **Completed Items:**
- **Carried Over:**

## Notes

Additional observations or discussion points.
`,
  },
  {
    id: 'adr',
    name: 'Architecture Decision Record',
    icon: 'building',
    description: 'Record an architectural or design decision',
    content: `# ADR: [Decision Title]

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:**
**Decision Makers:**
-

---

## Context

Describe the situation that requires a decision. What is the problem or opportunity? What forces are at play?

## Decision

State the decision that was made. Be specific and clear about what was chosen.

## Alternatives Considered

### Alternative 1: [Name]

**Pros:**
-

**Cons:**
-

### Alternative 2: [Name]

**Pros:**
-

**Cons:**
-

## Consequences

### Positive
-

### Negative
-

### Risks
-

## References

-
`,
  },
]
