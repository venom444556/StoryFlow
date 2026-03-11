// ---------------------------------------------------------------------------
// forge screenshot / forge read-canvas / forge get-selection
// ---------------------------------------------------------------------------

import { writeFileSync } from 'node:fs'
import { withCDP, getPort } from '../cdp-client.js'
import { readCanvasState, getSelection } from '../framer-actions.js'
import * as out from '../output.js'

export function register(program) {
  program
    .command('screenshot')
    .description('Capture canvas screenshot')
    .option('-o, --output <path>', 'Output file path', 'forge-screenshot.png')
    .option('--full-page', 'Capture full page')
    .option('--2x', 'Capture at 2x resolution (retina)')
    .option('--json', 'Output base64 JSON instead of file')
    .action(async (opts) => {
      const port = getPort(program)
      await withCDP(port, async (client) => {
        const screenshotOpts = {
          format: 'png',
        }
        if (opts['2x']) {
          screenshotOpts.deviceScaleFactor = 2
        }
        if (opts.fullPage) {
          screenshotOpts.captureBeyondViewport = true
        }

        const buffer = await client.screenshot(screenshotOpts)

        if (opts.json) {
          return out.json({
            format: 'png',
            size: buffer.length,
            data: buffer.toString('base64'),
          })
        }

        writeFileSync(opts.output, buffer)
        out.success(`Screenshot saved: ${opts.output} (${(buffer.length / 1024).toFixed(1)}KB)`)
      })
    })

  program
    .command('read-canvas')
    .description('Read canvas DOM state as JSON')
    .option('--depth <depth>', 'DOM traversal depth', '3')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const port = getPort(program)
      await withCDP(port, async (client) => {
        const state = await readCanvasState(client, parseInt(opts.depth, 10))
        if (opts.json) return out.json(state)

        out.heading('Canvas State')
        out.json(state)
      })
    })

  program
    .command('get-selection')
    .description('Get currently selected element properties')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const port = getPort(program)
      await withCDP(port, async (client) => {
        const selection = await getSelection(client)
        if (opts.json) return out.json(selection)

        if (!selection || selection.length === 0) {
          out.warn('No element selected')
          return
        }

        out.heading('Selection')
        for (const el of selection) {
          out.kv('Type', el.type || el.tag || 'unknown')
          if (el.name) out.kv('Name', el.name)
          if (el.id) out.kv('ID', el.id)
          if (el.rect) out.kv('Position', `(${el.rect.x}, ${el.rect.y}) ${el.rect.w}x${el.rect.h}`)
        }
      })
    })
}
