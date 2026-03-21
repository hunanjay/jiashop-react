import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Clock3, Package, TrendingUp } from 'lucide-react'

import { api } from '../../lib/api'
import { useApp } from '../../lib/app-context'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { formatCurrency, formatDateTime } from '../../lib/format'

export default function WorkspaceDashboardPage() {
  const { pushToast, session } = useApp()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api
      .get('/workspace/orders')
      .then((response) => {
        if (mounted) setOrders(response.data || [])
      })
      .catch(() => {
        if (mounted) pushToast('error', '工作台数据加载失败')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [pushToast])

  const stats = useMemo(
    () => [
      { label: '我的订单', value: orders.length, icon: ClipboardList },
      { label: '处理中', value: orders.filter((item) => item.status === 'Processing').length, icon: Clock3 },
      { label: '已完成', value: orders.filter((item) => item.status === 'Completed').length, icon: Package },
      { label: '总金额', value: formatCurrency(orders.reduce((sum, item) => sum + Number(item.total_price || 0), 0)), icon: TrendingUp },
    ],
    [orders],
  )

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/75 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">员工工作台</div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">欢迎回来，{session?.username}</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">这里可以查看我的订单、追踪处理进度，并快速识别待处理事项。</p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                  <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">{item.value}</div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>我的订单</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单号</TableHead>
                <TableHead>客户</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>创建时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : orders.length ? (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-slate-900">{order.id}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total_price)}</TableCell>
                    <TableCell>{formatDateTime(order.created_at)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                    暂无订单
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
