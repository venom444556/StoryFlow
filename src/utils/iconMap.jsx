import {
  FileText,
  Pencil,
  Wrench,
  ClipboardList,
  Globe,
  RefreshCw,
  Building,
  Database,
  Bot,
  Shield,
  Brain,
  Rocket,
  BookOpen,
  BarChart3,
  Target,
  Layers,
  File,
} from 'lucide-react'

const ICON_MAP = {
  'file-text': FileText,
  pencil: Pencil,
  wrench: Wrench,
  'clipboard-list': ClipboardList,
  globe: Globe,
  'refresh-cw': RefreshCw,
  building: Building,
  database: Database,
  bot: Bot,
  shield: Shield,
  brain: Brain,
  rocket: Rocket,
  'book-open': BookOpen,
  'bar-chart-3': BarChart3,
  target: Target,
  layers: Layers,
}

export function PageIcon({ name, size = 16, className = '' }) {
  const Icon = ICON_MAP[name] || File
  return <Icon size={size} className={className} />
}

export { ICON_MAP }
