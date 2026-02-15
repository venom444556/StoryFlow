import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { MoreHorizontal, Edit2, Trash2, Heart, Reply } from 'lucide-react'
import Avatar from '../ui/Avatar'
import DropdownMenu from '../ui/DropdownMenu'

/**
 * CommentItem - Single comment display with actions
 */
export default function CommentItem({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
  onReact,
  users = [],
  className = '',
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  const isOwner = comment.authorId === currentUserId

  const handleSaveEdit = useCallback(() => {
    if (editContent.trim() !== comment.content) {
      onEdit?.(comment.id, editContent.trim())
    }
    setIsEditing(false)
  }, [comment.id, comment.content, editContent, onEdit])

  const handleCancelEdit = useCallback(() => {
    setEditContent(comment.content)
    setIsEditing(false)
  }, [comment.content])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        handleCancelEdit()
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSaveEdit()
      }
    },
    [handleCancelEdit, handleSaveEdit]
  )

  // Parse mentions in content and highlight them
  const renderContent = (text) => {
    const parts = text.split(/(@\w+)/g)
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1)
        const mentionedUser = users.find(
          (u) => u.username === username || u.name === username
        )
        return (
          <span
            key={index}
            className="rounded bg-[var(--interactive-default)]/20 px-1 text-[var(--interactive-default)]"
          >
            {part}
          </span>
        )
      }
      return part
    })
  }

  const author = users.find((u) => u.id === comment.authorId) || {
    name: comment.authorName || 'Unknown',
    avatar: null,
  }

  const timeAgo = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : ''

  const isEdited = comment.updatedAt && comment.updatedAt !== comment.createdAt

  const menuItems = [
    isOwner && {
      icon: Edit2,
      label: 'Edit',
      onClick: () => setIsEditing(true),
    },
    isOwner && {
      icon: Trash2,
      label: 'Delete',
      onClick: () => onDelete?.(comment.id),
      variant: 'danger',
    },
  ].filter(Boolean)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={['flex gap-3', className].filter(Boolean).join(' ')}
    >
      <Avatar name={author.name} src={author.avatar} size="sm" />

      <div className="min-w-0 flex-1">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-fg-default)]">
            {author.name}
          </span>
          <span className="text-xs text-[var(--color-fg-subtle)]">{timeAgo}</span>
          {isEdited && (
            <span className="text-xs text-[var(--color-fg-subtle)]">(edited)</span>
          )}

          {/* Actions menu */}
          {menuItems.length > 0 && (
            <div className="ml-auto">
              <DropdownMenu
                trigger={
                  <button
                    type="button"
                    className="rounded p-1 text-[var(--color-fg-subtle)] opacity-0 transition-opacity hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-muted)] group-hover:opacity-100"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                }
                items={menuItems}
              />
            </div>
          )}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className={[
                'w-full resize-none rounded-lg border border-[var(--interactive-default)] bg-[var(--color-bg-glass)] px-3 py-2',
                'text-sm text-[var(--color-fg-default)]',
                'focus:outline-none focus:ring-1 focus:ring-[var(--interactive-default)]',
              ].join(' ')}
              rows={2}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-md bg-[var(--interactive-default)] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[var(--interactive-hover)]"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-md bg-[var(--color-bg-glass)] px-3 py-1 text-xs font-medium text-[var(--color-fg-muted)] transition-colors hover:bg-[var(--color-bg-glass-hover)]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 text-sm text-[var(--color-fg-muted)] whitespace-pre-wrap">
            {renderContent(comment.content)}
          </p>
        )}

        {/* Reactions and Reply */}
        {!isEditing && (
          <div className="mt-2 flex items-center gap-3">
            {/* Reactions */}
            <button
              type="button"
              onClick={() => onReact?.(comment.id, 'heart')}
              className={[
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors',
                comment.reactions?.heart?.length > 0
                  ? 'bg-red-500/10 text-red-400'
                  : 'text-[var(--color-fg-subtle)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-muted)]',
              ].join(' ')}
            >
              <Heart
                size={12}
                fill={comment.reactions?.heart?.length > 0 ? 'currentColor' : 'none'}
              />
              {comment.reactions?.heart?.length > 0 && (
                <span>{comment.reactions.heart.length}</span>
              )}
            </button>

            {/* Reply button */}
            {onReply && (
              <button
                type="button"
                onClick={() => onReply?.(comment)}
                className="flex items-center gap-1 text-xs text-[var(--color-fg-subtle)] transition-colors hover:text-[var(--color-fg-muted)]"
              >
                <Reply size={12} />
                <span>Reply</span>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
