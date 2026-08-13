import { ConfigProvider, Spin } from 'antd'
import enUS from 'antd/locale/en_US'
import jaJP from 'antd/locale/ja_JP'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/ja'
import 'dayjs/locale/zh-cn'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import MainLayout from './layouts/MainLayout'
import CategoryManage from './pages/CategoryManage'
import EmailLogin from './pages/EmailLogin'
import './App.css'

function ProtectedRoutes() {
  const { user, loading, recovering } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        <Spin size="large" tip="Loading..." />
      </div>
    )
  }

  if (!user || recovering) {
    const fallback = recovering ? '/login?mode=reset' : '/login'
    return (
      <Routes>
        <Route path="/login" element={<EmailLogin />} />
        <Route path="*" element={<Navigate to={fallback} replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<EmailLogin />} />
      <Route path="/categories" element={<CategoryManage />} />
      <Route path="*" element={<MainLayout />} />
    </Routes>
  )
}

function AppShell() {
  const { settings } = useSettings()
  const antdLocale =
    settings.language === 'en' ? enUS : settings.language === 'ja' ? jaJP : zhCN

  dayjs.locale(
    settings.language === 'en' ? 'en' : settings.language === 'ja' ? 'ja' : 'zh-cn',
  )

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        token: {
          colorPrimary: '#2f6fed',
          borderRadius: 10,
          fontFamily: 'var(--app-font)',
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <AppShell />
    </SettingsProvider>
  )
}
