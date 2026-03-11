// ---------------------------------------------------------------------------
// forge click / forge evaluate / forge type — Direct interaction commands
// ---------------------------------------------------------------------------

import { withCDP, getPort } from '../cdp-client.js'
import * as out from '../output.js'

export function register(program) {
  program
    .command('click <x> <y>')
    .description('Click at canvas coordinates')
    .option('--double', 'Double-click')
    .option('--right', 'Right-click')
    .option('--json', 'Output raw JSON')
    .action(async (x, y, opts) => {
      const port = getPort(program)
      const cx = parseInt(x, 10)
      const cy = parseInt(y, 10)

      await withCDP(port, async (client) => {
        await client.click(cx, cy, {
          button: opts.right ? 'right' : 'left',
          clickCount: opts.double ? 2 : 1,
        })

        if (opts.json) return out.json({ clicked: { x: cx, y: cy } })
        out.success(`Clicked (${cx}, ${cy})`)
      })
    })

  program
    .command('evaluate <expression>')
    .description('Evaluate JavaScript in Framer context')
    .option('--json', 'Output raw JSON')
    .action(async (expression, opts) => {
      const port = getPort(program)
      await withCDP(port, async (client) => {
        const result = await client.evaluate(expression)
        if (opts.json) return out.json({ result })
        if (typeof result === 'object' && result !== null) {
          out.json(result)
        } else {
          out.json(result)
        }
      })
    })

  program
    .command('type <text>')
    .description('Type text into focused element')
    .option('--json', 'Output raw JSON')
    .action(async (text, opts) => {
      const port = getPort(program)
      await withCDP(port, async (client) => {
        await client.type(text)
        if (opts.json) return out.json({ typed: text })
        out.success(`Typed: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`)
      })
    })

  program
    .command('key <combo>')
    .description('Press key combination (e.g., "Meta+a", "Meta+Shift+z")')
    .option('--json', 'Output raw JSON')
    .action(async (combo, opts) => {
      const port = getPort(program)
      const keys = combo.split('+').map((k) => k.trim())

      await withCDP(port, async (client) => {
        await client.keyCombo(keys)
        if (opts.json) return out.json({ keys })
        out.success(`Pressed ${combo}`)
      })
    })
}
