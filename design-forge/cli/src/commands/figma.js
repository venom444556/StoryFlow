/* global process, Buffer */
// ---------------------------------------------------------------------------
// forge figma — Figma REST API commands + Figma → Framer bridge
// ---------------------------------------------------------------------------

import { writeFileSync } from 'node:fs'
import * as figma from '../figma-client.js'
import * as out from '../output.js'
import chalk from 'chalk'

function tokenFromOpts(opts, program) {
  return opts?.token || program?.parent?.opts()?.figmaToken || process.env.FIGMA_TOKEN
}

export function register(program) {
  const fig = program.command('figma').description('Figma REST API — read designs, tokens, assets')

  // --- forge figma auth ---
  fig
    .command('auth')
    .description('Verify Figma authentication and show user info')
    .option('--token <token>', 'Figma PAT (or set FIGMA_TOKEN env)')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const token = figma.getToken(opts)
      const me = await figma.getMe(token)
      if (opts.json) return out.json(me)
      out.heading('Figma Auth')
      out.kv('User', me.handle)
      out.kv('Email', me.email)
      out.kv('ID', me.id)
      out.success('Authenticated')
    })

  // --- forge figma file ---
  fig
    .command('file <fileKeyOrUrl>')
    .description('Read Figma file structure')
    .option('--depth <n>', 'Node tree depth', '2')
    .option('--token <token>', 'Figma PAT')
    .option('--json', 'Output raw JSON')
    .action(async (input, opts) => {
      const token = figma.getToken(opts)
      const { fileKey } = input.startsWith('http') ? figma.parseUrl(input) : { fileKey: input }
      const file = await figma.getFile(fileKey, token, { depth: parseInt(opts.depth, 10) })

      if (opts.json) return out.json(file)

      out.heading(`Figma: ${file.name}`)
      out.kv('Last Modified', file.lastModified)
      out.kv('Version', file.version)

      // Print page structure
      const pages = file.document?.children || []
      for (const page of pages) {
        out.info(`Page: ${chalk.cyan(page.name)} (${page.children?.length || 0} top-level nodes)`)
        for (const child of (page.children || []).slice(0, 10)) {
          out.kv(`  ${child.type}`, child.name)
        }
        if ((page.children?.length || 0) > 10) {
          out.info(`  ... and ${page.children.length - 10} more`)
        }
      }
    })

  // --- forge figma nodes ---
  fig
    .command('nodes <fileKeyOrUrl> <nodeIds...>')
    .description('Fetch specific nodes by ID')
    .option('--token <token>', 'Figma PAT')
    .option('--json', 'Output raw JSON')
    .action(async (input, nodeIds, opts) => {
      const token = figma.getToken(opts)
      const { fileKey } = input.startsWith('http') ? figma.parseUrl(input) : { fileKey: input }
      const result = await figma.getNodes(fileKey, nodeIds, token)
      if (opts.json) return out.json(result)
      out.heading('Figma Nodes')
      for (const [id, node] of Object.entries(result.nodes || {})) {
        out.info(
          `${chalk.cyan(id)}: ${node?.document?.name || 'unknown'} (${node?.document?.type})`
        )
      }
    })

  // --- forge figma tokens ---
  fig
    .command('tokens <fileKeyOrUrl>')
    .description('Extract design tokens (variables) from Figma file')
    .option('--published', 'Get published variables instead of local')
    .option('--format <fmt>', 'Output format: json, css, tailwind', 'json')
    .option('-o, --output <path>', 'Write to file')
    .option('--token <token>', 'Figma PAT')
    .action(async (input, opts) => {
      const token = figma.getToken(opts)
      const { fileKey } = input.startsWith('http') ? figma.parseUrl(input) : { fileKey: input }
      const variables = await figma.getVariables(fileKey, token, {
        published: opts.published,
      })
      const tokens = figma.flattenVariables(variables)

      let output
      if (opts.format === 'css') {
        output = tokensToCSS(tokens)
      } else if (opts.format === 'tailwind') {
        output = JSON.stringify(tokensToTailwind(tokens), null, 2)
      } else {
        output = JSON.stringify(tokens, null, 2)
      }

      if (opts.output) {
        writeFileSync(opts.output, output)
        out.success(`Wrote ${tokens.length} tokens to ${opts.output}`)
      } else {
        out.json(opts.format === 'json' ? tokens : output)
      }
    })

  // --- forge figma export ---
  fig
    .command('export <fileKeyOrUrl> <nodeIds...>')
    .description('Export nodes as PNG/SVG/JPG/PDF')
    .option('--format <fmt>', 'Image format: png, svg, jpg, pdf', 'png')
    .option('--scale <n>', 'Export scale (1-4)', '2')
    .option('-o, --output <dir>', 'Output directory', '.')
    .option('--token <token>', 'Figma PAT')
    .action(async (input, nodeIds, opts) => {
      const token = figma.getToken(opts)
      const { fileKey } = input.startsWith('http') ? figma.parseUrl(input) : { fileKey: input }

      out.info(`Exporting ${nodeIds.length} node(s) as ${opts.format} at ${opts.scale}x...`)

      const result = await figma.exportImages(fileKey, nodeIds, token, {
        format: opts.format,
        scale: parseFloat(opts.scale),
        download: true,
      })

      for (const [id, buffer] of Object.entries(result.downloads || {})) {
        const filename = `${opts.output}/${id.replace(/:/g, '-')}.${opts.format}`
        writeFileSync(filename, buffer)
        out.success(`${filename} (${(buffer.length / 1024).toFixed(1)}KB)`)
      }
    })

  // --- forge figma components ---
  fig
    .command('components <fileKeyOrUrl>')
    .description('List components in a Figma file')
    .option('--token <token>', 'Figma PAT')
    .option('--json', 'Output raw JSON')
    .action(async (input, opts) => {
      const token = figma.getToken(opts)
      const { fileKey } = input.startsWith('http') ? figma.parseUrl(input) : { fileKey: input }
      const components = await figma.getComponents(fileKey, token)
      if (opts.json) return out.json(components)

      out.heading('Components')
      const entries = Object.entries(components)
      if (entries.length === 0) return out.info('No components found.')
      for (const [id, comp] of entries) {
        out.kv(comp.name, `${comp.description || 'no description'} ${chalk.gray(id)}`)
      }
      out.info(`${entries.length} component(s) found`)
    })

  // --- forge figma styles ---
  fig
    .command('styles <fileKeyOrUrl>')
    .description('List styles in a Figma file')
    .option('--token <token>', 'Figma PAT')
    .option('--json', 'Output raw JSON')
    .action(async (input, opts) => {
      const token = figma.getToken(opts)
      const { fileKey } = input.startsWith('http') ? figma.parseUrl(input) : { fileKey: input }
      const styles = await figma.getStyles(fileKey, token)
      if (opts.json) return out.json(styles)

      out.heading('Styles')
      const entries = Object.entries(styles)
      if (entries.length === 0) return out.info('No styles found.')
      for (const [id, style] of entries) {
        out.kv(`${style.styleType} ${style.name}`, chalk.gray(id))
      }
      out.info(`${entries.length} style(s) found`)
    })

  // --- forge figma comments ---
  fig
    .command('comments <fileKeyOrUrl>')
    .description('List or add comments on a Figma file')
    .option('--add <message>', 'Add a comment')
    .option('--node <nodeId>', 'Attach comment to specific node')
    .option('--token <token>', 'Figma PAT')
    .option('--json', 'Output raw JSON')
    .action(async (input, opts) => {
      const token = figma.getToken(opts)
      const { fileKey } = input.startsWith('http') ? figma.parseUrl(input) : { fileKey: input }

      if (opts.add) {
        const result = await figma.postComment(fileKey, opts.add, token, {
          nodeId: opts.node,
        })
        if (opts.json) return out.json(result)
        out.success('Comment added')
        return
      }

      const comments = await figma.getComments(fileKey, token)
      if (opts.json) return out.json(comments)

      out.heading('Comments')
      for (const c of comments.comments || []) {
        out.info(`${chalk.cyan(c.user.handle)}: ${c.message}`)
        out.kv('  Date', c.created_at)
      }
    })

  // --- forge figma versions ---
  fig
    .command('versions <fileKeyOrUrl>')
    .description('Show file version history')
    .option('--token <token>', 'Figma PAT')
    .option('--json', 'Output raw JSON')
    .action(async (input, opts) => {
      const token = figma.getToken(opts)
      const { fileKey } = input.startsWith('http') ? figma.parseUrl(input) : { fileKey: input }
      const versions = await figma.getVersions(fileKey, token)
      if (opts.json) return out.json(versions)

      out.heading('Version History')
      for (const v of (versions.versions || []).slice(0, 20)) {
        out.info(
          `${chalk.cyan(v.label || 'Autosave')} — ${v.created_at} by ${v.user?.handle || 'unknown'}`
        )
        if (v.description) out.kv('  Desc', v.description)
      }
    })

  // --- forge figma ddd ---
  fig
    .command('ddd <fileKeyOrUrl>')
    .description('Generate a Design Decision Document from Figma tokens + structure')
    .option('--node <nodeId>', 'Focus on specific node')
    .option('-o, --output <path>', 'Write DDD to file')
    .option('--token <token>', 'Figma PAT')
    .action(async (input, opts) => {
      const token = figma.getToken(opts)
      const parsed = input.startsWith('http') ? figma.parseUrl(input) : { fileKey: input }
      const fileKey = parsed.fileKey
      const nodeId = opts.node || parsed.nodeId

      out.info('Reading Figma file structure...')
      const file = await figma.getFile(fileKey, token, { depth: 3 })

      out.info('Extracting design tokens...')
      let tokens = []
      try {
        const variables = await figma.getVariables(fileKey, token)
        tokens = figma.flattenVariables(variables)
      } catch {
        out.warn('No variables found — will infer from file styles')
      }

      out.info('Reading styles...')
      const styles = file.styles || {}

      // Build the DDD
      const ddd = buildDDD(file, tokens, styles, nodeId)

      if (opts.output) {
        writeFileSync(opts.output, ddd)
        out.success(`DDD written to ${opts.output}`)
      } else {
        out.json(ddd)
      }
    })
}

// --- Token format converters ---

function tokensToCSS(tokens) {
  const lines = [':root {']
  for (const t of tokens) {
    const name = t.name.replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase()
    lines.push(`  --${name}: ${t.value};`)
  }
  lines.push('}')
  return lines.join('\n')
}

function tokensToTailwind(tokens) {
  const config = { colors: {}, spacing: {}, fontSize: {} }
  for (const t of tokens) {
    const name = t.name.replace(/\//g, '-').replace(/\s+/g, '-').toLowerCase()
    if (t.type === 'COLOR') {
      config.colors[name] = t.value
    } else if (t.type === 'FLOAT' && /spacing|padding|margin|gap/i.test(t.name)) {
      config.spacing[name] = `${t.value}px`
    } else if (t.type === 'FLOAT' && /font.*size|text.*size/i.test(t.name)) {
      config.fontSize[name] = `${t.value}px`
    }
  }
  return config
}

// --- DDD builder ---

function buildDDD(file, tokens, styles, focusNodeId) {
  const colorTokens = tokens.filter((t) => t.type === 'COLOR')
  const spacingTokens = tokens.filter(
    (t) => t.type === 'FLOAT' && /spacing|padding|margin|gap/i.test(t.name)
  )
  const fontTokens = tokens.filter((t) => t.type === 'FLOAT' && /font|text|size/i.test(t.name))

  // Extract font families from styles
  const fontStyles = Object.values(styles).filter((s) => s.styleType === 'TEXT')
  const colorStyles = Object.values(styles).filter((s) => s.styleType === 'FILL')

  const lines = [
    `## DDD: ${file.name}`,
    ``,
    `> Auto-generated from Figma file. Review and adjust before building.`,
    `> Source: https://www.figma.com/design/${file.document?.id || 'unknown'}`,
    ``,
    `### Typography`,
  ]

  if (fontStyles.length > 0) {
    lines.push(`- Text styles found: ${fontStyles.map((s) => s.name).join(', ')}`)
  }
  if (fontTokens.length > 0) {
    lines.push(`- Font size tokens:`)
    for (const t of fontTokens.slice(0, 10)) {
      lines.push(`  - ${t.name}: ${t.value}px`)
    }
  }
  lines.push(`- **TODO**: Specify display font, body font, and scale (H1-Body)`)
  lines.push(``)

  lines.push(`### Color Palette`)
  if (colorTokens.length > 0) {
    for (const t of colorTokens.slice(0, 15)) {
      lines.push(`- ${t.name}: ${t.value}`)
    }
  } else if (colorStyles.length > 0) {
    lines.push(`- Color styles found: ${colorStyles.map((s) => s.name).join(', ')}`)
    lines.push(
      `- **TODO**: Extract hex values from Figma (use \`forge figma nodes\` on style nodes)`
    )
  } else {
    lines.push(`- No color tokens found. Define manually:`)
    lines.push(`  - Background: [hex]`)
    lines.push(`  - Surface: [hex]`)
    lines.push(`  - Text primary: [hex]`)
    lines.push(`  - Text secondary: [hex]`)
    lines.push(`  - Brand: [hex]`)
    lines.push(`  - Accent: [hex]`)
  }
  lines.push(``)

  lines.push(`### Spacing`)
  if (spacingTokens.length > 0) {
    for (const t of spacingTokens.slice(0, 10)) {
      lines.push(`- ${t.name}: ${t.value}px`)
    }
  } else {
    lines.push(`- No spacing tokens found. Use 8px grid:`)
    lines.push(`  - Section gap: [N]px`)
    lines.push(`  - Card padding: [N]px`)
    lines.push(`  - Element gap: [N]px`)
  }
  lines.push(``)

  lines.push(`### Layout`)
  const pages = file.document?.children || []
  lines.push(`- Pages: ${pages.length}`)
  for (const page of pages) {
    const topNodes = page.children || []
    lines.push(`  - ${page.name}: ${topNodes.length} frames`)
    for (const node of topNodes.slice(0, 5)) {
      const w = node.absoluteBoundingBox?.width
      const h = node.absoluteBoundingBox?.height
      lines.push(`    - ${node.name} (${node.type}${w ? ` ${w}×${h}` : ''})`)
    }
  }
  lines.push(``)

  lines.push(`### Sections (from file structure)`)
  if (pages.length > 0) {
    const mainPage = pages[0]
    for (let i = 0; i < (mainPage.children || []).length && i < 10; i++) {
      const node = mainPage.children[i]
      lines.push(
        `${i + 1}. **${node.name}** — ${node.type} (${node.children?.length || 0} children)`
      )
    }
  }

  return lines.join('\n')
}
