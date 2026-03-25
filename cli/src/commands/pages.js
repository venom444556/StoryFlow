// ---------------------------------------------------------------------------
// storyflow pages — wiki page management
// ---------------------------------------------------------------------------

import { pages, resolveProject } from '../client.js'
import { PAGE_TEMPLATES } from '../templates.js'
import * as out from '../output.js'
import chalk from 'chalk'

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
      const result = await pages.create(project, data)
      out.success(`Created page: ${result.title} (${result.id})`)
    })

  cmd
    .command('update <pageId>')
    .description('Update a wiki page')
    .option('--project <project>', 'Override default project')
    .option('--title <title>', 'New title')
    .option('-c, --content <content>', 'New content')
    .action(async (pageId, opts) => {
      const project = await resolveProject(opts.project)
      const data = {}
      if (opts.title) data.title = opts.title
      if (opts.content) data.content = opts.content
      const result = await pages.update(project, pageId, data)
      out.success(`Updated page: ${result.title}`)
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
