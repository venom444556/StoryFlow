import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import CommentInput from './CommentInput'
import CommentItem from './CommentItem'
import EmptyState from '../ui/EmptyState'

/**
 * CommentThread - Full comment thread with input and list
 */
export default function CommentThread({
  comments = [],
  currentUser = { id: 'user', name: 'User' },
  users = [],
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReactComment,
  placeholder = 'Add a comment...',
  emptyMessage = 'No comments yet. Start the conversation!',
  className = '',
}) {
  const handleAddComment = useCallback(
    ({ content, mentions }) => {
      onAddComment?.({
        content,
        mentions,
        authorId: currentUser.id,
        authorName: currentUser.name,
      })
    },
    [currentUser, onAddComment]
  )

  const handleReact = useCallback(
    (commentId, reaction) => {
      const comment = comments.find((c) => c.id === commentId)
      if (!comment) return

      const reactions = comment.reactions || {}
      const reactionList = reactions[reaction] || []
      const hasReacted = reactionList.includes(currentUser.id)

      const newReactionList = hasReacted
        ? reactionList.filter((id) => id !== currentUser.id)
        : [...reactionList, currentUser.id]

      onReactComment?.(commentId, {
        ...reactions,
        [reaction]: newReactionList,
      })
    },
    [comments, currentUser.id, onReactComment]
  )

  // Combine current user with provided users for mentions
  const allUsers = [currentUser, ...users.filter((u) => u.id !== currentUser.id)]

  return (
    <div className={['space-y-4', className].filter(Boolean).join(' ')}>
      {/* Comment input */}
      <CommentInput
        onSubmit={handleAddComment}
        currentUser={currentUser}
        mentionSuggestions={allUsers}
        placeholder={placeholder}
      />

      {/* Comments list */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {comments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={MessageCircle}
                message={emptyMessage}
                size="sm"
              />
            </motion.div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUser.id}
                users={allUsers}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
                onReact={handleReact}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Comment count */}
      {comments.length > 0 && (
        <div className="border-t border-[var(--color-border-muted)] pt-2">
          <span className="text-xs text-[var(--color-fg-subtle)]">
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact version for sidebars/cards
 */
export function CommentCount({ count = 0, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center gap-1 text-xs',
        count > 0
          ? 'text-[var(--color-fg-muted)]'
          : 'text-[var(--color-fg-subtle)]',
        'transition-colors hover:text-[var(--color-fg-default)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <MessageCircle size={14} />
      <span>{count}</span>
    </button>
  )
}
