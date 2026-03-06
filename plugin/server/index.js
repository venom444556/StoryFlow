#!/usr/bin/env node
// ---------------------------------------------------------------------------
// StoryFlow MCP Server (stdio)
// Provides tools for Claude Code to interact with StoryFlow's REST API
// ---------------------------------------------------------------------------

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import * as sf from './storyflow-client.js'
import { buildProvenanceHeaders } from './storyflow-client.js'

const execFileAsync = promisify(execFile)

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
  version: '2.0.0',
})

// ---------------------------------------------------------------------------
// Auto AI-status tracker
// Automatically sets status to 'working' when mutating tools are called,
// and debounces back to 'idle' after 30 seconds of inactivity.
// ---------------------------------------------------------------------------
const AUTO_IDLE_DELAY_MS = 30_000
const _idleTimers = {} // projectId → timeout handle

// Tools that should NOT trigger auto-status (read-only or status-management tools)
const STATUS_BYPASS_TOOLS = new Set([
  'storyflow_list_projects',
  'storyflow_get_project',
  'storyflow_list_issues',
  'storyflow_get_issue_by_key',
  'storyflow_list_sprints',
  'storyflow_sprint_metrics',
  'storyflow_get_board_summary',
  'storyflow_run_hygiene',
  'storyflow_list_pages',
  'storyflow_get_page',
  'storyflow_list_sessions',
  'storyflow_get_last_session',
  'storyflow_query_events',
  'storyflow_check_connection',
  'storyflow_check_gates',
  'storyflow_get_steering_inputs',
  'storyflow_update_ai_status', // avoid recursion
  'storyflow_sync_from_git',
  'storyflow_record_event', // bookkeeping — not real work
  'storyflow_save_session_summary', // bookkeeping
  'storyflow_acknowledge_directive', // bookkeeping
  'storyflow_list_workflow_nodes', // read-only
  'storyflow_get_workflow_node', // read-only
  'storyflow_list_architecture_components', // read-only
])

function scheduleAutoIdle(projectId) {
  if (_idleTimers[projectId]) clearTimeout(_idleTimers[projectId])
  _idleTimers[projectId] = setTimeout(async () => {
    try {
      await sf.updateAiStatus(projectId, 'idle', '')
    } catch {
      // best-effort — don't break anything
    }
    delete _idleTimers[projectId]
  }, AUTO_IDLE_DELAY_MS)
}

// Wrap registerTool to inject auto-status on mutating tool calls
const _origRegisterTool = server.registerTool.bind(server)
server.registerTool = function (name, schema, handler) {
  if (STATUS_BYPASS_TOOLS.has(name)) {
    return _origRegisterTool(name, schema, handler)
  }
  const wrappedHandler = async (params) => {
    const projectId = params.project_id
    if (projectId) {
      try {
        const toolLabel = name.replace('storyflow_', '').replace(/_/g, ' ')
        await sf.updateAiStatus(projectId, 'working', toolLabel)
      } catch {
        // best-effort
      }
      scheduleAutoIdle(projectId)
    }
    return handler(params)
  }
  return _origRegisterTool(name, schema, wrappedHandler)
}

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
    description:
      'Update an existing StoryFlow project. Only provided fields are changed. Supports name, description, status, techStack, overview, architecture, and timeline.',
    inputSchema: {
      project_id: z.string().describe('Project ID (slug-based, e.g. "my-app")'),
      name: z.string().optional().describe('New project name'),
      description: z.string().optional().describe('New project description'),
      status: z
        .enum(['planning', 'in-progress', 'completed', 'on-hold'])
        .optional()
        .describe('New project status'),
      techStack: z
        .array(z.string())
        .optional()
        .describe('Technology stack (e.g. ["React", "Node.js", "SQLite"])'),
      overview: z
        .object({
          goals: z.string().optional(),
          constraints: z.string().optional(),
          targetAudience: z.string().optional(),
        })
        .optional()
        .describe('Project overview — goals, constraints, target audience'),
      architecture: z
        .object({
          components: z.array(z.any()).optional(),
          connections: z.array(z.any()).optional(),
        })
        .optional()
        .describe('Architecture diagram data — components and connections'),
      timeline: z
        .object({
          phases: z.array(z.any()).optional(),
          milestones: z.array(z.any()).optional(),
        })
        .optional()
        .describe('Timeline data — phases and milestones'),
      ...provenanceParams,
    },
  },
  async ({
    project_id,
    name,
    description,
    status,
    techStack,
    overview,
    architecture,
    timeline,
    reasoning,
    confidence,
    session_id,
  }) => {
    const data = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (status !== undefined) data.status = status
    if (techStack !== undefined) data.techStack = techStack
    if (overview !== undefined) data.overview = overview
    if (architecture !== undefined) data.architecture = architecture
    if (timeline !== undefined) data.timeline = timeline
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
      'List issues in a StoryFlow project with pagination. Returns {issues, total, page, limit, hasMore}. Use page/limit for large projects to avoid token overflow. Use fields="summary" for compact output.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      status: z
        .enum(['To Do', 'In Progress', 'Done', 'Blocked'])
        .optional()
        .describe('Filter by status'),
      type: z.enum(['epic', 'story', 'task', 'bug']).optional().describe('Filter by issue type'),
      epic_id: z.string().optional().describe('Filter by parent epic ID'),
      sprint_id: z.string().optional().describe('Filter by sprint ID'),
      assignee: z.string().optional().describe('Filter by assignee'),
      search: z.string().optional().describe('Search title, key, or description'),
      page: z.number().optional().describe('Page number (default: 1)'),
      limit: z.number().optional().describe('Items per page (default: 50, max: 100)'),
      fields: z
        .enum(['full', 'summary'])
        .optional()
        .describe('Field set: "summary" returns only id/key/title/status/type'),
    },
  },
  async ({
    project_id,
    status,
    type,
    epic_id,
    sprint_id,
    assignee,
    search,
    page,
    limit,
    fields,
  }) => {
    const filters = {}
    if (status) filters.status = status
    if (type) filters.type = type
    if (epic_id) filters.epicId = epic_id
    if (sprint_id) filters.sprintId = sprint_id
    if (assignee) filters.assignee = assignee
    if (search) filters.search = search
    if (page) filters.page = page
    if (limit) filters.limit = limit
    if (fields) filters.fields = fields
    const result = await sf.listIssues(project_id, filters)
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
        .enum(['To Do', 'In Progress', 'Done', 'Blocked'])
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
      status: z.enum(['To Do', 'In Progress', 'Done', 'Blocked']).optional().describe('New status'),
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
            status: z.enum(['To Do', 'In Progress', 'Done', 'Blocked']).optional(),
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
// Tool: Add Comment to Issue
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_add_comment',
  {
    description:
      'Add a comment to an issue — the agent\'s way to leave notes, questions, status updates, or context on any issue. Like a PM writing a comment in Jira. Accepts issue_id (UUID) or issue_key (e.g. "SCA-43").',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      issue_id: z.string().optional().describe('Issue ID (UUID) — provide this OR issue_key'),
      issue_key: z
        .string()
        .optional()
        .describe('Issue key (e.g. "SCA-43") — provide this OR issue_id'),
      body: z.string().describe('The comment text (supports markdown)'),
      author: z
        .string()
        .optional()
        .describe('Who is commenting (default: "agent"). Use "agent", "system", or a human name.'),
      ...provenanceParams,
    },
  },
  async ({ project_id, issue_id, issue_key, body, author, ...prov }) => {
    if (!issue_id && !issue_key) {
      return {
        content: [{ type: 'text', text: 'Error: provide either issue_id or issue_key' }],
        isError: true,
      }
    }
    const headers = sf.buildProvenanceHeaders(prov)
    const data = { body, author }
    const result = issue_key
      ? await sf.addCommentByKey(project_id, issue_key, data, headers)
      : await sf.addComment(project_id, issue_id, data, headers)
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
// Tool: Get Page (read wiki page content)
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_get_page',
  {
    description:
      'Read the full content of a wiki page by ID. Use this to read Agent: knowledge pages on session start, review documentation, or check page content before updating.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      page_id: z.string().describe('Page ID to read'),
    },
  },
  async ({ project_id, page_id }) => {
    try {
      const page = await sf.getPage(project_id, page_id)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(page, null, 2),
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
// Tool: Create Decision
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_create_decision',
  {
    description:
      'Create an architectural decision record (ADR) in a StoryFlow project. Decisions appear on the Decisions tab.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      title: z.string().describe('Decision title'),
      context: z.string().optional().describe('Context and background for the decision'),
      decision: z.string().optional().describe('The decision that was made'),
      status: z
        .enum(['proposed', 'accepted', 'deprecated', 'superseded'])
        .optional()
        .describe('Decision status (default: proposed)'),
      alternatives: z.array(z.string()).optional().describe('Alternative options considered'),
      consequences: z.string().optional().describe('Consequences of this decision'),
      ...provenanceParams,
    },
  },
  async ({ project_id, reasoning, confidence, session_id, ...data }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const decision = await sf.createDecision(project_id, data, headers)
    return {
      content: [{ type: 'text', text: JSON.stringify(decision, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Update Decision
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_update_decision',
  {
    description: 'Update an existing decision in a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      decision_id: z.string().describe('Decision ID to update'),
      title: z.string().optional().describe('New title'),
      context: z.string().optional().describe('Updated context'),
      decision: z.string().optional().describe('Updated decision text'),
      status: z
        .enum(['proposed', 'accepted', 'deprecated', 'superseded'])
        .optional()
        .describe('New status'),
      alternatives: z.array(z.string()).optional().describe('Updated alternatives'),
      consequences: z.string().optional().describe('Updated consequences'),
      ...provenanceParams,
    },
  },
  async ({ project_id, decision_id, reasoning, confidence, session_id, ...data }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const decision = await sf.updateDecision(project_id, decision_id, data, headers)
    return {
      content: [{ type: 'text', text: JSON.stringify(decision, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Delete Decision
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_delete_decision',
  {
    description: 'Delete a decision from a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      decision_id: z.string().describe('Decision ID to delete'),
      ...provenanceParams,
    },
  },
  async ({ project_id, decision_id, reasoning, confidence, session_id }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    await sf.deleteDecision(project_id, decision_id, headers)
    return {
      content: [{ type: 'text', text: `Decision ${decision_id} deleted successfully.` }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Create Phase
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_create_phase',
  {
    description:
      'Create a timeline phase in a StoryFlow project. Phases appear on the Timeline tab as a Gantt-style view.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      name: z.string().describe('Phase name'),
      description: z.string().optional().describe('Phase description'),
      startDate: z.string().optional().describe('Start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('End date (YYYY-MM-DD)'),
      progress: z.number().min(0).max(100).optional().describe('Progress percentage (0-100)'),
      color: z.string().optional().describe('Phase color (hex, e.g. "#f59e0b")'),
      ...provenanceParams,
    },
  },
  async ({ project_id, reasoning, confidence, session_id, ...data }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const phase = await sf.createPhase(project_id, data, headers)
    return {
      content: [{ type: 'text', text: JSON.stringify(phase, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Update Phase
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_update_phase',
  {
    description: 'Update an existing timeline phase in a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      phase_id: z.string().describe('Phase ID to update'),
      name: z.string().optional().describe('New phase name'),
      description: z.string().optional().describe('New description'),
      startDate: z.string().optional().describe('New start date (YYYY-MM-DD)'),
      endDate: z.string().optional().describe('New end date (YYYY-MM-DD)'),
      progress: z.number().min(0).max(100).optional().describe('Progress percentage (0-100)'),
      color: z.string().optional().describe('Phase color (hex)'),
      ...provenanceParams,
    },
  },
  async ({ project_id, phase_id, reasoning, confidence, session_id, ...data }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const phase = await sf.updatePhase(project_id, phase_id, data, headers)
    return {
      content: [{ type: 'text', text: JSON.stringify(phase, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Delete Phase
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_delete_phase',
  {
    description: 'Delete a timeline phase from a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      phase_id: z.string().describe('Phase ID to delete'),
      ...provenanceParams,
    },
  },
  async ({ project_id, phase_id, reasoning, confidence, session_id }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    await sf.deletePhase(project_id, phase_id, headers)
    return {
      content: [{ type: 'text', text: `Phase ${phase_id} deleted successfully.` }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Create Milestone
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_create_milestone',
  {
    description:
      'Create a timeline milestone in a StoryFlow project. Milestones mark key dates on the Timeline tab.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      name: z.string().describe('Milestone name'),
      targetDate: z.string().optional().describe('Target date (YYYY-MM-DD)'),
      completed: z.boolean().optional().describe('Whether the milestone is completed'),
      ...provenanceParams,
    },
  },
  async ({ project_id, reasoning, confidence, session_id, ...data }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const milestone = await sf.createMilestone(project_id, data, headers)
    return {
      content: [{ type: 'text', text: JSON.stringify(milestone, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Update Milestone
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_update_milestone',
  {
    description: 'Update an existing milestone in a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      milestone_id: z.string().describe('Milestone ID to update'),
      name: z.string().optional().describe('New name'),
      targetDate: z.string().optional().describe('New target date (YYYY-MM-DD)'),
      completed: z.boolean().optional().describe('Whether completed'),
      ...provenanceParams,
    },
  },
  async ({ project_id, milestone_id, reasoning, confidence, session_id, ...data }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const milestone = await sf.updateMilestone(project_id, milestone_id, data, headers)
    return {
      content: [{ type: 'text', text: JSON.stringify(milestone, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Delete Milestone
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_delete_milestone',
  {
    description: 'Delete a milestone from a StoryFlow project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      milestone_id: z.string().describe('Milestone ID to delete'),
      ...provenanceParams,
    },
  },
  async ({ project_id, milestone_id, reasoning, confidence, session_id }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    await sf.deleteMilestone(project_id, milestone_id, headers)
    return {
      content: [{ type: 'text', text: `Milestone ${milestone_id} deleted successfully.` }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: List Workflow Nodes
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_list_workflow_nodes',
  {
    description: 'List all workflow nodes for a project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
    },
  },
  async ({ project_id }) => {
    const nodes = await sf.listWorkflowNodes(project_id)
    return {
      content: [{ type: 'text', text: JSON.stringify(nodes, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Get Workflow Node
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_get_workflow_node',
  {
    description: 'Get a single workflow node by ID.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      node_id: z.string().describe('Workflow node ID'),
    },
  },
  async ({ project_id, node_id }) => {
    const node = await sf.getWorkflowNode(project_id, node_id)
    return {
      content: [{ type: 'text', text: JSON.stringify(node, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Add Workflow Node
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_add_workflow_node',
  {
    description: 'Add a new workflow node to a project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      title: z.string().describe('Node title'),
      type: z
        .enum(['start', 'end', 'phase', 'decision', 'milestone', 'task'])
        .describe('Node type'),
      description: z.string().optional().describe('Node description'),
      x: z.number().optional().describe('X position on canvas'),
      y: z.number().optional().describe('Y position on canvas'),
      ...provenanceParams,
    },
  },
  async ({ project_id, title, type, description, x, y, reasoning, confidence, session_id }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const node = await sf.addWorkflowNode(project_id, { title, type, description, x, y }, headers)
    return {
      content: [{ type: 'text', text: JSON.stringify(node, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Update Workflow Node (#42)
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_update_workflow_node',
  {
    description:
      'Update a workflow node status or fields. For phase nodes, can also update a specific child by passing child_id. Phase nodes cannot be set to "success" unless all children are complete.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      node_id: z.string().describe('Workflow node ID'),
      status: z
        .enum(['idle', 'running', 'success', 'error'])
        .optional()
        .describe('New node status'),
      child_id: z.string().optional().describe('Child node ID within a phase node'),
      error: z.string().optional().describe('Error message (when status is "error")'),
      title: z.string().optional().describe('Updated title'),
      description: z.string().optional().describe('Updated description'),
      ...provenanceParams,
    },
  },
  async ({
    project_id,
    node_id,
    status,
    child_id,
    error,
    title,
    description,
    reasoning,
    confidence,
    session_id,
  }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const updates = {}
    if (status !== undefined) updates.status = status
    if (child_id !== undefined) updates.child_id = child_id
    if (error !== undefined) updates.error = error
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    const node = await sf.updateWorkflowNode(project_id, node_id, updates, headers)
    return {
      content: [{ type: 'text', text: JSON.stringify(node, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Delete Workflow Node
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_delete_workflow_node',
  {
    description: 'Delete a workflow node and all its connections. Cannot be undone.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      node_id: z.string().describe('Workflow node ID to delete'),
      ...provenanceParams,
    },
  },
  async ({ project_id, node_id, reasoning, confidence, session_id }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    await sf.deleteWorkflowNode(project_id, node_id, headers)
    return {
      content: [{ type: 'text', text: JSON.stringify({ deleted: true, node_id }, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Link Issue to Workflow Node (#39)
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_link_issue_to_node',
  {
    description:
      'Link a board issue to a workflow node by issue key. When linked issues move to Done, the workflow node can be auto-updated.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      node_id: z.string().describe('Workflow node ID'),
      issue_key: z.string().describe('Issue key (e.g. "SC-42")'),
      ...provenanceParams,
    },
  },
  async ({ project_id, node_id, issue_key, reasoning, confidence, session_id }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const node = await sf.linkIssueToWorkflowNode(project_id, node_id, issue_key, headers)
    return {
      content: [{ type: 'text', text: JSON.stringify(node, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Unlink Issue from Workflow Node
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_unlink_issue_from_node',
  {
    description: 'Remove a link between a board issue and a workflow node.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      node_id: z.string().describe('Workflow node ID'),
      issue_key: z.string().describe('Issue key to unlink'),
    },
  },
  async ({ project_id, node_id, issue_key }) => {
    const node = await sf.unlinkIssueFromWorkflowNode(project_id, node_id, issue_key)
    return {
      content: [{ type: 'text', text: JSON.stringify(node, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: List Architecture Components
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_list_architecture_components',
  {
    description: 'List all architecture components for a project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
    },
  },
  async ({ project_id }) => {
    const comps = await sf.listArchitectureComponents(project_id)
    return {
      content: [{ type: 'text', text: JSON.stringify(comps, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Add Architecture Component
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_add_architecture_component',
  {
    description: 'Add a new architecture component to a project.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      name: z.string().describe('Component name'),
      type: z
        .string()
        .optional()
        .describe('Component type (e.g. "api", "service", "page", "model")'),
      description: z.string().optional().describe('Component description'),
      dependencies: z.array(z.string()).optional().describe('IDs of components this depends on'),
      x: z.number().optional().describe('X position on canvas'),
      y: z.number().optional().describe('Y position on canvas'),
      ...provenanceParams,
    },
  },
  async ({
    project_id,
    name,
    type,
    description,
    dependencies,
    x,
    y,
    reasoning,
    confidence,
    session_id,
  }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const comp = await sf.addArchitectureComponent(
      project_id,
      { name, type, description, dependencies, x, y },
      headers
    )
    return {
      content: [{ type: 'text', text: JSON.stringify(comp, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Update Architecture Component
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_update_architecture_component',
  {
    description: 'Update an architecture component. Only provided fields are changed.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      component_id: z.string().describe('Component ID'),
      name: z.string().optional().describe('Updated name'),
      type: z.string().optional().describe('Updated type'),
      description: z.string().optional().describe('Updated description'),
      dependencies: z.array(z.string()).optional().describe('Updated dependency IDs'),
      ...provenanceParams,
    },
  },
  async ({
    project_id,
    component_id,
    name,
    type,
    description,
    dependencies,
    reasoning,
    confidence,
    session_id,
  }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    const updates = {}
    if (name !== undefined) updates.name = name
    if (type !== undefined) updates.type = type
    if (description !== undefined) updates.description = description
    if (dependencies !== undefined) updates.dependencies = dependencies
    const comp = await sf.updateArchitectureComponent(project_id, component_id, updates, headers)
    return {
      content: [{ type: 'text', text: JSON.stringify(comp, null, 2) }],
    }
  }
)

// ---------------------------------------------------------------------------
// Tool: Delete Architecture Component
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_delete_architecture_component',
  {
    description: 'Delete an architecture component and all its connections. Cannot be undone.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      component_id: z.string().describe('Component ID to delete'),
      ...provenanceParams,
    },
  },
  async ({ project_id, component_id, reasoning, confidence, session_id }) => {
    const headers = buildProvenanceHeaders({ reasoning, confidence, session_id })
    await sf.deleteArchitectureComponent(project_id, component_id, headers)
    return {
      content: [{ type: 'text', text: JSON.stringify({ deleted: true, component_id }, null, 2) }],
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
// Tool: Sync from Git (inspect local repo history)
// ---------------------------------------------------------------------------

/** Run a git command safely and return stdout, or null on error */
async function git(args, cwd) {
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd,
      timeout: 10_000,
      maxBuffer: 1024 * 1024,
    })
    return stdout.trim()
  } catch {
    return null
  }
}

server.registerTool(
  'storyflow_sync_from_git',
  {
    description:
      'Inspect the local git repository to find commits, branches, and PRs that StoryFlow may have missed. Use on session start to catch up on work done outside StoryFlow-aware sessions, or when the board seems out of date. Returns recent commits, current branch, and any merged PRs. Read-only — does not modify the repo.',
    inputSchema: {
      project_id: z.string().describe('Project ID to reconcile against'),
      since: z
        .string()
        .optional()
        .describe(
          'Only show commits after this ISO date or relative time (e.g. "2024-01-15", "3 days ago"). Defaults to 7 days ago.'
        ),
      branch: z.string().optional().describe('Branch to inspect (default: current branch)'),
      cwd: z
        .string()
        .optional()
        .describe('Working directory of the git repo (default: process.cwd())'),
    },
  },
  async ({ project_id, since, branch, cwd: userCwd }) => {
    try {
      const repoDir = userCwd || process.cwd()

      // Verify this is a git repo
      const isRepo = await git(['rev-parse', '--is-inside-work-tree'], repoDir)
      if (isRepo !== 'true') {
        return {
          content: [{ type: 'text', text: 'Error: Not inside a git repository' }],
          isError: true,
        }
      }

      const sinceDate = since || '7 days ago'
      const targetBranch = branch || (await git(['branch', '--show-current'], repoDir)) || 'HEAD'

      // 1. Recent commits with message, author, date, files changed
      const logFormat = '%H||%s||%an||%aI'
      const logOutput = await git(
        [
          'log',
          targetBranch,
          `--since=${sinceDate}`,
          `--format=${logFormat}`,
          '--no-merges',
          '-50',
        ],
        repoDir
      )
      const commits = (logOutput || '')
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [hash, message, author, date] = line.split('||')
          return { hash: hash?.slice(0, 8), message, author, date }
        })

      // 2. Merge commits (PRs merged) in the same period
      const mergeOutput = await git(
        [
          'log',
          targetBranch,
          `--since=${sinceDate}`,
          '--format=%H||%s||%an||%aI',
          '--merges',
          '-20',
        ],
        repoDir
      )
      const merges = (mergeOutput || '')
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [hash, message, author, date] = line.split('||')
          return { hash: hash?.slice(0, 8), message, author, date }
        })

      // 3. Current branch and status
      const currentBranch = await git(['branch', '--show-current'], repoDir)
      const status = await git(['status', '--porcelain', '-uno'], repoDir)
      const uncommittedChanges = (status || '').split('\n').filter(Boolean).length

      // 4. Files changed in the period (for context on what was worked on)
      const filesChanged = await git(
        [
          'log',
          targetBranch,
          `--since=${sinceDate}`,
          '--format=',
          '--name-only',
          '--no-merges',
          '-50',
        ],
        repoDir
      )
      const fileFrequency = new Map()
      for (const f of (filesChanged || '').split('\n').filter(Boolean)) {
        fileFrequency.set(f, (fileFrequency.get(f) || 0) + 1)
      }
      const hotFiles = [...fileFrequency.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([file, count]) => ({ file, commits: count }))

      // 5. Get existing issues for cross-reference suggestions
      let boardIssues = []
      try {
        boardIssues = await sf.listIssues(project_id)
      } catch {
        // Board unavailable — continue with git data only
      }

      // 6. Match commits to issues by scanning commit messages for issue keys
      const issueKeys = boardIssues
        .filter((i) => i.key)
        .map((i) => ({ key: i.key, id: i.id, title: i.title, status: i.status }))
      const matchedCommits = []
      const unmatchedCommits = []

      for (const commit of commits) {
        const matched = issueKeys.find(
          (ik) =>
            commit.message.toLowerCase().includes(ik.key.toLowerCase()) ||
            commit.message.toLowerCase().includes(ik.title.toLowerCase().slice(0, 30))
        )
        if (matched) {
          matchedCommits.push({ ...commit, issue: matched })
        } else {
          unmatchedCommits.push(commit)
        }
      }

      const report = {
        repo: repoDir,
        branch: currentBranch,
        period: sinceDate,
        uncommittedChanges,
        commits: {
          total: commits.length,
          matched: matchedCommits.length,
          unmatched: unmatchedCommits.length,
        },
        matchedCommits,
        unmatchedCommits: unmatchedCommits.slice(0, 20),
        merges,
        hotFiles,
        suggestions: [],
      }

      // Generate reconciliation suggestions
      for (const mc of matchedCommits) {
        if (mc.issue.status === 'In Progress') {
          report.suggestions.push(
            `Issue ${mc.issue.key} "${mc.issue.title}" has commits but is still "In Progress" — consider moving to "Done"`
          )
        }
      }
      if (unmatchedCommits.length > 0) {
        report.suggestions.push(
          `${unmatchedCommits.length} commit(s) don't match any board issues — consider creating tasks for untracked work`
        )
      }
      for (const merge of merges) {
        if (merge.message.includes('Merge pull request')) {
          report.suggestions.push(
            `Merged PR detected: "${merge.message}" — check if related issues should be closed`
          )
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
// Tool: Sprint Metrics (velocity, cycle time, burndown, scope creep)
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_sprint_metrics',
  {
    description:
      'Compute sprint and project metrics: velocity per sprint, average velocity, cycle time, lead time, throughput, scope creep, and sprint completion rates. Essential for sprint planning, retros, and progress tracking. All data is computed from existing issue timestamps and sprint data.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      sprint_id: z
        .string()
        .optional()
        .describe(
          'Specific sprint to analyze. If omitted, analyzes all sprints + overall project metrics.'
        ),
    },
  },
  async ({ project_id, sprint_id }) => {
    try {
      const issues = await sf.listIssues(project_id)
      const sprints = await sf.listSprints(project_id)

      const metrics = {
        project: { totalIssues: issues.length, totalPoints: 0, donePoints: 0, blockedCount: 0 },
        velocity: { perSprint: [], average: 0, trend: 'stable' },
        cycleTime: { average: null, median: null, samples: 0 },
        leadTime: { average: null, median: null, samples: 0 },
        throughput: { issuesPerDay: 0, pointsPerDay: 0 },
        sprintAnalysis: [],
        scopeCreep: [],
      }

      // --- Project-level metrics ---
      const cycleTimes = []
      const leadTimes = []
      let earliestDone = null
      let latestDone = null

      for (const issue of issues) {
        if (issue.storyPoints) metrics.project.totalPoints += issue.storyPoints
        if (issue.status === 'Done' && issue.storyPoints)
          metrics.project.donePoints += issue.storyPoints
        if (issue.status === 'Blocked') metrics.project.blockedCount++

        // Cycle time: In Progress → Done
        if (issue.inProgressAt && issue.doneAt) {
          const ct = (new Date(issue.doneAt) - new Date(issue.inProgressAt)) / (1000 * 60 * 60)
          cycleTimes.push(ct)
        }
        // Lead time: To Do → Done
        if (issue.todoAt && issue.doneAt) {
          const lt = (new Date(issue.doneAt) - new Date(issue.todoAt)) / (1000 * 60 * 60)
          leadTimes.push(lt)
        }
        // Throughput date range
        if (issue.doneAt) {
          const d = new Date(issue.doneAt)
          if (!earliestDone || d < earliestDone) earliestDone = d
          if (!latestDone || d > latestDone) latestDone = d
        }
      }

      // Cycle time stats
      if (cycleTimes.length > 0) {
        cycleTimes.sort((a, b) => a - b)
        metrics.cycleTime.average = +(
          cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length
        ).toFixed(1)
        metrics.cycleTime.median = +cycleTimes[Math.floor(cycleTimes.length / 2)].toFixed(1)
        metrics.cycleTime.samples = cycleTimes.length
        metrics.cycleTime.unit = 'hours'
      }

      // Lead time stats
      if (leadTimes.length > 0) {
        leadTimes.sort((a, b) => a - b)
        metrics.leadTime.average = +(
          leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length
        ).toFixed(1)
        metrics.leadTime.median = +leadTimes[Math.floor(leadTimes.length / 2)].toFixed(1)
        metrics.leadTime.samples = leadTimes.length
        metrics.leadTime.unit = 'hours'
      }

      // Throughput
      if (earliestDone && latestDone && latestDone > earliestDone) {
        const daySpan = (latestDone - earliestDone) / (1000 * 60 * 60 * 24) || 1
        const doneIssues = issues.filter((i) => i.status === 'Done')
        metrics.throughput.issuesPerDay = +(doneIssues.length / daySpan).toFixed(2)
        metrics.throughput.pointsPerDay = +(metrics.project.donePoints / daySpan).toFixed(2)
      }

      // --- Per-sprint analysis ---
      for (const sprint of sprints) {
        const sprintIssues = issues.filter((i) => i.sprintId === sprint.id)
        const doneInSprint = sprintIssues.filter((i) => i.status === 'Done')
        const points = doneInSprint.reduce((sum, i) => sum + (i.storyPoints || 0), 0)
        const totalSprintPoints = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0)

        const analysis = {
          sprintId: sprint.id,
          name: sprint.name,
          status: sprint.status,
          goal: sprint.goal || null,
          issueCount: sprintIssues.length,
          doneCount: doneInSprint.length,
          blockedCount: sprintIssues.filter((i) => i.status === 'Blocked').length,
          completionRate:
            sprintIssues.length > 0
              ? +((doneInSprint.length / sprintIssues.length) * 100).toFixed(1)
              : 0,
          pointsCompleted: points,
          pointsTotal: totalSprintPoints,
          pointsRemaining: totalSprintPoints - points,
        }

        // Scope creep: issues created after sprint started
        if (sprint.startDate) {
          const sprintStart = new Date(sprint.startDate)
          const addedAfterStart = sprintIssues.filter(
            (i) => i.createdAt && new Date(i.createdAt) > sprintStart
          )
          analysis.scopeCreep = {
            issuesAdded: addedAfterStart.length,
            pointsAdded: addedAfterStart.reduce((sum, i) => sum + (i.storyPoints || 0), 0),
            items: addedAfterStart.map((i) => ({
              key: i.key,
              title: i.title,
              points: i.storyPoints || 0,
            })),
          }
          if (addedAfterStart.length > 0) {
            metrics.scopeCreep.push({
              sprint: sprint.name,
              issuesAdded: addedAfterStart.length,
              pointsAdded: analysis.scopeCreep.pointsAdded,
            })
          }
        }

        // Days remaining (if active sprint with endDate)
        if (sprint.status === 'active' && sprint.endDate) {
          const remaining = (new Date(sprint.endDate) - new Date()) / (1000 * 60 * 60 * 24)
          analysis.daysRemaining = +Math.max(0, remaining).toFixed(1)
          if (analysis.daysRemaining > 0 && analysis.pointsRemaining > 0) {
            analysis.requiredVelocity = +(
              analysis.pointsRemaining / analysis.daysRemaining
            ).toFixed(2)
          }
        }

        metrics.sprintAnalysis.push(analysis)

        // Velocity tracking (completed sprints only)
        if (sprint.status === 'completed') {
          metrics.velocity.perSprint.push({ sprint: sprint.name, points })
        }
      }

      // If requested specific sprint, filter
      if (sprint_id) {
        const target = metrics.sprintAnalysis.find((s) => s.sprintId === sprint_id)
        if (!target) {
          return {
            content: [{ type: 'text', text: `Sprint ${sprint_id} not found` }],
            isError: true,
          }
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { sprint: target, cycleTime: metrics.cycleTime, leadTime: metrics.leadTime },
                null,
                2
              ),
            },
          ],
        }
      }

      // Velocity average and trend
      const velocities = metrics.velocity.perSprint.map((v) => v.points)
      if (velocities.length > 0) {
        metrics.velocity.average = +(
          velocities.reduce((a, b) => a + b, 0) / velocities.length
        ).toFixed(1)
        if (velocities.length >= 3) {
          const recent = velocities.slice(-2).reduce((a, b) => a + b, 0) / 2
          const older = velocities.slice(0, -2).reduce((a, b) => a + b, 0) / (velocities.length - 2)
          metrics.velocity.trend =
            recent > older * 1.1 ? 'improving' : recent < older * 0.9 ? 'declining' : 'stable'
        }
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(metrics, null, 2) }],
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
// Tool: Query Events (search activity history)
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_query_events',
  {
    description:
      'Search the transparency event log. Use to review past AI actions, decision history, escalations, or audit what happened in previous sessions. Supports filtering by category, actor, entity, time range, and action type.',
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
        .optional()
        .describe('Filter by event category'),
      actor: z
        .enum(['ai', 'human', 'system'])
        .optional()
        .describe('Filter by who triggered the event'),
      entity_type: z
        .string()
        .optional()
        .describe('Filter by entity type (e.g. "issue", "page", "escalation")'),
      entity_id: z.string().optional().describe('Filter by specific entity ID'),
      action: z
        .enum(['create', 'update', 'delete', 'status_change', 'analyze', 'info'])
        .optional()
        .describe('Filter by action type'),
      since: z.string().optional().describe('Only events after this ISO timestamp'),
      before: z.string().optional().describe('Only events before this ISO timestamp'),
      limit: z.number().optional().describe('Max events to return (default: 50)'),
    },
  },
  async ({ project_id, category, actor, entity_type, entity_id, action, since, before, limit }) => {
    try {
      const filters = {}
      if (category) filters.category = category
      if (actor) filters.actor = actor
      if (entity_type) filters.entity_type = entity_type
      if (entity_id) filters.entity_id = entity_id
      if (action) filters.action = action
      if (since) filters.since = since
      if (before) filters.before = before
      if (limit) filters.limit = limit
      const events = await sf.queryEvents(project_id, filters)
      return {
        content: [
          {
            type: 'text',
            text:
              events.length > 0
                ? JSON.stringify(events, null, 2)
                : 'No events found matching the query.',
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
// Tool: List Sessions
// ---------------------------------------------------------------------------
server.registerTool(
  'storyflow_list_sessions',
  {
    description:
      'List recent agent sessions for a project. Returns session summaries ordered by most recent first. Use to review session history, track patterns, or find when a specific decision was made.',
    inputSchema: {
      project_id: z.string().describe('Project ID'),
      limit: z.number().optional().describe('Max sessions to return (default: 10)'),
    },
  },
  async ({ project_id, limit }) => {
    try {
      const sessions = await sf.listSessions(project_id, limit || 10)
      if (sessions.length === 0) {
        return {
          content: [{ type: 'text', text: 'No previous sessions found.' }],
        }
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(sessions, null, 2),
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
