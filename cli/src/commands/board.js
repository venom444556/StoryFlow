// ---------------------------------------------------------------------------
// storyflow board — board summary and hygiene
// ---------------------------------------------------------------------------

import { board, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

export function register(program) {
  program
    .command('board [project]')
    .description('Show board summary with issue counts by status')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const summary = await board.summary(project)
      if (opts.json) return out.json(summary)

      out.heading(`${summary.projectName || project} — Board`)

      // Status breakdown
      const statuses = ['To Do', 'In Progress', 'Blocked', 'Done']
      const total = summary.issueCount || 0
      console.log()
      for (const s of statuses) {
        const count = summary.byStatus?.[s] || 0
        const bar = barChart(count, total)
        console.log(`  ${out.status(s).padEnd(22)} ${bar} ${count}`)
      }
      console.log(chalk.gray(`  ${'─'.repeat(40)}`))
      console.log(`  ${chalk.bold('Total'.padEnd(14))}${' '.repeat(8)} ${total}`)

      // Points progress
      if (summary.totalPoints) {
        const pct = Math.round((summary.donePoints / summary.totalPoints) * 100)
        console.log(
          `  ${chalk.bold('Points'.padEnd(14))}${' '.repeat(8)} ${summary.donePoints}/${summary.totalPoints} (${pct}%)`
        )
      }

      // Active sprint
      if (summary.activeSprint) {
        console.log()
        console.log(chalk.bold('  Active Sprint:'))
        out.kv('  Name', summary.activeSprint.name)
        if (summary.activeSprint.goal) out.kv('  Goal', summary.activeSprint.goal)
      }

      // Type breakdown
      if (summary.byType) {
        console.log()
        console.log(chalk.bold('  By Type:'))
        for (const [type, count] of Object.entries(summary.byType)) {
          console.log(`    ${out.typeIcon(type)} ${type.padEnd(10)} ${count}`)
        }
      }

      // Priority breakdown
      if (summary.byPriority) {
        console.log()
        console.log(chalk.bold('  By Priority:'))
        for (const [pri, count] of Object.entries(summary.byPriority)) {
          console.log(`    ${out.priority(pri).toString().padEnd(18)} ${count}`)
        }
      }
    })

  program
    .command('hygiene [project]')
    .description('Run board hygiene analysis')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const result = await board.hygiene(project)
      if (opts.json) return out.json(result)

      out.heading(`Board Hygiene — ${project}`)

      const sections = [
        { key: 'duplicates', label: 'Possible Duplicates', icon: chalk.yellow('!') },
        { key: 'stale', label: 'Stale Issues', icon: chalk.red('!') },
        { key: 'orphans', label: 'Orphaned Issues', icon: chalk.gray('?') },
        { key: 'missingEstimates', label: 'Missing Estimates', icon: chalk.yellow('-') },
      ]

      let clean = true
      for (const { key, label, icon } of sections) {
        const items = result[key] || []
        if (items.length) {
          clean = false
          console.log(`\n  ${icon} ${chalk.bold(label)} (${items.length}):`)
          for (const item of items.slice(0, 10)) {
            const title = item.title || item.key || item.id || JSON.stringify(item)
            console.log(`    ${chalk.gray('•')} ${title}`)
          }
          if (items.length > 10) {
            console.log(chalk.gray(`    ... and ${items.length - 10} more`))
          }
        }
      }

      if (clean) {
        out.success('Board is clean — no issues found')
      }
    })
}

function barChart(count, total) {
  if (!total) return ''
  const width = 20
  const filled = Math.round((count / total) * width)
  return chalk.cyan('█'.repeat(filled)) + chalk.gray('░'.repeat(width - filled))
}
