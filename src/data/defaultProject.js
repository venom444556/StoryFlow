export function createDefaultProject(name, id) {
  if (!id || typeof id !== 'string') {
    throw new Error('createDefaultProject requires a valid string id')
  }
  const now = new Date().toISOString()

  return {
    id,
    name,
    description: '',
    status: 'planning',
    techStack: [],
    createdAt: now,
    updatedAt: now,
    overview: {
      goals: '',
      constraints: '',
      targetAudience: '',
    },
    architecture: {
      components: [],
    },
    workflow: {
      nodes: [],
      connections: [],
    },
    board: {
      sprints: [],
      issues: [],
      issueTypes: ['epic', 'story', 'task', 'bug', 'subtask'],
      customFields: [],
      statusColumns: ['To Do', 'In Progress', 'Done'],
      nextIssueNumber: 1,
    },
    pages: [],
    timeline: {
      phases: [],
      milestones: [],
    },
    decisions: [],
    settings: {
      defaultIssueType: 'task',
      pointScale: 'fibonacci',
      sprintLength: 14,
    },
  }
}
