#!/usr/bin/env node
// ---------------------------------------------------------------------------
// StoryFlow MCP Server (stdio)
// Provides tools for Claude Code to interact with StoryFlow's REST API
// ---------------------------------------------------------------------------

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import * as sf from './storyflow-client.js'

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
    },
  },
  async ({ name, description, status }) => {
    const project = await sf.createProject({ name, description, status })
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
    },
  },
  async ({ project_id, name, description, status }) => {
    const data = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (status !== undefined) data.status = status
    const project = await sf.updateProject(project_id, data)
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
    const issue = await sf.createIssue(project_id, data)
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
    const issue = issue_key
      ? await sf.updateIssueByKey(project_id, issue_key, data)
      : await sf.updateIssue(project_id, issue_id, data)
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
    },
  },
  async ({ project_id, issue_id, issue_key }) => {
    if (!issue_id && !issue_key) {
      return {
        content: [{ type: 'text', text: 'Error: provide either issue_id or issue_key' }],
        isError: true,
      }
    }
    const identifier = issue_key || issue_id
    if (issue_key) {
      await sf.deleteIssueByKey(project_id, issue_key)
    } else {
      await sf.deleteIssue(project_id, issue_id)
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
    },
  },
  async ({ project_id, name, goal, start_date, end_date, status }) => {
    const data = { name }
    if (goal) data.goal = goal
    if (start_date) data.startDate = start_date
    if (end_date) data.endDate = end_date
    if (status) data.status = status
    const sprint = await sf.createSprint(project_id, data)
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
    },
  },
  async ({ project_id, title, content, parent_id }) => {
    const data = { title }
    if (content) data.content = content
    if (parent_id) data.parentId = parent_id
    const page = await sf.createPage(project_id, data)
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
    },
  },
  async ({ project_id, page_id, title, content, parent_id }) => {
    const data = {}
    if (title !== undefined) data.title = title
    if (content !== undefined) data.content = content
    if (parent_id !== undefined) data.parentId = parent_id
    const page = await sf.updatePage(project_id, page_id, data)
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
    },
  },
  async ({ project_id, page_id }) => {
    await sf.deletePage(project_id, page_id)
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
    },
  },
  async ({ project_id, sprint_id }) => {
    await sf.deleteSprint(project_id, sprint_id)
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
