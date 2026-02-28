import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'storyflow-settings'

const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark' | 'light'
  accentColor: 'purple', // 'purple' | 'blue' | 'cyan' | 'green' | 'pink'
  sidebarCollapsed: false,
  animationsEnabled: true,
  autoSave: true,
  autoSaveDelay: 500, // ms
  showConfirmOnDelete: true,
  workflowSnapToGrid: false,
  workflowGridSize: 20,
  defaultProjectStatus: 'planning',
  compactCards: false,
  showBreadcrumbs: true,
  staleThresholdMinutes: 120,
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_SETTINGS }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    /* ignore */
  }
}

function settingsReducer(state, action) {
  switch (action.type) {
    case 'SET': {
      const next = { ...state, [action.key]: action.value }
      saveSettings(next)
      return next
    }
    case 'SET_MANY': {
      const next = { ...state, ...action.values }
      saveSettings(next)
      return next
    }
    case 'RESET': {
      saveSettings(DEFAULT_SETTINGS)
      return { ...DEFAULT_SETTINGS }
    }
    default:
      return state
  }
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, dispatch] = useReducer(settingsReducer, null, loadSettings)

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-dark', 'theme-light')
    root.classList.add(`theme-${settings.theme}`)
  }, [settings.theme])

  // Apply accent color as CSS variables
  useEffect(() => {
    const root = document.documentElement
    const accentMap = {
      purple: { hex: '#8b5cf6', rgb: '139, 92, 246' },
      blue: { hex: '#3b82f6', rgb: '59, 130, 246' },
      cyan: { hex: '#06b6d4', rgb: '6, 182, 212' },
      green: { hex: '#10b981', rgb: '16, 185, 129' },
      pink: { hex: '#ec4899', rgb: '236, 72, 153' },
    }
    const accent = accentMap[settings.accentColor] || accentMap.purple
    root.style.setProperty('--accent-active', accent.hex)
    root.style.setProperty('--accent-active-rgb', accent.rgb)
  }, [settings.accentColor])

  const setSetting = useCallback((key, value) => {
    dispatch({ type: 'SET', key, value })
  }, [])

  const setSettings = useCallback((values) => {
    dispatch({ type: 'SET_MANY', values })
  }, [])

  const resetSettings = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, setSetting, setSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
