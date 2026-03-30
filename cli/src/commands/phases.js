// ---------------------------------------------------------------------------
// storyflow phases — timeline phase management
// ---------------------------------------------------------------------------

import { phases, hotWashes, resolveProject } from '../client.js'
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
  // --- Hot Wash subcommands ---
  const hw = cmd.command('hot-wash').alias('hotwash').description('Phase hot wash reports')

  hw.command('generate <phaseRef>')
    .description('Generate a hot wash report for a phase')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (phaseRef, opts) => {
      const project = await resolveProject(opts.project)
      const result = await hotWashes.generate(project, phaseRef)
      if (opts.json) return out.json(result)
      out.success(`Generated hot wash for phase ${result.phaseId}`)
      console.log(`  Status: ${result.status}`)
      console.log(`  Summary: ${result.summary}`)
      console.log(
        `  Shipped: ${result.shipped.length} | Slipped: ${result.slipped.length} | Blockers: ${result.blockers.length}`
      )
      if (result.wikiPageId) console.log(`  Wiki page: ${result.wikiPageId}`)
    })

  hw.command('show <phaseRef>')
    .description('Show the hot wash report for a phase')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (phaseRef, opts) => {
      const project = await resolveProject(opts.project)
      const result = await hotWashes.get(project, phaseRef)
      if (opts.json) return out.json(result)

      const statusLabel =
        result.status === 'final' ? chalk.green('[FINAL]') : chalk.yellow('[DRAFT]')
      out.heading(`Phase Hot Wash ${statusLabel}`)
      console.log(`  Generated: ${result.generatedAt} by ${result.generatedBy}`)
      if (result.finalizedAt)
        console.log(`  Finalized: ${result.finalizedAt} by ${result.finalizedBy}`)
      console.log()
      console.log(chalk.bold('Summary:'))
      console.log(`  ${result.summary}`)
      console.log()

      if (result.shipped.length) {
        console.log(chalk.green(`Shipped (${result.shipped.length}):`))
        for (const s of result.shipped) console.log(`  ${s.key} ${s.title}`)
      }
      if (result.slipped.length) {
        console.log(chalk.yellow(`Slipped (${result.slipped.length}):`))
        for (const s of result.slipped) console.log(`  ${s.key} ${s.title} — ${s.status}`)
      }
      if (result.blockers.length) {
        console.log(chalk.red(`Blockers (${result.blockers.length}):`))
        for (const b of result.blockers)
          console.log(`  ${b.key} ${b.title}${b.resolvedAt ? ' (resolved)' : ''}`)
      }
      if (result.decisions.length) {
        console.log(chalk.cyan(`Decisions (${result.decisions.length}):`))
        for (const d of result.decisions) console.log(`  ${d.title} [${d.status}]`)
      }
      if (result.lessonsLearned.length) {
        console.log(chalk.magenta(`Lessons Learned (${result.lessonsLearned.length}):`))
        for (const l of result.lessonsLearned) console.log(`  ${l}`)
      }
      if (result.followUpActions.length) {
        console.log(`Follow-Up Actions (${result.followUpActions.length}):`)
        for (const a of result.followUpActions) console.log(`  [ ] ${a}`)
      }
    })

  hw.command('update <phaseRef>')
    .description('Update a draft hot wash report')
    .option('--project <project>', 'Override default project')
    .option('--summary <text>', 'Update summary')
    .option('--lessons <json>', 'Replace lessons learned (JSON array)')
    .option('--actions <json>', 'Replace follow-up actions (JSON array)')
    .option('--json', 'Output raw JSON')
    .action(async (phaseRef, opts) => {
      const project = await resolveProject(opts.project)
      const data = {}
      if (opts.summary) data.summary = opts.summary
      if (opts.lessons) data.lessonsLearned = JSON.parse(opts.lessons)
      if (opts.actions) data.followUpActions = JSON.parse(opts.actions)
      const result = await hotWashes.update(project, phaseRef, data)
      if (opts.json) return out.json(result)
      out.success('Hot wash updated')
    })

  hw.command('finalize <phaseRef>')
    .description('Lock a hot wash report as final')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (phaseRef, opts) => {
      const project = await resolveProject(opts.project)
      const result = await hotWashes.finalize(project, phaseRef)
      if (opts.json) return out.json(result)
      out.success('Hot wash finalized')
    })

  hw.command('delete <phaseRef>')
    .alias('rm')
    .description('Delete a draft hot wash report')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (phaseRef, opts) => {
      const project = await resolveProject(opts.project)
      const result = await hotWashes.delete(project, phaseRef)
      if (opts.json) return out.json(result)
      out.success(`Deleted hot wash for phase ${phaseRef}`)
    })

  hw.command('list [project]')
    .alias('ls')
    .description('List all hot wash reports for a project')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const list = await hotWashes.list(project)
      if (opts.json) return out.json(list)

      out.heading('Hot Washes')
      if (!list.length) {
        console.log(chalk.gray('  No hot wash reports yet.'))
        return
      }
      out.table(list, [
        { header: 'Phase', value: (r) => r.phaseName, maxWidth: 25 },
        {
          header: 'Status',
          value: (r) => (r.status === 'final' ? chalk.green(r.status) : chalk.yellow(r.status)),
          maxWidth: 8,
        },
        { header: 'Generated', value: (r) => r.generatedAt?.slice(0, 10) || '-', maxWidth: 12 },
        { header: 'Summary', value: (r) => (r.summary || '').slice(0, 40), maxWidth: 42 },
      ])
    })

  hw.command('lessons [project]')
    .description('Show the project-level lessons learned rollup')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const result = await hotWashes.lessons(project)
      if (opts.json) return out.json(result)

      out.heading(`Lessons Learned — ${project}`)
      console.log(
        chalk.gray(
          `  Reports: ${result.summary.reportsCount} | Final: ${result.summary.finalCount} | Draft: ${result.summary.draftCount} | Lessons: ${result.summary.lessonsCount} | Follow-up Actions: ${result.summary.followUpActionsCount}`
        )
      )
      if (result.summary.pageId) {
        console.log(
          chalk.gray(`  Wiki page: ${result.summary.pageTitle} (${result.summary.pageId})`)
        )
      }
      console.log()

      if (!result.reports.length) {
        console.log(chalk.gray('  No lessons learned captured yet.'))
        return
      }

      for (const report of result.reports) {
        const statusLabel =
          report.status === 'final' ? chalk.green('[FINAL]') : chalk.yellow('[DRAFT]')
        console.log(chalk.bold(`${report.phaseName} ${statusLabel}`))
        if (report.summary) console.log(`  ${report.summary}`)
        if (report.lessonsLearned.length) {
          console.log(chalk.magenta(`  Lessons (${report.lessonsLearned.length}):`))
          for (const lesson of report.lessonsLearned) console.log(`    - ${lesson}`)
        }
        if (report.followUpActions.length) {
          console.log(`  Follow-Up Actions (${report.followUpActions.length}):`)
          for (const action of report.followUpActions) {
            console.log(`    - ${action.key ? `${action.key} — ` : ''}${action.title}`)
          }
        }
        console.log()
      }
    })
}

function progressBar(pct) {
  const p = Math.round(pct || 0)
  const filled = Math.round(p / 10)
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled)
  return `${bar} ${p}%`
}
