// ---------------------------------------------------------------------------
// Express routes that expose gitnexus-client capabilities over REST so the
// browser bundle never imports the Node-only client directly.
// ---------------------------------------------------------------------------

import express from 'express'
import { getGitNexusClient } from './codeIntelligence.js'

function sanitizeError(err) {
  // Do not leak internals — keep the message short and generic.
  const msg = err && typeof err.message === 'string' ? err.message : 'unknown error'
  return msg.length > 200 ? `${msg.slice(0, 200)}...` : msg
}

function requireClient(res) {
  const client = getGitNexusClient()
  if (!client) {
    res.status(503).json({ error: 'code-intelligence-not-enabled' })
    return null
  }
  return client
}

/**
 * Build an Express router exposing the code-intelligence HTTP surface.
 *
 * Routes:
 *   GET  /health   → `{ status: 'ok' | 'down' }`
 *   POST /impact   → proxies `client.impact({ symbol?, file? })`
 *   POST /search   → proxies `client.search(query, { topK })`
 *   GET  /clusters → proxies `client.listClusters()`
 *   POST /query    → proxies `client.queryGraph(cypher)`
 *   GET  /changes  → proxies `client.detectChanges()`
 *
 * Every handler returns 503 if the client is not running and 500 on
 * client errors with a sanitized message.
 *
 * @returns {import('express').Router}
 */
export function createCodeIntelligenceRouter() {
  const router = express.Router()

  router.get('/health', (_req, res) => {
    const client = getGitNexusClient()
    if (!client) return res.json({ status: 'down' })
    return res.json({ status: 'ok' })
  })

  router.post('/impact', async (req, res) => {
    const client = requireClient(res)
    if (!client) return
    try {
      const { symbol, file } = req.body || {}
      const result = await client.impact({ symbol, file })
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: sanitizeError(err) })
    }
  })

  router.post('/search', async (req, res) => {
    const client = requireClient(res)
    if (!client) return
    try {
      const { query, topK } = req.body || {}
      const result = await client.search(query, { topK })
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: sanitizeError(err) })
    }
  })

  router.get('/clusters', async (_req, res) => {
    const client = requireClient(res)
    if (!client) return
    try {
      const result = await client.listClusters()
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: sanitizeError(err) })
    }
  })

  router.post('/query', async (req, res) => {
    const client = requireClient(res)
    if (!client) return
    try {
      const { cypher } = req.body || {}
      const result = await client.queryGraph(cypher)
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: sanitizeError(err) })
    }
  })

  router.get('/changes', async (_req, res) => {
    const client = requireClient(res)
    if (!client) return
    try {
      const result = await client.detectChanges()
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: sanitizeError(err) })
    }
  })

  return router
}
