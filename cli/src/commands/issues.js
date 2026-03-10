// ---------------------------------------------------------------------------
// storyflow issues — list, create, update, show, comment
// ---------------------------------------------------------------------------

import { issues, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

export function register(program) {
  const cmd = program.command('issues').alias('issue').description('Manage issues')

  cmd
    .command('list [project]')
    .alias('ls')
    .description('List issues (uses default project if omitted)')
    .option('-s, --status <status>', 'Filter by status (To Do, In Progress, Blocked, Done)')
    .option('-t, --type <type>', 'Filter by type (epic, story, task, bug)')
    .option('--sprint <sprintId>', 'Filter by sprint')
    .option('--epic <epicId>', 'Filter by epic')
    .option('-q, --search <query>', 'Search by title')
    .option('--limit <n>', 'Limit results', '50')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const filters = {}
      if (opts.status) filters.status = opts.status
      if (opts.type) filters.type = opts.type
      if (opts.sprint) filters.sprintId = opts.sprint
      if (opts.epic) filters.epicId = opts.epic
      if (opts.search) filters.search = opts.search
      if (opts.limit) filters.limit = opts.limit

      const result = await issues.list(project, filters)
      const list = result.issues || result
      if (opts.json) return out.json(list)

      out.heading(`Issues — ${project}`)
      out.table(list, [
        { header: 'Key', value: (r) => chalk.bold(r.key), maxWidth: 12 },
        { header: '', value: (r) => out.typeIcon(r.type), maxWidth: 2 },
        { header: 'Title', value: (r) => r.title, maxWidth: 45 },
        { header: 'Status', value: (r) => out.status(r.status), maxWidth: 14 },
        { header: 'Pri', value: (r) => out.priority(r.priority), maxWidth: 10 },
        {
          header: 'Pts',
          value: (r) => (r.storyPoints ? String(r.storyPoints) : chalk.gray('-')),
          maxWidth: 4,
        },
      ])
      console.log(chalk.gray(`\n  ${list.length} issues`))
    })

  cmd
    .command('show <key>')
    .alias('get')
    .description('Show issue details by key (e.g., SC-42)')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (key, opts) => {
      const project = await resolveProject(opts.project)
      const issue = await issues.getByKey(project, key)
      if (opts.json) return out.json(issue)

      out.heading(`${issue.key} — ${issue.title}`)
      out.kv('Type', issue.type)
      out.kv('Status', out.status(issue.status))
      out.kv('Priority', out.priority(issue.priority))
      out.kv('Points', issue.storyPoints || chalk.gray('unestimated'))
      out.kv('Assignee', issue.assignee || chalk.gray('unassigned'))
      out.kv('Labels', issue.labels?.length ? issue.labels.join(', ') : chalk.gray('none'))
      if (issue.epicId) out.kv('Epic', issue.epicId)
      if (issue.sprintId) out.kv('Sprint', issue.sprintId)
      if (issue.description) {
        console.log()
        console.log(issue.description)
      }
      if (issue.comments?.length) {
        console.log()
        out.heading('Comments')
        for (const c of issue.comments) {
          console.log(`  ${chalk.gray(c.createdAt)} ${chalk.bold(c.author || 'unknown')}`)
          console.log(`  ${c.body || c.text}`)
          console.log()
        }
      }
    })

  cmd
    .command('create [project]')
    .description('Create a new issue')
    .requiredOption('--title <title>', 'Issue title')
    .option('-t, --type <type>', 'Type (epic, story, task, bug)', 'task')
    .option('-s, --status <status>', 'Status', 'To Do')
    .option('-p, --priority <priority>', 'Priority (critical, high, medium, low)', 'medium')
    .option('--points <n>', 'Story points (1, 2, 3, 5, 8, 13)')
    .option('--epic <epicId>', 'Parent epic ID')
    .option('--sprint <sprintId>', 'Sprint ID')
    .option('-d, --description <desc>', 'Description')
    .option('--assignee <name>', 'Assignee')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const data = {
        title: opts.title,
        type: opts.type,
        status: opts.status,
        priority: opts.priority,
      }
      if (opts.points) data.storyPoints = parseInt(opts.points, 10)
      if (opts.epic) data.epicId = opts.epic
      if (opts.sprint) data.sprintId = opts.sprint
      if (opts.description) data.description = opts.description
      if (opts.assignee) data.assignee = opts.assignee

      const result = await issues.create(project, data)
      if (opts.json) return out.json(result)
      out.success(`Created ${result.key}: ${result.title}`)
    })

  cmd
    .command('update <key>')
    .description('Update an issue by key')
    .option('--project <project>', 'Override default project')
    .option('--title <title>', 'New title')
    .option('-s, --status <status>', 'New status')
    .option('-p, --priority <priority>', 'New priority')
    .option('--points <n>', 'Story points')
    .option('--assignee <name>', 'Assignee')
    .option('--sprint <sprintId>', 'Sprint ID')
    .option('--epic <epicId>', 'Epic ID')
    .option('--json', 'Output raw JSON')
    .action(async (key, opts) => {
      const project = await resolveProject(opts.project)
      const data = {}
      if (opts.title) data.title = opts.title
      if (opts.status) data.status = opts.status
      if (opts.priority) data.priority = opts.priority
      if (opts.points) data.storyPoints = parseInt(opts.points, 10)
      if (opts.assignee) data.assignee = opts.assignee
      if (opts.sprint) data.sprintId = opts.sprint
      if (opts.epic) data.epicId = opts.epic

      const result = await issues.updateByKey(project, key, data)
      if (opts.json) return out.json(result)
      out.success(`Updated ${key}: ${result.title}`)
    })

  cmd
    .command('comment <key>')
    .description('Add a comment to an issue')
    .option('--project <project>', 'Override default project')
    .requiredOption('-m, --message <text>', 'Comment text')
    .option('--author <name>', 'Author name', 'cli')
    .action(async (key, opts) => {
      const project = await resolveProject(opts.project)
      await issues.addCommentByKey(project, key, {
        body: opts.message,
        author: opts.author,
      })
      out.success(`Comment added to ${key}`)
    })

  cmd
    .command('done <key>')
    .description('Quick-mark an issue as Done')
    .option('--project <project>', 'Override default project')
    .action(async (key, opts) => {
      const project = await resolveProject(opts.project)
      await issues.updateByKey(project, key, { status: 'Done' })
      out.success(`${key} marked as Done`)
    })

  cmd
    .command('block <key>')
    .description('Quick-mark an issue as Blocked')
    .option('--project <project>', 'Override default project')
    .option('-r, --reason <reason>', 'Reason for blocking')
    .action(async (key, opts) => {
      const project = await resolveProject(opts.project)
      await issues.updateByKey(project, key, { status: 'Blocked' })
      if (opts.reason) {
        await issues.addCommentByKey(project, key, {
          body: `Blocked: ${opts.reason}`,
          author: 'cli',
        })
      }
      out.success(`${key} marked as Blocked`)
    })
}
