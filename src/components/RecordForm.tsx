import { Button, DatePicker, Form, Input, InputNumber, Select, Segmented } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { getCategories } from '../storage'
import type { Category, Record, RecordType } from '../types'
import { fenToYuan, yuanToFen } from '../utils/format'

export interface RecordFormValues {
  type: RecordType
  amount: number
  categoryId: string
  date: Dayjs
  note?: string
}

interface RecordFormProps {
  initial?: Record
  submitText?: string
  onSubmit: (record: Record) => Promise<void> | void
  onSuccess?: () => void
}

export default function RecordForm({
  initial,
  submitText = '保存',
  onSubmit,
  onSuccess,
}: RecordFormProps) {
  const { t } = useSettings()
  const [form] = Form.useForm<RecordFormValues>()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const type = Form.useWatch('type', form) ?? 'expense'

  const loadCategories = async () => {
    setCategories(await getCategories())
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  useEffect(() => {
    if (initial) {
      form.setFieldsValue({
        type: initial.type,
        amount: fenToYuan(initial.amount),
        categoryId: initial.categoryId,
        date: dayjs(initial.date),
        note: initial.note,
      })
    } else {
      form.setFieldsValue({
        type: 'expense',
        amount: undefined,
        categoryId: undefined,
        date: dayjs(),
        note: '',
      })
    }
  }, [initial, form])

  const typeCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  )

  const handleTypeChange = (value: RecordType) => {
    form.setFieldsValue({ type: value, categoryId: undefined })
  }

  const handleFinish = async (values: RecordFormValues) => {
    if (!values.amount || values.amount <= 0) return
    if (!values.categoryId) return

    setLoading(true)
    try {
      const record: Record = {
        id: initial?.id ?? '',
        amount: yuanToFen(values.amount),
        type: values.type,
        categoryId: values.categoryId,
        date: values.date.format('YYYY-MM-DD'),
        note: values.note?.trim() || undefined,
        createdAt: initial?.createdAt ?? new Date().toISOString(),
      }
      await onSubmit(record)
      if (!initial) {
        form.resetFields()
        form.setFieldsValue({ type: values.type, date: dayjs(), note: '' })
      }
      onSuccess?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ type: 'expense', date: dayjs() }}
    >
      <Form.Item name="type" label="类型">
        <Segmented
          block
          options={[
            {
              label: (
                <span className="seg-with-icon">
                  <span>💸</span>
                  {t('expense')}
                </span>
              ),
              value: 'expense',
            },
            {
              label: (
                <span className="seg-with-icon">
                  <span>💰</span>
                  {t('income')}
                </span>
              ),
              value: 'income',
            },
          ]}
          onChange={(v) => handleTypeChange(v as RecordType)}
        />
      </Form.Item>

      <Form.Item
        name="amount"
        label="金额（元）"
        rules={[
          { required: true, message: '请输入金额' },
          {
            validator: (_, value) =>
              value > 0 ? Promise.resolve() : Promise.reject(new Error('金额必须大于 0')),
          },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0.01}
          step={0.01}
          precision={2}
          placeholder="0.00"
          prefix="¥"
        />
      </Form.Item>

      <Form.Item
        name="categoryId"
        label="分类"
        rules={[{ required: true, message: '请选择分类' }]}
      >
        <Select
          placeholder="选择分类"
          options={typeCategories.map((c) => ({
            value: c.id,
            label: `${c.icon} ${c.name}`,
          }))}
          dropdownRender={(menu) => (
            <>
              {menu}
              <div style={{ padding: '8px 12px', borderTop: '1px solid #f0f0f0' }}>
                <Link to="/categories">管理分类</Link>
              </div>
            </>
          )}
        />
      </Form.Item>

      <Form.Item
        name="date"
        label="日期"
        rules={[{ required: true, message: '请选择日期' }]}
      >
        <DatePicker style={{ width: '100%' }} allowClear={false} />
      </Form.Item>

      <Form.Item name="note" label="备注">
        <Input.TextArea rows={2} placeholder="可选" maxLength={100} showCount />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
          {submitText}
        </Button>
      </Form.Item>
    </Form>
  )
}
