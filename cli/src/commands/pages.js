// ---------------------------------------------------------------------------
// storyflow pages — wiki page management
// ---------------------------------------------------------------------------

import { pages, resolveProject } from '../client.js'
import { PAGE_TEMPLATES } from '../templates.js'
import * as out from '../output.js'
import chalk from 'chalk'
import { CORE_WIKI_PAGES, buildCoreWikiPageContent } from '../../../shared/wikiCorePages.js'

export function register(program) {
  const cmd = program.command('pages').alias('page').alias('wiki').description('Manage wiki pages')

  cmd
    .command('list [project]')
    .alias('ls')
    .description('List wiki pages')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const list = await pages.list(project)
      if (opts.json) return out.json(list)

      out.heading(`Pages — ${project}`)
      out.table(list, [
        { header: 'Title', value: (r) => r.title, maxWidth: 40 },
        { header: 'ID', value: (r) => r.id, maxWidth: 36 },
        { header: 'Updated', value: (r) => shortDate(r.updatedAt), maxWidth: 12 },
      ])
    })

  cmd
    .command('show <pageId>')
    .alias('get')
    .description('Show a wiki page')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (pageId, opts) => {
      const project = await resolveProject(opts.project)
      const page = await pages.get(project, pageId)
      if (opts.json) return out.json(page)

      out.heading(page.title)
      out.kv('ID', page.id)
      out.kv('Updated', page.updatedAt)
      console.log()
      console.log(page.content || chalk.gray('(empty)'))
    })

  cmd
    .command('create [project]')
    .description('Create a wiki page')
    .requiredOption('--title <title>', 'Page title')
    .option('-c, --content <content>', 'Page content')
    .option(
      '-t, --template <id>',
      'Template: blank, meeting-notes, technical-spec, requirements-doc, api-documentation, retrospective, adr'
    )
    .option('--icon <emoji>', 'Page icon (emoji)')
    .option('--parent <pageId>', 'Parent page ID')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      let content = opts.content || ''
      let icon = opts.icon
      if (opts.template) {
        const tmpl = PAGE_TEMPLATES.find((t) => t.id === opts.template)
        if (!tmpl) {
          const ids = PAGE_TEMPLATES.map((t) => t.id).join(', ')
          throw new Error(`Unknown template "${opts.template}". Available: ${ids}`)
        }
        if (!content) content = tmpl.content
        if (!icon) icon = tmpl.icon
      }
      const data = { title: opts.title, content }
      if (icon) data.icon = icon
      if (opts.parent) data.parent_id = opts.parent
      const result = await pages.create(project, data)
      if (opts.json) return out.json(result)
      out.success(`Created page: ${result.title} (${result.id})`)
    })

  cmd
    .command('update <pageId>')
    .description('Update a wiki page')
    .option('--project <project>', 'Override default project')
    .option('--title <title>', 'New title')
    .option('-c, --content <content>', 'New content')
    .option('--icon <emoji>', 'Update icon')
    .option('--json', 'Output raw JSON')
    .action(async (pageId, opts) => {
      const project = await resolveProject(opts.project)
      const data = {}
      if (opts.title) data.title = opts.title
      if (opts.content) data.content = opts.content
      if (opts.icon !== undefined) data.icon = opts.icon
      const result = await pages.update(project, pageId, data)
      if (opts.json) return out.json(result)
      out.success(`Updated page: ${result.title}`)
    })

  cmd
    .command('audit [project]')
    .description('Audit wiki freshness and required core pages')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const audit = await pages.audit(project)
      if (opts.json) return out.json(audit)

      out.heading(`Wiki Audit — ${project}`)
      console.log(
        `  Findings: ${audit.findings} (threshold: ${audit.staleThresholdDays} day${audit.staleThresholdDays === 1 ? '' : 's'})`
      )

      if (audit.missingCorePages?.length) {
        console.log()
        console.log(chalk.red(`  Missing core pages (${audit.missingCorePages.length}):`))
        for (const page of audit.missingCorePages) {
          console.log(`    • ${page.title}`)
        }
      }

      if (audit.staleCorePages?.length) {
        console.log()
        console.log(chalk.yellow(`  Stale core pages (${audit.staleCorePages.length}):`))
        for (const page of audit.staleCorePages) {
          console.log(`    • ${page.title} — ${page.daysStale} day(s) stale`)
        }
      }

      if (!audit.findings) {
        console.log(chalk.green('  Wiki backbone is current.'))
      }
    })

  cmd
    .command('ensure-core [project]')
    .description('Create any missing required core wiki pages')
    .option('--json', 'Output raw JSON')
    .option('--dry-run', 'Show what would be created without writing')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const audit = await pages.audit(project)
      const missing = audit.missingCorePages || []
      const created = []

      if (!opts.dryRun) {
        for (const page of missing) {
          const def = CORE_WIKI_PAGES.find((candidate) => candidate.slug === page.slug)
          if (!def) continue
          const result = await pages.create(project, {
            title: def.title,
            icon: def.icon,
            content: buildCoreWikiPageContent(def),
            status: 'draft',
          })
          created.push({ id: result.id, title: result.title, slug: def.slug })
        }
      }

      if (opts.json) {
        return out.json({
          project,
          dryRun: Boolean(opts.dryRun),
          missing,
          created,
        })
      }

      if (opts.dryRun) {
        out.heading(`Ensure Core Wiki Pages — ${project}`)
        if (missing.length === 0) {
          console.log(chalk.green('  No missing core pages.'))
          return
        }
        console.log(chalk.yellow(`  Would create ${missing.length} page(s):`))
        for (const page of missing) {
          console.log(`    • ${page.title}`)
        }
        return
      }

      if (created.length === 0) {
        out.success('No missing core wiki pages.')
        return
      }

      out.success(`Created ${created.length} core wiki page(s).`)
      for (const page of created) {
        console.log(`  • ${page.title} (${page.id})`)
      }
    })

  cmd
    .command('delete <pageId>')
    .alias('rm')
    .description('Delete a wiki page')
    .option('--project <project>', 'Override default project')
    .action(async (pageId, opts) => {
      const project = await resolveProject(opts.project)
      await pages.delete(project, pageId)
      out.success(`Deleted page ${pageId}`)
    })

  cmd
    .command('templates')
    .description('List available page templates')
    .action(() => {
      out.heading('Page Templates')
      out.table(PAGE_TEMPLATES, [
        { header: '', value: (r) => r.icon, maxWidth: 3 },
        { header: 'ID', value: (r) => chalk.bold(r.id), maxWidth: 20 },
        { header: 'Name', value: (r) => r.name, maxWidth: 30 },
        { header: 'Description', value: (r) => r.description, maxWidth: 45 },
      ])
      console.log(chalk.gray('\n  Usage: storyflow pages create --title "My Page" --template adr'))
    })
}

function shortDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
