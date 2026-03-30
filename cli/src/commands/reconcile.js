// ---------------------------------------------------------------------------
// storyflow reconcile — reconcile git commits with issue statuses
// ---------------------------------------------------------------------------

import { execFileSync } from 'node:child_process'
import { issues, resolveProject } from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

// Patterns that suggest a commit completed work on an issue
const COMPLETION_PATTERNS = [
  /^fix[:(]/i,
  /^feat[:(]/i,
  /\bdone\b/i,
  /\bclose[sd]?\b/i,
  /\bcomplete[sd]?\b/i,
  /\bfinish(ed|es)?\b/i,
  /\bresolve[sd]?\b/i,
  /\bimplement(ed|s)?\b/i,
  /\bship(ped|s)?\b/i,
]

// Issue key pattern: alphanumeric prefix + dash + number (e.g. SC-42, S-123, SF-7)
const ISSUE_KEY_RE = /\b([A-Za-z][A-Za-z0-9]*-\d+)\b/g

function extractIssueKeys(message) {
  const keys = new Set()
  let match
  while ((match = ISSUE_KEY_RE.exec(message)) !== null) {
    keys.add(match[1].toUpperCase())
  }
  return [...keys]
}

function looksLikeCompletion(message) {
  return COMPLETION_PATTERNS.some((pattern) => pattern.test(message))
}

export function register(program) {
  const cmd = program.command('reconcile').description('Reconcile external state with StoryFlow')

  cmd
    .command('git')
    .description('Scan recent git commits and mark referenced issues as Done')
    .option('--project <project>', 'Override default project')
    .option('--limit <n>', 'Number of commits to scan (default: 20)', '20')
    .option('--dry-run', 'Show what would be done without making changes')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const project = await resolveProject(opts.project)
      const limit = parseInt(opts.limit, 10) || 20

      // Get recent git commits using execFileSync (no shell injection risk)
      let gitLog
      try {
        gitLog = execFileSync('git', ['log', '--oneline', `-${limit}`], {
          encoding: 'utf-8',
          timeout: 10_000,
        }).trim()
      } catch (err) {
        out.error(`Failed to read git log: ${err.message}`)
        process.exitCode = 1
        return
      }

      if (!gitLog) {
        if (opts.json) return out.json({ scanned: 0, actions: [] })
        out.info('No commits found.')
        return
      }

      const lines = gitLog.split('\n')
      const results = {
        scanned: lines.length,
        actions: [],
        errors: [],
        skipped: [],
      }

      // Collect all unique issue keys with their commit context
      const issueCommits = new Map() // key -> { messages: string[], completion: boolean }

      for (const line of lines) {
        // Format: "abc1234 commit message here"
        const spaceIdx = line.indexOf(' ')
        if (spaceIdx === -1) continue
        const message = line.slice(spaceIdx + 1)
        const keys = extractIssueKeys(message)
        const isCompletion = looksLikeCompletion(message)

        for (const key of keys) {
          if (!issueCommits.has(key)) {
            issueCommits.set(key, { messages: [], completion: false })
          }
          const entry = issueCommits.get(key)
          entry.messages.push(message)
          if (isCompletion) entry.completion = true
        }
      }

      if (issueCommits.size === 0) {
        if (opts.json) return out.json(results)
        out.info(`Scanned ${lines.length} commits. No issue keys found.`)
        return
      }

      // Check each issue and decide what to do
      for (const [key, context] of issueCommits) {
        try {
          const issue = await issues.getByKey(project, key)

          if (!issue || !issue.id) {
            results.skipped.push({
              key,
              reason: 'Issue not found in project',
            })
            continue
          }

          const currentStatus = issue.status
          if (currentStatus === 'Done') {
            results.skipped.push({
              key,
              reason: 'Already Done',
              title: issue.title,
            })
            continue
          }

          if (!context.completion) {
            results.skipped.push({
              key,
              reason: 'Commit does not suggest completion',
              title: issue.title,
              status: currentStatus,
            })
            continue
          }

          if (currentStatus === 'To Do' || currentStatus === 'In Progress') {
            if (opts.dryRun) {
              results.actions.push({
                key,
                title: issue.title,
                from: currentStatus,
                to: 'Done',
                dryRun: true,
                commits: context.messages,
              })
            } else {
              await issues.updateByKey(project, key, { status: 'Done' })
              results.actions.push({
                key,
                title: issue.title,
                from: currentStatus,
                to: 'Done',
                dryRun: false,
                commits: context.messages,
              })
            }
          } else {
            results.skipped.push({
              key,
              reason: `Status "${currentStatus}" not auto-resolvable`,
              title: issue.title,
            })
          }
        } catch (err) {
          results.errors.push({
            key,
            error: err.message,
          })
        }
      }

      if (opts.json) return out.json(results)

      // Human-readable output
      const prefix = opts.dryRun ? chalk.yellow('[DRY RUN] ') : ''
      out.heading(`${prefix}Git Reconciliation`)
      console.log(
        chalk.gray(`  Scanned ${results.scanned} commits, found ${issueCommits.size} issue keys`)
      )
      console.log()

      if (results.actions.length) {
        console.log(chalk.green(`Marked Done (${results.actions.length}):`))
        for (const a of results.actions) {
          console.log(`  ${chalk.bold(a.key)} ${a.title} ${chalk.gray(`(${a.from} -> Done)`)}`)
        }
        console.log()
      }

      if (results.skipped.length) {
        console.log(chalk.gray(`Skipped (${results.skipped.length}):`))
        for (const s of results.skipped) {
          console.log(`  ${s.key}${s.title ? ` ${s.title}` : ''} -- ${s.reason}`)
        }
        console.log()
      }

      if (results.errors.length) {
        console.log(chalk.red(`Errors (${results.errors.length}):`))
        for (const e of results.errors) {
          console.log(`  ${e.key}: ${e.error}`)
        }
      }
    })
}
