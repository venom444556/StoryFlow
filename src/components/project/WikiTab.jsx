import { useState, useCallback, useMemo } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { BookOpen, PanelLeft } from 'lucide-react'
import { generateId } from '../../utils/ids'
import EmptyState from '../ui/EmptyState'
import ConfirmDialog from '../ui/ConfirmDialog'
import GlassCard from '../ui/GlassCard'
import PageTree from '../wiki/PageTree'
import BreadcrumbTrail from '../wiki/BreadcrumbTrail'
import TableOfContents from '../wiki/TableOfContents'
import TemplateSelector from '../wiki/TemplateSelector'
import PageViewer from '../wiki/PageViewer'
import PageEditor from '../wiki/PageEditor'
import VersionHistory from '../wiki/VersionHistory'

export default function WikiTab({ project, addPage, updatePage, deletePage }) {
  const { pageId: routePageId } = useParams()
  const pages = useMemo(() => project?.pages || [], [project?.pages])

  // -- Local UI state --
  const [selectedPageId, setSelectedPageId] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [pendingParentId, setPendingParentId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showTree, setShowTree] = useState(false)
  const [remotePage, setRemotePage] = useState(null)

  const selectedPage = pages.find((p) => p.id === selectedPageId) || remotePage || null

  useEffect(() => {
    if (!routePageId) return
    if (pages.some((page) => page.id === routePageId)) {
      setSelectedPageId(routePageId)
      setIsEditing(false)
      setRemotePage(null)
    }
  }, [pages, routePageId])

  useEffect(() => {
    if (!routePageId || !project?.id) return
    if (pages.some((page) => page.id === routePageId)) return

    const controller = new AbortController()
    setSelectedPageId(routePageId)

    fetch(`/api/projects/${project.id}/pages/${routePageId}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((page) => {
        if (page) {
          setRemotePage(page)
          setIsEditing(false)
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Failed to load wiki page by route:', err)
        }
      })

    return () => controller.abort()
  }, [pages, project?.id, routePageId])

  // ----- Page creation -----

  const handleAddPage = useCallback((parentId) => {
    setPendingParentId(parentId)
    setShowTemplateSelector(true)
  }, [])

  const handleTemplateSelected = useCallback(
    (template) => {
      const newPage = addPage({
        title: template.id === 'blank' ? 'Untitled Page' : template.name,
        content: template.content || '',
        icon: template.icon || '',
        parentId: pendingParentId,
        labels: [],
        versions: [],
        pinned: false,
      })
      if (newPage) {
        setSelectedPageId(newPage.id)
        setIsEditing(true)
      }
      setPendingParentId(null)
    },
    [addPage, pendingParentId]
  )

  // ----- Save (from editor) -----

  const handleSave = useCallback(
    (data) => {
      if (!selectedPageId) return
      const { _autoSave: isAutoSave, ...updates } = data

      // Build a version snapshot (only for explicit saves, not auto-saves)
      // Cap at 50 versions per page (FIFO — oldest removed first)
      const MAX_VERSIONS = 50
      if (!isAutoSave && selectedPage) {
        const version = {
          id: generateId(),
          content: selectedPage.content,
          editedAt: new Date().toISOString(),
          summary: data.title !== selectedPage.title ? 'Title changed' : 'Manual save',
        }
        const existingVersions = selectedPage.versions || []
        const allVersions = [...existingVersions, version]
        updates.versions =
          allVersions.length > MAX_VERSIONS
            ? allVersions.slice(allVersions.length - MAX_VERSIONS)
            : allVersions
      }

      updatePage(selectedPageId, updates)

      // Only exit edit mode on explicit save
      if (!isAutoSave) {
        setIsEditing(false)
      }
    },
    [selectedPageId, selectedPage, updatePage]
  )

  // ----- Delete -----

  const handleRequestDelete = useCallback((pageId) => {
    setDeleteTarget(pageId)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteTarget(null)
    if (selectedPageId === target) {
      setSelectedPageId(null)
      setIsEditing(false)
    }
    deletePage(target)
  }, [deleteTarget, deletePage, selectedPageId])

  // ----- Pin toggle -----

  const handleTogglePin = useCallback(
    (pageId) => {
      const page = pages.find((p) => p.id === pageId)
      if (page) {
        updatePage(pageId, { pinned: !page.pinned })
      }
    },
    [pages, updatePage]
  )

  // ----- Version restore -----

  const handleRestore = useCallback(
    (version) => {
      if (!selectedPageId) return
      updatePage(selectedPageId, { content: version.content })
    },
    [selectedPageId, updatePage]
  )

  // ----- Heading click (scroll into view) -----

  const handleHeadingClick = useCallback((headingId) => {
    const el = document.getElementById(headingId)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // ----- Render -----

  return (
    <div className="surface-workstation flex-1 min-h-[750px] flex md:flex-row gap-4 p-4">
      {/* Mobile backdrop for page tree */}
      {showTree && (
        <div
          className="fixed inset-0 z-10 bg-[var(--color-bg-backdrop)] md:hidden"
          onClick={() => setShowTree(false)}
        />
      )}

      {/* Sidebar tree — hidden on mobile, toggle-controlled */}
      <div
        className={[
          'w-[280px] shrink-0 absolute inset-y-0 left-0 z-20 md:relative md:z-auto h-full',
          showTree ? 'block' : 'hidden md:block',
        ].join(' ')}
      >
        <GlassCard padding="none" className="h-[calc(100vh-140px)] flex flex-col overflow-hidden">
          <PageTree
            pages={pages}
            selectedPageId={selectedPageId}
            onSelectPage={(id) => {
              setSelectedPageId(id)
              setIsEditing(false)
              setShowTree(false)
            }}
            onAddPage={handleAddPage}
            onDeletePage={handleRequestDelete}
          />
        </GlassCard>
      </div>

      {/* Main area */}
      <GlassCard
        padding="none"
        className="flex min-w-0 flex-1 flex-col h-[calc(100vh-140px)] overflow-hidden"
      >
        {/* Mobile page-tree toggle + Breadcrumb */}
        <div className="flex shrink-0 items-center gap-2 border-b border-[var(--color-border-default)] px-3 py-2 md:px-5">
          <button
            onClick={() => setShowTree((prev) => !prev)}
            className="rounded-md p-1 text-[var(--color-fg-muted)] hover:bg-[var(--color-bg-glass-hover)] hover:text-[var(--color-fg-default)] md:hidden"
          >
            <PanelLeft size={16} />
          </button>
          {selectedPage && (
            <BreadcrumbTrail
              pages={pages}
              currentPageId={selectedPageId}
              onNavigate={(id) => {
                setSelectedPageId(id)
                setIsEditing(false)
              }}
            />
          )}
        </div>

        {/* Content region */}
        <div className="with-steering-clearance flex min-h-0 flex-1 gap-4 overflow-hidden p-4">
          {!selectedPage ? (
            /* Empty state */
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={BookOpen}
                title="No page selected"
                description="Select a page from the sidebar or create a new one to get started."
                action={{
                  label: 'New Page',
                  onClick: () => handleAddPage(null),
                }}
              />
            </div>
          ) : isEditing ? (
            /* Editor */
            <div className="min-w-0 flex-1 overflow-hidden">
              <PageEditor
                page={selectedPage}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            /* Viewer + TOC */
            <>
              <div className="min-w-0 flex-1 overflow-hidden">
                <PageViewer
                  page={selectedPage}
                  onEdit={() => setIsEditing(true)}
                  onDelete={() => handleRequestDelete(selectedPageId)}
                  onTogglePin={handleTogglePin}
                  onShowVersions={() => setShowVersionHistory(true)}
                />
              </div>
              <TableOfContents
                markdown={selectedPage.content}
                onHeadingClick={handleHeadingClick}
              />
            </>
          )}
        </div>
      </GlassCard>

      {/* Modals */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelected}
      />

      <VersionHistory
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        versions={selectedPage?.versions || []}
        onRestore={handleRestore}
      />

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete page?"
        message="This page and all its child pages will be permanently deleted. This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  )
}
