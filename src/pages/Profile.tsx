import {
  Avatar,
  Button,
  Card,
  Col,
  Modal,
  Row,
  Statistic,
  message,
} from 'antd'
import Papa from 'papaparse'
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import SettingsModal from '../components/SettingsModal'
import ReminderModal from '../components/ReminderModal'
import BudgetModal from '../components/BudgetModal'
import MyBadgesModal from '../components/MyBadgesModal'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import {
  getCategories,
  getRecordSummary,
  getRecords,
  getStreakDays,
} from '../storage'
import { formatYuan } from '../utils/format'
import {
  DEFAULT_REMINDER,
  getReminderSettings,
} from '../reminderStorage'
import {
  DEFAULT_BUDGET,
  getBudgetSettings,
} from '../budgetStorage'
import {
  ACHIEVEMENT_BY_ID,
  GAMIFICATION_CHANGED_EVENT,
} from '../gamification/achievements'
import {
  getDisplayBadgeId,
  syncUnlockTimes,
} from '../gamification/gamificationStorage'
import { getUnlockedAchievements } from '../gamification/streakStats'
import { useGamificationStats } from '../gamification/useGamificationStats'
import type { I18nKey } from '../i18n/translations'
import type { BudgetSettings, ReminderSettings } from '../types'

function maskEmail(email?: string | null, fallback = '未绑定邮箱') {
  if (!email) return fallback
  const [name, domain] = email.split('@')
  if (!domain) return email
  const maskedName =
    name.length <= 2 ? `${name[0] ?? ''}*` : `${name.slice(0, 2)}***`
  return `${maskedName}@${domain}`
}

export default function Profile({ active = true }: { active?: boolean }) {
  const { user, logout } = useAuth()
  const { settings, t } = useSettings()
  const navigate = useNavigate()
  const [dayCount, setDayCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [reminderOpen, setReminderOpen] = useState(false)
  const [reminder, setReminder] = useState<ReminderSettings>(DEFAULT_REMINDER)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [budget, setBudget] = useState<BudgetSettings>(DEFAULT_BUDGET)
  const [badgesOpen, setBadgesOpen] = useState(false)
  const [equipTick, setEquipTick] = useState(0)
  const { stats: gamificationStats } = useGamificationStats(active)

  const avatar = user?.id ? settings.avatars[user.id] : undefined

  const displayBadgeId = useMemo(() => {
    if (!user?.id || !gamificationStats) return null
    return getDisplayBadgeId(user.id, gamificationStats)
  }, [user?.id, gamificationStats, equipTick])
  const displayBadge = displayBadgeId ? ACHIEVEMENT_BY_ID[displayBadgeId] : null

  useEffect(() => {
    if (!user?.id || !gamificationStats) return
    syncUnlockTimes(user.id, getUnlockedAchievements(gamificationStats))
  }, [user?.id, gamificationStats])

  useEffect(() => {
    const bump = () => setEquipTick((n) => n + 1)
    window.addEventListener(GAMIFICATION_CHANGED_EVENT, bump)
    return () => window.removeEventListener(GAMIFICATION_CHANGED_EVENT, bump)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [summary, streakDays] = await Promise.all([
        getRecordSummary(),
        getStreakDays(),
      ])
      setDayCount(summary.dayCount)
      setTotalCount(summary.totalCount)
      setStreak(streakDays)
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (active) {
      void load()
      void getReminderSettings()
        .then(setReminder)
        .catch(() => setReminder(DEFAULT_REMINDER))
      void getBudgetSettings()
        .then(setBudget)
        .catch(() => setBudget(DEFAULT_BUDGET))
    }
  }, [active, load])

  const handleExport = async () => {
    try {
      const [records, categories] = await Promise.all([
        getRecords(),
        getCategories(),
      ])
      if (records.length === 0) {
        message.warning('暂无记录可导出')
        return
      }
      const catMap = new Map(categories.map((c) => [c.id, c]))
      const rows = records.map((r) => {
        const cat = catMap.get(r.categoryId)
        return {
          日期: r.date.slice(0, 10),
          类型: r.type === 'expense' ? '支出' : '收入',
          分类: cat ? `${cat.icon} ${cat.name}` : r.categoryId,
          '金额(元)': formatYuan(r.amount),
          备注: r.note ?? '',
        }
      })
      const csv = Papa.unparse(rows)
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `全部记账记录.csv`
      a.click()
      URL.revokeObjectURL(url)
      message.success('导出成功')
    } catch (e) {
      message.error(e instanceof Error ? e.message : '导出失败')
    }
  }

  const handleLogout = () => {
    Modal.confirm({
      title: t('logoutConfirm'),
      content: t('logoutContent'),
      okText: t('logout'),
      okButtonProps: { danger: true },
      onOk: async () => {
        await logout()
        navigate('/login', { replace: true })
      },
    })
  }

  return (
    <div className="page profile-page">
      <div className="page-header">
        <h2 className="page-title">
          <span className="title-icon">👤</span>
          {t('profile')}
        </h2>
        <Button onClick={() => setSettingsOpen(true)}>⚙️ {t('settings')}</Button>
      </div>

      <Card className="profile-hero" loading={loading}>
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-ring">
            <Avatar
              size={80}
              src={avatar}
              style={{ backgroundColor: '#91caff', fontSize: 36 }}
            >
              👤
            </Avatar>
            {displayBadge ? (
              <span
                className="profile-avatar-badge"
                title={t(displayBadge.nameKey as I18nKey)}
                style={{ '--badge-color': displayBadge.color } as CSSProperties}
              >
                {displayBadge.icon}
              </span>
            ) : null}
          </div>
          <div className="profile-identity">
            <div className="profile-phone">
              {maskEmail(user?.email, t('noEmail'))}
            </div>
            {displayBadge ? (
              <div className="profile-auto-title">
                {displayBadge.icon} {t(displayBadge.titleKey as I18nKey)}
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Row gutter={8} className="profile-stats">
        <Col span={8}>
          <Card size="small">
            <Statistic title={`📅 ${t('days')}`} value={dayCount} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title={`🧾 ${t('count')}`} value={totalCount} />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic title={`🔥 ${t('streak')}`} value={streak} />
          </Card>
        </Col>
      </Row>

      <button
        type="button"
        className="profile-nav-item"
        onClick={() => setBadgesOpen(true)}
      >
        <span>🎖 {t('myBadges')}</span>
        <span className="profile-nav-extra">
          {t('myBadgesUnlocked')}
          <span className="profile-nav-arrow">›</span>
        </span>
      </button>

      <button
        type="button"
        className="profile-nav-item"
        onClick={() => setReminderOpen(true)}
      >
        <span>⏰ {t('reminder')}</span>
        <span className="profile-nav-extra">
          {reminder.enabled ? t('reminderOn') : t('reminderOff')}
          <span className="profile-nav-arrow">›</span>
        </span>
      </button>

      <button
        type="button"
        className="profile-nav-item"
        onClick={() => setBudgetOpen(true)}
      >
        <span>💰 {t('budget')}</span>
        <span className="profile-nav-extra">
          {budget.enabled && budget.monthAmount > 0
            ? t('budgetOn')
            : t('budgetOff')}
          <span className="profile-nav-arrow">›</span>
        </span>
      </button>

      <Button
        block
        size="large"
        type="primary"
        onClick={() => void handleExport()}
        style={{ marginTop: 16 }}
      >
        📤 {t('export')}
      </Button>
      <Button
        block
        size="large"
        danger
        type="text"
        onClick={handleLogout}
        style={{ marginTop: 12 }}
      >
        {t('logout')}
      </Button>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userId={user?.id}
      />
      <ReminderModal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        onSaved={setReminder}
      />
      <BudgetModal
        open={budgetOpen}
        onClose={() => setBudgetOpen(false)}
        onSaved={setBudget}
      />
      <MyBadgesModal
        open={badgesOpen}
        onClose={() => setBadgesOpen(false)}
        stats={gamificationStats}
      />
    </div>
  )
}
