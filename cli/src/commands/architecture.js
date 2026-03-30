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
    .option('--x <n>', 'X position on canvas')
    .option('--y <n>', 'Y position on canvas')
    .option('--tech <tech>', 'Technology stack')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const data = { name: opts.name, type: opts.type }
      if (opts.description) data.description = opts.description
      if (opts.parent) data.parentId = opts.parent
      if (opts.x) data.x = parseFloat(opts.x)
      if (opts.y) data.y = parseFloat(opts.y)
      if (opts.tech) data.tech = opts.tech
      const deps = opts.deps ? opts.deps.split(',').map((s) => s.trim()) : []
      const result = await architecture.create(project, data)
      if (opts.json && !deps.length) return out.json(result)
      // Wire --deps to real architecture connections
      if (deps.length) {
        for (const depId of deps) {
          await architecture.connections
            .create(project, { fromComponentId: result.id, toComponentId: depId })
            .catch(() => {})
        }
      }
      if (opts.json) return out.json(result)
      out.success(
        `Created component: ${result.name} (${result.id})${deps.length ? ` with ${deps.length} dep(s)` : ''}`
      )
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
    .option('--x <n>', 'X position on canvas')
    .option('--y <n>', 'Y position on canvas')
    .option('--tech <tech>', 'Technology stack')
    .option('--json', 'Output raw JSON')
    .action(async (componentId, opts) => {
      const project = await resolveProject(opts.project)
      const data = {}
      if (opts.name) data.name = opts.name
      if (opts.type) data.type = opts.type
      if (opts.description) data.description = opts.description
      if (opts.parent) data.parentId = opts.parent
      if (opts.x) data.x = parseFloat(opts.x)
      if (opts.y) data.y = parseFloat(opts.y)
      if (opts.tech) data.tech = opts.tech
      const deps = opts.deps ? opts.deps.split(',').map((s) => s.trim()) : null
      const result = await architecture.update(project, componentId, data)
      // Wire --deps to real architecture connections (replace existing)
      if (deps) {
        // Delete old outbound connections, create new ones
        const existingConns = await architecture.connections.list(project)
        for (const c of existingConns.filter(
          (c) => (c.fromComponentId || c.from) === componentId
        )) {
          await architecture.connections.delete(project, c.id).catch(() => {})
        }
        for (const depId of deps) {
          await architecture.connections
            .create(project, { fromComponentId: componentId, toComponentId: depId })
            .catch(() => {})
        }
      }
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

  registerConnections(cmd)
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

export function registerConnections(cmd) {
  const conn = cmd
    .command('connections')
    .alias('conn')
    .description('Manage architecture dependency edges')

  conn
    .command('list [project]')
    .alias('ls')
    .description('List architecture connections')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const list = await architecture.connections.list(project)
      if (opts.json) return out.json(list)
      out.heading('Architecture Connections')
      if (!list.length) return console.log(chalk.gray('  No connections.'))
      out.table(list, [
        { header: 'ID', value: (r) => r.id.slice(0, 8), maxWidth: 10 },
        {
          header: 'From',
          value: (r) => (r.fromComponentId || r.from || '').slice(0, 8),
          maxWidth: 10,
        },
        { header: 'To', value: (r) => (r.toComponentId || r.to || '').slice(0, 8), maxWidth: 10 },
        { header: 'Type', value: (r) => r.type || '-', maxWidth: 12 },
      ])
    })

  conn
    .command('create')
    .description('Create an architecture connection')
    .requiredOption('--from <componentId>', 'Source component ID')
    .requiredOption('--to <componentId>', 'Target component ID')
    .option('--type <type>', 'Connection type')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const project = await resolveProject(opts.project)
      const result = await architecture.connections.create(project, {
        fromComponentId: opts.from,
        toComponentId: opts.to,
        type: opts.type,
      })
      if (opts.json) return out.json(result)
      out.success(`Created connection ${result.id.slice(0, 8)}`)
    })

  conn
    .command('delete <connectionId>')
    .alias('rm')
    .description('Delete an architecture connection')
    .option('--project <project>', 'Override default project')
    .action(async (connectionId, opts) => {
      const project = await resolveProject(opts.project)
      await architecture.connections.delete(project, connectionId)
      out.success(`Deleted connection ${connectionId.slice(0, 8)}`)
    })
}
