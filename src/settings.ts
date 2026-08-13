export type BgPreset = 'default' | 'mint' | 'sunset' | 'ocean' | 'custom'
export type Lang = 'zh' | 'en' | 'ja'
export type FontPreset = 'default' | 'serif' | 'sans' | 'mono'

export interface AppSettings {
  bgPreset: BgPreset
  customBg?: string
  language: Lang
  fontPreset: FontPreset
  /** userId -> dataURL */
  avatars: { [userId: string]: string }
}

const SETTINGS_KEY = 'accounting_app_settings'

export const DEFAULT_SETTINGS: AppSettings = {
  bgPreset: 'default',
  language: 'zh',
  fontPreset: 'default',
  avatars: {},
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AppSettings
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export const FONT_STACKS: Record<FontPreset, string> = {
  default:
    '"Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  serif: '"Songti SC", "Noto Serif SC", "Source Han Serif SC", Georgia, serif',
  sans: '"Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
  mono: '"Cascadia Code", "Sarasa Mono SC", "Consolas", "Courier New", monospace',
}

import { translate } from './i18n/translations'

export function applyDocumentSettings(settings: AppSettings) {
  document.documentElement.style.setProperty(
    '--app-font',
    FONT_STACKS[settings.fontPreset],
  )
  document.documentElement.lang =
    settings.language === 'zh' ? 'zh-CN' : settings.language === 'ja' ? 'ja' : 'en'
  document.body.style.fontFamily = FONT_STACKS[settings.fontPreset]
  document.title = translate(settings.language, 'appName')
}
