import { useEffect, useState } from 'react'
import { Package, ReceiptText, ShieldCheck, Users } from 'lucide-react'

import { useApp } from '../../lib/app-context'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { formatCurrency } from '../../lib/format'

export default function DashboardPage() {
  const { products } = useApp()
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    let mounted = true
    Promise.all([
      api.get('/admin/orders').then((res) => res.data).catch(() => []),
      api.get('/admin/users').then((res) => res.data).catch(() => []),
    ]).then(([orderData, userData]) => {
      if (!mounted) return
      setOrders(orderData)
      setUsers(userData)
    })

    return () => {
      mounted = false
    }
  }, [])

  const stats = [
    { label: '商品总数', value: products.length, icon: Package },
    { label: '订单数', value: orders.length, icon: ReceiptText },
    { label: '用户数', value: users.length, icon: Users },
    { label: '总销售额', value: formatCurrency(orders.reduce((sum, item) => sum + Number(item.total_price || 0), 0)), icon: ShieldCheck },
  ]

  return (
    <div className="space-y-6">
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

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>最近商品</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <div className="font-medium text-slate-900">{product.name}</div>
                  <div className="text-sm text-slate-500">{product.category}</div>
                </div>
                <div className="text-sm font-semibold text-slate-900">{formatCurrency(product.price)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>状态概览</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PanelItem label="处理中订单" value={orders.filter((order) => order.status === 'Processing').length} />
            <PanelItem label="待发货订单" value={orders.filter((order) => order.status === 'Pending').length} />
            <PanelItem label="超级管理员" value={users.filter((user) => user.role === 'SuperAdmin').length} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PanelItem({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-lg font-semibold text-slate-900">{value}</span>
    </div>
  )
}
