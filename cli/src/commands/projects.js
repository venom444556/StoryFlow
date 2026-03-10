// ---------------------------------------------------------------------------
// storyflow projects — list, show, create, update
// ---------------------------------------------------------------------------

import { projects, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

export function register(program) {
  const cmd = program.command('projects').alias('project').description('Manage projects')

  cmd
    .command('list')
    .alias('ls')
    .description('List all projects')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const list = await projects.list()
      if (opts.json) return out.json(list)

      out.heading('Projects')
      out.table(list, [
        { header: 'ID', value: (r) => r.id, maxWidth: 25 },
        { header: 'Name', value: (r) => r.name, maxWidth: 30 },
        { header: 'Status', value: (r) => out.status(r.status || 'planning'), maxWidth: 15 },
        { header: 'Issues', value: (r) => String(r.board?.issues?.length ?? '?'), maxWidth: 8 },
        { header: 'Updated', value: (r) => shortDate(r.updatedAt), maxWidth: 12 },
      ])
    })

  cmd
    .command('show [id]')
    .alias('get')
    .description('Show project details')
    .option('--json', 'Output raw JSON')
    .action(async (id, opts) => {
      id = await resolveProject(id)
      const p = await projects.get(id)
      if (opts.json) return out.json(p)

      out.heading(p.name)
      out.kv('ID', p.id)
      out.kv('Status', out.status(p.status || 'planning'))
      out.kv('Description', p.description || chalk.gray('(none)'))
      out.kv('Issues', p.board?.issues?.length ?? 0)
      out.kv('Sprints', p.board?.sprints?.length ?? 0)
      out.kv('Pages', p.pages?.length ?? 0)
      out.kv('Created', p.createdAt)
      out.kv('Updated', p.updatedAt)
    })

  cmd
    .command('create <id>')
    .description('Create a new project')
    .requiredOption('-n, --name <name>', 'Project name')
    .option('-d, --description <desc>', 'Description')
    .action(async (id, opts) => {
      const result = await projects.create({
        id,
        name: opts.name,
        description: opts.description || '',
      })
      out.success(`Created project: ${result.name} (${result.id})`)
    })

  cmd
    .command('update <id>')
    .description('Update a project')
    .option('-n, --name <name>', 'Project name')
    .option('-d, --description <desc>', 'Description')
    .option('-s, --status <status>', 'Status (planning, in-progress, completed, on-hold)')
    .action(async (id, opts) => {
      const data = {}
      if (opts.name) data.name = opts.name
      if (opts.description) data.description = opts.description
      if (opts.status) data.status = opts.status
      const result = await projects.update(id, data)
      out.success(`Updated project: ${result.name}`)
    })
}

function shortDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
