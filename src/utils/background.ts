import type { CSSProperties } from 'react'
import type { AppSettings } from '../settings'

export function resolveBackgroundStyle(settings: AppSettings): CSSProperties {
  if (settings.bgPreset === 'custom' && settings.customBg) {
    return {
      backgroundImage: `linear-gradient(rgba(245,247,251,0.72), rgba(245,247,251,0.88)), url(${settings.customBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }
  }
  return {}
}

export function backgroundClassName(settings: AppSettings): string {
  if (settings.bgPreset === 'custom') return 'bg-custom'
  return `bg-${settings.bgPreset}`
}
