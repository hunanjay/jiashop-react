import { useEffect, useState } from 'react'
import { Check, RefreshCw } from 'lucide-react'

import { api } from '../../lib/api'
import { useApp } from '../../lib/app-context'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { formatCurrency, formatDateTime } from '../../lib/format'

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled']

export default function OrdersPage() {
  const { pushToast } = useApp()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/orders')
      setOrders(response.data || [])
    } catch {
      pushToast('error', '订单加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status })
      pushToast('success', '订单状态已更新')
      loadOrders()
    } catch {
      pushToast('error', '更新失败')
    }
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>订单处理</CardTitle>
        <Button variant="secondary" onClick={loadOrders}>
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>客户</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                  加载中...
                </TableCell>
              </TableRow>
            ) : orders.length ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-slate-900">{order.id}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'Pending' ? 'secondary' : 'outline'}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(order.total_price)}</TableCell>
                  <TableCell>{formatDateTime(order.created_at)}</TableCell>
                  <TableCell>
                    <select
                      value={order.status}
                      onChange={(event) => updateStatus(order.id, event.target.value)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                  暂无订单
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
