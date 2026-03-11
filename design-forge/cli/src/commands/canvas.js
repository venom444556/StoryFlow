// ---------------------------------------------------------------------------
// forge insert / forge style / forge set-text / forge set-layout / forge move
// ---------------------------------------------------------------------------

import { withCDP, getPort } from '../cdp-client.js'
import {
  insertElement,
  setTextContent,
  applyStyle,
  setLayout,
  moveElement,
} from '../framer-actions.js'
import * as out from '../output.js'

export function register(program) {
  program
    .command('insert <type>')
    .description('Insert element: frame, text, stack, link, image, video, code')
    .option('--json', 'Output raw JSON')
    .action(async (type, opts) => {
      const port = getPort(program)
      await withCDP(port, async (client) => {
        await insertElement(client, type)
        if (opts.json) return out.json({ inserted: type })
        out.success(`Inserted ${type}`)
      })
    })

  program
    .command('style <css-json>')
    .description('Apply CSS styles to selection (JSON string)')
    .option('--json', 'Output raw JSON')
    .action(async (cssJson, opts) => {
      const port = getPort(program)
      let properties
      try {
        properties = JSON.parse(cssJson)
      } catch {
        throw new Error('Invalid CSS JSON. Example: \'{"color":"#FF0000","fontSize":"24px"}\'')
      }

      await withCDP(port, async (client) => {
        const result = await applyStyle(client, properties)
        if (opts.json) return out.json(result)
        if (result?.error) {
          out.error(result.error)
        } else {
          out.success(`Applied ${Object.keys(properties).length} style properties`)
        }
      })
    })

  program
    .command('set-text <content>')
    .description('Set text content of selected element')
    .option('--font <font>', 'Font family')
    .option('--size <size>', 'Font size (px)')
    .option('--weight <weight>', 'Font weight (100-900)')
    .option('--color <color>', 'Text color (hex)')
    .option('--json', 'Output raw JSON')
    .action(async (content, opts) => {
      const port = getPort(program)
      await withCDP(port, async (client) => {
        await setTextContent(client, content)

        // Apply typography styles if provided
        const style = {}
        if (opts.font) style.fontFamily = opts.font
        if (opts.size) style.fontSize = `${opts.size}px`
        if (opts.weight) style.fontWeight = opts.weight
        if (opts.color) style.color = opts.color

        if (Object.keys(style).length > 0) {
          await applyStyle(client, style)
        }

        if (opts.json) return out.json({ text: content, style })
        out.success(`Set text: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`)
      })
    })

  program
    .command('set-layout <direction>')
    .description('Set layout direction (horizontal/vertical) on selection')
    .option('--gap <gap>', 'Gap between children (px)')
    .option('--padding <padding>', 'Padding (px)')
    .option('--align <align>', 'Align items (start, center, end, stretch)')
    .option('--justify <justify>', 'Justify content (start, center, end, space-between)')
    .option('--json', 'Output raw JSON')
    .action(async (direction, opts) => {
      const port = getPort(program)
      const options = {}
      if (opts.gap) options.gap = parseInt(opts.gap, 10)
      if (opts.padding) options.padding = parseInt(opts.padding, 10)
      if (opts.align) options.align = opts.align
      if (opts.justify) options.justify = opts.justify

      await withCDP(port, async (client) => {
        const result = await setLayout(client, direction, options)
        if (opts.json) return out.json(result)
        out.success(`Set ${direction} layout`)
      })
    })

  program
    .command('move <x> <y>')
    .description('Move/resize selected element')
    .option('-w, --width <width>', 'Width (px)')
    .option('-h, --height <height>', 'Height (px)')
    .option('--json', 'Output raw JSON')
    .action(async (x, y, opts) => {
      const port = getPort(program)
      await withCDP(port, async (client) => {
        const result = await moveElement(
          client,
          parseInt(x, 10),
          parseInt(y, 10),
          opts.width ? parseInt(opts.width, 10) : undefined,
          opts.height ? parseInt(opts.height, 10) : undefined
        )
        if (opts.json) return out.json(result)
        out.success(
          `Moved to (${x}, ${y})${opts.width ? ` [${opts.width}x${opts.height || '?'}]` : ''}`
        )
      })
    })
}
