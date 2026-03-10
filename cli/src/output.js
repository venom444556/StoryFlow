// ---------------------------------------------------------------------------
// Terminal output formatting — colors, tables, status indicators
// ---------------------------------------------------------------------------

import chalk from 'chalk'

// --- Status colors ---

const STATUS_COLORS = {
  'To Do': chalk.white,
  'In Progress': chalk.cyan,
  Blocked: chalk.red,
  Done: chalk.green,
  // Project statuses
  planning: chalk.yellow,
  'in-progress': chalk.cyan,
  completed: chalk.green,
  'on-hold': chalk.gray,
  // Sprint
  active: chalk.cyan,
  // Workflow node
  idle: chalk.gray,
  running: chalk.cyan,
  success: chalk.green,
  error: chalk.red,
}

const PRIORITY_COLORS = {
  critical: chalk.red.bold,
  high: chalk.red,
  medium: chalk.yellow,
  low: chalk.gray,
}

const TYPE_ICONS = {
  epic: chalk.magenta('E'),
  story: chalk.blue('S'),
  task: chalk.white('T'),
  bug: chalk.red('B'),
  subtask: chalk.gray('s'),
}

export function status(s) {
  const fn = STATUS_COLORS[s] || chalk.white
  return fn(s)
}

export function priority(p) {
  const fn = PRIORITY_COLORS[p] || chalk.white
  return fn(p)
}

export function typeIcon(t) {
  return TYPE_ICONS[t] || chalk.white(t?.[0]?.toUpperCase() || '?')
}

// --- Table formatting ---

export function table(rows, columns) {
  if (!rows.length) {
    console.log(chalk.gray('  (empty)'))
    return
  }

  // Calculate column widths
  const widths = columns.map((col) => {
    const headerLen = col.header.length
    const maxData = rows.reduce((max, row) => {
      const val = String(col.value(row) ?? '')
      return Math.max(max, stripAnsi(val).length)
    }, 0)
    return Math.min(Math.max(headerLen, maxData), col.maxWidth || 50)
  })

  // Header
  const header = columns.map((col, i) => col.header.padEnd(widths[i])).join('  ')
  console.log(chalk.bold.underline(header))

  // Rows
  for (const row of rows) {
    const line = columns
      .map((col, i) => {
        const raw = String(col.value(row) ?? '')
        const visible = stripAnsi(raw)
        const pad = widths[i] - visible.length
        return pad > 0 ? raw + ' '.repeat(pad) : raw.slice(0, widths[i])
      })
      .join('  ')
    console.log(line)
  }
}

// Strip ANSI codes for width calculation
function stripAnsi(str) {
  return str.replace(/\x1B\[\d+m/g, '').replace(/\x1B\[[\d;]*m/g, '')
}

// --- Shorthand helpers ---

export function heading(text) {
  console.log()
  console.log(chalk.bold(text))
  console.log(chalk.gray('─'.repeat(stripAnsi(text).length + 4)))
}

export function success(msg) {
  console.log(chalk.green('✓') + ' ' + msg)
}

export function error(msg) {
  console.error(chalk.red('✗') + ' ' + msg)
}

export function warn(msg) {
  console.log(chalk.yellow('!') + ' ' + msg)
}

export function info(msg) {
  console.log(chalk.blue('i') + ' ' + msg)
}

export function json(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

export function kv(label, value) {
  console.log(`  ${chalk.gray(label + ':')} ${value}`)
}
