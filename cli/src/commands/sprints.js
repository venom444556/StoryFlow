// ---------------------------------------------------------------------------
// storyflow sprints — list, create, update
// ---------------------------------------------------------------------------

import { sprints, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

export function register(program) {
  const cmd = program.command('sprints').alias('sprint').description('Manage sprints')

  cmd
    .command('list [project]')
    .alias('ls')
    .description('List sprints')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const list = await sprints.list(project)
      if (opts.json) return out.json(list)

      out.heading(`Sprints — ${project}`)
      out.table(list, [
        { header: 'Name', value: (r) => r.name, maxWidth: 30 },
        { header: 'Status', value: (r) => out.status(r.status || 'planning'), maxWidth: 12 },
        { header: 'Start', value: (r) => shortDate(r.startDate), maxWidth: 12 },
        { header: 'End', value: (r) => shortDate(r.endDate), maxWidth: 12 },
        { header: 'Goal', value: (r) => r.goal || chalk.gray('-'), maxWidth: 40 },
      ])
    })

  cmd
    .command('create [project]')
    .description('Create a sprint')
    .requiredOption('-n, --name <name>', 'Sprint name')
    .option('-g, --goal <goal>', 'Sprint goal')
    .option('--start <date>', 'Start date (YYYY-MM-DD)')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .option('-s, --status <status>', 'Status (planning, active, completed)', 'planning')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const data = { name: opts.name, status: opts.status }
      if (opts.goal) data.goal = opts.goal
      if (opts.start) data.startDate = opts.start
      if (opts.end) data.endDate = opts.end
      const result = await sprints.create(project, data)
      out.success(`Created sprint: ${result.name}`)
    })

  cmd
    .command('update <sprintId>')
    .description('Update a sprint')
    .option('--project <project>', 'Override default project')
    .option('-n, --name <name>', 'Sprint name')
    .option('-g, --goal <goal>', 'Sprint goal')
    .option('-s, --status <status>', 'Status')
    .option('--start <date>', 'Start date')
    .option('--end <date>', 'End date')
    .action(async (sprintId, opts) => {
      const project = await resolveProject(opts.project)
      const data = {}
      if (opts.name) data.name = opts.name
      if (opts.goal) data.goal = opts.goal
      if (opts.status) data.status = opts.status
      if (opts.start) data.startDate = opts.start
      if (opts.end) data.endDate = opts.end
      const result = await sprints.update(project, sprintId, data)
      out.success(`Updated sprint: ${result.name}`)
    })
}

function shortDate(iso) {
  if (!iso) return chalk.gray('-')
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
