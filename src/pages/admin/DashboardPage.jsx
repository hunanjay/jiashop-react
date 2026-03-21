import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Package, ReceiptText, ShieldCheck, Users } from 'lucide-react'

import { useApp } from '../../lib/app-context'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { formatCurrency } from '../../lib/format'

export default function DashboardPage() {
  const { products, isSuperAdmin, pushToast } = useApp()
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [reportView, setReportView] = useState('weekly')

  useEffect(() => {
    let mounted = true
    Promise.all([
      api.get('/admin/orders').then((res) => res.data).catch(() => []),
      isSuperAdmin ? api.get('/admin/users').then((res) => res.data).catch(() => []) : Promise.resolve([]),
      api.get('/admin/stats').then((res) => res.data).catch(() => null),
    ]).then(([orderData, userData, statData]) => {
      if (!mounted) return
      setOrders(orderData)
      setUsers(userData)
      setStats(statData)
      if (!statData) {
        pushToast('error', '看板统计加载失败')
      }
    })

    return () => {
      mounted = false
    }
  }, [isSuperAdmin, pushToast])

  const overviewCards = useMemo(
    () => [
      { label: '商品总数', value: products.length, icon: Package },
      { label: '订单数', value: stats?.orders ?? orders.length, icon: ReceiptText },
      { label: '客户数', value: stats?.customers ?? 0, icon: Users },
      { label: '总销售额', value: formatCurrency(stats?.sales_total ?? orders.reduce((sum, item) => sum + Number(item.total_price || 0), 0)), icon: ShieldCheck },
    ],
    [orders, products.length, stats],
  )

  const statusBreakdown = stats?.status_distribution?.length
    ? stats.status_distribution
    : [
        { status: 'Processing', count: orders.filter((order) => order.status === 'Processing').length },
        { status: 'Pending', count: orders.filter((order) => order.status === 'Pending').length },
        { status: 'Completed', count: orders.filter((order) => order.status === 'Completed').length },
      ]

  const ranking = stats?.sales_ranking || []
  const dailyTrend = stats?.daily_trend || []
  const weeklySummary = stats?.weekly_summary || []
  const monthlySummary = stats?.monthly_summary || { orders: 0, sales_total: 0 }
  const customerSummary = stats?.customer_summary || { recent: [], owner_distribution: [] }
  const ownerNameById = (ownerId) => users.find((user) => user.id === ownerId)?.username || ownerId || '未归属'

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
              <PanelItem key={item.status} label={item.status} value={item.count} />
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
            <CardTitle className="text-base">最近 7 天趋势</CardTitle>
            <Badge variant="secondary">订单与销售额</Badge>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-2">
            {dailyTrend.length ? (
              dailyTrend.slice(0, 5).map((item) => (
                <TrendBar key={item.label} label={item.label} value={item.orders} sales={item.sales_total} />
              ))
            ) : (
              <div className="text-sm text-zinc-500">暂无趋势数据</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
            <CardTitle className="text-base">周报 / 月报</CardTitle>
            <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setReportView('weekly')}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  reportView === 'weekly' ? 'bg-white/20 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                周报
              </button>
              <button
                type="button"
                onClick={() => setReportView('monthly')}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  reportView === 'monthly' ? 'bg-white/20 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                月报
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-2">
            {reportView === 'weekly' ? (
              <div className="space-y-2">
                {weeklySummary.length ? (
                  weeklySummary.slice(0, 3).map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                      <div>
                        <div className="font-medium text-white">{item.label}</div>
                        <div className="text-xs text-zinc-500">{item.orders} 单</div>
                      </div>
                      <div className="text-xs font-semibold text-white">{formatCurrency(item.sales_total)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-zinc-500">暂无周报数据</div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">月报汇总</div>
                <div className="mt-1.5 text-xl font-semibold text-white">{monthlySummary.orders} 单</div>
                <div className="mt-0.5 text-xs text-zinc-400">{formatCurrency(monthlySummary.sales_total)}</div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">客户汇总</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-2">
            {customerSummary.recent.length ? (
              customerSummary.recent.slice(0, 4).map((customer) => (
                <div key={customer.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <div>
                    <div className="font-medium text-white">{customer.company_name}</div>
                    <div className="text-xs text-zinc-500">{customer.purchaser || '未填写采购员'}</div>
                  </div>
                  <div className="text-xs text-zinc-500">{ownerNameById(customer.owner_id)}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-zinc-500">暂无客户数据</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">客户归属分布</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-2">
            {customerSummary.owner_distribution.length ? (
              customerSummary.owner_distribution.map((item) => (
                <PanelItem key={item.username} label={item.username} value={item.count} />
              ))
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
        <span className="text-zinc-500">{value} 单 · {formatCurrency(sales)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 transition-all" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
