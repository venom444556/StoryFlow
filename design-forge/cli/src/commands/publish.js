// ---------------------------------------------------------------------------
// forge publish — Trigger Framer publish flow
// ---------------------------------------------------------------------------

import { withCDP, getPort } from '../cdp-client.js'
import * as out from '../output.js'

export function register(program) {
  program
    .command('publish')
    .description('Publish the current Framer project')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const port = getPort(program)
      await withCDP(port, async (client) => {
        // Click the publish/preview button
        await client.evaluate(`
          const btn = document.querySelector('[data-testid="projectbar-preview-button"]')
            || document.querySelector('button[aria-label*="Publish"]');
          if (btn) btn.click();
          else throw new Error('Publish button not found');
        `)

        // Wait for publish dialog
        await new Promise((r) => setTimeout(r, 2000))

        // Click the publish/update button in the dialog
        await client.evaluate(`
          const publishBtn = document.querySelector('[data-testid="publish-button"]')
            || Array.from(document.querySelectorAll('button')).find(b =>
              /publish|update/i.test(b.textContent)
            );
          if (publishBtn) publishBtn.click();
          else throw new Error('Publish confirmation button not found');
        `)

        // Wait for publish to complete
        await new Promise((r) => setTimeout(r, 5000))

        // Try to get the published URL
        const url = await client.evaluate(`
          (() => {
            const link = document.querySelector('[data-testid="published-url"]')
              || document.querySelector('a[href*=".framer."]');
            return link?.href || link?.textContent || null;
          })()
        `)

        if (opts.json) return out.json({ published: true, url })
        out.success('Published!')
        if (url) out.kv('URL', url)
      })
    })
}
