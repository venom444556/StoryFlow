import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

const PRESET_COLORS = [
  '#10b981', // emerald
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
]

const DEFAULT_FORM = {
  name: '',
  date: '',
  completed: false,
  color: PRESET_COLORS[0],
  phaseId: '',
}

export default function MilestoneForm({ isOpen, onClose, onSave, milestone = null, phases = [] }) {
  const [form, setForm] = useState(DEFAULT_FORM)

  useEffect(() => {
    if (isOpen) {
      if (milestone) {
        setForm({
          name: milestone.name || '',
          date: milestone.date || '',
          completed: milestone.completed || false,
          color: milestone.color || PRESET_COLORS[0],
          phaseId: milestone.phaseId || '',
        })
      } else {
        setForm(DEFAULT_FORM)
      }
    }
  }, [isOpen, milestone])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave({
      ...form,
      name: form.name.trim(),
      phaseId: form.phaseId || null,
    })
    onClose()
  }

  const isEditing = Boolean(milestone)

  const phaseOptions = [
    { value: '', label: 'None (global)' },
    ...phases.map((p) => ({ value: p.id, label: p.name })),
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Milestone' : 'New Milestone'}
      size="md"
    >
      <div className="space-y-5">
        {/* Name */}
        <Input
          label="Milestone Name"
          value={form.name}
          onChange={handleChange('name')}
          placeholder="e.g. MVP Release, Design Review..."
          autoFocus
        />

        {/* Date */}
        <Input
          label="Target Date"
          type="date"
          value={form.date}
          onChange={handleChange('date')}
        />

        {/* Phase association */}
        <Select
          label="Associated Phase"
          value={form.phaseId}
          onChange={handleChange('phaseId')}
          options={phaseOptions}
          placeholder="Select a phase (optional)"
        />

        {/* Completed toggle */}
        <div>
          <label className="mb-1.5 block text-sm text-slate-400">Status</label>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, completed: !prev.completed }))}
            className={[
              'inline-flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200',
              form.completed
                ? 'bg-green-500/15 text-green-400 ring-1 ring-green-500/30'
                : 'bg-white/5 text-slate-400 ring-1 ring-white/10',
            ].join(' ')}
          >
            <div
              className={[
                'h-4 w-4 rounded border-2 transition-colors',
                form.completed
                  ? 'border-green-400 bg-green-400'
                  : 'border-slate-500 bg-transparent',
              ].join(' ')}
            >
              {form.completed && (
                <svg viewBox="0 0 16 16" className="h-full w-full text-white">
                  <path
                    d="M4 8l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            {form.completed ? 'Completed' : 'Not completed'}
          </button>
        </div>

        {/* Color picker */}
        <div>
          <label className="mb-2 block text-sm text-slate-400">Color</label>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, color }))}
                className={[
                  'h-7 w-7 rounded-full transition-all duration-150',
                  form.color === color
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                    : 'hover:scale-110 hover:brightness-110',
                ].join(' ')}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!form.name.trim()}
          >
            {isEditing ? 'Save Changes' : 'Create Milestone'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
