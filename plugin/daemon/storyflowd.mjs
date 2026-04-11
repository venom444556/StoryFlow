#!/usr/bin/env node
// StoryFlow background agent daemon.
// Long-running process launched on SessionStart. Consumes signals from hooks
// and git activity, performs PM work autonomously via the storyflow CLI.
// Never injects prompts into Claude. Never blocks a turn. Silent by design.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, appendFileSync, writeFileSync, readFileSync, statSync, watch } from 'node:fs';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { homedir } from 'node:os';

const ROOT = '/tmp/storyflow';
const SIGNAL_LOG = join(ROOT, 'signals.log');
const DAEMON_LOG = join(ROOT, 'daemon.log');
const PID_FILE = join(ROOT, 'storyflowd.pid');
const BOOT_CONTEXT = join(ROOT, 'boot-context.txt');
const STATE_FILE = join(ROOT, 'daemon-state.json');

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const DEBOUNCE_MS = 2000;
const HEARTBEAT_MS = 30 * 1000;

mkdirSync(ROOT, { recursive: true });

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { appendFileSync(DAEMON_LOG, line); } catch {}
}

function loadState() {
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); }
  catch { return { startedAt: Date.now(), lastTurnAt: Date.now(), filesEdited: [], commitsSeen: [], issuesTouched: [], sessionSaved: false }; }
}

function saveState(state) {
  try { writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); } catch {}
}

function cliAvailable() {
  const r = spawnSync('storyflow', ['status'], { stdio: 'ignore' });
  return r.status === 0;
}

function cli(args, opts = {}) {
  return spawnSync('storyflow', args, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', ...opts });
}

function alreadyRunning() {
  if (!existsSync(PID_FILE)) return false;
  try {
    const pid = parseInt(readFileSync(PID_FILE, 'utf8'), 10);
    if (!pid) return false;
    process.kill(pid, 0);
    return pid !== process.pid;
  } catch { return false; }
}

if (alreadyRunning()) {
  log(`Daemon already running (pid ${readFileSync(PID_FILE, 'utf8').trim()}). Exiting.`);
  process.exit(0);
}

writeFileSync(PID_FILE, String(process.pid));
log(`Daemon started pid=${process.pid}`);

const state = loadState();

async function refreshBootContext() {
  if (!cliAvailable()) return;
  const ctx = cli(['context', 'boot', '--json']);
  if (ctx.status === 0 && ctx.stdout) {
    try { writeFileSync(BOOT_CONTEXT, ctx.stdout); log('Boot context refreshed'); } catch {}
  }
  cli(['ai-status', 'set', 'working']);
}

function templateSummary() {
  const durationMin = Math.round((Date.now() - state.startedAt) / 60000);
  const parts = [];
  parts.push(`Autonomous session record. Duration ${durationMin}m.`);
  if (state.filesEdited.length) parts.push(`Files touched: ${state.filesEdited.length} (${[...new Set(state.filesEdited)].slice(0, 10).join(', ')}).`);
  if (state.commitsSeen.length) parts.push(`Commits: ${state.commitsSeen.length}.`);
  if (state.issuesTouched.length) parts.push(`Issues auto-closed: ${[...new Set(state.issuesTouched)].join(', ')}.`);
  if (!state.filesEdited.length && !state.commitsSeen.length) parts.push('No code changes detected — likely planning or discussion session.');
  return parts.join(' ');
}

function saveSessionOnce(reason) {
  if (state.sessionSaved || !cliAvailable()) return;
  const summary = templateSummary();
  const nextSteps = 'Daemon-generated record. Refine in next session if needed.';
  const keyDecisions = 'None recorded — daemon autonomous save.';
  const r = cli(['sessions', 'save', '--summary', summary, '--next-steps', nextSteps, '--key-decisions', keyDecisions]);
  if (r.status === 0) {
    state.sessionSaved = true;
    saveState(state);
    log(`Session saved autonomously (${reason})`);
  } else {
    log(`Session save failed (${reason}): ${r.stderr}`);
  }
}

function handleCommit(payload) {
  const keys = (payload.issueKeys || []).filter(Boolean);
  for (const key of keys) {
    const r = cli(['issues', 'done', key]);
    if (r.status === 0) {
      state.issuesTouched.push(key);
      log(`Auto-closed ${key} from commit`);
    }
  }
  state.commitsSeen.push({ sha: payload.sha || null, at: Date.now() });
  saveState(state);
}

function handleFileEdit(payload) {
  if (payload.file) state.filesEdited.push(payload.file);
  state.lastTurnAt = Date.now();
  saveState(state);
}

function handleTurnStop() {
  state.lastTurnAt = Date.now();
  saveState(state);
}

function handleSessionStart() {
  state.lastTurnAt = Date.now();
  state.sessionSaved = false;
  saveState(state);
  refreshBootContext();
}

let debounceTimer = null;
function scheduleProcess() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(processPending, DEBOUNCE_MS);
}

const pending = [];
function processPending() {
  while (pending.length) {
    const ev = pending.shift();
    try {
      switch (ev.type) {
        case 'session-start': handleSessionStart(); break;
        case 'file-edit': handleFileEdit(ev); break;
        case 'git-commit': handleCommit(ev); break;
        case 'turn-stop': handleTurnStop(); break;
        default: log(`Unknown event: ${ev.type}`);
      }
    } catch (e) {
      log(`Event handler error: ${e.message}`);
    }
  }
}

let signalOffset = 0;
function tailSignals() {
  if (!existsSync(SIGNAL_LOG)) return;
  const stat = statSync(SIGNAL_LOG);
  if (stat.size <= signalOffset) return;
  const stream = createReadStream(SIGNAL_LOG, { start: signalOffset, end: stat.size });
  const rl = createInterface({ input: stream });
  rl.on('line', (line) => {
    if (!line.trim()) return;
    try { pending.push(JSON.parse(line)); } catch { log(`Bad signal line: ${line}`); }
  });
  rl.on('close', () => {
    signalOffset = stat.size;
    scheduleProcess();
  });
}

if (existsSync(SIGNAL_LOG)) {
  signalOffset = statSync(SIGNAL_LOG).size;
  watch(SIGNAL_LOG, { persistent: false }, () => tailSignals());
} else {
  writeFileSync(SIGNAL_LOG, '');
  watch(SIGNAL_LOG, { persistent: false }, () => tailSignals());
}

setInterval(() => {
  const idleMs = Date.now() - state.lastTurnAt;
  if (idleMs > IDLE_TIMEOUT_MS && !state.sessionSaved) {
    saveSessionOnce('idle-timeout');
    cli(['ai-status', 'set', 'idle']);
    log('Daemon exiting after idle timeout');
    cleanup();
    process.exit(0);
  }
}, HEARTBEAT_MS);

function cleanup() {
  try {
    if (existsSync(PID_FILE) && parseInt(readFileSync(PID_FILE, 'utf8'), 10) === process.pid) {
      writeFileSync(PID_FILE, '');
    }
  } catch {}
}

process.on('SIGTERM', () => { saveSessionOnce('sigterm'); cli(['ai-status', 'set', 'idle']); cleanup(); process.exit(0); });
process.on('SIGINT', () => { saveSessionOnce('sigint'); cli(['ai-status', 'set', 'idle']); cleanup(); process.exit(0); });

refreshBootContext();
tailSignals();
log('Daemon ready');
