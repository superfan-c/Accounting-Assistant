import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { translate, type I18nKey } from '../i18n/translations'
import {
  applyDocumentSettings,
  getSettings,
  saveSettings,
  type AppSettings,
} from '../settings'

interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (patch: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)) => void
  t: (key: I18nKey) => string
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => getSettings())

  useEffect(() => {
    applyDocumentSettings(settings)
  }, [settings])

  const updateSettings = useCallback(
    (patch: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)) => {
      setSettings((prev) => {
        const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }
        saveSettings(next)
        return next
      })
    },
    [],
  )

  const t = useCallback(
    (key: I18nKey) => translate(settings.language, key),
    [settings.language],
  )

  const value = useMemo(
    () => ({ settings, updateSettings, t }),
    [settings, updateSettings, t],
  )

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
