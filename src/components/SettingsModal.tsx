import { Avatar, Button, Modal, Segmented, Upload, message } from 'antd'
import { useSettings } from '../context/SettingsContext'
import type { BgPreset, FontPreset, Lang } from '../settings'

const PRESETS: { key: BgPreset; label: string; swatch: string }[] = [
  {
    key: 'default',
    label: '💙 清爽蓝',
    swatch: 'linear-gradient(160deg, #e8f0ff, #f5f7fb)',
  },
  {
    key: 'mint',
    label: '💚 薄荷绿',
    swatch: 'linear-gradient(160deg, #d8f5e7, #f0faf5)',
  },
  {
    key: 'sunset',
    label: '🧡 暖日落',
    swatch: 'linear-gradient(160deg, #ffe8d6, #fff5eb)',
  },
  {
    key: 'ocean',
    label: '🩵 深海青',
    swatch: 'linear-gradient(160deg, #d6f0ff, #eef8ff)',
  },
]

interface Props {
  open: boolean
  onClose: () => void
  userId?: string
}

function readImageAsDataUrl(file: File, maxMb: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('请上传图片文件'))
      return
    }
    if (file.size > maxMb * 1024 * 1024) {
      reject(new Error(`图片请小于 ${maxMb}MB`))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('读取失败'))
    reader.readAsDataURL(file)
  })
}

export default function SettingsModal({ open, onClose, userId }: Props) {
  const { settings, updateSettings, t } = useSettings()
  const avatar = userId ? settings.avatars[userId] : undefined

  return (
    <Modal
      title={`⚙️ ${t('settingsTitle')}`}
      open={open}
      onCancel={onClose}
      footer={null}
      closable
      destroyOnHidden
      width={420}
    >
      <div className="settings-section">
        <h4>🖼️ {t('avatarSection')}</h4>
        <div className="settings-avatar-row">
          <Avatar
            size={64}
            src={avatar}
            style={{ backgroundColor: '#bfbfbf', fontSize: 28 }}
          >
            👤
          </Avatar>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              void readImageAsDataUrl(file, 2)
                .then((dataUrl) => {
                  if (!userId) return
                  updateSettings((prev) => ({
                    ...prev,
                    avatars: { ...prev.avatars, [userId]: dataUrl },
                  }))
                  message.success('OK')
                })
                .catch((e) => message.error(e instanceof Error ? e.message : '失败'))
              return false
            }}
          >
            <Button type="primary">{t('uploadAvatar')}</Button>
          </Upload>
          {avatar ? (
            <Button
              onClick={() => {
                if (!userId) return
                updateSettings((prev) => {
                  const next = { ...prev.avatars }
                  delete next[userId]
                  return { ...prev, avatars: next }
                })
              }}
            >
              {t('removeAvatar')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="settings-section">
        <h4>🎨 {t('bgSection')}</h4>
        <div className="bg-preset-grid">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`bg-preset-card ${settings.bgPreset === p.key ? 'active' : ''}`}
              onClick={() => updateSettings({ bgPreset: p.key })}
            >
              <span className="bg-swatch" style={{ background: p.swatch }} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
        <div className="bg-upload-row">
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              void readImageAsDataUrl(file, 3)
                .then((dataUrl) => {
                  updateSettings({ bgPreset: 'custom', customBg: dataUrl })
                  message.success('OK')
                })
                .catch((e) => message.error(e instanceof Error ? e.message : '失败'))
              return false
            }}
          >
            <Button type="primary">📷 {t('uploadBg')}</Button>
          </Upload>
          {settings.bgPreset === 'custom' ? (
            <Button
              onClick={() =>
                updateSettings({ bgPreset: 'default', customBg: undefined })
              }
            >
              {t('resetBg')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="settings-section">
        <h4>🔤 {t('fontSection')}</h4>
        <Segmented
          block
          value={settings.fontPreset}
          onChange={(v) => updateSettings({ fontPreset: v as FontPreset })}
          options={[
            { label: `Aa ${t('fontDefault')}`, value: 'default' },
            { label: `文 ${t('fontSerif')}`, value: 'serif' },
            { label: `黑 ${t('fontSans')}`, value: 'sans' },
            { label: `</> ${t('fontMono')}`, value: 'mono' },
          ]}
        />
      </div>

      <div className="settings-section">
        <h4>🌐 {t('langSection')}</h4>
        <Segmented
          block
          value={settings.language}
          onChange={(v) => updateSettings({ language: v as Lang })}
          options={[
            { label: `🇨🇳 ${t('langZh')}`, value: 'zh' },
            { label: `🇺🇸 ${t('langEn')}`, value: 'en' },
            { label: `🇯🇵 ${t('langJa')}`, value: 'ja' },
          ]}
        />
      </div>
    </Modal>
  )
}
