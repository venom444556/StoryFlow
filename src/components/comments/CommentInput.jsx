import { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, AtSign } from 'lucide-react'
import Avatar from '../ui/Avatar'

/**
 * CommentInput - Input component with @mention support
 */
export default function CommentInput({
  onSubmit,
  placeholder = 'Write a comment...',
  currentUser = { name: 'User', avatar: null },
  mentionSuggestions = [],
  disabled = false,
  autoFocus = false,
  className = '',
}) {
  const [content, setContent] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionStartIndex, setMentionStartIndex] = useState(-1)
  const inputRef = useRef(null)

  // Filter mention suggestions
  const filteredSuggestions = useMemo(() => {
    if (!mentionQuery) return mentionSuggestions
    const query = mentionQuery.toLowerCase()
    return mentionSuggestions.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        (user.username && user.username.toLowerCase().includes(query))
    )
  }, [mentionSuggestions, mentionQuery])

  const handleChange = useCallback((e) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    setContent(value)

    // Check for @mention trigger
    const textBeforeCursor = value.slice(0, cursorPos)
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1)
      // Only show mentions if @ is at start or after whitespace
      const charBeforeAt = atIndex > 0 ? value[atIndex - 1] : ' '
      if (/\s/.test(charBeforeAt) || atIndex === 0) {
        // Check if there's no space after the @
        if (!/\s/.test(textAfterAt)) {
          setShowMentions(true)
          setMentionQuery(textAfterAt)
          setMentionStartIndex(atIndex)
          return
        }
      }
    }

    setShowMentions(false)
    setMentionQuery('')
    setMentionStartIndex(-1)
  }, [])

  const handleMentionSelect = useCallback(
    (user) => {
      const beforeMention = content.slice(0, mentionStartIndex)
      const afterMention = content.slice(
        mentionStartIndex + 1 + mentionQuery.length
      )
      const newContent = `${beforeMention}@${user.username || user.name} ${afterMention}`
      setContent(newContent)
      setShowMentions(false)
      setMentionQuery('')
      setMentionStartIndex(-1)
      inputRef.current?.focus()
    },
    [content, mentionStartIndex, mentionQuery]
  )

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && showMentions) {
        setShowMentions(false)
        e.preventDefault()
        return
      }

      if (e.key === 'Enter' && !e.shiftKey && !showMentions) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [showMentions]
  )

  const handleSubmit = useCallback(() => {
    if (!content.trim() || disabled) return

    // Extract mentions from content
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match
    while ((match = mentionRegex.exec(content)) !== null) {
      const mentioned = mentionSuggestions.find(
        (u) => u.username === match[1] || u.name === match[1]
      )
      if (mentioned) {
        mentions.push(mentioned.id || mentioned.name)
      }
    }

    onSubmit?.({
      content: content.trim(),
      mentions,
    })

    setContent('')
  }, [content, disabled, onSubmit, mentionSuggestions])

  return (
    <div className={['relative', className].filter(Boolean).join(' ')}>
      <div className="flex gap-3">
        <Avatar name={currentUser.name} src={currentUser.avatar} size="sm" />

        <div className="min-w-0 flex-1">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              autoFocus={autoFocus}
              rows={1}
              className={[
                'w-full resize-none rounded-lg border bg-[var(--color-bg-glass)] px-3 py-2',
                'text-sm text-[var(--color-fg-default)] placeholder-[var(--color-fg-subtle)]',
                'transition-all duration-200',
                'focus:border-[var(--interactive-default)] focus:outline-none focus:ring-1 focus:ring-[var(--interactive-default)]',
                disabled && 'cursor-not-allowed opacity-50',
                content ? 'border-[var(--color-border-default)]' : 'border-[var(--color-border-muted)]',
              ].join(' ')}
              style={{
                minHeight: '38px',
                maxHeight: '120px',
                height: content.split('\n').length > 1 ? 'auto' : '38px',
              }}
            />

            {/* Send button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!content.trim() || disabled}
              className={[
                'absolute bottom-2 right-2 rounded-md p-1',
                'transition-all duration-200',
                content.trim()
                  ? 'text-[var(--interactive-default)] hover:bg-[var(--interactive-default)]/10'
                  : 'text-[var(--color-fg-subtle)] cursor-not-allowed',
              ].join(' ')}
            >
              <Send size={16} />
            </button>
          </div>

          {/* Hint text */}
          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-fg-subtle)]">
            <AtSign size={12} />
            <span>Type @ to mention someone</span>
          </div>
        </div>
      </div>

      {/* Mention suggestions dropdown */}
      <AnimatePresence>
        {showMentions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={[
              'absolute left-10 right-0 z-50 mt-1',
              'rounded-lg border border-[var(--color-border-default)]',
              'bg-[var(--color-bg-glass)] backdrop-blur-xl',
              'shadow-lg overflow-hidden',
              'max-h-48 overflow-y-auto',
            ].join(' ')}
          >
            {filteredSuggestions.map((user) => (
              <button
                key={user.id || user.name}
                type="button"
                onClick={() => handleMentionSelect(user)}
                className={[
                  'flex w-full items-center gap-3 px-3 py-2 text-left',
                  'transition-colors duration-100',
                  'hover:bg-[var(--color-bg-glass-hover)]',
                ].join(' ')}
              >
                <Avatar name={user.name} src={user.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-[var(--color-fg-default)]">
                    {user.name}
                  </span>
                  {user.username && (
                    <span className="block text-xs text-[var(--color-fg-muted)]">
                      @{user.username}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
