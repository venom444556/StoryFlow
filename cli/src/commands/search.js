// ---------------------------------------------------------------------------
// storyflow search — cross-entity search
// storyflow resolve — fuzzy entity resolution
// ---------------------------------------------------------------------------

import { operational, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

export function register(program) {
  // --- Search ---
  program
    .command('search <query>')
    .description('Search across all entity types')
    .option('--project <project>', 'Target project')
    .option(
      '--type <types>',
      'Comma-separated entity types (issue,page,decision,workflow_node,component,phase,milestone)'
    )
    .option('--limit <n>', 'Max results', '20')
    .option('--json', 'Output raw JSON')
    .action(async (query, opts) => {
      const project = await resolveProject(opts.project)
      const result = await operational.search(project, query, {
        types: opts.type || undefined,
        limit: parseInt(opts.limit, 10),
      })
      if (opts.json) return out.json(result)

      out.heading(`Search: "${query}" (${result.total} results)`)
      if (result.results.length === 0) {
        console.log(chalk.gray('  No matches found.'))
        return
      }
      out.table(result.results, [
        { header: 'Type', value: (r) => r.type, maxWidth: 15 },
        { header: 'Key/ID', value: (r) => r.key || r.id.substring(0, 8), maxWidth: 12 },
        { header: 'Title', value: (r) => r.title, maxWidth: 45 },
        { header: 'Status', value: (r) => r.status || '-', maxWidth: 12 },
        {
          header: 'Score',
          value: (r) => {
            const pct = Math.round(r.score * 100)
            return pct >= 80
              ? chalk.green(`${pct}%`)
              : pct >= 50
                ? chalk.yellow(`${pct}%`)
                : chalk.gray(`${pct}%`)
          },
          maxWidth: 6,
        },
      ])
    })

  // --- Resolve ---
  program
    .command('resolve <type> <ref>')
    .description('Resolve a fuzzy reference to a canonical entity')
    .option('--project <project>', 'Target project')
    .option('--json', 'Output raw JSON')
    .action(async (type, ref, opts) => {
      const project = await resolveProject(opts.project)
      const result = await operational.resolve(project, type, ref)
      if (opts.json) return out.json(result)

      if (result.error) {
        out.error(result.error)
        return
      }

      if (result.resolved) {
        console.log(chalk.green('✓') + ` Resolved: ${result.type} ${result.key || result.id}`)
        console.log(`  Title: ${result.title}`)
        console.log(`  ID: ${result.id}`)
        console.log(`  Confidence: ${Math.round(result.confidence * 100)}%`)
      } else if (result.candidates && result.candidates.length > 0) {
        console.log(chalk.yellow('?') + ` Ambiguous — ${result.candidates.length} candidates:`)
        for (const c of result.candidates) {
          console.log(
            `  • ${c.key || c.id.substring(0, 8)} — ${c.title} (${Math.round(c.confidence * 100)}%)`
          )
        }
      } else {
        console.log(chalk.red('✗') + ` No match for "${ref}" as ${type}`)
      }
    })
}
