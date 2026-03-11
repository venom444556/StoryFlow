#!/usr/bin/env node
/* global process */

// ---------------------------------------------------------------------------
// Design Forge CLI — Entry point
// Drive Framer's desktop app via Chrome DevTools Protocol
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
  .name('forge')
  .description('Design Forge — drive Framer via Chrome DevTools Protocol')
  .version(pkg.version)
  .option('-p, --port <port>', 'CDP debug port', '9222')

// Register command groups
const commands = await Promise.all([
  import('../src/commands/connect.js'),
  import('../src/commands/project.js'),
  import('../src/commands/canvas.js'),
  import('../src/commands/observe.js'),
  import('../src/commands/interact.js'),
  import('../src/commands/publish.js'),
])

for (const mod of commands) {
  mod.register(program)
}

program.parse()
