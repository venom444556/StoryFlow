import {
  FileText,
  Box,
  Anchor,
  Wrench,
  Orbit,
  Globe,
  Server,
  Database,
} from 'lucide-react'

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
export const TYPE_HEX_COLORS = {
  page: '#3b82f6',
  component: '#8b5cf6',
  hook: '#06b6d4',
  util: '#eab308',
  context: '#22c55e',
  api: '#ef4444',
  service: '#ec4899',
  model: '#6b7280',
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
