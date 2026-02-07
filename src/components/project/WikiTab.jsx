import React, { useState, useCallback } from 'react'
import { BookOpen, PanelLeft } from 'lucide-react'
import { generateId } from '../../utils/ids'
import EmptyState from '../ui/EmptyState'
import ConfirmDialog from '../ui/ConfirmDialog'
import PageTree from '../wiki/PageTree'
import BreadcrumbTrail from '../wiki/BreadcrumbTrail'
import TableOfContents from '../wiki/TableOfContents'
import TemplateSelector from '../wiki/TemplateSelector'
import PageViewer from '../wiki/PageViewer'
import PageEditor from '../wiki/PageEditor'
import VersionHistory from '../wiki/VersionHistory'

export default function WikiTab({ project, addPage, updatePage, deletePage }) {
  const pages = project?.pages || []

  // -- Local UI state --
  const [selectedPageId, setSelectedPageId] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [pendingParentId, setPendingParentId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showTree, setShowTree] = useState(false)

  const selectedPage = pages.find((p) => p.id === selectedPageId) || null

  // ----- Page creation -----

  const handleAddPage = useCallback(
    (parentId) => {
      setPendingParentId(parentId)
      setShowTemplateSelector(true)
    },
    []
  )

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
      const isAutoSave = data._autoSave
      const { _autoSave, ...updates } = data

      // Build a version snapshot (only for explicit saves, not auto-saves)
      if (!isAutoSave && selectedPage) {
        const version = {
          id: generateId(),
          content: selectedPage.content,
          editedAt: new Date().toISOString(),
          summary: data.title !== selectedPage.title ? 'Title changed' : 'Manual save',
        }
        const existingVersions = selectedPage.versions || []
        updates.versions = [...existingVersions, version]
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
    deletePage(deleteTarget)
    if (selectedPageId === deleteTarget) {
      setSelectedPageId(null)
      setIsEditing(false)
    }
    setDeleteTarget(null)
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

  // ----- Status toggle -----

  const handlePublishToggle = useCallback(() => {
    if (!selectedPage) return
    const nextStatus = selectedPage.status === 'published' ? 'draft' : 'published'
    updatePage(selectedPageId, { status: nextStatus })
  }, [selectedPage, selectedPageId, updatePage])

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
    <div className="relative flex h-full gap-0 overflow-hidden rounded-xl">
      {/* Mobile backdrop for page tree */}
      {showTree && (
        <div
          className="fixed inset-0 z-10 bg-black/30 md:hidden"
          onClick={() => setShowTree(false)}
        />
      )}

      {/* Sidebar tree — hidden on mobile, toggle-controlled */}
      <div className={[
        'absolute inset-y-0 left-0 z-20 md:relative md:z-auto',
        showTree ? 'block' : 'hidden md:block',
      ].join(' ')}>
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
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile page-tree toggle + Breadcrumb */}
        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 py-2 md:px-5">
          <button
            onClick={() => setShowTree((prev) => !prev)}
            className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
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
        <div className="flex flex-1 gap-4 overflow-hidden p-4">
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
            <div className="flex-1 overflow-hidden">
              <PageEditor
                page={selectedPage}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            /* Viewer + TOC */
            <>
              <div className="flex-1 overflow-hidden">
                <PageViewer
                  page={selectedPage}
                  onEdit={() => setIsEditing(true)}
                  onDelete={() => handleRequestDelete(selectedPageId)}
                  onTogglePin={handleTogglePin}
                  onShowVersions={
                    selectedPage.versions?.length > 0
                      ? () => setShowVersionHistory(true)
                      : undefined
                  }
                />
              </div>
              <TableOfContents
                markdown={selectedPage.content}
                onHeadingClick={handleHeadingClick}
              />
            </>
          )}
        </div>
      </div>

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
