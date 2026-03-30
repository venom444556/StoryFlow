#!/usr/bin/env node

// ---------------------------------------------------------------------------
// StoryFlow CLI — Entry point
// ---------------------------------------------------------------------------

import { program } from 'commander'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import chalk from 'chalk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'))

// Global error handler — clean output, no stack traces
process.on('uncaughtException', (err) => {
  console.error(chalk.red('✗') + ' ' + err.message)
  process.exit(1)
})
process.on('unhandledRejection', (err) => {
  console.error(chalk.red('✗') + ' ' + (err?.message || err))
  process.exit(1)
})

program
  .name('storyflow')
  .description('StoryFlow Agent CLI — project management from the terminal')
  .version(pkg.version)

// Register command groups
const commands = await Promise.all([
  import('../src/commands/config.js'),
  import('../src/commands/projects.js'),
  import('../src/commands/issues.js'),
  import('../src/commands/sprints.js'),
  import('../src/commands/pages.js'),
  import('../src/commands/decisions.js'),
  import('../src/commands/phases.js'),
  import('../src/commands/milestones.js'),
  import('../src/commands/workflow.js'),
  import('../src/commands/architecture.js'),
  import('../src/commands/events.js'),
  import('../src/commands/board.js'),
  import('../src/commands/agent.js'),
  import('../src/commands/context.js'),
  import('../src/commands/search.js'),
  import('../src/commands/reconcile.js'),
])

for (const mod of commands) {
  mod.register(program)
}

program.parse()
