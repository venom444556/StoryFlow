// ---------------------------------------------------------------------------
// storyflow phases — timeline phase management
// ---------------------------------------------------------------------------

import { phases, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

export function register(program) {
  const cmd = program.command('phases').alias('phase').description('Manage timeline phases')

  cmd
    .command('list [project]')
    .alias('ls')
    .description('List phases')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const list = await phases.list(project)
      if (opts.json) return out.json(list)

      out.heading(`Phases — ${project}`)
      out.table(list, [
        { header: 'ID', value: (r) => (r.id || '').slice(0, 8), maxWidth: 10 },
        { header: 'Name', value: (r) => r.name, maxWidth: 30 },
        { header: 'Progress', value: (r) => progressBar(r.progress), maxWidth: 14 },
        { header: 'Start', value: (r) => r.startDate || chalk.gray('-'), maxWidth: 12 },
        { header: 'End', value: (r) => r.endDate || chalk.gray('-'), maxWidth: 12 },
      ])
      console.log(chalk.gray(`\n  ${list.length} phases`))
    })

  cmd
    .command('create [project]')
    .description('Create a phase')
    .requiredOption('-n, --name <name>', 'Phase name')
    .option('-d, --description <desc>', 'Phase description')
    .option('--start <date>', 'Start date (YYYY-MM-DD)')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .option('--progress <n>', 'Progress percentage (0-100)', '0')
    .option('--deliverables <items>', 'Comma-separated deliverables')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const data = { name: opts.name, progress: parseInt(opts.progress, 10) }
      if (opts.description) data.description = opts.description
      if (opts.start) data.startDate = opts.start
      if (opts.end) data.endDate = opts.end
      if (opts.deliverables) data.deliverables = opts.deliverables.split(',').map((s) => s.trim())
      const result = await phases.create(project, data)
      if (opts.json) return out.json(result)
      out.success(`Created phase: ${result.name} (${result.id})`)
    })

  cmd
    .command('update <phaseId>')
    .description('Update a phase')
    .option('--project <project>', 'Override default project')
    .option('-n, --name <name>', 'Phase name')
    .option('-d, --description <desc>', 'Description')
    .option('--start <date>', 'Start date')
    .option('--end <date>', 'End date')
    .option('--progress <n>', 'Progress percentage (0-100)')
    .option('--deliverables <items>', 'Comma-separated deliverables')
    .option('--json', 'Output raw JSON')
    .action(async (phaseId, opts) => {
      const project = await resolveProject(opts.project)
      const data = {}
      if (opts.name) data.name = opts.name
      if (opts.description) data.description = opts.description
      if (opts.start) data.startDate = opts.start
      if (opts.end) data.endDate = opts.end
      if (opts.progress) data.progress = parseInt(opts.progress, 10)
      if (opts.deliverables) data.deliverables = opts.deliverables.split(',').map((s) => s.trim())
      const result = await phases.update(project, phaseId, data)
      if (opts.json) return out.json(result)
      out.success(`Updated phase: ${result.name}`)
    })

  cmd
    .command('delete <phaseId>')
    .alias('rm')
    .description('Delete a phase')
    .option('--project <project>', 'Override default project')
    .action(async (phaseId, opts) => {
      const project = await resolveProject(opts.project)
      await phases.delete(project, phaseId)
      out.success(`Deleted phase ${phaseId}`)
    })
}

function progressBar(pct) {
  const p = Math.round(pct || 0)
  const filled = Math.round(p / 10)
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled)
  return `${bar} ${p}%`
}
