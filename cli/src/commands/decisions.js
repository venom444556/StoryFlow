// ---------------------------------------------------------------------------
// storyflow decisions — list, show, create, update, delete
// ---------------------------------------------------------------------------

import { decisions, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

const STATUS_MAP = {
  proposed: chalk.yellow('proposed'),
  accepted: chalk.green('accepted'),
  deprecated: chalk.gray('deprecated'),
  superseded: chalk.gray('superseded'),
}

export function register(program) {
  const cmd = program.command('decisions').alias('decision').description('Manage decisions (ADRs)')

  cmd
    .command('list [project]')
    .alias('ls')
    .description('List decisions')
    .option(
      '-s, --status <status>',
      'Filter by status (proposed, accepted, deprecated, superseded)'
    )
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      let list = await decisions.list(project)
      if (opts.status) {
        list = list.filter((d) => d.status === opts.status)
      }
      if (opts.json) return out.json(list)

      out.heading(`Decisions — ${project}`)
      out.table(list, [
        { header: 'ID', value: (r) => (r.id || '').slice(0, 8), maxWidth: 10 },
        { header: 'Title', value: (r) => r.title, maxWidth: 45 },
        { header: 'Status', value: (r) => STATUS_MAP[r.status] || r.status, maxWidth: 12 },
        { header: 'Updated', value: (r) => shortDate(r.updatedAt), maxWidth: 12 },
      ])
      console.log(chalk.gray(`\n  ${list.length} decisions`))
    })

  cmd
    .command('show <decisionId>')
    .alias('get')
    .description('Show decision details')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (decisionId, opts) => {
      const project = await resolveProject(opts.project)
      const list = await decisions.list(project)
      const d = list.find((x) => x.id === decisionId || x.id?.startsWith(decisionId))
      if (!d) throw new Error(`Decision "${decisionId}" not found`)
      if (opts.json) return out.json(d)

      out.heading(d.title)
      out.kv('ID', d.id)
      out.kv('Status', STATUS_MAP[d.status] || d.status)
      if (d.tags?.length) out.kv('Tags', d.tags.join(', '))
      if (d.context) {
        console.log()
        console.log(chalk.bold('Context'))
        console.log(d.context)
      }
      if (d.decision) {
        console.log()
        console.log(chalk.bold('Decision'))
        console.log(d.decision)
      }
      if (d.alternatives?.length) {
        console.log()
        console.log(chalk.bold('Alternatives'))
        for (const alt of d.alternatives) {
          console.log(`  - ${alt.title || alt}`)
          if (alt.pros) console.log(`    Pros: ${alt.pros}`)
          if (alt.cons) console.log(`    Cons: ${alt.cons}`)
        }
      }
      if (d.consequences) {
        console.log()
        console.log(chalk.bold('Consequences'))
        console.log(d.consequences)
      }
    })

  cmd
    .command('create [project]')
    .description('Create a decision')
    .requiredOption('--title <title>', 'Decision title')
    .option(
      '-s, --status <status>',
      'Status (proposed, accepted, deprecated, superseded)',
      'proposed'
    )
    .option('--context <text>', 'Context / problem statement')
    .option('--decision <text>', 'The decision made')
    .option('--consequences <text>', 'Consequences of the decision')
    .option('--tags <tags>', 'Comma-separated tags')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const data = { title: opts.title, status: opts.status }
      if (opts.context) data.context = opts.context
      if (opts.decision) data.decision = opts.decision
      if (opts.consequences) data.consequences = opts.consequences
      if (opts.tags) data.tags = opts.tags.split(',').map((t) => t.trim())
      const result = await decisions.create(project, data)
      if (opts.json) return out.json(result)
      out.success(`Created decision: ${result.title} (${result.id})`)
    })

  cmd
    .command('update <decisionId>')
    .description('Update a decision')
    .option('--project <project>', 'Override default project')
    .option('--title <title>', 'New title')
    .option('-s, --status <status>', 'New status')
    .option('--context <text>', 'New context')
    .option('--decision <text>', 'New decision text')
    .option('--consequences <text>', 'New consequences')
    .option('--tags <tags>', 'Comma-separated tags')
    .option('--json', 'Output raw JSON')
    .action(async (decisionId, opts) => {
      const project = await resolveProject(opts.project)
      const data = {}
      if (opts.title) data.title = opts.title
      if (opts.status) data.status = opts.status
      if (opts.context) data.context = opts.context
      if (opts.decision) data.decision = opts.decision
      if (opts.consequences) data.consequences = opts.consequences
      if (opts.tags) data.tags = opts.tags.split(',').map((t) => t.trim())
      const result = await decisions.update(project, decisionId, data)
      if (opts.json) return out.json(result)
      out.success(`Updated decision: ${result.title}`)
    })

  cmd
    .command('delete <decisionId>')
    .alias('rm')
    .description('Delete a decision')
    .option('--project <project>', 'Override default project')
    .action(async (decisionId, opts) => {
      const project = await resolveProject(opts.project)
      await decisions.delete(project, decisionId)
      out.success(`Deleted decision ${decisionId}`)
    })
}

function shortDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
