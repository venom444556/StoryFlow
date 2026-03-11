/* global process */
// ---------------------------------------------------------------------------
// forge connect / forge status — CDP connection management
// ---------------------------------------------------------------------------

import { getPort } from '../cdp-client.js'
import { ensureRunning, findEditorPage, isPortResponding, findFramer } from '../framer-launcher.js'
import * as out from '../output.js'
import chalk from 'chalk'

export function register(program) {
  program
    .command('connect')
    .description('Check or establish CDP connection to Framer')
    .option('--launch', 'Launch Framer if not running')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const port = getPort(program)

      if (opts.launch) {
        const result = await ensureRunning(port)
        if (result.launched) {
          out.success(`Launched Framer with CDP on port ${port}`)
        } else {
          out.info(`Framer already running on port ${port}`)
        }
      }

      const responding = await isPortResponding(port)
      if (!responding) {
        if (opts.json) return out.json({ connected: false, port })
        out.error(`No CDP endpoint on port ${port}`)
        out.info('Launch Framer with: forge connect --launch')
        out.info(`Or manually: open -a Framer --args --remote-debugging-port=${port}`)
        process.exit(1)
      }

      const page = await findEditorPage(port)
      const result = {
        connected: true,
        port,
        editorUrl: page?.url || null,
        title: page?.title || null,
        targetCount: undefined,
      }

      // Get full target list for count
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/list`)
        const targets = await res.json()
        result.targetCount = targets.length
      } catch {
        /* ignore */
      }

      if (opts.json) return out.json(result)

      out.heading('Forge CDP Connection')
      out.kv('Status', out.status(true))
      out.kv('Port', port)
      out.kv('Targets', result.targetCount ?? '?')
      if (page) {
        out.kv('Editor', chalk.cyan(page.title || 'Unknown'))
        out.kv('URL', chalk.gray(page.url))
      } else {
        out.warn('No Framer editor page detected — open a project in Framer')
      }
    })

  program
    .command('status')
    .description('Show connection and current project info')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const port = getPort(program)
      const responding = await isPortResponding(port)

      if (!responding) {
        if (opts.json) return out.json({ connected: false, port })
        out.kv('CDP', out.status(false) + chalk.gray(` (port ${port})`))
        out.kv('Framer', findFramer() ? chalk.gray('installed') : chalk.red('not found'))
        return
      }

      const info = { connected: true, port }

      try {
        const page = await findEditorPage(port)
        if (page) {
          info.page = { title: page.title, url: page.url }
          // Extract project info from URL
          const match = page.url.match(/framer\.com\/projects\/([^/?]+)/)
          if (match) info.projectId = match[1]
        }
      } catch {
        /* ignore */
      }

      if (opts.json) return out.json(info)

      out.heading('Forge Status')
      out.kv('CDP', out.status(true) + chalk.gray(` (port ${port})`))
      if (info.page) {
        out.kv('Page', info.page.title)
        if (info.projectId) out.kv('Project', chalk.cyan(info.projectId))
      }
    })
}
