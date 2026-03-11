import { FileText, Box, Anchor, Wrench, Orbit, Globe, Server, Database } from 'lucide-react'

export const COMPONENT_TYPES = [
  { value: 'page', label: 'Page' },
  { value: 'component', label: 'Component' },
  { value: 'hook', label: 'Hook' },
  { value: 'util', label: 'Utility' },
  { value: 'context', label: 'Context' },
  { value: 'api', label: 'API' },
  { value: 'service', label: 'Service' },
  { value: 'model', label: 'Model' },
]

export const TYPE_COLORS = {
  page: 'blue',
  component: 'purple',
  hook: 'cyan',
  util: 'yellow',
  context: 'green',
  api: 'red',
  service: 'pink',
  model: 'gray',
}

// Hex colors for graph rendering (node color bars, edges)
// Tuned for Neptune charcoal palette — Tailwind 400-level for visibility without harshness
export const TYPE_HEX_COLORS = {
  page: '#60a5fa',
  component: '#a78bfa',
  hook: '#22d3ee',
  util: '#fbbf24',
  context: '#34d399',
  api: '#fb923c',
  service: '#f472b6',
  model: '#94a3b8',
}

export const TYPE_ICONS = {
  page: FileText,
  component: Box,
  hook: Anchor,
  util: Wrench,
  context: Orbit,
  api: Globe,
  service: Server,
  model: Database,
}
