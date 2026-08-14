import {
  Button,
  DatePicker,
  Empty,
  Input,
  Modal,
  Segmented,
  Space,
  Tag,
  message,
} from 'antd'
import { SwipeAction } from 'antd-mobile'
import dayjs, { type Dayjs } from 'dayjs'
import Papa from 'papaparse'
import { useCallback, useEffect, useMemo, useState } from 'react'
import RecordForm from '../components/RecordForm'
import {
  deleteRecord,
  getCategories,
  getRecords,
  updateRecord,
} from '../storage'
import type { Category, Record } from '../types'
import { formatYuan } from '../utils/format'
import { notifyBudgetChanged } from '../utils/budget'
import { useSettings } from '../context/SettingsContext'

interface GroupedMonth {
  month: string
  records: Record[]
  expenseTotal: number
  incomeTotal: number
}

interface Props {
  active?: boolean
}

type PeriodMode = 'month' | 'year'

export default function RecordList({ active = true }: Props) {
  const { t } = useSettings()
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month')
  const [period, setPeriod] = useState<Dayjs>(dayjs())
  const [keyword, setKeyword] = useState('')
  const [records, setRecords] = useState<Record[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<Record | null>(null)
  const [actionRecord, setActionRecord] = useState<Record | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>()
    categories.forEach((c) => map.set(c.id, c))
    return map
  }, [categories])

  const load = useCallback(async () => {
    try {
      const filter =
        periodMode === 'year'
          ? { year: period.format('YYYY') }
          : { month: period.format('YYYY-MM') }
      const [recs, cats] = await Promise.all([
        getRecords(filter),
        getCategories(),
      ])
      setRecords(recs)
      setCategories(cats)
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败')
    }
  }, [period, periodMode])

  useEffect(() => {
    if (active) void load()
  }, [load, active])

  const periodKey = useMemo(
    () =>
      periodMode === 'year' ? period.format('YYYY') : period.format('YYYY-MM'),
    [period, periodMode],
  )

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return records
    return records.filter((r) => {
      const cat = categoryMap.get(r.categoryId)
      const note = r.note?.toLowerCase() ?? ''
      const catName = cat?.name.toLowerCase() ?? ''
      return note.includes(kw) || catName.includes(kw)
    })
  }, [records, keyword, categoryMap])

  const summary = useMemo(() => {
    let expense = 0
    let income = 0
    for (const r of filtered) {
      if (r.type === 'expense') expense += r.amount
      else income += r.amount
    }
    return { expense, income, balance: income - expense }
  }, [filtered])

  const groups = useMemo(() => {
    const map = new Map<string, GroupedMonth>()
    for (const r of filtered) {
      const m = r.date.slice(0, 7)
      let g = map.get(m)
      if (!g) {
        g = { month: m, records: [], expenseTotal: 0, incomeTotal: 0 }
        map.set(m, g)
      }
      g.records.push(r)
      if (r.type === 'expense') g.expenseTotal += r.amount
      else g.incomeTotal += r.amount
    }
    return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month))
  }, [filtered])

  const handleDelete = async (id: string) => {
    await deleteRecord(id)
    notifyBudgetChanged()
    message.success('已删除')
    setDeleteId(null)
    setActionRecord(null)
    await load()
  }

  const handleUpdate = async (record: Record) => {
    await updateRecord(record.id, {
      amount: record.amount,
      type: record.type,
      categoryId: record.categoryId,
      date: record.date,
      note: record.note,
    })
    message.success('修改成功')
    notifyBudgetChanged()
    setEditing(null)
    await load()
  }

  const handleExport = () => {
    if (filtered.length === 0) {
      message.warning('当前没有可导出的记录')
      return
    }
    const rows = filtered.map((r) => {
      const cat = categoryMap.get(r.categoryId)
      return {
        日期: dayjs(r.date).format('YYYY-MM-DD'),
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
    a.download = `${periodKey}-记账记录.csv`
    a.click()
    URL.revokeObjectURL(url)
    message.success('导出成功')
  }

  const emptyText =
    periodMode === 'year' ? '本年暂无记录' : '本月暂无记录'

  return (
    <div className="page record-list-page">
      <div className="page-header">
        <h2 className="page-title">
          <span className="title-icon">📋</span>
          {t('records')}
        </h2>
        <Button type="primary" onClick={handleExport}>
          导出 CSV
        </Button>
      </div>

      <div className="summary-cards">
        <div className="summary-card expense">
          <span className="summary-label">支出</span>
          <strong>¥{formatYuan(summary.expense)}</strong>
        </div>
        <div className="summary-card income">
          <span className="summary-label">收入</span>
          <strong>¥{formatYuan(summary.income)}</strong>
        </div>
        <div className="summary-card balance">
          <span className="summary-label">结余</span>
          <strong>¥{formatYuan(summary.balance)}</strong>
        </div>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Segmented
          block
          value={periodMode}
          onChange={(v) => setPeriodMode(v as PeriodMode)}
          options={[
            {
              label: (
                <span className="seg-with-icon">
                  <span>📅</span>
                  {t('byMonth')}
                </span>
              ),
              value: 'month',
            },
            {
              label: (
                <span className="seg-with-icon">
                  <span>🗓️</span>
                  {t('byYear')}
                </span>
              ),
              value: 'year',
            },
          ]}
        />
        <DatePicker
          picker={periodMode === 'year' ? 'year' : 'month'}
          value={period}
          onChange={(v) => v && setPeriod(v)}
          allowClear={false}
          style={{ width: '100%' }}
        />
        <Input.Search
          placeholder="🔍 搜索备注、分类名"
          allowClear
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </Space>

      {groups.length === 0 ? (
        <Empty style={{ marginTop: 48 }} description={emptyText} />
      ) : (
        groups.map((g) => (
          <div key={g.month} className="month-group">
            <div className="month-summary">
              <span className="month-label">📅 {g.month}</span>
              <span className="month-totals">
                <span className="tot-exp">支 ¥{formatYuan(g.expenseTotal)}</span>
                <span className="tot-inc">收 ¥{formatYuan(g.incomeTotal)}</span>
              </span>
            </div>
            <div className="record-stack">
              {g.records.map((item) => {
                const cat = categoryMap.get(item.categoryId)
                const isExpense = item.type === 'expense'
                return (
                  <SwipeAction
                    key={item.id}
                    rightActions={[
                      {
                        key: 'edit',
                        text: '编辑',
                        color: 'primary',
                        onClick: () => setEditing(item),
                      },
                      {
                        key: 'delete',
                        text: '删除',
                        color: 'danger',
                        onClick: () => setDeleteId(item.id),
                      },
                    ]}
                  >
                    <div
                      className={`record-card ${isExpense ? 'is-expense' : 'is-income'}`}
                      onClick={() => setActionRecord(item)}
                    >
                      <span className="cat-icon">{cat?.icon ?? '📌'}</span>
                      <div className="record-main">
                        <div className="record-title-row">
                          <span className="record-name">
                            {cat?.name ?? '未知分类'}
                          </span>
                          <Tag color={isExpense ? 'red' : 'green'}>
                            {isExpense ? '支出' : '收入'}
                          </Tag>
                        </div>
                        <div className="record-meta">
                          <span>{dayjs(item.date).format('MM-DD')}</span>
                          {item.note ? <span> · {item.note}</span> : null}
                        </div>
                      </div>
                      <div
                        className={`record-amount ${isExpense ? 'neg' : 'pos'}`}
                      >
                        {isExpense ? '-' : '+'}¥{formatYuan(item.amount)}
                      </div>
                    </div>
                  </SwipeAction>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* 操作弹窗：右上角 X 关闭 */}
      <Modal
        title="记录操作"
        open={!!actionRecord}
        onCancel={() => setActionRecord(null)}
        footer={null}
        closable
        destroyOnHidden
        centered
      >
        {actionRecord ? (
          <div className="action-modal-body">
            <p className="action-hint">请选择要对这条记录执行的操作</p>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                type="primary"
                block
                size="large"
                onClick={() => {
                  setEditing(actionRecord)
                  setActionRecord(null)
                }}
              >
                ✏️ 编辑
              </Button>
              <Button
                danger
                block
                size="large"
                onClick={() => {
                  setDeleteId(actionRecord.id)
                  setActionRecord(null)
                }}
              >
                🗑️ 删除
              </Button>
            </Space>
          </div>
        ) : null}
      </Modal>

      {/* 删除二次确认：右上角 X 关闭 */}
      <Modal
        title="确认删除"
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        closable
        centered
        okText="确认删除"
        okButtonProps={{ danger: true }}
        cancelText="取消"
        onOk={() => deleteId && handleDelete(deleteId)}
        destroyOnHidden
      >
        <p>删除后无法恢复，确定要删除这条记录吗？</p>
      </Modal>

      {/* 编辑弹窗：右上角 X 关闭 */}
      <Modal
        title="编辑记录"
        open={!!editing}
        onCancel={() => setEditing(null)}
        footer={null}
        closable
        destroyOnHidden
        centered
      >
        {editing && (
          <RecordForm
            initial={editing}
            submitText="保存修改"
            onSubmit={handleUpdate}
          />
        )}
      </Modal>
    </div>
  )
}
