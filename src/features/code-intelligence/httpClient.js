/**
 * Browser-side fetch proxy that mimics a minimal GitNexusClient interface.
 *
 * The real `gitnexus-client` package spawns a child process and cannot run in
 * the browser bundle. This proxy implements just the subset of the interface
 * that the feature module and symbol-resolver actually call, shuttling
 * requests over HTTP to server endpoints backed by the real client.
 *
 * Only `search`, `impact`, `listClusters`, `detectChanges`, and `queryGraph`
 * make sense over HTTP. `start`/`stop` are stubbed (server manages lifecycle),
 * and `health` pings a status endpoint.
 *
 * @param {{ baseUrl?: string }} [opts]
 * @returns {{
 *   start: () => Promise<void>,
 *   stop: () => Promise<void>,
 *   health: () => Promise<string>,
 *   search: (query: string, opts?: { topK?: number }) => Promise<any>,
 *   impact: (args: { symbol?: string, file?: string }) => Promise<any>,
 *   listClusters: () => Promise<any[]>,
 *   detectChanges: () => Promise<any>,
 *   queryGraph: (cypher: string) => Promise<any>,
 * }}
 */
export function createHttpGitNexusProxy(opts = {}) {
  const baseUrl = typeof opts.baseUrl === 'string' ? opts.baseUrl : ''
  const prefix = `${baseUrl}/api/code-intelligence`

  async function request(method, path, body) {
    const init = {
      method,
      headers: { Accept: 'application/json' },
    }
    if (body !== undefined) {
      init.headers['Content-Type'] = 'application/json'
      init.body = JSON.stringify(body)
    }
    const res = await fetch(`${prefix}${path}`, init)
    if (!res.ok) {
      let detail = ''
      try {
        const payload = await res.text()
        detail = payload ? `: ${payload}` : ''
      } catch {
        /* ignore */
      }
      throw new Error(
        `code-intelligence HTTP ${res.status} ${res.statusText} for ${method} ${path}${detail}`
      )
    }
    // 204 or empty body -> return null
    const text = await res.text()
    if (!text) return null
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  return {
    async start() {
      /* server manages lifecycle */
    },
    async stop() {
      /* server manages lifecycle */
    },
    async health() {
      try {
        const result = await request('GET', '/health')
        if (result && typeof result === 'object' && result.status === 'ok') return 'ok'
        return 'down'
      } catch {
        return 'down'
      }
    },
    async search(query, { topK } = {}) {
      return request('POST', '/search', { query, topK })
    },
    async impact({ symbol, file } = {}) {
      return request('POST', '/impact', { symbol, file })
    },
    async listClusters() {
      const result = await request('GET', '/clusters')
      return Array.isArray(result) ? result : []
    },
    async detectChanges() {
      return request('GET', '/changes')
    },
    async queryGraph(cypher) {
      return request('POST', '/query', { cypher })
    },
  }
}
