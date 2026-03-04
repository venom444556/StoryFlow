#!/usr/bin/env node
// ---------------------------------------------------------------------------
// StoryFlow MCP Server (stdio)
// Provides tools for Claude Code to interact with StoryFlow's REST API
// ---------------------------------------------------------------------------

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import * as sf from './storyflow-client.js'
import { buildProvenanceHeaders } from './storyflow-client.js'

// Shared provenance params for all mutating tools
const provenanceParams = {
  reasoning: z
    .string()
    .optional()
    .describe('WHY this action is being taken (shown to the human in the transparency dashboard)'),
  confidence: z.number().min(0).max(1).optional().describe('Confidence level (0-1) in this action'),
  session_id: z.string().optional().describe('Current session ID for event correlation'),
}

const server = new McpServer({
  name: 'storyflow',
  version: '1.0.0',
})

// ---------------------------------------------------------------------------
// Tool: List Projects
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_list_projects',
  {
    description:
      'List all projects in StoryFlow. Returns id, name, status, issue count, and sprint count for each project.',
    inputSchema: {},
  },
  async () => {
    const projects = await sf.listProjects()
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(projects, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Get Project
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_get_project',
  {
    description:
      'Get full details of a StoryFlow project including overview, board, wiki pages, timeline, decisions, and architecture.',
    inputSchema: {
      project_id: z.string().describe('The project ID (slug-based, e.g. "my-app")'),
    },
  },
  async ({ project_id }) => {
    const project = await sf.getProject(project_id)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(project, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Create Project
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_create_project',
  {
    description: 'Create a new project in StoryFlow.',
    inputSchema: {
      name: z.string().describe('Project name'),
      description: z.string().optional().describe('Project description'),
      status: z
        .enum(['planning', 'in-progress', 'completed', 'on-hold'])
        .optional()
        .describe('Project status (default: planning)'),
      ...provenanceParams,
    },
  },
  async ({ name, description, status, reasoning, confidence, session_id }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const project = await sf.createProject({ name, description, status }, headers)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(project, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Update Project
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_update_project',
  {
    description: 'Update an existing StoryFlow project. Only provided fields are changed.',
    inputSchema: {
      project_id: z.string().describe('Project ID (slug-based, e.g. "my-app")'),
      name: z.string().optional().describe('New project name'),
      description: z.string().optional().describe('New project description'),
      status: z
        .enum(['planning', 'in-progress', 'completed', 'on-hold'])
        .optional()
        .describe('New project status'),
      ...provenanceParams,
    },
  },
  async ({ project_id, name, description, status, reasoning, confidence, session_id }) => {
    const data = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (status !== undefined) data.status = status
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const project = await sf.updateProject(project_id, data, headers)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(project, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Advance Phase
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_advance_phase',
  {
    description:
      'Advance a project to the next phase in the lifecycle (planning → in-progress → completed), or set a specific target phase. Useful for post-commit hooks and milestone triggers.',
    inputSchema: {
      project_id: z.string().describe('Project ID (slug-based, e.g. "my-app")'),
      target_phase: z
        .enum(['planning', 'in-progress', 'completed', 'on-hold'])
        .optional()
        .describe(
          'Explicit target phase. If omitted, auto-advances to the next phase in order (planning → in-progress → completed).'
        ),
    },
  },
  async ({ project_id, target_phase }) => {
    try {
      const result = await sf.advancePhase(project_id, target_phase)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      }
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: List Issues
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_list_issues',
  {
    description:
      'List issues in a StoryFlow project. Can filter by status, type, epicId, sprintId, or assignee.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      status: z.enum(['To Do', 'In Progress', 'Done']).optional().describe('Filter by status'),
      type: z.enum(['epic', 'story', 'task', 'bug']).optional().describe('Filter by issue type'),
      epic_id: z.string().optional().describe('Filter by parent epic ID'),
      sprint_id: z.string().optional().describe('Filter by sprint ID'),
      assignee: z.string().optional().describe('Filter by assignee'),
    },
  },
  async ({ project_id, status, type, epic_id, sprint_id, assignee }) => {
    const filters = {}
    if (status) filters.status = status
    if (type) filters.type = type
    if (epic_id) filters.epicId = epic_id
    if (sprint_id) filters.sprintId = sprint_id
    if (assignee) filters.assignee = assignee
    const issues = await sf.listIssues(project_id, filters)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(issues, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Create Issue
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_create_issue',
  {
    description: 'Create a new issue (epic, story, task, or bug) in a StoryFlow project board.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      title: z.string().describe('Issue title'),
      type: z.enum(['epic', 'story', 'task', 'bug']).describe('Issue type'),
      status: z
        .enum(['To Do', 'In Progress', 'Done'])
        .optional()
        .describe('Initial status (default: To Do)'),
      priority: z.enum(['critical', 'high', 'medium', 'low']).optional().describe('Priority level'),
      description: z.string().optional().describe('Issue description (markdown)'),
      story_points: z.number().optional().describe('Story points estimate'),
      epic_id: z.string().optional().describe('Parent epic ID (for stories/tasks/bugs)'),
      sprint_id: z.string().optional().describe('Sprint ID to assign to'),
      assignee: z.string().optional().describe('Assignee name'),
      labels: z.array(z.string()).optional().describe('Labels/tags'),
      ...provenanceParams,
    },
  },
  async ({
    project_id,
    title,
    type,
    status,
    priority,
    description,
    story_points,
    epic_id,
    sprint_id,
    assignee,
    labels,
    reasoning,
    confidence,
    session_id,
  }) => {
    const data = { title, type }
    if (status) data.status = status
    if (priority) data.priority = priority
    if (description) data.description = description
    if (story_points) data.storyPoints = story_points
    if (epic_id) data.epicId = epic_id
    if (sprint_id) data.sprintId = sprint_id
    if (assignee) data.assignee = assignee
    if (labels) data.labels = labels
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const issue = await sf.createIssue(project_id, data, headers)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(issue, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Update Issue
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_update_issue',
  {
    description:
      'Update an existing issue in a StoryFlow project. Provide either issue_id (UUID) or issue_key (e.g. "SCA-43"). Only provided fields are changed.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      issue_id: z.string().optional().describe('Issue ID (UUID) — provide this OR issue_key'),
      issue_key: z
        .string()
        .optional()
        .describe('Issue key (e.g. "SCA-43") — provide this OR issue_id'),
      title: z.string().optional().describe('New title'),
      status: z.enum(['To Do', 'In Progress', 'Done']).optional().describe('New status'),
      priority: z.enum(['critical', 'high', 'medium', 'low']).optional().describe('New priority'),
      description: z.string().optional().describe('New description'),
      story_points: z.number().optional().describe('New story points'),
      epic_id: z.string().optional().describe('New parent epic ID'),
      sprint_id: z.string().optional().describe('New sprint ID'),
      assignee: z.string().optional().describe('New assignee'),
      labels: z.array(z.string()).optional().describe('New labels'),
      ...provenanceParams,
    },
  },
  async ({
    project_id,
    issue_id,
    issue_key,
    title,
    status,
    priority,
    description,
    story_points,
    epic_id,
    sprint_id,
    assignee,
    labels,
    reasoning,
    confidence,
    session_id,
  }) => {
    if (!issue_id && !issue_key) {
      return {
        content: [{ type: 'text', text: 'Error: provide either issue_id or issue_key' }],
        isError: true,
      }
    }
    const data = {}
    if (title !== undefined) data.title = title
    if (status !== undefined) data.status = status
    if (priority !== undefined) data.priority = priority
    if (description !== undefined) data.description = description
    if (story_points !== undefined) data.storyPoints = story_points
    if (epic_id !== undefined) data.epicId = epic_id
    if (sprint_id !== undefined) data.sprintId = sprint_id
    if (assignee !== undefined) data.assignee = assignee
    if (labels !== undefined) data.labels = labels
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const issue = issue_key
      ? await sf.updateIssueByKey(project_id, issue_key, data, headers)
      : await sf.updateIssue(project_id, issue_id, data, headers)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(issue, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Get Issue by Key
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_get_issue_by_key',
  {
    description: 'Look up an issue by its human-readable key (e.g. "SCA-43") instead of UUID.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      issue_key: z.string().describe('Issue key (e.g. "SCA-43")'),
    },
  },
  async ({ project_id, issue_key }) => {
    const issue = await sf.getIssueByKey(project_id, issue_key)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(issue, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Delete Issue
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_delete_issue',
  {
    description:
      'Delete an issue from a StoryFlow project board. Provide either issue_id (UUID) or issue_key (e.g. "SCA-43").',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      issue_id: z.string().optional().describe('Issue ID (UUID) — provide this OR issue_key'),
      issue_key: z
        .string()
        .optional()
        .describe('Issue key (e.g. "SCA-43") — provide this OR issue_id'),
      ...provenanceParams,
    },
  },
  async ({ project_id, issue_id, issue_key, reasoning, confidence, session_id }) => {
    if (!issue_id && !issue_key) {
      return {
        content: [{ type: 'text', text: 'Error: provide either issue_id or issue_key' }],
        isError: true,
      }
    }
    const identifier = issue_key || issue_id
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    if (issue_key) {
      await sf.deleteIssueByKey(project_id, issue_key, headers)
    } else {
      await sf.deleteIssue(project_id, issue_id, headers)
    }
    return {
      content: [
        {
          type: 'text',
          text: `Issue ${identifier} deleted successfully.`,
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Batch Update Issues
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_batch_update_issues',
  {
    description:
      'Update multiple issues in a single call. Efficient for sprint closes, bulk status changes, or reassignments. Max 50 updates per call.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      updates: z
        .array(
          z.object({
            issue_id: z.string().optional().describe('Issue ID (UUID) — provide this OR issue_key'),
            issue_key: z
              .string()
              .optional()
              .describe('Issue key (e.g. "SCA-43") — provide this OR issue_id'),
            title: z.string().optional(),
            status: z.enum(['To Do', 'In Progress', 'Done']).optional(),
            priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
            description: z.string().optional(),
            story_points: z.number().optional(),
            epic_id: z.string().optional(),
            sprint_id: z.string().optional(),
            assignee: z.string().optional(),
            labels: z.array(z.string()).optional(),
          })
        )
        .describe('Array of issue updates (each must include issue_id or issue_key)'),
      ...provenanceParams,
    },
  },
  async ({ project_id, updates, reasoning, confidence, session_id }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const result = await sf.batchUpdateIssues(project_id, updates, headers)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Board Summary
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_get_board_summary',
  {
    description:
      'Get a summary of the project board: issue counts by status and type, story points progress, active sprint info.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
    },
  },
  async ({ project_id }) => {
    const summary = await sf.getBoardSummary(project_id)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(summary, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Nudge Issue (reset staleness)
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_nudge_issue',
  {
    description:
      'Nudge a stale issue to reset its updatedAt timestamp, clearing the staleness indicator. Use after milestones (test pass, deploy, build) to signal progress. Accepts issue_id (UUID) or issue_key (e.g. "SCA-43").',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      issue_id: z.string().optional().describe('Issue ID (UUID) — provide this OR issue_key'),
      issue_key: z
        .string()
        .optional()
        .describe('Issue key (e.g. "SCA-43") — provide this OR issue_id'),
      message: z.string().optional().describe('Optional nudge message (e.g. "Tests passed")'),
      author: z.string().optional().describe('Who triggered the nudge (default: "system")'),
    },
  },
  async ({ project_id, issue_id, issue_key, message, author }) => {
    if (!issue_id && !issue_key) {
      return {
        content: [{ type: 'text', text: 'Error: provide either issue_id or issue_key' }],
        isError: true,
      }
    }
    const data = {}
    if (message) data.message = message
    if (author) data.author = author
    const result = issue_key
      ? await sf.nudgeIssueByKey(project_id, issue_key, data)
      : await sf.nudgeIssue(project_id, issue_id, data)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: List Sprints
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_list_sprints',
  {
    description: 'List all sprints in a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
    },
  },
  async ({ project_id }) => {
    const sprints = await sf.listSprints(project_id)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(sprints, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Create Sprint
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_create_sprint',
  {
    description: 'Create a new sprint in a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      name: z.string().describe('Sprint name'),
      goal: z.string().optional().describe('Sprint goal'),
      start_date: z.string().optional().describe('Start date (ISO format or YYYY-MM-DD)'),
      end_date: z.string().optional().describe('End date (ISO format or YYYY-MM-DD)'),
      status: z
        .enum(['planning', 'active', 'completed'])
        .optional()
        .describe('Sprint status (default: planning)'),
      ...provenanceParams,
    },
  },
  async ({
    project_id,
    name,
    goal,
    start_date,
    end_date,
    status,
    reasoning,
    confidence,
    session_id,
  }) => {
    const data = { name }
    if (goal) data.goal = goal
    if (start_date) data.startDate = start_date
    if (end_date) data.endDate = end_date
    if (status) data.status = status
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const sprint = await sf.createSprint(project_id, data, headers)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(sprint, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: List Pages
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_list_pages',
  {
    description: 'List all wiki pages in a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
    },
  },
  async ({ project_id }) => {
    const pages = await sf.listPages(project_id)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(pages, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Create Page
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_create_page',
  {
    description: 'Create a new wiki page in a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      title: z.string().describe('Page title'),
      content: z.string().optional().describe('Page content (markdown)'),
      parent_id: z.string().optional().describe('Parent page ID for nesting'),
      ...provenanceParams,
    },
  },
  async ({ project_id, title, content, parent_id, reasoning, confidence, session_id }) => {
    const data = { title }
    if (content) data.content = content
    if (parent_id) data.parentId = parent_id
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const page = await sf.createPage(project_id, data, headers)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(page, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Update Page
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_update_page',
  {
    description: 'Update a wiki page in a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      page_id: z.string().describe('Page ID'),
      title: z.string().optional().describe('New title'),
      content: z.string().optional().describe('New content (markdown)'),
      parent_id: z.string().optional().describe('New parent page ID'),
      ...provenanceParams,
    },
  },
  async ({ project_id, page_id, title, content, parent_id, reasoning, confidence, session_id }) => {
    const data = {}
    if (title !== undefined) data.title = title
    if (content !== undefined) data.content = content
    if (parent_id !== undefined) data.parentId = parent_id
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const page = await sf.updatePage(project_id, page_id, data, headers)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(page, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Delete Page
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_delete_page',
  {
    description: 'Delete a wiki page from a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      page_id: z.string().describe('Page ID to delete'),
      ...provenanceParams,
    },
  },
  async ({ project_id, page_id, reasoning, confidence, session_id }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    await sf.deletePage(project_id, page_id, headers)
    return {
      content: [
        {
          type: 'text',
          text: `Page ${page_id} deleted successfully.`,
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Delete Sprint
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_delete_sprint',
  {
    description: 'Delete a sprint from a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      sprint_id: z.string().describe('Sprint ID to delete'),
      ...provenanceParams,
    },
  },
  async ({ project_id, sprint_id, reasoning, confidence, session_id }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    await sf.deleteSprint(project_id, sprint_id, headers)
    return {
      content: [
        {
          type: 'text',
          text: `Sprint ${sprint_id} deleted successfully.`,
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Update Sprint
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_update_sprint',
  {
    description:
      'Update an existing sprint in a StoryFlow project. Use to change sprint status (planning → active → completed), rename, or adjust dates.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      sprint_id: z.string().describe('Sprint ID to update'),
      name: z.string().optional().describe('New sprint name'),
      goal: z.string().optional().describe('New sprint goal'),
      start_date: z.string().optional().describe('New start date (ISO format or YYYY-MM-DD)'),
      end_date: z.string().optional().describe('New end date (ISO format or YYYY-MM-DD)'),
      status: z.enum(['planning', 'active', 'completed']).optional().describe('New sprint status'),
      ...provenanceParams,
    },
  },
  async ({
    project_id,
    sprint_id,
    name,
    goal,
    start_date,
    end_date,
    status,
    reasoning,
    confidence,
    session_id,
  }) => {
    const data = {}
    if (name !== undefined) data.name = name
    if (goal !== undefined) data.goal = goal
    if (start_date !== undefined) data.startDate = start_date
    if (end_date !== undefined) data.endDate = end_date
    if (status !== undefined) data.status = status
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const sprint = await sf.updateSprint(project_id, sprint_id, data, headers)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(sprint, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Check Connection
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_check_connection',
  {
    description:
      'Check if StoryFlow is reachable. Returns connection status, URL, and project count.',
    inputSchema: {},
  },
  async () => {
    const status = await sf.checkConnection()
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        },
      ],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Run Board Hygiene
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_run_hygiene',
  {
    description:
      'Analyze the project board for hygiene issues: stale "In Progress" items, orphan stories/tasks without an epic, duplicate titles, and missing estimates/priorities. Optionally auto-fix stale issues by nudging them.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      auto_fix: z
        .boolean()
        .optional()
        .describe(
          'If true, auto-nudge stale issues. Other fixes require human judgment and are report-only. Default: false.'
        ),
    },
  },
  async ({ project_id, auto_fix }) => {
    try {
      // 1. Get board summary for stale issues
      const summary = await sf.getBoardSummary(project_id)
      // 2. Get all issues for deeper analysis
      const issues = await sf.listIssues(project_id)

      const report = {
        stale: summary.staleIssues || [],
        orphans: [],
        duplicates: [],
        missingEstimates: [],
        missingPriority: [],
        autoFixed: { nudged: 0 },
      }

      // 3. Detect orphans — stories/tasks/bugs with no epicId (exclude epics)
      for (const issue of issues) {
        if (issue.type !== 'epic' && !issue.epicId) {
          report.orphans.push({
            id: issue.id,
            key: issue.key,
            title: issue.title,
            type: issue.type,
          })
        }
      }

      // 4. Detect duplicates — group by lowercase title
      const titleMap = new Map()
      for (const issue of issues) {
        const lower = (issue.title || '').toLowerCase().trim()
        if (!lower) continue
        if (!titleMap.has(lower)) titleMap.set(lower, [])
        titleMap.get(lower).push({ id: issue.id, key: issue.key, title: issue.title })
      }
      for (const [, group] of titleMap) {
        if (group.length > 1) report.duplicates.push(group)
      }

      // 5. Detect missing estimates and priorities (exclude epics)
      for (const issue of issues) {
        if (issue.type === 'epic') continue
        if (!issue.storyPoints) {
          report.missingEstimates.push({ id: issue.id, key: issue.key, title: issue.title })
        }
        if (!issue.priority) {
          report.missingPriority.push({ id: issue.id, key: issue.key, title: issue.title })
        }
      }

      // 6. Auto-fix: nudge stale issues
      if (auto_fix && report.stale.length > 0) {
        for (const stale of report.stale) {
          try {
            const identifier = stale.key || stale.id
            if (stale.key) {
              await sf.nudgeIssueByKey(project_id, stale.key, {
                message: 'Hygiene: auto-nudged',
                author: 'hygiene-bot',
              })
            } else {
              await sf.nudgeIssue(project_id, stale.id, {
                message: 'Hygiene: auto-nudged',
                author: 'hygiene-bot',
              })
            }
            report.autoFixed.nudged++
          } catch {
            // Continue on individual nudge failure
          }
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(report, null, 2),
          },
        ],
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      }
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Record Event (AI transparency)
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_record_event',
  {
    description:
      'Record an AI activity event for transparency. Use this for actions that don\'t map to entity CRUD — e.g. "analyzed codebase structure", "read file to understand patterns", "evaluated alternatives". Every significant AI action should be recorded.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      category: z
        .enum([
          'board',
          'wiki',
          'architecture',
          'workflow',
          'timeline',
          'decisions',
          'project',
          'system',
        ])
        .describe('Which domain this event belongs to'),
      action: z
        .enum(['create', 'update', 'delete', 'status_change', 'analyze', 'info'])
        .describe('What type of action occurred'),
      entity_type: z
        .string()
        .optional()
        .describe('Entity type (e.g. "issue", "file", "component")'),
      entity_id: z.string().optional().describe('Entity identifier'),
      entity_title: z.string().optional().describe('Human-readable title for the entity'),
      reasoning: z.string().describe('WHY this action was taken'),
      confidence: z.number().min(0).max(1).optional().describe('Confidence level (0-1)'),
      session_id: z.string().optional().describe('Session ID for correlation'),
      data: z.record(z.unknown()).optional().describe('Additional structured data'),
    },
  },
  async ({
    project_id,
    category,
    action,
    entity_type,
    entity_id,
    entity_title,
    reasoning,
    confidence,
    session_id,
    data,
  }) => {
    try {
      const event = await sf.recordEvent(project_id, {
        actor: 'ai',
        category,
        action,
        entity_type,
        entity_id,
        entity_title,
        reasoning,
        confidence,
        session_id,
        data: data || {},
      })
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(event, null, 2),
          },
        ],
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      }
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Update AI Status
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_update_ai_status',
  {
    description:
      'Report what the AI is currently working on. The human sees this in the transparency dashboard. Call this when starting work, switching focus, or when blocked and needing input.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      status: z.enum(['working', 'idle', 'blocked']).describe('Current AI status'),
      detail: z
        .string()
        .optional()
        .describe('What the AI is currently doing (e.g. "Implementing authentication middleware")'),
    },
  },
  async ({ project_id, status, detail }) => {
    try {
      const result = await sf.updateAiStatus(project_id, status, detail)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      }
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Get Steering Inputs
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_get_steering_inputs',
  {
    description:
      'Check for pending human steering directives. The human can type natural language instructions like "focus on the API next" or "stop auth work, prioritize bugfixes". Call this periodically to see if the human wants to redirect your work. Use consume=true to mark directives as read.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      consume: z
        .boolean()
        .optional()
        .describe(
          'If true, marks returned directives as consumed so they are not returned again. Default false (peek only).'
        ),
    },
  },
  async ({ project_id, consume }) => {
    try {
      const directives = await sf.getSteeringInputs(project_id, { consume: !!consume })
      return {
        content: [
          {
            type: 'text',
            text:
              directives.length > 0
                ? JSON.stringify(directives, null, 2)
                : 'No pending steering directives.',
          },
        ],
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      }
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Respond to Human
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_respond_to_human',
  {
    description:
      'Acknowledge or respond to a human steering directive or event. Use this to confirm you received a directive, explain what you plan to do about it, or mark it as addressed.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      directive_id: z
        .string()
        .optional()
        .describe('The directive ID to acknowledge (from storyflow_get_steering_inputs)'),
      event_id: z
        .string()
        .optional()
        .describe('The event ID to respond to (alternative to directive_id)'),
      action: z
        .enum(['approve', 'reject', 'redirect'])
        .optional()
        .describe('Response action for event-based responses'),
      comment: z.string().optional().describe('Response message to the human'),
      ...provenanceParams,
    },
  },
  async ({
    project_id,
    directive_id,
    event_id,
    action,
    comment,
    reasoning,
    confidence: _confidence,
    session_id: _session_id,
  }) => {
    try {
      const results = []

      // Acknowledge a steering directive
      if (directive_id) {
        const ack = await sf.acknowledgeDirective(project_id, directive_id)
        results.push({ type: 'directive_acknowledged', directive: ack })
      }

      // Respond to an event
      if (event_id && action) {
        const resp = await sf.respondToHuman(project_id, event_id, { action, comment })
        results.push({ type: 'event_responded', event: resp })
      }

      // Record acknowledgment as an event for transparency
      if (comment) {
        await sf.recordEvent(project_id, {
          actor: 'ai',
          category: 'steering',
          action: 'info',
          entity_type: 'response',
          entity_id: directive_id || event_id || null,
          entity_title: comment.slice(0, 120),
          reasoning: reasoning || null,
          data: { directive_id, event_id, action, comment },
        })
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              results.length > 0 ? results : { acknowledged: true, comment },
              null,
              2
            ),
          },
        ],
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      }
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Escalate to Human
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_escalate',
  {
    description:
      'Escalate a decision to the human when confidence is low (<0.5), conflicting directives exist, or a gate is pending for a prerequisite. Sets AI status to "blocked" and records an escalation event visible in the transparency dashboard.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      severity: z.enum(['low', 'medium', 'high', 'critical']).describe('Escalation severity'),
      context: z.string().describe('What the agent is trying to do and why it needs help'),
      options: z.array(z.string()).optional().describe('Choices for the human to pick from'),
      reasoning: z.string().describe('Why this is being escalated instead of acted on'),
    },
  },
  async ({ project_id, severity, context, options, reasoning }) => {
    try {
      // 1. Set AI status to blocked
      await sf.updateAiStatus(project_id, 'blocked', context)

      // 2. Record escalation event
      await sf.recordEvent(project_id, {
        actor: 'ai',
        category: 'system',
        action: 'info',
        entity_type: 'escalation',
        entity_title: context.slice(0, 120),
        reasoning,
        data: { severity, options: options || [] },
      })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                escalated: true,
                message: 'Blocked — waiting for human input via the transparency dashboard',
              },
              null,
              2
            ),
          },
        ],
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      }
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Check Approval Gates
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_check_gates',
  {
    description:
      'Check for pending approval gates and recently rejected actions. Call this before significant mutations to respect human oversight. Returns pending gates that need human approval and rejected actions the AI should not retry.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      since: z
        .string()
        .optional()
        .describe('ISO timestamp — only return rejected events after this time'),
    },
  },
  async ({ project_id, since }) => {
    try {
      const gates = await sf.checkGates(project_id, { since })
      const pendingCount = gates.pending?.length || 0
      const rejectedCount = gates.rejected?.length || 0

      let summary = ''
      if (pendingCount === 0 && rejectedCount === 0) {
        summary = 'No pending gates or rejected actions. You are clear to proceed.'
      } else {
        const parts = []
        if (pendingCount > 0) {
          parts.push(
            `${pendingCount} action(s) awaiting human approval — do NOT proceed with related mutations until approved.`
          )
        }
        if (rejectedCount > 0) {
          parts.push(
            `${rejectedCount} action(s) were rejected by the human — review before retrying similar actions.`
          )
        }
        summary = parts.join(' ')
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ summary, ...gates }, null, 2),
          },
        ],
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      }
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Save Session Summary
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_save_session_summary',
  {
    description:
      'Save a session summary capturing what the agent did, decisions made, learnings, and planned next steps. Call this at session end to maintain continuity across conversations.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      summary: z.string().describe('Brief summary of the session'),
      work_done: z.string().optional().describe('Narrative of what was accomplished'),
      issues_created: z.number().optional().describe('Number of issues created'),
      issues_updated: z.number().optional().describe('Number of issues updated'),
      key_decisions: z.string().optional().describe('Decisions made and why'),
      learnings: z.string().optional().describe('New knowledge gained about the codebase/project'),
      wiki_pages_updated: z.string().optional().describe('Which Agent: wiki pages were updated'),
      next_steps: z.string().optional().describe('What should happen in the next session'),
    },
  },
  async ({
    project_id,
    summary,
    work_done,
    issues_created,
    issues_updated,
    key_decisions,
    learnings,
    wiki_pages_updated,
    next_steps,
  }) => {
    try {
      const session = await sf.saveSessionSummary(project_id, {
        summary,
        work_done,
        issues_created,
        issues_updated,
        key_decisions,
        learnings,
        wiki_pages_updated,
        next_steps,
      })
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(session, null, 2),
          },
        ],
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      }
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Get Last Session
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_get_last_session',
  {
    description:
      'Retrieve the most recent agent session for a project. Use on session start to recall what happened last time and what was planned next. Returns session summary, decisions, learnings, and next steps.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
    },
  },
  async ({ project_id }) => {
    try {
      const session = await sf.getLastSession(project_id)
      if (!session || session.message) {
        return {
          content: [
            {
              type: 'text',
              text: 'No previous sessions found. This is likely a first session — read the project board and wiki to build initial context, then create Agent: wiki pages.',
            },
          ],
        }
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(session, null, 2),
          },
        ],
      }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      }
    }
  }
)

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('StoryFlow MCP server running on stdio')
}

main().catch((err) => {
  console.error('Fatal error starting StoryFlow MCP server:', err)
  process.exit(1)
})
