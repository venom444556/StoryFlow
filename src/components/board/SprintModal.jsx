import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import TextArea from '../ui/TextArea'

export default function SprintModal({ isOpen, onClose, onSave, sprint = null }) {
  const isEditing = !!sprint
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      if (sprint) {
        setName(sprint.name || '')
        setGoal(sprint.goal || '')
        setStartDate(sprint.startDate || '')
        setEndDate(sprint.endDate || '')
      } else {
        setName('')
        setGoal('')
        setStartDate('')
        setEndDate('')
      }
      setErrors({})
    }
  }, [isOpen, sprint])

  const validate = () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Sprint name is required'
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'End date must be after start date'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSave({
      ...(sprint || {}),
      name: name.trim(),
      goal: goal.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Sprint' : 'New Sprint'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Sprint Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Sprint 1 — Core Features"
          error={errors.name}
          autoFocus
        />

        <TextArea
          label="Sprint Goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What should be accomplished in this sprint?"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            error={errors.endDate}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {isEditing ? 'Save Changes' : 'Create Sprint'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
