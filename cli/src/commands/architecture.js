// ---------------------------------------------------------------------------
// storyflow architecture — architecture component management
// ---------------------------------------------------------------------------

import { architecture, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

const COMP_TYPES = [
  'service',
  'database',
  'api',
  'frontend',
  'library',
  'external',
  'queue',
  'cache',
]

export function register(program) {
  const cmd = program
    .command('architecture')
    .alias('arch')
    .description('Manage architecture components')

  cmd
    .command('list [project]')
    .alias('ls')
    .description('List architecture components')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const list = await architecture.list(project)
      if (opts.json) return out.json(list)

      out.heading(`Architecture — ${project}`)
      out.table(list, [
        { header: 'ID', value: (r) => (r.id || '').slice(0, 8), maxWidth: 10 },
        { header: 'Name', value: (r) => r.name, maxWidth: 30 },
        { header: 'Type', value: (r) => compType(r.type), maxWidth: 12 },
        {
          header: 'Deps',
          value: (r) => (r.dependencies?.length ? String(r.dependencies.length) : chalk.gray('-')),
          maxWidth: 5,
        },
        { header: 'Description', value: (r) => (r.description || '').slice(0, 40), maxWidth: 40 },
      ])
      console.log(chalk.gray(`\n  ${list.length} components`))
    })

  cmd
    .command('show <componentId>')
    .alias('get')
    .description('Show component details')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (componentId, opts) => {
      const project = await resolveProject(opts.project)
      const comp = await architecture.get(project, componentId)
      if (opts.json) return out.json(comp)

      out.heading(comp.name)
      out.kv('ID', comp.id)
      out.kv('Type', comp.type)
      if (comp.parentId) out.kv('Parent', comp.parentId)
      if (comp.description) {
        console.log()
        console.log(comp.description)
      }
      if (comp.dependencies?.length) {
        console.log()
        console.log(chalk.bold('Dependencies'))
        for (const dep of comp.dependencies) {
          console.log(`  → ${dep}`)
        }
      }
    })

  cmd
    .command('create [project]')
    .description('Create an architecture component')
    .requiredOption('-n, --name <name>', 'Component name')
    .option('-t, --type <type>', `Type: ${COMP_TYPES.join(', ')}`, 'service')
    .option('-d, --description <desc>', 'Description')
    .option('--parent <parentId>', 'Parent component ID')
    .option('--deps <ids>', 'Comma-separated dependency component IDs')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const data = { name: opts.name, type: opts.type }
      if (opts.description) data.description = opts.description
      if (opts.parent) data.parentId = opts.parent
      if (opts.deps) data.dependencies = opts.deps.split(',').map((s) => s.trim())
      const result = await architecture.create(project, data)
      if (opts.json) return out.json(result)
      out.success(`Created component: ${result.name} (${result.id})`)
    })

  cmd
    .command('update <componentId>')
    .description('Update an architecture component')
    .option('--project <project>', 'Override default project')
    .option('-n, --name <name>', 'Component name')
    .option('-t, --type <type>', 'Component type')
    .option('-d, --description <desc>', 'Description')
    .option('--parent <parentId>', 'Parent component ID')
    .option('--deps <ids>', 'Comma-separated dependency IDs')
    .option('--json', 'Output raw JSON')
    .action(async (componentId, opts) => {
      const project = await resolveProject(opts.project)
      const data = {}
      if (opts.name) data.name = opts.name
      if (opts.type) data.type = opts.type
      if (opts.description) data.description = opts.description
      if (opts.parent) data.parentId = opts.parent
      if (opts.deps) data.dependencies = opts.deps.split(',').map((s) => s.trim())
      const result = await architecture.update(project, componentId, data)
      if (opts.json) return out.json(result)
      out.success(`Updated component: ${result.name}`)
    })

  cmd
    .command('delete <componentId>')
    .alias('rm')
    .description('Delete an architecture component')
    .option('--project <project>', 'Override default project')
    .action(async (componentId, opts) => {
      const project = await resolveProject(opts.project)
      await architecture.delete(project, componentId)
      out.success(`Deleted component ${componentId}`)
    })
}

function compType(t) {
  const colors = {
    service: chalk.blue,
    database: chalk.yellow,
    api: chalk.green,
    frontend: chalk.cyan,
    library: chalk.magenta,
    external: chalk.gray,
    queue: chalk.red,
    cache: chalk.yellow,
  }
  return (colors[t] || chalk.white)(t || '?')
}
