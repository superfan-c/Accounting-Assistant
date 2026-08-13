import { Button, Card, Form, Input, Segmented, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import AppLogo from '../components/AppLogo'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabaseClient'

const { Title, Paragraph, Text } = Typography

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LEN = 6

type Mode = 'login' | 'register' | 'forgot'

function mapAuthError(msg: string): string {
  if (/invalid login credentials|invalid_credentials/i.test(msg)) {
    return '邮箱或密码错误'
  }
  if (/email not confirmed/i.test(msg)) {
    return '请先到邮箱点击确认链接后再登录'
  }
  if (/user already registered|already been registered/i.test(msg)) {
    return '该邮箱已注册，请直接登录。以前用验证码的账号请点「忘记密码」设置密码'
  }
  if (/password/i.test(msg) && /at least|6/i.test(msg)) {
    return `密码至少 ${MIN_PASSWORD_LEN} 位`
  }
  if (/rate|too many|security purposes/i.test(msg)) {
    return '操作过于频繁，请稍后再试'
  }
  return msg
}

export default function EmailLogin() {
  const { user, loading, recovering, finishRecovery } = useAuth()
  const { t } = useSettings()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm<{
    email: string
    password: string
    confirm: string
  }>()
  const [mode, setMode] = useState<Mode>('login')
  const [submitting, setSubmitting] = useState(false)

  const isReset = recovering || searchParams.get('mode') === 'reset'

  useEffect(() => {
    if (isReset) {
      form.resetFields(['password', 'confirm'])
    }
  }, [isReset, form])

  if (!loading && user && !isReset) {
    return <Navigate to="/" replace />
  }

  const goHome = () => navigate('/', { replace: true })

  const onLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    message.success('登录成功')
    goHome()
  }

  const onRegister = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user && (data.user.identities?.length ?? 1) === 0) {
      message.error(
        '该邮箱已注册，请直接登录。以前用验证码的账号请点「忘记密码」设置密码',
      )
      setMode('login')
      return
    }
    if (!data.session) {
      message.success('注册成功，请到邮箱点击确认链接后再登录')
      setMode('login')
      return
    }
    message.success('注册成功')
    goHome()
  }

  const onForgot = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?mode=reset`,
    })
    if (error) throw error
    message.success('重置邮件已发送，请到邮箱打开链接后设置新密码')
    setMode('login')
  }

  const onSetPassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    finishRecovery()
    message.success('密码已更新，请牢记后使用邮箱和密码登录')
    goHome()
  }

  const onFinish = async (values: {
    email?: string
    password: string
    confirm?: string
  }) => {
    try {
      setSubmitting(true)
      if (isReset) {
        if (!user) {
          message.error('重置链接无效或尚未生效，请重新点「忘记密码」')
          return
        }
        await onSetPassword(values.password)
        return
      }
      const email = String(values.email ?? '')
        .trim()
        .toLowerCase()
      if (!EMAIL_RE.test(email)) {
        message.error('请输入有效邮箱')
        return
      }
      if (mode === 'login') await onLogin(email, values.password)
      else if (mode === 'register') await onRegister(email, values.password)
      else await onForgot(email)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '操作失败'
      message.error(mapAuthError(msg))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-decor login-decor-a" />
      <div className="login-decor login-decor-b" />
      <div className="login-decor login-decor-c" />

      <Card className="login-card" bordered={false}>
        <div className="login-brand">
          <AppLogo size={72} className="login-brand-mark" />
          <div className="login-title-row">
            <Title level={2} className="login-title">
              {t('loginTitle')}
            </Title>
            {!isReset && (
              <>
                <span className="login-title-sep" aria-hidden>
                  —
                </span>
                <span className="login-slogan">{t('appSlogan')}</span>
              </>
            )}
          </div>
          <Paragraph type="secondary" className="login-sub">
            {isReset ? t('resetTitle') : t('loginSubtitle')}
          </Paragraph>
        </div>

        {!isReset && (
          <div className="login-feature-row">
            <span>☁️ 云同步</span>
            <span>🔐 安全登录</span>
            <span>📊 智能统计</span>
          </div>
        )}

        {!isReset && mode !== 'forgot' && (
          <Segmented
            block
            className="login-mode"
            value={mode}
            onChange={(v) => {
              setMode(v as Mode)
              form.resetFields(['password', 'confirm'])
            }}
            options={[
              { label: t('loginBtn'), value: 'login' },
              { label: t('registerBtn'), value: 'register' },
            ]}
          />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish}>
          {!isReset && (
            <Form.Item
              name="email"
              label={`📧 ${t('email')}`}
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
              ]}
            >
              <Input
                size="large"
                placeholder="name@example.com"
                inputMode="email"
                autoComplete="email"
                prefix={<span>✉️</span>}
              />
            </Form.Item>
          )}

          {mode !== 'forgot' && (
            <Form.Item
              name="password"
              label={`🔑 ${t('password')}`}
              rules={[
                { required: true, message: '请输入密码' },
                { min: MIN_PASSWORD_LEN, message: `密码至少 ${MIN_PASSWORD_LEN} 位` },
              ]}
            >
              <Input.Password
                size="large"
                placeholder={t('password')}
                autoComplete={
                  isReset || mode === 'register' ? 'new-password' : 'current-password'
                }
              />
            </Form.Item>
          )}

          {(isReset || mode === 'register') && (
            <Form.Item
              name="confirm"
              label={`🔑 ${t('confirmPassword')}`}
              dependencies={['password']}
              rules={[
                { required: true, message: '请再次输入密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder={t('confirmPassword')}
                autoComplete="new-password"
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={submitting}
              className="login-submit"
            >
              {isReset
                ? t('savePassword')
                : mode === 'register'
                  ? `🚀 ${t('registerBtn')}`
                  : mode === 'forgot'
                    ? t('sendReset')
                    : `🚀 ${t('loginBtn')}`}
            </Button>
          </Form.Item>
        </Form>

        {!isReset && mode === 'login' && (
          <div className="login-switch">
            <Button type="link" onClick={() => setMode('forgot')}>
              {t('forgotPassword')}
            </Button>
          </div>
        )}

        {!isReset && mode === 'forgot' && (
          <div className="login-switch">
            <Button type="link" onClick={() => setMode('login')}>
              {t('backToLogin')}
            </Button>
          </div>
        )}

        {isReset && (
          <Text type="secondary" className="login-hint">
            💡 {t('resetHint')}
          </Text>
        )}
      </Card>
    </div>
  )
}
