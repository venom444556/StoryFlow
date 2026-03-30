// ---------------------------------------------------------------------------
// storyflow milestones — timeline milestone management
// ---------------------------------------------------------------------------

import { milestones, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

export function register(program) {
  const cmd = program
    .command('milestones')
    .alias('milestone')
    .description('Manage timeline milestones')

  cmd
    .command('list [project]')
    .alias('ls')
    .description('List milestones')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const list = await milestones.list(project)
      if (opts.json) return out.json(list)

      out.heading(`Milestones — ${project}`)
      out.table(list, [
        { header: 'ID', value: (r) => (r.id || '').slice(0, 8), maxWidth: 10 },
        { header: 'Name', value: (r) => r.name, maxWidth: 35 },
        {
          header: 'Done',
          value: (r) => (r.completed ? chalk.green('✓') : chalk.gray('○')),
          maxWidth: 5,
        },
        { header: 'Date', value: (r) => r.date || chalk.gray('-'), maxWidth: 12 },
      ])
      console.log(chalk.gray(`\n  ${list.length} milestones`))
    })

  cmd
    .command('create [project]')
    .description('Create a milestone')
    .requiredOption('-n, --name <name>', 'Milestone name')
    .option('--date <date>', 'Target date (YYYY-MM-DD)')
    .option('--completed', 'Mark as completed')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const data = { name: opts.name, completed: !!opts.completed }
      if (opts.date) data.date = opts.date
      const result = await milestones.create(project, data)
      if (opts.json) return out.json(result)
      out.success(`Created milestone: ${result.name} (${result.id})`)
    })

  cmd
    .command('update <milestoneId>')
    .description('Update a milestone')
    .option('--project <project>', 'Override default project')
    .option('-n, --name <name>', 'Milestone name')
    .option('--date <date>', 'Target date')
    .option('--completed <bool>', 'Completed (true/false)')
    .option('--json', 'Output raw JSON')
    .action(async (milestoneId, opts) => {
      const project = await resolveProject(opts.project)
      const data = {}
      if (opts.name) data.name = opts.name
      if (opts.date) data.date = opts.date
      if (opts.completed !== undefined) data.completed = opts.completed === 'true'
      const result = await milestones.update(project, milestoneId, data)
      if (opts.json) return out.json(result)
      out.success(`Updated milestone: ${result.name}`)
    })

  cmd
    .command('toggle <milestoneId>')
    .description('Toggle milestone completion')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (milestoneId, opts) => {
      const project = await resolveProject(opts.project)
      const list = await milestones.list(project)
      const m = list.find((x) => x.id === milestoneId || x.id?.startsWith(milestoneId))
      if (!m) throw new Error(`Milestone "${milestoneId}" not found`)
      const result = await milestones.update(project, m.id, { completed: !m.completed })
      if (opts.json) return out.json(result)
      out.success(`${result.name}: ${result.completed ? 'completed' : 'not completed'}`)
    })

  cmd
    .command('delete <milestoneId>')
    .alias('rm')
    .description('Delete a milestone')
    .option('--project <project>', 'Override default project')
    .action(async (milestoneId, opts) => {
      const project = await resolveProject(opts.project)
      await milestones.delete(project, milestoneId)
      out.success(`Deleted milestone ${milestoneId}`)
    })
}
