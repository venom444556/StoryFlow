import { useCallback } from 'react'
import { FileText, Cpu, Target } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Input from '../ui/Input'
import TagInput from '../ui/TagInput'
import { ActivityPanel } from '../activity'

const TECH_SUGGESTIONS = [
  'React',
  'Vue',
  'Angular',
  'Next.js',
  'Remix',
  'Node.js',
  'Express',
  'Fastify',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Prisma',
  'Tailwind CSS',
  'TypeScript',
  'GraphQL',
  'Docker',
  'AWS',
  'Vercel',
  'Supabase',
  'Firebase',
  'Vite',
  'Framer Motion',
]

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {Icon && <Icon size={16} style={{ color: 'var(--accent-active, #8b5cf6)' }} />}
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
        {children}
      </h3>
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  className = '',
}) {
  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {label && (
        <label className="mb-1.5 block text-sm text-[var(--color-fg-muted)]">{label}</label>
      )}
      <textarea
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="glass-input w-full resize-none px-3 py-2 text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)]"
      />
    </div>
  )
}

export default function OverviewTab({ project, onUpdate }) {
  const overview = project?.overview || {}

  const handleFieldChange = useCallback(
    (field) => (e) => {
      onUpdate({
        overview: { ...project.overview, [field]: e.target.value },
      })
    },
    [project?.overview, onUpdate]
  )

  const handleTopLevelChange = useCallback(
    (field) => (e) => {
      onUpdate({ [field]: e.target.value })
    },
    [onUpdate]
  )

  const handleTechStackChange = useCallback(
    (tags) => {
      onUpdate({ techStack: tags })
    },
    [onUpdate]
  )

  if (!project) return null

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Project Details */}
      <GlassCard>
        <SectionTitle icon={FileText}>Project Details</SectionTitle>
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={project.name || ''}
            onChange={handleTopLevelChange('name')}
            placeholder="Enter project name"
          />
          <TextArea
            label="Description"
            value={project.description || ''}
            onChange={handleTopLevelChange('description')}
            placeholder="Describe what this project is about..."
            rows={3}
          />
        </div>
      </GlassCard>

      {/* Tech Stack */}
      <GlassCard>
        <SectionTitle icon={Cpu}>Tech Stack</SectionTitle>
        <TagInput
          tags={project.techStack || []}
          onChange={handleTechStackChange}
          placeholder="Add technology (e.g. React, Node.js)"
          suggestions={TECH_SUGGESTIONS}
        />
      </GlassCard>

      {/* Goals & Scope */}
      <GlassCard>
        <SectionTitle icon={Target}>Goals & Scope</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <TextArea
            label="Goals"
            value={overview.goals || ''}
            onChange={handleFieldChange('goals')}
            placeholder="What are the main goals of this project?"
            rows={5}
          />
          <TextArea
            label="Constraints"
            value={overview.constraints || ''}
            onChange={handleFieldChange('constraints')}
            placeholder="Any limitations or constraints to keep in mind?"
            rows={5}
          />
        </div>
        <div className="mt-4">
          <TextArea
            label="Target Audience"
            value={overview.targetAudience || ''}
            onChange={handleFieldChange('targetAudience')}
            placeholder="Who is this project for?"
            rows={3}
          />
        </div>
      </GlassCard>

      {/* Recent Activity */}
      <ActivityPanel projectId={project.id} limit={10} />
    </div>
  )
}
