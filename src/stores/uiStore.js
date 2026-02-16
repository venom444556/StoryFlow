import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ---------------------------------------------------------------------------
// UI Store
// Handles global UI state: sidebar, modals, command palette, etc.
// ---------------------------------------------------------------------------
export const useUIStore = create(
  persist(
    (set, get) => ({
      // ---------------------------------------------------------------------------
      // Sidebar State
      // ---------------------------------------------------------------------------
      sidebarCollapsed: false,
      sidebarWidth: 256,

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      // ---------------------------------------------------------------------------
      // Command Palette
      // ---------------------------------------------------------------------------
      commandPaletteOpen: false,
      commandPaletteScope: null, // null = global, 'board', 'wiki', etc.

      openCommandPalette: (scope = null) =>
        set({ commandPaletteOpen: true, commandPaletteScope: scope }),

      closeCommandPalette: () => set({ commandPaletteOpen: false, commandPaletteScope: null }),

      toggleCommandPalette: () =>
        set((state) => ({
          commandPaletteOpen: !state.commandPaletteOpen,
          commandPaletteScope: state.commandPaletteOpen ? null : state.commandPaletteScope,
        })),

      // ---------------------------------------------------------------------------
      // Modal State (generic modal handling)
      // ---------------------------------------------------------------------------
      activeModal: null, // { type: 'issue-detail', props: { issueId: '...' } }

      openModal: (type, props = {}) => set({ activeModal: { type, props } }),

      closeModal: () => set({ activeModal: null }),

      // ---------------------------------------------------------------------------
      // Slide-over / Drawer State
      // ---------------------------------------------------------------------------
      activeDrawer: null, // { type: 'issue-detail', props: { issueId: '...' } }

      openDrawer: (type, props = {}) => set({ activeDrawer: { type, props } }),

      closeDrawer: () => set({ activeDrawer: null }),

      // ---------------------------------------------------------------------------
      // Toast Notifications Queue
      // ---------------------------------------------------------------------------
      toasts: [],

      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        set((state) => ({
          toasts: [
            ...state.toasts,
            {
              id,
              type: 'info',
              duration: 5000,
              ...toast,
            },
          ],
        }))
        return id
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      clearToasts: () => set({ toasts: [] }),

      // ---------------------------------------------------------------------------
      // Global Search
      // ---------------------------------------------------------------------------
      searchQuery: '',
      searchResults: [],
      searchOpen: false,

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSearchResults: (results) => set({ searchResults: results }),

      openSearch: () => set({ searchOpen: true }),

      closeSearch: () => set({ searchOpen: false, searchQuery: '', searchResults: [] }),

      // ---------------------------------------------------------------------------
      // Active Entity Tracking (for highlighting/focusing)
      // ---------------------------------------------------------------------------
      focusedIssueId: null,
      focusedPageId: null,
      focusedDecisionId: null,

      setFocusedIssue: (id) => set({ focusedIssueId: id }),
      setFocusedPage: (id) => set({ focusedPageId: id }),
      setFocusedDecision: (id) => set({ focusedDecisionId: id }),

      clearFocus: () =>
        set({
          focusedIssueId: null,
          focusedPageId: null,
          focusedDecisionId: null,
        }),

      // ---------------------------------------------------------------------------
      // Confirmation Dialog
      // ---------------------------------------------------------------------------
      confirmDialog: null, // { title, message, onConfirm, onCancel, variant }

      showConfirmDialog: (options) =>
        set({
          confirmDialog: {
            title: 'Confirm',
            message: 'Are you sure?',
            confirmLabel: 'Confirm',
            cancelLabel: 'Cancel',
            variant: 'danger',
            ...options,
          },
        }),

      hideConfirmDialog: () => set({ confirmDialog: null }),

      // ---------------------------------------------------------------------------
      // Keyboard Shortcut Hints
      // ---------------------------------------------------------------------------
      shortcutsVisible: false,

      toggleShortcuts: () => set((state) => ({ shortcutsVisible: !state.shortcutsVisible })),

      showShortcuts: () => set({ shortcutsVisible: true }),

      hideShortcuts: () => set({ shortcutsVisible: false }),

      // ---------------------------------------------------------------------------
      // Recent Navigation History (for breadcrumbs, back navigation)
      // ---------------------------------------------------------------------------
      navigationHistory: [],

      pushNavigation: (entry) =>
        set((state) => ({
          navigationHistory: [...state.navigationHistory.slice(-9), entry],
        })),

      popNavigation: () =>
        set((state) => ({
          navigationHistory: state.navigationHistory.slice(0, -1),
        })),

      clearNavigationHistory: () => set({ navigationHistory: [] }),
    }),
    {
      name: 'storyflow-ui',
      partialize: (state) => ({
        // Only persist these UI preferences
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
      }),
    }
  )
)

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectSidebarCollapsed = (state) => state.sidebarCollapsed
export const selectCommandPaletteOpen = (state) => state.commandPaletteOpen
export const selectActiveModal = (state) => state.activeModal
export const selectActiveDrawer = (state) => state.activeDrawer
export const selectToasts = (state) => state.toasts
export const selectConfirmDialog = (state) => state.confirmDialog
