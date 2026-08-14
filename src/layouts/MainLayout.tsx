import { TabBar } from 'antd-mobile'
import {
  AppOutline,
  PieOutline,
  UnorderedListOutline,
  UserOutline,
} from 'antd-mobile-icons'
import { useLocation, useNavigate } from 'react-router-dom'
import AppLogo from '../components/AppLogo'
import AchievementUnlockModal from '../components/AchievementUnlockModal'
import BudgetAlertModal from '../components/BudgetAlertModal'
import { useSettings } from '../context/SettingsContext'
import AddRecord from '../pages/AddRecord'
import Profile from '../pages/Profile'
import RecordList from '../pages/RecordList'
import Statistics from '../pages/Statistics'
import {
  backgroundClassName,
  resolveBackgroundStyle,
} from '../utils/background'

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { settings, t } = useSettings()

  const tabs = [
    { key: '/', title: t('tabAdd'), icon: <AppOutline /> },
    { key: '/records', title: t('tabRecords'), icon: <UnorderedListOutline /> },
    { key: '/statistics', title: t('tabStats'), icon: <PieOutline /> },
    { key: '/profile', title: t('tabProfile'), icon: <UserOutline /> },
  ]

  const active = tabs.some((tab) => tab.key === location.pathname)
    ? location.pathname
    : '/'

  return (
    <div
      className={`main-layout ${backgroundClassName(settings)}`}
      style={resolveBackgroundStyle(settings)}
    >
      <div className="app-top-bar">
        <div className="app-brand">
          <AppLogo size={34} className="app-brand-logo" />
          <div className="app-brand-text">
            <span className="app-brand-name">{t('appName')}</span>
            <span className="app-brand-sep" aria-hidden>
              —
            </span>
            <span className="app-brand-slogan">{t('appSlogan')}</span>
          </div>
        </div>
      </div>
      <div className="main-content">
        <div style={{ display: active === '/' ? 'block' : 'none' }}>
          <AddRecord />
        </div>
        <div style={{ display: active === '/records' ? 'block' : 'none' }}>
          <RecordList active={active === '/records'} />
        </div>
        <div style={{ display: active === '/statistics' ? 'block' : 'none' }}>
          <Statistics active={active === '/statistics'} />
        </div>
        <div style={{ display: active === '/profile' ? 'block' : 'none' }}>
          <Profile active={active === '/profile'} />
        </div>
      </div>
      <BudgetAlertModal />
      <AchievementUnlockModal />
      <div className="tab-bar-wrap">
        <TabBar activeKey={active} onChange={(key) => navigate(key)}>
          {tabs.map((item) => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  )
}
