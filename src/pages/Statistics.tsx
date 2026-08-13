import { Col, DatePicker, Empty, Row, Statistic } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const [allRecent, setAllRecent] = useState<Record[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>()
    categories.forEach((c) => map.set(c.id, c))
    return map
  }, [categories])

  const load = useCallback(async () => {
    const monthKey = month.format('YYYY-MM')
    try {
      const [monthRecs, cats, all] = await Promise.all([
        getRecords({ month: monthKey }),
        getCategories(),
        getRecords(),
      ])
      setRecords(monthRecs)
      setCategories(cats)
      setAllRecent(all)
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

  const lineData = useMemo(() => {
    const today = dayjs().startOf('day')
    const days: { date: string; expense: number; income: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = today.subtract(i, 'day')
      const key = d.format('YYYY-MM-DD')
      let expense = 0
      let income = 0
      for (const r of allRecent) {
        if (dayjs(r.date).format('YYYY-MM-DD') !== key) continue
        if (r.type === 'expense') expense += r.amount
        else income += r.amount
      }
      days.push({
        date: d.format('MM-DD'),
        expense: fenToYuan(expense),
        income: fenToYuan(income),
      })
    }
    return days
  }, [allRecent])

  const hasMonthData = records.length > 0
  const hasTrendData = allRecent.some((r) =>
    dayjs(r.date).isAfter(dayjs().subtract(30, 'day').startOf('day')),
  )

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
        </>
      )}

      <div className="chart-block">
        <h3>近 30 天收支趋势</h3>
        {!hasTrendData ? (
          <Empty
            description="近 30 天暂无记录"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
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
        )}
      </div>
    </div>
  )
}
