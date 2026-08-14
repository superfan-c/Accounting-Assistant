import { Button, Modal, Popover, message } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  ALL_ACHIEVEMENTS,
  type AchievementDef,
} from '../gamification/achievements'
import {
  getEquippedBadge,
  getUnlockTimes,
  setEquippedBadge,
  syncUnlockTimes,
} from '../gamification/gamificationStorage'
import { getUnlockedAchievements } from '../gamification/streakStats'
import type { StreakGamificationStats } from '../gamification/streakStats'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import type { I18nKey } from '../i18n/translations'

interface Props {
  open: boolean
  onClose: () => void
  stats: StreakGamificationStats | null
}

function BadgeIntro({
  def,
  lit,
  unlockDate,
  t,
}: {
  def: AchievementDef
  lit: boolean
  unlockDate?: string
  t: (key: I18nKey) => string
}) {
  return (
    <div className="my-badges-hover">
      <div className="my-badges-hover-name">
        {def.icon} {t(def.nameKey as I18nKey)}
      </div>
      <div className="my-badges-hover-title">{t(def.titleKey as I18nKey)}</div>
      <p className="my-badges-hover-text">{t(def.unlockKey as I18nKey)}</p>
      <p className="my-badges-hover-req">
        {t('myBadgesReq')}：{t(def.reqKey as I18nKey)}
      </p>
      {lit ? (
        <p className="my-badges-hover-meta">
          {t('myBadgesUnlockedAtLabel')}：
          {unlockDate ? dayjs(unlockDate).format('YYYY-MM-DD') : '—'}
        </p>
      ) : (
        <p className="my-badges-hover-meta">{t('myBadgesLocked')}</p>
      )}
    </div>
  )
}

export default function MyBadgesModal({ open, onClose, stats }: Props) {
  const { user } = useAuth()
  const { t } = useSettings()
  const [selected, setSelected] = useState<AchievementDef | null>(null)

  const unlocked = useMemo(
    () => (stats ? getUnlockedAchievements(stats) : []),
    [stats],
  )
  const unlockedSet = useMemo(() => new Set(unlocked), [unlocked])
  const [equippedId, setEquippedId] = useState<string | null>(null)
  const selectedLit = selected ? unlockedSet.has(selected.id) : false

  useEffect(() => {
    if (!open || !user?.id || unlocked.length === 0) return
    syncUnlockTimes(user.id, unlocked)
  }, [open, user?.id, unlocked])

  useEffect(() => {
    if (!open) {
      setSelected(null)
      return
    }
    setEquippedId(user?.id ? getEquippedBadge(user.id) : null)
  }, [open, user?.id])

  const unlockTimes = user?.id ? getUnlockTimes(user.id) : {}

  const wearSelected = () => {
    if (!user?.id || !selected || !selectedLit) return
    setEquippedBadge(user.id, selected.id)
    setEquippedId(selected.id)
    message.success(t('badgeWorn'))
  }

  return (
    <Modal
      title={`🎖 ${t('myBadges')}`}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="ok" onClick={onClose}>
          {t('myBadgesOk')}
        </Button>,
        <Button
          key="wear"
          type="primary"
          disabled={!selectedLit}
          onClick={wearSelected}
        >
          {t('achWear')}
        </Button>,
      ]}
      closable
      maskClosable={false}
      destroyOnHidden
      centered
      width={420}
    >
      <p className="my-badges-hint">{t('myBadgesHint')}</p>
      <div className="my-badges-grid">
        {ALL_ACHIEVEMENTS.map((def) => {
          const lit = unlockedSet.has(def.id)
          const worn = equippedId === def.id
          return (
            <Popover
              key={def.id}
              trigger="hover"
              mouseEnterDelay={0.15}
              placement="top"
              getPopupContainer={() => document.body}
              content={
                <BadgeIntro
                  def={def}
                  lit={lit}
                  unlockDate={unlockTimes[def.id]}
                  t={t}
                />
              }
            >
              <button
                type="button"
                className={`my-badges-tile${lit ? ' is-lit' : ' is-dim'}${worn ? ' is-worn' : ''}${selected?.id === def.id ? ' is-selected' : ''}`}
                style={{ '--badge-color': def.color } as CSSProperties}
                onClick={() => setSelected(def)}
              >
                <span className="my-badges-tile-icon">{def.icon}</span>
                <span className="my-badges-tile-name">
                  {t(def.nameKey as I18nKey)}
                </span>
              </button>
            </Popover>
          )
        })}
      </div>
      <p className="my-badges-empty" style={{ marginTop: 12 }}>
        {t('titleProgress')
          .replace('{n}', String(unlocked.length))
          .replace('{total}', String(ALL_ACHIEVEMENTS.length))}
      </p>
    </Modal>
  )
}
