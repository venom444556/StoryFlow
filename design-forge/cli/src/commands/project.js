// ---------------------------------------------------------------------------
// forge create-project / forge navigate — Project management
// ---------------------------------------------------------------------------

import { withCDP, getPort } from '../cdp-client.js'
import { createProject, navigateToUrl } from '../framer-actions.js'
import * as out from '../output.js'

export function register(program) {
  program
    .command('create-project')
    .description('Create a new Framer project')
    .option('-t, --template <template>', 'Template name (blank, portfolio, landing)', 'blank')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const port = getPort(program)
      await withCDP(port, async (client) => {
        await createProject(client, opts.template)
        const url = await client.evaluate('window.location.href')

        if (opts.json) return out.json({ created: true, template: opts.template, url })
        out.success(`Created ${opts.template} project`)
        out.kv('URL', url)
      })
    })

  program
    .command('navigate <url>')
    .description('Navigate to a specific Framer URL')
    .option('--json', 'Output raw JSON')
    .action(async (url, opts) => {
      const port = getPort(program)
      await withCDP(port, async (client) => {
        await navigateToUrl(client, url)
        const currentUrl = await client.evaluate('window.location.href')

        if (opts.json) return out.json({ url: currentUrl })
        out.success(`Navigated to ${currentUrl}`)
      })
    })
}
