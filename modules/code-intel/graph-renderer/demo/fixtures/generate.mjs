#!/usr/bin/env node
/**
 * Deterministic fixture generator. Commits three JSON graphs under
 * demo/fixtures/. Uses a seeded PRNG so output is stable across runs.
 *
 * Usage:  node demo/fixtures/generate.mjs
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLUSTER_NAMES = [
  'core',
  'auth',
  'api',
  'ui',
  'db',
  'agents',
  'workers',
  'hooks',
  'ingest',
  'bridge',
];

const FOLDERS_BY_CLUSTER = {
  core: ['src/core', 'src/core/util', 'src/core/types'],
  auth: ['src/auth', 'src/auth/middleware'],
  api: ['server/api', 'server/api/routes'],
  ui: ['src/components', 'src/components/board', 'src/components/wiki'],
  db: ['server/db', 'server/db/migrations'],
  agents: ['agents', 'agents/claude', 'agents/worker'],
  workers: ['workers', 'workers/queue'],
  hooks: ['plugin/hooks'],
  ingest: ['ingest', 'ingest/parsers'],
  bridge: ['bridge', 'bridge/mcp'],
};

function fileFor(rand, cluster, i) {
  const folders = FOLDERS_BY_CLUSTER[cluster] || ['src'];
  const folder = folders[Math.floor(rand() * folders.length)];
  return `${folder}/file_${i}.js`;
}

function symbolName(cluster, i) {
  const verbs = ['handle', 'load', 'build', 'parse', 'sync', 'emit', 'resolve', 'apply', 'fetch'];
  const nouns = ['Request', 'State', 'Event', 'Token', 'Payload', 'Config', 'Session', 'Node'];
  const verb = verbs[i % verbs.length];
  const noun = nouns[(i * 3) % nouns.length];
  return `${cluster}.${verb}${noun}`;
}

function generate({ nodeCount, edgeCount, clusterCount, seed, filename }) {
  const rand = mulberry32(seed);
  const usedClusters = CLUSTER_NAMES.slice(0, clusterCount);
  const clusterSymbols = new Map(usedClusters.map((c) => [c, []]));
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    const cluster = usedClusters[Math.floor(rand() * clusterCount)];
    const name = symbolName(cluster, i);
    const file = fileFor(rand, cluster, i);
    const id = `n${i}`;
    const node = {
      id,
      label: name.split('.').pop(),
      clusterId: cluster,
      symbol: { name, file, kind: 'function', line: 1 + Math.floor(rand() * 400) },
    };
    nodes.push(node);
    clusterSymbols.get(cluster).push(node.symbol);
  }

  const edges = [];
  const seen = new Set();
  // Intra-cluster bias first to make visible communities.
  const byCluster = new Map();
  for (const n of nodes) {
    if (!byCluster.has(n.clusterId)) byCluster.set(n.clusterId, []);
    byCluster.get(n.clusterId).push(n);
  }
  let attempts = 0;
  while (edges.length < edgeCount && attempts < edgeCount * 20) {
    attempts++;
    const intra = rand() < 0.7;
    let a, b;
    if (intra) {
      const cluster = usedClusters[Math.floor(rand() * clusterCount)];
      const pool = byCluster.get(cluster);
      if (!pool || pool.length < 2) continue;
      a = pool[Math.floor(rand() * pool.length)];
      b = pool[Math.floor(rand() * pool.length)];
    } else {
      a = nodes[Math.floor(rand() * nodes.length)];
      b = nodes[Math.floor(rand() * nodes.length)];
    }
    if (a.id === b.id) continue;
    const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push({ source: a.id, target: b.id, weight: 1 + Math.floor(rand() * 3) });
  }

  const clusters = usedClusters.map((c) => ({
    id: c,
    name: c,
    symbols: clusterSymbols.get(c),
    callsiteCount: clusterSymbols.get(c).length * 2,
  }));

  const out = { nodes, edges, clusters };
  const path = resolve(here, filename);
  writeFileSync(path, JSON.stringify(out, null, 2));
  console.log(`wrote ${filename}: ${nodes.length} nodes / ${edges.length} edges / ${clusters.length} clusters`);
}

generate({ nodeCount: 10, edgeCount: 12, clusterCount: 2, seed: 1, filename: 'small.json' });
generate({ nodeCount: 100, edgeCount: 200, clusterCount: 6, seed: 42, filename: 'medium.json' });
generate({ nodeCount: 300, edgeCount: 600, clusterCount: 10, seed: 1337, filename: 'large.json' });
