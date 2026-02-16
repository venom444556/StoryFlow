import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon: Icon = AlertTriangle,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-[var(--space-4)] flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-danger-subtle)]">
          <Icon size={24} className="text-[var(--color-danger)]" aria-hidden="true" />
        </div>

        <h3 className="mb-[var(--space-2)] text-[var(--text-lg)] font-[var(--font-semibold)] text-[var(--color-fg-default)]">
          {title}
        </h3>
        <p className="mb-[var(--space-6)] text-[var(--text-sm)] text-[var(--color-fg-subtle)]">
          {message}
        </p>

        <div className="flex w-full gap-[var(--space-3)]">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            className="flex-1"
            onClick={() => {
              onConfirm?.()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
