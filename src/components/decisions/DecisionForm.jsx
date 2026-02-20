import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import TextArea from '../ui/TextArea'
import Select from '../ui/Select'
import Button from '../ui/Button'

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

  useEffect(() => {
    if (isOpen) {
      setForm(DEFAULT_FORM)
      setErrors({})
    }
  }, [isOpen])

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
