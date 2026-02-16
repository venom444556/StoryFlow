import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { COMPONENT_TYPES } from './constants'

export default function ComponentForm({
  isOpen,
  onClose,
  onSave,
  component = null,
  allComponents = [],
}) {
  const isEdit = !!component

  const [name, setName] = useState('')
  const [type, setType] = useState('component')
  const [description, setDescription] = useState('')
  const [parentId, setParentId] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (component) {
        setName(component.name || '')
        setType(component.type || 'component')
        setDescription(component.description || '')
        setParentId(component.parentId || '')
      } else {
        setName('')
        setType('component')
        setDescription('')
        setParentId('')
      }
    }
  }, [isOpen, component])

  const parentOptions = [
    { value: '', label: 'None (root)' },
    ...allComponents
      .filter((c) => !component || c.id !== component.id)
      .map((c) => ({
        value: c.id,
        label: `${c.name} (${c.type})`,
      })),
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      type,
      description: description.trim(),
      parentId: parentId || null,
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Component' : 'Add Component'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Component name"
          autoFocus
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Type"
            value={type}
            options={COMPONENT_TYPES}
            onChange={(e) => setType(e.target.value)}
          />
          <Select
            label="Parent"
            value={parentId}
            options={parentOptions}
            onChange={(e) => setParentId(e.target.value)}
          />
        </div>

        <div className="w-full">
          <label className="mb-1.5 block text-sm text-[var(--color-fg-muted)]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this component does..."
            rows={3}
            className="glass-input w-full resize-none px-3 py-2 text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-muted)]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {isEdit ? 'Save Changes' : 'Add Component'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
