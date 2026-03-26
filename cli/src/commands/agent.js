// ---------------------------------------------------------------------------
// storyflow agent — StoryFlow Agent care package lifecycle
// ---------------------------------------------------------------------------

import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  chmodSync,
} from 'node:fs'
import { join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import {
  checkConnection,
  resolveProject,
  operational,
  isConfigured,
  getBaseUrl,
} from '../client.js'
import * as out from '../output.js'
import chalk from 'chalk'

const AGENT_DIR = 'agent'
const MEMORY_DB = join(AGENT_DIR, 'memory.db')
const CONFIG_FILE = join(AGENT_DIR, 'config.json')

export function register(program) {
  const cmd = program.command('agent').description('StoryFlow Agent care package lifecycle')

  // ---- agent init ----
  cmd
    .command('init')
    .description('Initialize the StoryFlow Agent package in the current directory')
    .option('--force', 'Overwrite existing files')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const result = initAgent(opts.force)
      if (opts.json) return out.json(result)

      if (result.alreadyExists && !opts.force) {
        out.info('Agent package already exists. Use --force to reinitialize.')
        return
      }
      out.success('Agent package initialized')
      for (const f of result.created) {
        console.log(chalk.gray(`  + ${f}`))
      }
      console.log()
      console.log(chalk.cyan('  Next steps:'))
      console.log(chalk.gray('    1. storyflow agent doctor    — check connectivity'))
      console.log(chalk.gray('    2. storyflow agent install-hooks — wire session hooks'))
    })

  // ---- agent doctor ----
  cmd
    .command('doctor')
    .description('Run diagnostics on StoryFlow Agent readiness')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const checks = await runDoctor()
      if (opts.json) return out.json(checks)

      out.heading('Agent Doctor')
      let allPass = true
      for (const check of checks.checks) {
        const icon = check.pass ? chalk.green('✓') : chalk.red('✗')
        console.log(`  ${icon} ${check.name}`)
        if (!check.pass) {
          allPass = false
          if (check.fix) console.log(chalk.yellow(`    fix: ${check.fix}`))
          if (check.detail) console.log(chalk.gray(`    ${check.detail}`))
        }
      }
      console.log()
      if (allPass) {
        out.success('All checks passed — agent is ready')
      } else {
        out.warn(`${checks.failCount} check(s) failed`)
      }
    })

  // ---- agent install-hooks ----
  cmd
    .command('install-hooks')
    .description('Install or refresh StoryFlow Agent hooks')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const result = installHooks()
      if (opts.json) return out.json(result)

      if (result.error) {
        out.error(result.error)
        return
      }
      out.success(`Installed ${result.installed.length} hook(s)`)
      for (const h of result.installed) {
        console.log(chalk.gray(`  + ${h}`))
      }
    })

  // ---- agent status ----
  cmd
    .command('status')
    .description('Show StoryFlow Agent package status')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const status = getAgentStatus()
      if (opts.json) return out.json(status)

      out.heading('Agent Status')
      console.log(
        `  Package: ${status.packagePresent ? chalk.green('installed') : chalk.red('not found')}`
      )
      console.log(
        `  Memory DB: ${status.memoryDbPresent ? chalk.green('present') : chalk.yellow('missing')}`
      )
      console.log(
        `  Config: ${status.configPresent ? chalk.green('present') : chalk.yellow('missing')}`
      )
      console.log(`  Hooks: ${status.hookCount} file(s) in agent/hooks/`)
      console.log(`  KB: ${status.kbCount} file(s) in agent/kb/`)
      if (status.config) {
        console.log()
        console.log(chalk.gray(`  Created: ${status.config.createdAt || 'unknown'}`))
      }
    })
}

// ---------------------------------------------------------------------------
// Init — scaffold the agent package
// ---------------------------------------------------------------------------

function initAgent(force = false) {
  const exists = existsSync(AGENT_DIR)
  if (exists && !force) {
    return { alreadyExists: true, created: [] }
  }

  const created = []

  // Create directory structure
  for (const dir of [
    AGENT_DIR,
    join(AGENT_DIR, 'hooks'),
    join(AGENT_DIR, 'kb'),
    join(AGENT_DIR, 'kb', 'core'),
    join(AGENT_DIR, 'kb', 'runtime'),
    join(AGENT_DIR, 'state'),
  ]) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
      created.push(dir + '/')
    }
  }

  // CLAUDE.md — agent identity and operating rules
  writeFileSync(join(AGENT_DIR, 'CLAUDE.md'), CLAUDE_MD_CONTENT)
  created.push('agent/CLAUDE.md')

  // SKILL.md — CLI reference
  writeFileSync(join(AGENT_DIR, 'SKILL.md'), SKILL_MD_CONTENT)
  created.push('agent/SKILL.md')

  // config.json
  const config = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    hooks: {
      sessionStart: 'hooks/session-start.sh',
      sessionStop: 'hooks/session-stop.sh',
      preMutation: 'hooks/pre-mutation.sh',
      postMutation: 'hooks/post-mutation.sh',
    },
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
  created.push('agent/config.json')

  // Hook scripts
  writeHook('session-start.sh', SESSION_START_HOOK)
  created.push('agent/hooks/session-start.sh')

  writeHook('session-stop.sh', SESSION_STOP_HOOK)
  created.push('agent/hooks/session-stop.sh')

  writeHook('pre-mutation.sh', PRE_MUTATION_HOOK)
  created.push('agent/hooks/pre-mutation.sh')

  writeHook('post-mutation.sh', POST_MUTATION_HOOK)
  created.push('agent/hooks/post-mutation.sh')

  // memory.db
  createMemoryDb()
  created.push('agent/memory.db')

  // state files
  writeFileSync(join(AGENT_DIR, 'state', 'session.json'), '{}')
  created.push('agent/state/session.json')
  writeFileSync(join(AGENT_DIR, 'state', 'doctor.json'), '{}')
  created.push('agent/state/doctor.json')

  // .gitignore for runtime files
  writeFileSync(join(AGENT_DIR, '.gitignore'), 'memory.db\nstate/\nkb/runtime/\n')
  created.push('agent/.gitignore')

  return { alreadyExists: false, created }
}

function writeHook(name, content) {
  const path = join(AGENT_DIR, 'hooks', name)
  writeFileSync(path, content)
  chmodSync(path, 0o755)
}

function createMemoryDb() {
  try {
    execFileSync(
      'sqlite3',
      [
        MEMORY_DB,
        `CREATE TABLE IF NOT EXISTS memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts DATETIME DEFAULT CURRENT_TIMESTAMP,
        session_id TEXT,
        type TEXT NOT NULL,
        scope TEXT,
        ref TEXT,
        content TEXT NOT NULL,
        confidence REAL,
        source TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_memory_type ON memory(type);
      CREATE INDEX IF NOT EXISTS idx_memory_session ON memory(session_id);
      CREATE INDEX IF NOT EXISTS idx_memory_ref ON memory(ref);`,
      ],
      { stdio: 'pipe' }
    )
  } catch {
    // sqlite3 CLI not available — create empty file as placeholder
    writeFileSync(MEMORY_DB, '')
  }
}

// ---------------------------------------------------------------------------
// Doctor — run diagnostics
// ---------------------------------------------------------------------------

async function runDoctor() {
  const checks = []

  // 1. StoryFlow server connectivity
  try {
    const conn = await checkConnection()
    checks.push({
      name: 'StoryFlow server connectivity',
      pass: conn.connected,
      detail: conn.connected ? `Connected to ${conn.url}` : conn.error,
      fix: conn.connected ? null : 'Run: storyflow config set-url http://localhost:3001',
    })
  } catch (e) {
    checks.push({
      name: 'StoryFlow server connectivity',
      pass: false,
      detail: e.message,
      fix: 'Start the StoryFlow server',
    })
  }

  // 2. CLI configuration
  const configured = isConfigured()
  checks.push({
    name: 'CLI configuration',
    pass: configured,
    detail: configured ? `URL: ${getBaseUrl()}` : 'No URL configured',
    fix: configured ? null : 'Run: storyflow config set-url <url>',
  })

  // 3. Default project resolution
  let projectResolved = false
  try {
    const pid = await resolveProject()
    projectResolved = !!pid
    checks.push({ name: 'Default project resolution', pass: true, detail: `Project: ${pid}` })
  } catch {
    checks.push({
      name: 'Default project resolution',
      pass: false,
      fix: 'Run: storyflow config set-default <project>',
    })
  }

  // 4. Context boot health
  if (projectResolved) {
    try {
      const pid = await resolveProject()
      const ctx = await operational.boot(pid)
      checks.push({
        name: 'Context boot health',
        pass: !!ctx?.project,
        detail: ctx?.project ? `Project: ${ctx.project.name}` : 'Boot returned empty',
      })
    } catch (e) {
      checks.push({ name: 'Context boot health', pass: false, detail: e.message })
    }
  } else {
    checks.push({
      name: 'Context boot health',
      pass: false,
      detail: 'Skipped — no default project',
    })
  }

  // 5. Agent package presence
  const pkgPresent = existsSync(AGENT_DIR) && existsSync(join(AGENT_DIR, 'CLAUDE.md'))
  checks.push({
    name: 'Agent package present',
    pass: pkgPresent,
    detail: pkgPresent ? `Found at ${resolve(AGENT_DIR)}` : 'agent/ directory missing',
    fix: pkgPresent ? null : 'Run: storyflow agent init',
  })

  // 6. memory.db presence
  const memPresent = existsSync(MEMORY_DB)
  checks.push({
    name: 'Memory DB',
    pass: memPresent,
    detail: memPresent ? 'Present' : 'Not found',
    fix: memPresent ? null : 'Run: storyflow agent init',
  })

  // 7. Hook files present
  const hooksDir = join(AGENT_DIR, 'hooks')
  let hookCount = 0
  if (existsSync(hooksDir)) {
    hookCount = readdirSync(hooksDir).filter((f) => f.endsWith('.sh')).length
  }
  checks.push({
    name: 'Hook files present',
    pass: hookCount > 0,
    detail: hookCount > 0 ? `${hookCount} hook(s)` : 'No hooks found',
    fix: hookCount > 0 ? null : 'Run: storyflow agent init',
  })

  // 8. Hooks installed (settings.local.json has hook entries)
  const settingsPath = join('.claude', 'settings.local.json')
  let hooksInstalled = false
  if (existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(readFileSync(settingsPath, 'utf-8'))
      hooksInstalled = !!settings.hooks && Object.keys(settings.hooks).length > 0
    } catch {
      /* corrupt */
    }
  }
  checks.push({
    name: 'Hooks installed',
    pass: hooksInstalled,
    detail: hooksInstalled ? 'Registered in .claude/settings.local.json' : 'Not installed',
    fix: hooksInstalled ? null : 'Run: storyflow agent install-hooks',
  })

  const failCount = checks.filter((c) => !c.pass).length

  // Save doctor results
  const stateDir = join(AGENT_DIR, 'state')
  if (existsSync(stateDir)) {
    writeFileSync(
      join(stateDir, 'doctor.json'),
      JSON.stringify({ checks, failCount, timestamp: new Date().toISOString() }, null, 2)
    )
  }

  return { checks, failCount, timestamp: new Date().toISOString() }
}

// ---------------------------------------------------------------------------
// Install hooks — real install path: chmod + settings.local.json + manifest
// ---------------------------------------------------------------------------

function installHooks() {
  const hooksDir = join(AGENT_DIR, 'hooks')
  if (!existsSync(hooksDir)) {
    return { installed: [], error: 'agent/hooks/ not found. Run: storyflow agent init' }
  }

  const installed = []
  const files = readdirSync(hooksDir).filter((f) => f.endsWith('.sh'))
  const absHooksDir = resolve(hooksDir)

  // 1. Make hooks executable
  for (const file of files) {
    chmodSync(join(hooksDir, file), 0o755)
    installed.push(file)
  }

  // 2. Write/update .claude/settings.local.json with hook entries
  const claudeDir = '.claude'
  if (!existsSync(claudeDir)) mkdirSync(claudeDir, { recursive: true })

  const settingsPath = join(claudeDir, 'settings.local.json')
  let settings = {}
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf-8'))
    } catch {
      settings = {}
    }
  }

  // Build hook config entries from agent package hooks
  const hookConfig = {}

  if (files.includes('session-start.sh')) {
    hookConfig.SessionStart = [
      {
        matcher: '*',
        hooks: [
          {
            type: 'command',
            command: `bash ${join(absHooksDir, 'session-start.sh')}`,
            timeout: 15,
          },
        ],
      },
    ]
  }
  if (files.includes('pre-mutation.sh')) {
    hookConfig.PreToolUse = [
      {
        matcher: 'Bash',
        hooks: [
          { type: 'command', command: `bash ${join(absHooksDir, 'pre-mutation.sh')}`, timeout: 10 },
        ],
      },
    ]
  }
  if (files.includes('post-mutation.sh')) {
    hookConfig.PostToolUse = [
      {
        matcher: 'Bash',
        hooks: [
          {
            type: 'command',
            command: `bash ${join(absHooksDir, 'post-mutation.sh')}`,
            timeout: 10,
          },
        ],
      },
    ]
  }
  if (files.includes('session-stop.sh')) {
    hookConfig.Stop = [
      {
        matcher: '*',
        hooks: [
          { type: 'command', command: `bash ${join(absHooksDir, 'session-stop.sh')}`, timeout: 5 },
        ],
      },
    ]
  }

  settings.hooks = hookConfig
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
  installed.push('.claude/settings.local.json')

  // 3. Write manifest for programmatic discovery
  const manifest = {
    description: 'StoryFlow Agent hooks — installed',
    installedAt: new Date().toISOString(),
    settingsPath: resolve(settingsPath),
    hooks: Object.fromEntries(
      Object.entries(hookConfig).map(([event, entries]) => [
        event,
        entries[0]?.hooks?.[0]?.command || null,
      ])
    ),
  }
  writeFileSync(join(hooksDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
  installed.push('manifest.json')

  return { installed, settingsPath: resolve(settingsPath) }
}

// ---------------------------------------------------------------------------
// Status — quick package health check
// ---------------------------------------------------------------------------

function getAgentStatus() {
  const packagePresent = existsSync(AGENT_DIR) && existsSync(join(AGENT_DIR, 'CLAUDE.md'))
  const memoryDbPresent = existsSync(MEMORY_DB)
  const configPresent = existsSync(CONFIG_FILE)

  let config = null
  if (configPresent) {
    try {
      config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
    } catch {
      /* corrupt */
    }
  }

  let hookCount = 0
  const hooksDir = join(AGENT_DIR, 'hooks')
  if (existsSync(hooksDir)) {
    hookCount = readdirSync(hooksDir).filter((f) => f.endsWith('.sh')).length
  }

  let kbCount = 0
  const kbDir = join(AGENT_DIR, 'kb')
  if (existsSync(kbDir)) {
    const countFiles = (dir) => {
      let count = 0
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        try {
          if (statSync(full).isDirectory()) count += countFiles(full)
          else count++
        } catch {
          /* skip */
        }
      }
      return count
    }
    kbCount = countFiles(kbDir)
  }

  return { packagePresent, memoryDbPresent, configPresent, config, hookCount, kbCount }
}

// ---------------------------------------------------------------------------
// Template content — real content, not placeholders
// ---------------------------------------------------------------------------

const CLAUDE_MD_CONTENT = `# StoryFlow Agent

You are the StoryFlow Agent — an autonomous AI project manager that operates through the StoryFlow CLI.

## Identity

- You own: operating policy, boot behavior, session behavior, reconciliation, wiki discipline, lessons-learned discipline
- StoryFlow owns: durable project truth, query surfaces, write surfaces, event history, safety rails

## Operating Rules

1. Boot from \`storyflow context boot --json\` — never chain individual calls
2. CLI is your interface — one command = one operation
3. StoryFlow DB is canonical truth — local memory.db is cache only
4. Never fake lessons, never fabricate evidence
5. Surface failures honestly — do not silently degrade

## Boot Sequence

1. \`storyflow status\` — if offline, stop
2. \`storyflow context boot --json\` — project state, gates, directives, board, session, wiki audit, hygiene, lessons rollup
3. \`storyflow ai-status set working\`

## Session Close Sequence

1. \`storyflow sessions save --summary "..." --next-steps "..." --key-decisions "..." --work-done "..." --learnings "..."\`
2. \`storyflow issues batch-done <keys>\` — reconcile board
3. \`storyflow phases hot-wash generate <phase-ref>\` — if phase completed
4. \`storyflow phases hot-wash lessons --json\` — review project-level lessons rollup
5. \`storyflow pages audit --json\` then \`storyflow pages ensure-core\` — wiki accountability
6. \`storyflow ai-status set idle\`
`

const SKILL_MD_CONTENT = `# StoryFlow Agent Skills

All interaction through \`storyflow\` CLI. Every command supports \`--json\`.

## Core Primitives

| Command | Purpose |
|---------|---------|
| \`storyflow context boot --json\` | Single-call agent boot |
| \`storyflow search <query>\` | Cross-entity search |
| \`storyflow resolve <type> <ref>\` | Fuzzy entity resolution |
| \`storyflow issues batch-done <keys>\` | Mark multiple issues Done |
| \`storyflow sessions save ...\` | Save session with all fields |
| \`storyflow phases hot-wash generate\` | Generate phase retrospective |
| \`storyflow phases hot-wash lessons\` | Project-level lessons rollup |
| \`storyflow pages audit --json\` | Check wiki completeness |
| \`storyflow agent doctor --json\` | Self-diagnostics |

## Entity Types

Issues: epic, story, task, bug | Statuses: To Do, In Progress, Blocked, Done
Priorities: critical, high, medium, low | Points: Fibonacci (1,2,3,5,8,13)
Fields: \`storyPoints\` (not points), \`epicId\` (not parentId), comment \`body\` (not text)
`

const SESSION_START_HOOK = `#!/usr/bin/env bash
# StoryFlow Agent — session start hook
set -euo pipefail
cat > /dev/null

if ! command -v storyflow &>/dev/null; then echo "CLI not found"; exit 0; fi
if ! storyflow status &>/dev/null 2>&1; then echo "StoryFlow offline"; exit 0; fi

storyflow ai-status set working &>/dev/null 2>&1 || true
storyflow context boot --json 2>/dev/null || echo '{"error":"context boot failed"}'
exit 0
`

const SESSION_STOP_HOOK = `#!/usr/bin/env bash
# StoryFlow Agent — session stop hook
set -euo pipefail
cat > /dev/null
storyflow ai-status set idle &>/dev/null 2>&1 || true
exit 0
`

const PRE_MUTATION_HOOK = `#!/usr/bin/env bash
# StoryFlow Agent — pre-mutation gate check
set -euo pipefail
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -o 'git commit' 2>/dev/null) || COMMAND=""
if [ "$COMMAND" = "git commit" ]; then
  IN_PROGRESS=$(storyflow issues list -s "In Progress" --json 2>/dev/null | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
    items = d.get('issues', d) if isinstance(d, dict) else d
    print(len(items))
except:
    print(0)
" 2>/dev/null) || IN_PROGRESS="0"
  if [ "$IN_PROGRESS" = "0" ]; then
    echo "No issues In Progress. Create or move an issue to In Progress before committing."
    exit 2
  fi
fi
exit 0
`

const POST_MUTATION_HOOK = `#!/usr/bin/env bash
# StoryFlow Agent — post-mutation sync
set -euo pipefail
INPUT=$(cat)
COMMIT_MSG=$(echo "$INPUT" | grep -o 'git commit' 2>/dev/null) || COMMIT_MSG=""
if [ -n "$COMMIT_MSG" ]; then
  KEYS=$(git log --oneline -1 2>/dev/null | grep -oE '\\b[A-Z]{1,5}-[0-9]{1,4}\\b' | sort -u) || KEYS=""
  for key in $KEYS; do
    storyflow issues done "$key" 2>/dev/null && echo "AUTO: $key -> Done" || true
  done
fi
exit 0
`
