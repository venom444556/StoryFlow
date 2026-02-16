import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import TextArea from '../ui/TextArea'
import Button from '../ui/Button'

const PRESET_COLORS = [
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#6366f1', // indigo
]

const DEFAULT_FORM = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  progress: 0,
  color: PRESET_COLORS[0],
}

export default function PhaseForm({ isOpen, onClose, onSave, phase = null }) {
  const [form, setForm] = useState(DEFAULT_FORM)

  useEffect(() => {
    if (isOpen) {
      if (phase) {
        setForm({
          name: phase.name || '',
          description: phase.description || '',
          startDate: phase.startDate || '',
          endDate: phase.endDate || '',
          progress: phase.progress ?? 0,
          color: phase.color || PRESET_COLORS[0],
        })
      } else {
        setForm(DEFAULT_FORM)
      }
    }
  }, [isOpen, phase])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleProgressChange = (e) => {
    const val = Math.max(0, Math.min(100, Number(e.target.value)))
    setForm((prev) => ({ ...prev, progress: val }))
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave({
      ...form,
      name: form.name.trim(),
      progress: Number(form.progress),
    })
    onClose()
  }

  const isEditing = Boolean(phase)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Phase' : 'New Phase'}
      size="md"
    >
      <div className="space-y-5">
        {/* Name */}
        <Input
          label="Phase Name"
          value={form.name}
          onChange={handleChange('name')}
          placeholder="e.g. Design, Development, Testing..."
          autoFocus
        />

        {/* Description */}
        <TextArea
          label="Description"
          value={form.description}
          onChange={handleChange('description')}
          placeholder="What happens during this phase?"
          rows={3}
        />

        {/* Date range */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={handleChange('startDate')}
          />
          <Input
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={handleChange('endDate')}
          />
        </div>

        {/* Progress slider */}
        <div>
          <label className="mb-1.5 block text-sm text-[var(--color-fg-muted)]">Progress</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={form.progress}
              onChange={handleProgressChange}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-bg-glass)]
                         [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:shadow-lg
                         [&::-webkit-slider-thumb]:shadow-purple-500/30 [&::-webkit-slider-thumb]:transition-transform
                         [&::-webkit-slider-thumb]:hover:scale-110
                         [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
                         [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0
                         [&::-moz-range-thumb]:bg-purple-500 [&::-moz-range-thumb]:shadow-lg"
            />
            <span className="w-12 shrink-0 text-right text-sm font-medium text-[var(--color-fg-default)]">
              {form.progress}%
            </span>
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="mb-2 block text-sm text-[var(--color-fg-muted)]">Color</label>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, color }))}
                className={[
                  'h-7 w-7 rounded-full transition-all duration-150',
                  form.color === color
                    ? 'ring-2 ring-[var(--color-fg-default)] ring-offset-2 ring-offset-[var(--color-bg-emphasis)] scale-110'
                    : 'hover:scale-110 hover:brightness-110',
                ].join(' ')}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--color-border-default)]">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>
            {isEditing ? 'Save Changes' : 'Create Phase'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
