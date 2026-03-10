// ---------------------------------------------------------------------------
// storyflow events — event stream, steering, AI status
// ---------------------------------------------------------------------------

import { events, ai, safety, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

export function register(program) {
  // --- Events ---
  const evtCmd = program.command('events').alias('event').description('Query the event stream')

  evtCmd
    .command('list [project]')
    .alias('ls')
    .description('List recent events')
    .option('--category <cat>', 'Filter by category')
    .option('--actor <actor>', 'Filter by actor (ai, human, system)')
    .option('--limit <n>', 'Limit results', '20')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const filters = {}
      if (opts.category) filters.category = opts.category
      if (opts.actor) filters.actor = opts.actor
      if (opts.limit) filters.limit = opts.limit

      const list = await events.query(project, filters)
      if (opts.json) return out.json(list)

      out.heading(`Events — ${project}`)
      out.table(list, [
        { header: 'Time', value: (r) => shortTime(r.timestamp), maxWidth: 18 },
        { header: 'Actor', value: (r) => actorColor(r.actor), maxWidth: 8 },
        { header: 'Action', value: (r) => r.action, maxWidth: 14 },
        { header: 'Entity', value: (r) => r.entity_title || r.entity_type || '', maxWidth: 35 },
        {
          header: 'Status',
          value: (r) => (r.status ? out.status(r.status) : chalk.gray('-')),
          maxWidth: 10,
        },
      ])
    })

  // --- Steer ---
  program
    .command('steer <message>')
    .description('Send a steering directive to the AI agent')
    .option('--project <project>', 'Override default project')
    .option('-p, --priority <priority>', 'Priority (normal, high, critical)', 'normal')
    .action(async (message, opts) => {
      const project = await resolveProject(opts.project)
      await ai.steer(project, message, opts.priority)
      out.success(`Directive sent (${opts.priority}): ${message}`)
    })

  // --- AI Status ---
  program
    .command('ai-status [project]')
    .description('Check AI agent status')
    .action(async (project) => {
      project = await resolveProject(project)
      const status = await ai.getStatus(project)
      out.heading('AI Agent Status')
      out.kv('Status', out.status(status.status || 'idle'))
      out.kv('Detail', status.detail || chalk.gray('none'))
      out.kv('Updated', status.updatedAt || chalk.gray('never'))

      // Also show pending directives
      const directives = await ai.getDirectives(project)
      if (directives.length) {
        console.log()
        out.heading('Pending Directives')
        for (const d of directives) {
          const pri =
            d.priority === 'critical'
              ? chalk.red('!!!')
              : d.priority === 'high'
                ? chalk.yellow('!!')
                : chalk.gray('!')
          console.log(`  ${pri} ${d.text} ${chalk.gray(`(${shortTime(d.created_at)})`)}`)
        }
      }
    })

  // --- Gates ---
  program
    .command('gates [project]')
    .description('Check pending approval gates')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const result = await safety.gates(project)
      if (opts.json) return out.json(result)

      out.heading(`Approval Gates — ${project}`)
      const pending = result.pending || []
      const rejected = result.rejected || []

      if (!pending.length && !rejected.length) {
        out.info('No pending or rejected gates')
        return
      }

      if (pending.length) {
        console.log(chalk.yellow(`\n  ${pending.length} pending:`))
        for (const g of pending) {
          console.log(`    ${g.entity_title || g.entity_type} — ${g.reasoning || 'no reason'}`)
        }
      }
      if (rejected.length) {
        console.log(chalk.red(`\n  ${rejected.length} rejected:`))
        for (const g of rejected) {
          console.log(`    ${g.entity_title || g.entity_type} — ${g.reasoning || 'no reason'}`)
        }
      }
    })

  // --- Snapshots ---
  program
    .command('snapshots [project]')
    .description('List undo snapshots')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const list = await safety.snapshots(project)
      if (opts.json) return out.json(list)

      out.heading(`Snapshots — ${project}`)
      out.table(list, [
        { header: 'ID', value: (r) => r.id?.slice(0, 8), maxWidth: 10 },
        { header: 'Trigger', value: (r) => r.trigger_action, maxWidth: 20 },
        { header: 'Entity', value: (r) => r.trigger_entity, maxWidth: 30 },
        { header: 'Actor', value: (r) => actorColor(r.trigger_actor), maxWidth: 8 },
        { header: 'Time', value: (r) => shortTime(r.created_at), maxWidth: 18 },
      ])
    })
}

function actorColor(actor) {
  if (actor === 'ai') return chalk.cyan(actor)
  if (actor === 'human') return chalk.green(actor)
  return chalk.gray(actor || '?')
}

function shortTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
