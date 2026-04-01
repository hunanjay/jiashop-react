import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Package, ReceiptText, ShieldCheck, Users } from 'lucide-react'

import { useApp } from '../../lib/app-context'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { formatCurrency, parseApiDateTime } from '../../lib/format'

const ORDER_STATUS_LABELS = {
  Pending: '待处理',
  Processing: '处理中',
  Shipped: '已发货',
  Completed: '已完成',
  Cancelled: '已取消',
}

export default function DashboardPage({ scope = 'admin' }) {
  const { products, session, isSuperAdmin, pushToast } = useApp()
  const isWorkspace = scope === 'workspace'
  const [orders, setOrders] = useState([])
  const [workspaceProducts, setWorkspaceProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let mounted = true
    Promise.all([
      api.get(isWorkspace ? '/workspace/orders' : '/admin/orders').then((res) => res.data).catch(() => []),
      isWorkspace ? api.get('/workspace/products').then((res) => res.data).catch(() => []) : Promise.resolve([]),
      api.get(isWorkspace ? '/workspace/customers' : '/admin/customers').then((res) => res.data).catch(() => []),
      !isWorkspace && isSuperAdmin ? api.get('/admin/users').then((res) => res.data).catch(() => []) : Promise.resolve([]),
      !isWorkspace ? api.get('/admin/stats').then((res) => res.data).catch(() => null) : Promise.resolve(null),
    ]).then(([orderData, workspaceProductData, customerData, userData, statData]) => {
      if (!mounted) return
      setOrders(orderData)
      setWorkspaceProducts(workspaceProductData)
      setCustomers(customerData)
      setUsers(userData)
      setStats(statData)
      if (!isWorkspace && !statData) {
        pushToast('error', '看板统计加载失败')
      }
    })

    return () => {
      mounted = false
    }
  }, [isSuperAdmin, isWorkspace, pushToast])

  const visibleOrders = orders

  const rollingDailyTrend = useMemo(() => {
    const now = new Date()
    const dayMap = new Map()

    for (let index = 6; index >= 0; index -= 1) {
      const day = new Date(now)
      day.setDate(now.getDate() - index)
      const key = toLocalDateKey(day)
      dayMap.set(key, {
        label: formatTrendDayLabel(day, now),
        orders: 0,
        sales_total: 0,
      })
    }

    visibleOrders.forEach((order) => {
      const createdAt = parseApiDateTime(order.created_at)
      if (!createdAt || Number.isNaN(createdAt.getTime())) return
      const key = toLocalDateKey(createdAt)
      const bucket = dayMap.get(key)
      if (!bucket) return
      bucket.orders += 1
      bucket.sales_total += Number(order.total_price || 0)
    })

    return Array.from(dayMap.values())
  }, [visibleOrders])

  const monthlySalesTrend = useMemo(() => {
    const now = new Date()
    const monthIndex = now.getMonth()
    const year = now.getFullYear()
    const daysInMonth = now.getDate()

    const buckets = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1
      return {
        day,
        label: `${day}日`,
        sales_total: 0,
      }
    })

    visibleOrders.forEach((order) => {
      const createdAt = parseApiDateTime(order.created_at)
      if (!createdAt || Number.isNaN(createdAt.getTime())) return
      if (createdAt.getFullYear() !== year || createdAt.getMonth() !== monthIndex) return
      const bucket = buckets[createdAt.getDate() - 1]
      if (!bucket) return
      bucket.sales_total += Number(order.total_price || 0)
    })

    return buckets
  }, [visibleOrders])

  const monthlySalesPeak = useMemo(
    () => Math.max(1, ...monthlySalesTrend.map((item) => Number(item.sales_total || 0))),
    [monthlySalesTrend],
  )

  const monthlySalesTotal = useMemo(
    () => monthlySalesTrend.reduce((sum, item) => sum + Number(item.sales_total || 0), 0),
    [monthlySalesTrend],
  )

  const overviewCards = useMemo(
    () => [
      { label: '商品总数', value: isWorkspace ? workspaceProducts.length : products.length, icon: Package },
      { label: '订单数', value: stats?.orders ?? visibleOrders.length, icon: ReceiptText },
      { label: '客户数', value: stats?.customers ?? customers.length, icon: Users },
      { label: '总销售额', value: formatCurrency(stats?.sales_total ?? visibleOrders.reduce((sum, item) => sum + Number(item.total_price || 0), 0)), icon: ShieldCheck },
    ],
    [customers.length, isWorkspace, products.length, stats, visibleOrders, workspaceProducts.length],
  )

  const statusBreakdown = stats?.status_distribution?.length
    ? stats.status_distribution
    : [
        { status: 'Processing', count: visibleOrders.filter((order) => order.status === 'Processing').length },
        { status: 'Pending', count: visibleOrders.filter((order) => order.status === 'Pending').length },
        { status: 'Completed', count: visibleOrders.filter((order) => order.status === 'Completed').length },
      ]

  const ranking =
    stats?.sales_ranking ||
    (isWorkspace
      ? [{ username: session?.username || 'Me', sales_total: visibleOrders.reduce((sum, item) => sum + Number(item.total_price || 0), 0), order_count: visibleOrders.length }]
      : [])

  const customerSummary =
    stats?.customer_summary || {
      owner_distribution: [{ username: session?.username || 'Me', count: customers.length }],
    }

  const ownerNameById = (ownerId) => users.find((user) => user.id === ownerId)?.username || session?.username || ownerId || '未归属'

  return (
    <div className="space-y-3 text-zinc-100">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="border-white/10 bg-white/6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">{item.label}</div>
                  <div className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] text-white">{item.value}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400 text-white shadow-[0_10px_18px_rgba(129,140,248,0.24)]">
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Card className="border-white/10 bg-white/6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base">订单分布统计</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <BarChart3 className="h-3.5 w-3.5" />
              实时统计
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-2">
            {statusBreakdown.map((item) => (
              <PanelItem key={item.status} label={getOrderStatusLabel(item.status)} value={item.count} />
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">业绩排行</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-2">
            {ranking.length ? (
              ranking.slice(0, 4).map((item, index) => (
                <div key={item.username} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <div>
                    <div className="font-medium text-white">
                      {index + 1}. {item.username}
                    </div>
                    <div className="text-xs text-zinc-500">订单数 {item.order_count}</div>
                  </div>
                  <div className="text-xs font-semibold text-white">{formatCurrency(item.sales_total)}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-500">暂无业绩数据</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base">动态近 7 天趋势</CardTitle>
            <Badge variant="secondary">滚动日期</Badge>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-2">
            {rollingDailyTrend.length ? (
              rollingDailyTrend.map((item) => <TrendBar key={item.label} label={item.label} value={item.orders} sales={item.sales_total} />)
            ) : (
              <div className="text-sm text-zinc-500">暂无趋势数据</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base">本月销量折线图</CardTitle>
            <Badge variant="secondary">金额</Badge>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <MonthlySalesChart points={monthlySalesTrend} peak={monthlySalesPeak} total={monthlySalesTotal} />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">客户归属分布</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-2">
            {customerSummary.owner_distribution.length ? (
              customerSummary.owner_distribution.map((item) => <PanelItem key={item.username} label={item.username} value={item.count} />)
            ) : (
              <div className="text-sm text-zinc-500">暂无归属数据</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PanelItem({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="text-base font-semibold text-white">{value}</span>
    </div>
  )
}

function TrendBar({ label, value, sales }) {
  const width = Math.min(100, Math.max(8, value * 14))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-300">{label}</span>
        <span className="text-zinc-500">
          {value} 单 · {formatCurrency(sales)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 transition-all" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

function MonthlySalesChart({ points, peak, total }) {
  const width = 640
  const height = 240
  const padding = 28
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const maxValue = Math.max(Number(peak || 0), 1)
  const xStep = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth

  const scaledPoints = points.map((point, index) => {
    const x = padding + index * xStep
    const y = padding + chartHeight - (Number(point.sales_total || 0) / maxValue) * chartHeight
    return { ...point, x, y }
  })

  const linePoints = scaledPoints.map((point) => `${point.x},${point.y}`).join(' ')
  const areaPoints = [`${padding},${padding + chartHeight}`, ...scaledPoints.map((point) => `${point.x},${point.y}`), `${padding + chartWidth},${padding + chartHeight}`].join(' ')
  const yTicks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">本月累计销售额</div>
          <div className="mt-1 text-xl font-semibold text-white">{formatCurrency(total)}</div>
        </div>
        <div className="text-xs text-zinc-500">横坐标：本月日期</div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[240px] w-full">
          <defs>
            <linearGradient id="salesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="55%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="salesFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
              <stop offset="100%" stopColor="rgba(56,189,248,0.02)" />
            </linearGradient>
          </defs>

          {yTicks.map((ratio) => {
            const y = padding + chartHeight - chartHeight * ratio
            const value = maxValue * ratio
            return (
              <g key={ratio}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" />
                <text x={8} y={y + 4} fill="rgba(161,161,170,0.8)" fontSize="10">
                  {formatCurrency(value)}
                </text>
              </g>
            )
          })}

          {linePoints ? <polygon points={areaPoints} fill="url(#salesFill)" /> : null}

          {linePoints ? (
            <polyline
              fill="none"
              stroke="url(#salesGradient)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={linePoints}
            />
          ) : null}

          {scaledPoints.map((point, index) => {
            const showLabel = index === 0 || index === scaledPoints.length - 1 || (index + 1) % 5 === 0
            return (
              <g key={point.label}>
                <circle cx={point.x} cy={point.y} r="4.5" fill="url(#salesGradient)" />
                {showLabel ? (
                  <text x={point.x} y={height - 8} textAnchor="middle" fill="rgba(161,161,170,0.85)" fontSize="10">
                    {point.label}
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

function getOrderStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] || status || '未知状态'
}

function formatTrendDayLabel(day, now) {
  const diffDays = Math.round((now.getTime() - day.getTime()) / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  return `${String(day.getMonth() + 1).padStart(2, '0')}/${String(day.getDate()).padStart(2, '0')}`
}

function toLocalDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
