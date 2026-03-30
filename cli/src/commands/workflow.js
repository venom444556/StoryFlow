// ---------------------------------------------------------------------------
// storyflow workflow — workflow node management
// ---------------------------------------------------------------------------

import { workflow, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

const NODE_TYPES = ['start', 'end', 'task', 'decision', 'parallel', 'merge', 'milestone', 'group']

export function register(program) {
  const cmd = program.command('workflow').alias('wf').description('Manage workflow nodes')

  cmd
    .command('list [project]')
    .alias('ls')
    .description('List workflow nodes')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const list = await workflow.list(project)
      if (opts.json) return out.json(list)

      out.heading(`Workflow Nodes — ${project}`)
      out.table(list, [
        { header: 'ID', value: (r) => (r.id || '').slice(0, 8), maxWidth: 10 },
        { header: 'Type', value: (r) => nodeType(r.type), maxWidth: 10 },
        { header: 'Title', value: (r) => r.title || chalk.gray('(untitled)'), maxWidth: 35 },
        { header: 'Status', value: (r) => out.status(r.status || 'idle'), maxWidth: 10 },
        {
          header: 'Issues',
          value: (r) => (r.linkedIssues?.length ? String(r.linkedIssues.length) : chalk.gray('-')),
          maxWidth: 7,
        },
      ])
      console.log(chalk.gray(`\n  ${list.length} nodes`))
    })

  cmd
    .command('show <nodeId>')
    .alias('get')
    .description('Show workflow node details')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (nodeId, opts) => {
      const project = await resolveProject(opts.project)
      const node = await workflow.get(project, nodeId)
      if (opts.json) return out.json(node)

      out.heading(node.title || `Node ${node.id}`)
      out.kv('ID', node.id)
      out.kv('Type', node.type)
      out.kv('Status', out.status(node.status || 'idle'))
      if (node.description) out.kv('Description', node.description)
      if (node.linkedIssues?.length) {
        out.kv('Linked Issues', node.linkedIssues.join(', '))
      }
      if (node.config) {
        console.log()
        console.log(chalk.bold('Config'))
        console.log(JSON.stringify(node.config, null, 2))
      }
    })

  cmd
    .command('create [project]')
    .description('Create a workflow node')
    .requiredOption('--title <title>', 'Node title')
    .requiredOption('-t, --type <type>', `Node type: ${NODE_TYPES.join(', ')}`)
    .option('-s, --status <status>', 'Status (idle, running, success, error)', 'idle')
    .option('-d, --description <desc>', 'Node description')
    .option('--x <n>', 'X position on canvas')
    .option('--y <n>', 'Y position on canvas')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const data = { title: opts.title, type: opts.type, status: opts.status }
      if (opts.description) data.description = opts.description
      if (opts.x) data.x = parseInt(opts.x, 10)
      if (opts.y) data.y = parseInt(opts.y, 10)
      const result = await workflow.create(project, data)
      if (opts.json) return out.json(result)
      out.success(`Created node: ${result.title} (${result.id})`)
    })

  cmd
    .command('update <nodeId>')
    .description('Update a workflow node')
    .option('--project <project>', 'Override default project')
    .option('--title <title>', 'Node title')
    .option('-t, --type <type>', 'Node type')
    .option('-s, --status <status>', 'Status')
    .option('-d, --description <desc>', 'Description')
    .option('--x <n>', 'X position on canvas')
    .option('--y <n>', 'Y position on canvas')
    .option('--json', 'Output raw JSON')
    .action(async (nodeId, opts) => {
      const project = await resolveProject(opts.project)
      const data = {}
      if (opts.title) data.title = opts.title
      if (opts.type) data.type = opts.type
      if (opts.status) data.status = opts.status
      if (opts.description) data.description = opts.description
      if (opts.x) data.x = parseFloat(opts.x)
      if (opts.y) data.y = parseFloat(opts.y)
      const result = await workflow.update(project, nodeId, data)
      if (opts.json) return out.json(result)
      out.success(`Updated node: ${result.title}`)
    })

  cmd
    .command('delete <nodeId>')
    .alias('rm')
    .description('Delete a workflow node')
    .option('--project <project>', 'Override default project')
    .action(async (nodeId, opts) => {
      const project = await resolveProject(opts.project)
      await workflow.delete(project, nodeId)
      out.success(`Deleted node ${nodeId}`)
    })

  cmd
    .command('link <nodeId> <issueKey>')
    .description('Link an issue to a workflow node')
    .option('--project <project>', 'Override default project')
    .action(async (nodeId, issueKey, opts) => {
      const project = await resolveProject(opts.project)
      await workflow.link(project, nodeId, issueKey)
      out.success(`Linked ${issueKey} to node ${nodeId}`)
    })

  cmd
    .command('unlink <nodeId> <issueKey>')
    .description('Unlink an issue from a workflow node')
    .option('--project <project>', 'Override default project')
    .action(async (nodeId, issueKey, opts) => {
      const project = await resolveProject(opts.project)
      await workflow.unlink(project, nodeId, issueKey)
      out.success(`Unlinked ${issueKey} from node ${nodeId}`)
    })

  registerConnections(cmd)
}

function nodeType(t) {
  const colors = {
    start: chalk.green,
    end: chalk.red,
    task: chalk.blue,
    decision: chalk.yellow,
    parallel: chalk.cyan,
    merge: chalk.cyan,
    milestone: chalk.magenta,
    group: chalk.gray,
  }
  return (colors[t] || chalk.white)(t || '?')
}

// --- Connection subcommands ---
export function registerConnections(cmd) {
  const conn = cmd.command('connections').alias('conn').description('Manage workflow edges')

  conn
    .command('list [project]')
    .alias('ls')
    .description('List workflow connections')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const list = await workflow.connections.list(project)
      if (opts.json) return out.json(list)
      out.heading('Workflow Connections')
      if (!list.length) return console.log(chalk.gray('  No connections.'))
      out.table(list, [
        { header: 'ID', value: (r) => r.id.slice(0, 8), maxWidth: 10 },
        {
          header: 'From',
          value: (r) => r.fromNodeId?.slice(0, 8) || r.from?.slice(0, 8),
          maxWidth: 10,
        },
        { header: 'To', value: (r) => r.toNodeId?.slice(0, 8) || r.to?.slice(0, 8), maxWidth: 10 },
        { header: 'Type', value: (r) => r.type || '-', maxWidth: 12 },
      ])
    })

  conn
    .command('create')
    .description('Create a workflow connection')
    .requiredOption('--from <nodeId>', 'Source node ID')
    .requiredOption('--to <nodeId>', 'Target node ID')
    .option('--type <type>', 'Connection type')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const project = await resolveProject(opts.project)
      const result = await workflow.connections.create(project, {
        fromNodeId: opts.from,
        toNodeId: opts.to,
        type: opts.type,
      })
      if (opts.json) return out.json(result)
      out.success(`Created connection ${result.id.slice(0, 8)}`)
    })

  conn
    .command('delete <connectionId>')
    .alias('rm')
    .description('Delete a workflow connection')
    .option('--project <project>', 'Override default project')
    .action(async (connectionId, opts) => {
      const project = await resolveProject(opts.project)
      await workflow.connections.delete(project, connectionId)
      out.success(`Deleted connection ${connectionId.slice(0, 8)}`)
    })
}
