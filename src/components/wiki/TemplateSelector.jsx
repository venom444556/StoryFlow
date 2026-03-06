import { motion } from 'framer-motion'
import Modal from '../ui/Modal'
import { pageTemplates } from '../../data/pageTemplates'

export default function TemplateSelector({ isOpen, onClose, onSelect }) {
  const handleSelect = (template) => {
    onSelect(template)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose a Template" size="lg">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {pageTemplates.map((template, idx) => (
          <motion.button
            key={template.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.2 }}
            onClick={() => handleSelect(template)}
            className="glass-card flex flex-col items-start rounded-xl p-4 text-left transition-colors duration-200"
          >
            <span className="mb-2 text-2xl">{template.icon}</span>
            <span className="text-sm font-medium text-[var(--color-fg-default)]">
              {template.name}
            </span>
            <span className="mt-1 line-clamp-2 text-xs text-[var(--color-fg-muted)]">
              {template.description}
            </span>
          </motion.button>
        ))}
      </div>
    </Modal>
  )
}
