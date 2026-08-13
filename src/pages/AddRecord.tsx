import { message } from 'antd'
import RecordForm from '../components/RecordForm'
import { useSettings } from '../context/SettingsContext'
import { saveRecord } from '../storage'
import type { Record } from '../types'

export default function AddRecord() {
  const { t } = useSettings()

  const handleSubmit = async (record: Record) => {
    await saveRecord({
      amount: record.amount,
      type: record.type,
      categoryId: record.categoryId,
      date: record.date,
      note: record.note,
    })
    message.success('记账成功')
  }

  return (
    <div className="page add-record-page">
      <h2 className="page-title">
        <span className="title-icon">✍️</span>
        {t('addRecord')}
      </h2>
      <RecordForm submitText={t('addRecord')} onSubmit={handleSubmit} />
    </div>
  )
}
