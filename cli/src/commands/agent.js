// ---------------------------------------------------------------------------
// storyflow agent — Agent SDK autonomous mode (placeholder)
// ---------------------------------------------------------------------------

import * as out from '../output.js'
import chalk from 'chalk'

export function register(program) {
  program
    .command('agent')
    .description('Launch the autonomous StoryFlow agent (Agent SDK)')
    .option('--task <task>', 'Task for the agent to perform')
    .option('--project <project>', 'Target project')
    .option('--resume', 'Resume from last session')
    .option('--dry-run', 'Show what the agent would do without executing')
    .action(async (opts) => {
      out.heading('StoryFlow Agent')
      out.warn('Agent SDK mode is not yet implemented.')
      console.log()
      console.log(chalk.gray('  This will use the Claude Agent SDK to run an autonomous'))
      console.log(chalk.gray('  project management agent that calls CLI commands as tools.'))
      console.log()
      console.log(chalk.gray('  Coming soon:'))
      console.log(chalk.gray('    storyflow agent --task "Plan the auth feature"'))
      console.log(chalk.gray('    storyflow agent --resume'))
      console.log(chalk.gray('    storyflow agent  (interactive mode)'))
      console.log()

      if (opts.task) {
        out.info(`Task queued: ${opts.task}`)
        out.info('Agent SDK integration pending — track progress at:')
        console.log(chalk.cyan('  https://github.com/anthropics/claude-code'))
      }
    })
}
