import { Col, DatePicker, Empty, Row, Statistic } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import StreakHeatmap from '../components/StreakHeatmap'
import { buildMonthHeatmapDays } from '../gamification/streakStats'
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useSettings } from '../context/SettingsContext'
import { getCategories, getRecords } from '../storage'
import type { Category, Record, RecordType } from '../types'
import { fenToYuan, formatYuan } from '../utils/format'

const EXPENSE_COLORS = [
  '#ff6b6b',
  '#ffa94d',
  '#ffd43b',
  '#fd79a8',
  '#e17055',
  '#fab1a0',
  '#ff8787',
  '#f783ac',
]

const INCOME_COLORS = [
  '#51cf66',
  '#20c997',
  '#38d9a9',
  '#94d82d',
  '#69db7c',
  '#12b886',
  '#40c057',
  '#82c91e',
]

function buildPieData(
  records: Record[],
  type: RecordType,
  categoryMap: Map<string, Category>,
) {
  const map = new Map<string, number>()
  for (const r of records) {
    if (r.type !== type) continue
    map.set(r.categoryId, (map.get(r.categoryId) ?? 0) + r.amount)
  }
  return Array.from(map.entries()).map(([categoryId, amount]) => {
    const cat = categoryMap.get(categoryId)
    return {
      name: cat ? `${cat.icon} ${cat.name}` : categoryId,
      value: fenToYuan(amount),
    }
  })
}

function PieBlock({
  title,
  data,
  colors,
  emptyText,
}: {
  title: string
  data: { name: string; value: number }[]
  colors: string[]
  emptyText: string
}) {
  return (
    <div className="chart-block">
      <h3>{title}</h3>
      {data.length === 0 ? (
        <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `¥${Number(v).toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default function Statistics({ active = true }: { active?: boolean }) {
  const { t } = useSettings()
  const [month, setMonth] = useState<Dayjs>(dayjs())
  const [records, setRecords] = useState<Record[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>()
    categories.forEach((c) => map.set(c.id, c))
    return map
  }, [categories])

  const load = useCallback(async () => {
    const monthKey = month.format('YYYY-MM')
    try {
      const [monthRecs, cats] = await Promise.all([
        getRecords({ month: monthKey }),
        getCategories(),
      ])
      setRecords(monthRecs)
      setCategories(cats)
    } catch (e) {
      console.error(e)
    }
  }, [month])

  useEffect(() => {
    if (active) void load()
  }, [load, active])

  const totals = useMemo(() => {
    let expense = 0
    let income = 0
    for (const r of records) {
      if (r.type === 'expense') expense += r.amount
      else income += r.amount
    }
    return { expense, income, balance: income - expense }
  }, [records])

  const expensePie = useMemo(
    () => buildPieData(records, 'expense', categoryMap),
    [records, categoryMap],
  )

  const incomePie = useMemo(
    () => buildPieData(records, 'income', categoryMap),
    [records, categoryMap],
  )

  const heatmapDays = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of records) {
      const key = r.date.slice(0, 10)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return buildMonthHeatmapDays(counts, month)
  }, [records, month])

  const lineData = useMemo(() => {
    const start = month.startOf('month')
    const daysInMonth = month.daysInMonth()
    const byDay = new Map<string, { expense: number; income: number }>()
    for (const r of records) {
      const key = r.date.slice(0, 10)
      const cur = byDay.get(key) ?? { expense: 0, income: 0 }
      if (r.type === 'expense') cur.expense += r.amount
      else cur.income += r.amount
      byDay.set(key, cur)
    }
    const days: { date: string; expense: number; income: number }[] = []
    for (let i = 0; i < daysInMonth; i += 1) {
      const d = start.add(i, 'day')
      const key = d.format('YYYY-MM-DD')
      const cur = byDay.get(key) ?? { expense: 0, income: 0 }
      days.push({
        date: d.format('D'),
        expense: fenToYuan(cur.expense),
        income: fenToYuan(cur.income),
      })
    }
    return days
  }, [records, month])

  const hasMonthData = records.length > 0

  return (
    <div className="page statistics-page">
      <h2 className="page-title">
        <span className="title-icon">📊</span>
        {t('statistics')}
      </h2>

      <DatePicker
        picker="month"
        value={month}
        onChange={(v) => v && setMonth(v)}
        allowClear={false}
        style={{ width: '100%', marginBottom: 16 }}
      />

      {!hasMonthData ? (
        <Empty
          style={{ marginTop: 24, marginBottom: 24 }}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="本月暂无记录"
        />
      ) : (
        <>
          <Row gutter={16} className="stat-row">
            <Col span={8}>
              <Statistic
                title="总支出"
                value={formatYuan(totals.expense)}
                prefix="¥"
                valueStyle={{ color: '#cf1322', fontSize: 18 }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="总收入"
                value={formatYuan(totals.income)}
                prefix="¥"
                valueStyle={{ color: '#3f8600', fontSize: 18 }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="结余"
                value={formatYuan(totals.balance)}
                prefix="¥"
                valueStyle={{
                  color: totals.balance >= 0 ? '#1677ff' : '#cf1322',
                  fontSize: 18,
                }}
              />
            </Col>
          </Row>

          <div className="chart-block">
            <StreakHeatmap days={heatmapDays} />
          </div>

          <PieBlock
            title="支出分类占比"
            data={expensePie}
            colors={EXPENSE_COLORS}
            emptyText="本月暂无支出"
          />

          <PieBlock
            title="收入分类占比"
            data={incomePie}
            colors={INCOME_COLORS}
            emptyText="本月暂无收入"
          />

          <div className="chart-block">
            <h3>本月收支趋势</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `¥${Number(v).toFixed(2)}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="支出"
                  stroke="#ff6b6b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="收入"
                  stroke="#51cf66"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
