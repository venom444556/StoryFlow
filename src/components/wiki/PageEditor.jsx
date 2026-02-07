import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Bold,
  Italic,
  Heading2,
  List,
  Code,
  Link as LinkIcon,
  Table,
  Eye,
  Save,
  X,
  Clock,
} from 'lucide-react'
import Button from '../ui/Button'
import TagInput from '../ui/TagInput'
import MarkdownRenderer from './MarkdownRenderer'
import { wordCount, readingTime } from '../../utils/markdown'

// ---------------------------------------------------------------------------
// Toolbar button config
// ---------------------------------------------------------------------------

const TOOLBAR_ITEMS = [
  {
    id: 'bold',
    icon: Bold,
    title: 'Bold',
    wrap: { before: '**', after: '**', placeholder: 'bold text' },
  },
  {
    id: 'italic',
    icon: Italic,
    title: 'Italic',
    wrap: { before: '*', after: '*', placeholder: 'italic text' },
  },
  {
    id: 'heading',
    icon: Heading2,
    title: 'Heading',
    prefix: '## ',
    placeholder: 'Heading',
  },
  {
    id: 'list',
    icon: List,
    title: 'List',
    prefix: '- ',
    placeholder: 'List item',
  },
  {
    id: 'code',
    icon: Code,
    title: 'Code',
    wrap: { before: '`', after: '`', placeholder: 'code' },
  },
  {
    id: 'link',
    icon: LinkIcon,
    title: 'Link',
    wrap: { before: '[', after: '](url)', placeholder: 'link text' },
  },
  {
    id: 'table',
    icon: Table,
    title: 'Table',
    insert:
      '| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PageEditor({ page, onSave, onCancel }) {
  const [title, setTitle] = useState(page?.title || '')
  const [content, setContent] = useState(page?.content || '')
  const [labels, setLabels] = useState(page?.labels || [])
  const [icon, setIcon] = useState(page?.icon || '')
  const textareaRef = useRef(null)
  const debounceRef = useRef(null)

  // Sync local state when a new page is opened for editing
  useEffect(() => {
    setTitle(page?.title || '')
    setContent(page?.content || '')
    setLabels(page?.labels || [])
    setIcon(page?.icon || '')
  }, [page?.id])

  // ---- Auto-save via debounce (calls parent but does NOT exit edit mode) ----
  const autoSave = useCallback(
    (nextContent) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        // Silent save -- just persist content without exiting edit mode
        onSave?.({ title, content: nextContent, labels, icon, _autoSave: true })
      }, 2000)
    },
    [title, labels, icon, onSave]
  )

  const handleContentChange = (e) => {
    const next = e.target.value
    setContent(next)
    autoSave(next)
  }

  // ---- Toolbar insertion helpers ----
  const insertAtCursor = (item) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.substring(start, end)

    let newText = ''
    let cursorOffset = 0

    if (item.wrap) {
      const inner = selected || item.wrap.placeholder
      newText =
        content.substring(0, start) +
        item.wrap.before +
        inner +
        item.wrap.after +
        content.substring(end)
      cursorOffset = start + item.wrap.before.length + inner.length + item.wrap.after.length
    } else if (item.prefix) {
      const inner = selected || item.placeholder || ''
      newText =
        content.substring(0, start) +
        item.prefix +
        inner +
        content.substring(end)
      cursorOffset = start + item.prefix.length + inner.length
    } else if (item.insert) {
      newText =
        content.substring(0, start) +
        item.insert +
        content.substring(end)
      cursorOffset = start + item.insert.length
    }

    setContent(newText)

    // Restore focus + cursor position after React re-renders
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(cursorOffset, cursorOffset)
    })
  }

  // ---- Save (explicit save -- creates a version snapshot) ----
  const handleSave = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    onSave?.({ title, content, labels, icon })
  }

  const wc = wordCount(content)
  const rt = readingTime(content)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
      {/* Top bar: title + icon */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
        {/* Emoji icon input */}
        <input
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="icon"
          maxLength={2}
          className="w-10 rounded bg-white/5 px-1.5 py-1 text-center text-lg text-white outline-none transition-colors focus:bg-white/10"
          title="Page icon (emoji)"
        />
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title..."
          className="flex-1 bg-transparent text-lg font-semibold text-white placeholder-slate-600 outline-none"
        />
      </div>

      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-0.5 border-b border-white/[0.06] px-3 py-1.5">
        {TOOLBAR_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => insertAtCursor(item)}
            title={item.title}
            className="rounded p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-200"
          >
            <item.icon size={15} />
          </button>
        ))}

        <span className="mx-2 h-4 w-px bg-white/10" />

        {/* Preview indicator */}
        <span className="flex items-center gap-1 text-xs text-slate-600">
          <Eye size={13} />
          Live preview
        </span>
      </div>

      {/* Split pane: Editor | Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor pane */}
        <div className="flex flex-1 flex-col border-r border-white/[0.06]">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing in markdown..."
            className="flex-1 resize-none bg-transparent px-5 py-4 font-mono text-sm leading-relaxed text-slate-300 placeholder-slate-600 outline-none"
            spellCheck={false}
          />
        </div>

        {/* Preview pane */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <MarkdownRenderer content={content} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex shrink-0 items-center gap-4 border-t border-white/[0.06] px-4 py-2.5">
        {/* Labels */}
        <div className="flex-1">
          <TagInput
            tags={labels}
            onChange={setLabels}
            placeholder="Add label..."
          />
        </div>

        {/* Stats */}
        <span className="flex items-center gap-1 text-xs text-slate-600">
          <Clock size={12} />
          {wc} words &middot; {rt} min read
        </span>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={X} onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
