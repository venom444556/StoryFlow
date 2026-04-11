import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import TextArea from '../ui/TextArea'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { useCodeIntelligence } from '../../features/code-intelligence'
import {
  createImpactAttachment,
  summarizeAttachment,
} from '../../features/code-intelligence/integrations/decisionAttachment'

const STATUS_OPTIONS = [
  { value: 'proposed', label: 'Proposed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'superseded', label: 'Superseded' },
]

const DEFAULT_FORM = {
  title: '',
  context: '',
  decision: '',
  status: 'proposed',
}

export default function DecisionForm({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [errors, setErrors] = useState({})
  // DecisionForm previously had no attachments — introduced an attachments
  // state array to host code-impact-report attachments from Code Intelligence.
  const [attachments, setAttachments] = useState([])
  const [attaching, setAttaching] = useState(false)
  const codeIntel = useCodeIntelligence()

  useEffect(() => {
    if (isOpen) {
      setForm(DEFAULT_FORM)
      setErrors({})
      setAttachments([])
    }
  }, [isOpen])

  const handleAttachCodeImpact = async () => {
    if (!codeIntel?.enabled || !codeIntel?.module) return
    // TODO: replace with a proper symbol search modal.
    const symbolName =
      typeof window !== 'undefined' && typeof window.prompt === 'function'
        ? window.prompt('Symbol to analyze (fully-qualified name):')
        : null
    if (!symbolName || !symbolName.trim()) return
    setAttaching(true)
    try {
      const reports = await codeIntel.module.analyzeSymbols([symbolName.trim()])
      const report = Array.isArray(reports) ? reports[0] : null
      if (!report) return
      const symbol = report.target || { name: symbolName.trim(), file: '' }
      const attachment = createImpactAttachment(symbol, report)
      setAttachments((prev) => [...prev, attachment])
    } finally {
      setAttaching(false)
    }
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Decision title is required'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    onSave({
      title: form.title.trim(),
      context: form.context.trim(),
      decision: form.decision.trim(),
      status: form.status,
      alternatives: [],
      consequences: '',
      tags: [],
      attachments,
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Decision" size="md">
      <div className="space-y-5">
        {/* Title */}
        <Input
          label="Title *"
          value={form.title}
          onChange={(e) => {
            handleChange('title')(e)
            if (errors.title && e.target.value.trim())
              setErrors((prev) => ({ ...prev, title: undefined }))
          }}
          placeholder="e.g. Use PostgreSQL for primary database"
          error={errors.title}
          autoFocus
        />

        {/* Context */}
        <TextArea
          label="Context"
          value={form.context}
          onChange={handleChange('context')}
          placeholder="What prompted this decision? What forces are at play?"
          rows={3}
        />

        {/* Decision */}
        <TextArea
          label="Decision"
          value={form.decision}
          onChange={handleChange('decision')}
          placeholder="What was decided?"
          rows={3}
        />

        {/* Status */}
        <Select
          label="Status"
          value={form.status}
          options={STATUS_OPTIONS}
          onChange={handleChange('status')}
        />

        <p className="text-xs text-[var(--color-fg-muted)]">
          You can add alternatives, consequences, and tags after creation.
        </p>

        {/* Code Impact attachments (Code Intelligence feature) */}
        {codeIntel?.enabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--color-fg-muted)]">
                Code Impact
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAttachCodeImpact}
                disabled={attaching || !codeIntel.ready}
              >
                {attaching ? 'Analyzing…' : 'Attach Code Impact'}
              </Button>
            </div>
            {attachments.length > 0 && (
              <ul className="space-y-1 text-xs text-[var(--color-fg-default)]">
                {attachments.map((att, i) => (
                  <li
                    key={`${att.type}-${i}`}
                    className="rounded border border-[var(--color-border-default)] px-2 py-1"
                  >
                    {summarizeAttachment(att)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--color-border-default)]">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.title.trim()}>
            Create Decision
          </Button>
        </div>
      </div>
    </Modal>
  )
}
