// ---------------------------------------------------------------------------
// storyflow events — event stream, steering, AI status
// ---------------------------------------------------------------------------

import { events, ai, safety, sessions, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

export function register(program) {
  // --- Events ---
  const evtCmd = program.command('events').alias('event').description('Query the event stream')

  evtCmd
    .command('list [project]')
    .alias('ls')
    .description('List recent events')
    .option('--category <cat>', 'Filter by category')
    .option('--actor <actor>', 'Filter by actor (ai, human, system)')
    .option('--limit <n>', 'Limit results', '20')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const filters = {}
      if (opts.category) filters.category = opts.category
      if (opts.actor) filters.actor = opts.actor
      if (opts.limit) filters.limit = opts.limit

      const list = await events.query(project, filters)
      if (opts.json) return out.json(list)

      out.heading(`Events — ${project}`)
      out.table(list, [
        { header: 'Time', value: (r) => shortTime(r.timestamp), maxWidth: 18 },
        { header: 'Actor', value: (r) => actorColor(r.actor), maxWidth: 8 },
        { header: 'Action', value: (r) => r.action, maxWidth: 14 },
        { header: 'Entity', value: (r) => r.entity_title || r.entity_type || '', maxWidth: 35 },
        {
          header: 'Status',
          value: (r) => (r.status ? out.status(r.status) : chalk.gray('-')),
          maxWidth: 10,
        },
      ])
    })

  evtCmd
    .command('create [project]')
    .description('Record a custom event')
    .requiredOption('--action <action>', 'Event action (e.g., deployed, reviewed)')
    .option('--category <cat>', 'Event category')
    .option('--entity-type <type>', 'Entity type')
    .option('--entity-title <title>', 'Entity title')
    .option('--actor <actor>', 'Actor (ai, human, system)', 'human')
    .option('--detail <detail>', 'Additional detail')
    .option('--reasoning <text>', 'Reasoning for the event')
    .option('--confidence <n>', 'Confidence score (0-1)')
    .option('--parent-event-id <id>', 'Parent event ID for causal chain')
    .option('--entity-id <id>', 'Entity ID')
    .option('--session-id <id>', 'Session ID')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const event = { action: opts.action, actor: opts.actor }
      if (opts.category) event.category = opts.category
      if (opts.entityType) event.entity_type = opts.entityType
      if (opts.entityTitle) event.entity_title = opts.entityTitle
      if (opts.detail) event.detail = opts.detail
      if (opts.reasoning) event.reasoning = opts.reasoning
      if (opts.confidence) event.confidence = parseFloat(opts.confidence)
      if (opts.parentEventId) event.parent_event_id = opts.parentEventId
      if (opts.entityId) event.entity_id = opts.entityId
      if (opts.sessionId) event.session_id = opts.sessionId
      const result = await events.record(project, event)
      if (opts.json) return out.json(result)
      out.success(`Event recorded: ${opts.action}`)
    })

  evtCmd
    .command('respond <eventId>')
    .description('Approve or reject an approval gate')
    .requiredOption('--action <action>', 'Response: approve, reject, redirect')
    .option('--project <project>', 'Override default project')
    .option('--reason <reason>', 'Reason for decision')
    .option('--json', 'Output raw JSON')
    .action(async (eventId, opts) => {
      const project = await resolveProject(opts.project)
      const data = { action: opts.action }
      if (opts.reason) data.comment = opts.reason
      const result = await events.respond(project, eventId, data)
      if (opts.json) return out.json(result)
      out.success(`Gate ${eventId}: ${opts.action}`)
    })

  evtCmd
    .command('cleanup [project]')
    .description('Delete events older than retention period')
    .action(async (project) => {
      project = await resolveProject(project)
      const result = await events.cleanup(project)
      out.success(`Cleaned up events: ${result.deleted || 0} removed`)
    })

  // --- Steer ---
  program
    .command('steer <message>')
    .description('Send a steering directive to the AI agent')
    .option('--project <project>', 'Override default project')
    .option('-p, --priority <priority>', 'Priority (normal, high, critical)', 'normal')
    .option('--json', 'Output raw JSON')
    .action(async (message, opts) => {
      const project = await resolveProject(opts.project)
      const result = await ai.steer(project, message, opts.priority)
      if (opts.json) return out.json(result)
      out.success(`Directive sent (${opts.priority}): ${message}`)
    })

  // --- AI Status ---
  const aiCmd = program.command('ai-status').description('Manage AI agent status')

  aiCmd
    .command('show [project]')
    .alias('get')
    .description('Check AI agent status')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const status = await ai.getStatus(project)
      if (opts?.json) return out.json(status)
      out.heading('AI Agent Status')
      out.kv('Status', out.status(status.status || 'idle'))
      out.kv('Detail', status.detail || chalk.gray('none'))
      out.kv('Updated', status.updatedAt || chalk.gray('never'))

      const directives = await ai.getDirectives(project)
      if (directives.length) {
        console.log()
        out.heading('Pending Directives')
        for (const d of directives) {
          const pri =
            d.priority === 'critical'
              ? chalk.red('!!!')
              : d.priority === 'high'
                ? chalk.yellow('!!')
                : chalk.gray('!')
          console.log(`  ${pri} ${d.text} ${chalk.gray(`(${shortTime(d.created_at)})`)}`)
        }
      }
    })

  aiCmd
    .command('set <status>')
    .description('Set AI agent status (idle, working, blocked, paused)')
    .option('--project <project>', 'Override default project')
    .option('-d, --detail <detail>', 'Status detail message')
    .action(async (status, opts) => {
      const project = await resolveProject(opts.project)
      await ai.setStatus(project, status, opts.detail)
      out.success(`AI status set to: ${status}`)
    })

  aiCmd
    .command('acknowledge <directiveId>')
    .alias('ack')
    .description('Acknowledge a steering directive')
    .option('--project <project>', 'Override default project')
    .action(async (directiveId, opts) => {
      const project = await resolveProject(opts.project)
      await ai.acknowledge(project, directiveId)
      out.success(`Directive ${directiveId} acknowledged`)
    })

  // --- Gates ---
  program
    .command('gates [project]')
    .description('Check pending approval gates')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const result = await safety.gates(project)
      if (opts.json) return out.json(result)

      out.heading(`Approval Gates — ${project}`)
      const pending = result.pending || []
      const rejected = result.rejected || []

      if (!pending.length && !rejected.length) {
        out.info('No pending or rejected gates')
        return
      }

      if (pending.length) {
        console.log(chalk.yellow(`\n  ${pending.length} pending:`))
        for (const g of pending) {
          console.log(`    ${g.entity_title || g.entity_type} — ${g.reasoning || 'no reason'}`)
        }
      }
      if (rejected.length) {
        console.log(chalk.red(`\n  ${rejected.length} rejected:`))
        for (const g of rejected) {
          console.log(`    ${g.entity_title || g.entity_type} — ${g.reasoning || 'no reason'}`)
        }
      }
    })

  // --- Snapshots ---
  const snapCmd = program.command('snapshots').description('Manage undo snapshots')

  snapCmd
    .command('list [project]')
    .alias('ls')
    .description('List undo snapshots')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const list = await safety.snapshots(project)
      if (opts.json) return out.json(list)

      out.heading(`Snapshots — ${project}`)
      out.table(list, [
        { header: 'ID', value: (r) => r.id?.slice(0, 8), maxWidth: 10 },
        { header: 'Trigger', value: (r) => r.trigger_action, maxWidth: 20 },
        { header: 'Entity', value: (r) => r.trigger_entity, maxWidth: 30 },
        { header: 'Actor', value: (r) => actorColor(r.trigger_actor), maxWidth: 8 },
        { header: 'Time', value: (r) => shortTime(r.created_at), maxWidth: 18 },
      ])
    })

  snapCmd
    .command('restore <snapshotId>')
    .description('Restore project from a snapshot')
    .option('--project <project>', 'Override default project')
    .option('--json', 'Output raw JSON')
    .action(async (snapshotId, opts) => {
      const project = await resolveProject(opts.project)
      const result = await safety.restore(project, snapshotId)
      if (opts.json) return out.json(result)
      out.success(`Restored from snapshot ${snapshotId}`)
    })

  // --- Sessions ---
  const sessCmd = program.command('sessions').alias('session').description('Manage agent sessions')

  sessCmd
    .command('list [project]')
    .alias('ls')
    .description('List agent sessions')
    .option('--limit <n>', 'Limit results', '10')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const list = await sessions.list(project, parseInt(opts.limit, 10))
      if (opts.json) return out.json(list)

      out.heading(`Sessions — ${project}`)
      out.table(list, [
        { header: 'ID', value: (r) => (r.id || '').slice(0, 8), maxWidth: 10 },
        { header: 'Summary', value: (r) => (r.summary || '').slice(0, 60), maxWidth: 60 },
        { header: 'Time', value: (r) => shortTime(r.createdAt || r.created_at), maxWidth: 18 },
      ])
    })

  sessCmd
    .command('latest [project]')
    .description('Show the most recent session')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const session = await sessions.latest(project)
      if (opts.json) return out.json(session)

      if (!session || !session.id) {
        out.info('No sessions recorded yet')
        return
      }
      out.heading('Latest Session')
      out.kv('ID', session.id)
      out.kv('Time', session.createdAt || session.created_at)
      if (session.summary) {
        console.log()
        console.log(session.summary)
      }
    })

  sessCmd
    .command('save [project]')
    .description('Save a session summary')
    .requiredOption('-s, --summary <text>', 'Session summary text')
    .option('--next-steps <text>', 'Next steps for future sessions')
    .option('--key-decisions <text>', 'Key decisions made in this session')
    .option('--work-done <text>', 'Description of work completed')
    .option('--learnings <text>', 'Lessons learned during session')
    .option('--wiki-pages-updated <text>', 'Comma-separated page IDs or titles updated')
    .option('--issues-created <n>', 'Count of issues created', parseInt)
    .option('--issues-updated <n>', 'Count of issues updated', parseInt)
    .option('--events-recorded <n>', 'Count of events recorded', parseInt)
    .option('--agent-id <id>', 'Agent ID')
    .option('--json', 'Output raw JSON')
    .action(async (project, opts) => {
      project = await resolveProject(project)
      const data = { summary: opts.summary }
      if (opts.nextSteps) data.next_steps = opts.nextSteps
      if (opts.keyDecisions) data.key_decisions = opts.keyDecisions
      if (opts.workDone) data.work_done = opts.workDone
      if (opts.learnings) data.learnings = opts.learnings
      if (opts.wikiPagesUpdated) data.wiki_pages_updated = opts.wikiPagesUpdated
      if (opts.issuesCreated !== undefined) data.issues_created = opts.issuesCreated
      if (opts.issuesUpdated !== undefined) data.issues_updated = opts.issuesUpdated
      if (opts.eventsRecorded !== undefined) data.events_recorded = opts.eventsRecorded
      if (opts.agentId) data.agent_id = opts.agentId
      const result = await sessions.save(project, data)
      if (opts.json) return out.json(result)
      out.success('Session saved')
    })
}

function actorColor(actor) {
  if (actor === 'ai') return chalk.cyan(actor)
  if (actor === 'human') return chalk.green(actor)
  return chalk.gray(actor || '?')
}

function shortTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
