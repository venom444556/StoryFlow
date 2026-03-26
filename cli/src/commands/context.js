// ---------------------------------------------------------------------------
// storyflow context — agent context boot and operational summary
// ---------------------------------------------------------------------------

import { operational, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

export function register(program) {
  const cmd = program.command('context').description('Agent context and operational summary')

  cmd
    .command('boot [project]')
    .description('Boot agent context — single atomic snapshot of project state')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const ctx = await operational.context(project)
      if (opts.json) return out.json(ctx)

      // Formatted output for human/agent readability
      out.heading(`Context Boot — ${ctx.project.name}`)

      // Agent state
      const stateColor =
        ctx.agentState.status === 'working'
          ? chalk.green
          : ctx.agentState.status === 'blocked'
            ? chalk.red
            : chalk.gray
      console.log(
        `  Agent: ${stateColor(ctx.agentState.status)}${ctx.agentState.detail ? ` — ${ctx.agentState.detail}` : ''}`
      )

      // Board summary
      const { board } = ctx
      console.log(
        `  Board: ${board.issueCount} issues (${chalk.cyan(board.byStatus['In Progress'])} active, ${chalk.yellow(board.byStatus.Blocked)} blocked, ${chalk.green(board.byStatus.Done)} done)`
      )
      console.log(`  Points: ${board.donePoints}/${board.totalPoints}`)

      // Active sprint
      if (ctx.activeSprint) {
        console.log(`  Sprint: ${chalk.cyan(ctx.activeSprint.name)}`)
      }

      // Gates
      if (ctx.pendingGatesCount > 0) {
        console.log()
        console.log(chalk.yellow(`  ⚠ ${ctx.pendingGatesCount} pending gate(s):`))
        for (const g of ctx.pendingGates) {
          console.log(
            `    • ${g.entityTitle || g.entityType} — ${g.reasoning || 'no reason given'}`
          )
        }
      }

      // Directives
      if (ctx.directivesCount > 0) {
        console.log()
        console.log(chalk.cyan(`  📋 ${ctx.directivesCount} steering directive(s):`))
        for (const d of ctx.directives) {
          const pri =
            d.priority === 'critical'
              ? chalk.red(`[${d.priority}]`)
              : d.priority === 'high'
                ? chalk.yellow(`[${d.priority}]`)
                : chalk.gray(`[${d.priority}]`)
          console.log(`    ${pri} ${d.text}`)
        }
      }

      // Blockers
      if (ctx.activeBlockers.length > 0) {
        console.log()
        console.log(chalk.red(`  🚫 ${ctx.activeBlockers.length} blocked issue(s):`))
        for (const b of ctx.activeBlockers) {
          console.log(`    • ${b.key} ${b.title}`)
        }
      }

      // Stale issues
      if (ctx.staleIssues.length > 0) {
        console.log()
        console.log(chalk.yellow(`  ⏰ ${ctx.staleIssues.length} stale issue(s):`))
        for (const s of ctx.staleIssues) {
          console.log(`    • ${s.key} ${s.title}`)
        }
      }

      // Last session
      if (ctx.lastSession) {
        console.log()
        console.log(chalk.gray('  Last session:'))
        if (ctx.lastSession.summary) {
          console.log(
            `    ${ctx.lastSession.summary.substring(0, 120)}${ctx.lastSession.summary.length > 120 ? '...' : ''}`
          )
        }
        if (ctx.lastSession.nextSteps) {
          console.log(
            chalk.cyan(
              `  Next steps: ${ctx.lastSession.nextSteps.substring(0, 120)}${ctx.lastSession.nextSteps.length > 120 ? '...' : ''}`
            )
          )
        }
      }

      // Agent pages
      if (ctx.agentPages.length > 0) {
        console.log()
        console.log(chalk.gray(`  Agent wiki pages (${ctx.agentPages.length}):`))
        for (const p of ctx.agentPages) {
          console.log(`    [${p.id}] ${p.title}`)
        }
      }

      // Wiki audit
      if (ctx.wiki) {
        const missing = ctx.wiki.missingCorePages || []
        const stale = ctx.wiki.staleCorePages || []
        if (missing.length > 0 || stale.length > 0) {
          console.log()
          console.log(chalk.yellow(`  Wiki findings: ${ctx.wiki.findings}`))
          if (missing.length > 0) {
            console.log(
              chalk.red(`    Missing core pages: ${missing.map((p) => p.title).join(', ')}`)
            )
          }
          if (stale.length > 0) {
            console.log(
              chalk.yellow(
                `    Stale core pages: ${stale.map((p) => `${p.title} (${p.daysStale}d)`).join(', ')}`
              )
            )
          }
        }
      }

      // Hygiene
      if (ctx.hygiene && ctx.hygiene.findings > 0) {
        console.log()
        const h = ctx.hygiene
        const problems = []
        if (h.missingEstimates?.length)
          problems.push(`${h.missingEstimates.length} missing estimates`)
        if (h.orphanedStories?.length) problems.push(`${h.orphanedStories.length} orphaned stories`)
        if (h.stuckIssues?.length) problems.push(`${h.stuckIssues.length} stuck 7+ days`)
        if (h.completableSprints?.length)
          problems.push(`${h.completableSprints.length} completable sprint(s)`)
        if (problems.length) {
          console.log(chalk.yellow(`  Hygiene: ${problems.join(', ')}`))
        }
      }

      console.log()
    })
}
