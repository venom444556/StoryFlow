// ---------------------------------------------------------------------------
// storyflow config — setup and connection management
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { checkConnection, getBaseUrl, getDefaultProject, resolveProject } from '../client.js'
import * as out from '../output.js'

const CONFIG_PATH = join(homedir(), '.config', 'storyflow', 'config.json')

function readConfig() {
  if (!existsSync(CONFIG_PATH)) return {}
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function writeConfig(config) {
  mkdirSync(dirname(CONFIG_PATH), { recursive: true })
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n')
}

export function register(program) {
  const config = program.command('config').description('Configure StoryFlow connection')

  config
    .command('set-url <url>')
    .description('Set the StoryFlow server URL')
    .action((url) => {
      const cfg = readConfig()
      cfg.url = url.replace(/\/+$/, '')
      writeConfig(cfg)
      out.success(`URL set to ${cfg.url}`)
    })

  config
    .command('set-token <token>')
    .description('Set the auth token')
    .action((token) => {
      const cfg = readConfig()
      cfg.token = token
      writeConfig(cfg)
      out.success('Token saved')
    })

  config
    .command('set-default <project>')
    .description('Set the default project (name, prefix, or UUID)')
    .action(async (project) => {
      // Resolve to UUID to validate it exists
      const id = await resolveProject(project)
      const cfg = readConfig()
      cfg.defaultProject = id
      writeConfig(cfg)
      out.success(`Default project set to ${id}`)
    })

  config
    .command('show')
    .description('Show current configuration')
    .action(() => {
      const url = getBaseUrl()
      const cfg = readConfig()
      const def = getDefaultProject()
      out.heading('StoryFlow Config')
      out.kv('URL', url || '(not set)')
      out.kv('Token', cfg.token ? '****' + cfg.token.slice(-4) : '(not set)')
      out.kv('Default project', def || '(not set)')
      out.kv('Config file', CONFIG_PATH)
    })

  // Top-level status command
  program
    .command('status')
    .description('Check StoryFlow connection and server status')
    .action(async () => {
      const result = await checkConnection()
      if (result.connected) {
        out.success(`Connected to ${result.url}`)
        out.kv('Projects', result.projectCount)
      } else {
        out.error(`Not connected: ${result.error}`)
        if (result.url) out.kv('URL', result.url)
        else out.info('Run: storyflow config set-url <url>')
      }
    })
}
