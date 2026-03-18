// ---------------------------------------------------------------------------
// storyflow migrate — migration management commands
// ---------------------------------------------------------------------------

import { migrate } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

const MODE_LABELS = {
  shadow_write: chalk.yellow('shadow_write') + chalk.gray(' (writes to both blob + SQL)'),
  read_normalized: chalk.cyan('read_normalized') + chalk.gray(' (reads from SQL, writes to both)'),
  normalized: chalk.green('normalized') + chalk.gray(' (SQL only, blob deprecated)'),
}

function formatMode(mode) {
  return MODE_LABELS[mode] || mode
}

export function register(program) {
  const cmd = program.command('migrate').description('SQL migration management')

  cmd
    .command('status')
    .description('Show current migration mode')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const result = await migrate.status()
      if (opts.json) return out.json(result)

      out.heading('Migration Status')
      out.kv('Mode', formatMode(result.mode))
    })

  cmd
    .command('verify')
    .description('Verify blob vs SQL consistency for all projects')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const results = await migrate.verify()
      if (opts.json) return out.json(results)

      out.heading('Migration Verification')

      if (results.length === 0) {
        console.log(chalk.gray('  No projects to verify'))
        return
      }

      let totalPass = 0
      let totalFail = 0

      for (const r of results) {
        const icon = r.status === 'pass' ? chalk.green('PASS') : chalk.red('FAIL')
        const discCount = r.discrepancies.length
        console.log(
          `  ${icon}  ${r.projectName} ${chalk.gray('(' + r.projectId.slice(0, 8) + ')')}`
        )

        // Show entity counts
        const counts = Object.entries(r.entityCounts)
          .filter(([, v]) => v.blob > 0 || v.sql > 0)
          .map(([name, v]) => {
            const match =
              v.blob === v.sql ? chalk.green(`${v.blob}`) : chalk.red(`${v.blob}/${v.sql}`)
            return `${name}: ${match}`
          })
          .join(', ')
        if (counts) console.log(chalk.gray(`       ${counts}`))

        if (discCount > 0) {
          console.log(chalk.red(`       ${discCount} discrepancies:`))
          // Show up to 10 discrepancies per project
          const shown = r.discrepancies.slice(0, 10)
          for (const d of shown) {
            if (d.type === 'field_mismatch') {
              console.log(
                chalk.gray(`         ${d.entity}.${d.field}: `) +
                  chalk.yellow(`blob=${JSON.stringify(d.blob)}`) +
                  chalk.gray(' vs ') +
                  chalk.cyan(`sql=${JSON.stringify(d.sql)}`)
              )
            } else {
              console.log(
                chalk.gray(`         ${d.type}: ${d.entity} ${d.id?.slice(0, 8) || '?'}`) +
                  (d.detail ? chalk.gray(` (${d.detail})`) : '')
              )
            }
          }
          if (r.discrepancies.length > 10) {
            console.log(chalk.gray(`         ... and ${r.discrepancies.length - 10} more`))
          }
          totalFail++
        } else {
          totalPass++
        }
      }

      console.log()
      console.log(
        `  ${chalk.green(totalPass + ' pass')}, ${totalFail > 0 ? chalk.red(totalFail + ' fail') : chalk.green(totalFail + ' fail')} out of ${results.length} projects`
      )
    })

  cmd
    .command('advance')
    .description('Advance migration mode to the next phase')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const result = await migrate.advance()
      if (opts.json) return out.json(result)

      out.success('Migration mode advanced')
      out.kv('Previous', formatMode(result.previous))
      out.kv('Current', formatMode(result.mode))
    })

  cmd
    .command('rollback')
    .description('Roll back migration mode to the previous phase')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const result = await migrate.rollback()
      if (opts.json) return out.json(result)

      out.success('Migration mode rolled back')
      out.kv('Previous', formatMode(result.previous))
      out.kv('Current', formatMode(result.mode))
    })
}
