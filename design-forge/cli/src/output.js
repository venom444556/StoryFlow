/* eslint-disable no-console */
// ---------------------------------------------------------------------------
// Terminal output formatting for Design Forge
// ---------------------------------------------------------------------------

import chalk from 'chalk'

export function heading(text) {
  console.log()
  console.log(chalk.bold.magenta(text))
  console.log(chalk.gray('─'.repeat(text.length + 4)))
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
  console.log(chalk.cyan('i') + ' ' + msg)
}

export function json(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

export function kv(label, value) {
  console.log(`  ${chalk.gray(label + ':')} ${value}`)
}

export function status(connected) {
  return connected ? chalk.green('connected') : chalk.red('disconnected')
}
