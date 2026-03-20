import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'

import { api } from '../../lib/api'
import { useApp } from '../../lib/app-context'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../../components/ui/sheet'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { formatCurrency, formatDateTime } from '../../lib/format'

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled']

const EMPTY_FORM = {
  id: null,
  customer_name: '',
  total_price: '',
  status: 'Pending',
  items: [{ product_id: '', product_name: '', product_query: '', qty: 1 }],
}

export default function OrdersPage({ scope = 'admin' }) {
  const { pushToast, products, categoryOptions } = useApp()
  const [orders, setOrders] = useState([])
  const [workspaceOrders, setWorkspaceOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [productTypeFilter, setProductTypeFilter] = useState('all')
  const [form, setForm] = useState(EMPTY_FORM)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [pendingSavePayload, setPendingSavePayload] = useState(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/orders')
      setOrders(response.data || [])
    } catch {
      pushToast('error', '订单加载失败')
    } finally {
      setLoading(false)
    }
  }, [pushToast])

  const loadWorkspaceOrders = useCallback(async () => {
    setWorkspaceLoading(true)
    try {
      const response = await api.get('/workspace/orders')
      setWorkspaceOrders(response.data || [])
    } catch {
      pushToast('error', '订单加载失败')
    } finally {
      setWorkspaceLoading(false)
    }
  }, [pushToast])

  useEffect(() => {
    if (scope === 'workspace') {
      loadWorkspaceOrders()
      return
    }
    loadOrders()
  }, [scope, loadOrders, loadWorkspaceOrders])

  const visibleOrders = scope === 'workspace' ? workspaceOrders : orders
  const productCategories = categoryOptions

  useEffect(() => {
    if (productTypeFilter === 'all') return
    if (productCategories.some((item) => item.value === productTypeFilter)) return
    setProductTypeFilter('all')
  }, [productCategories, productTypeFilter])

  const filteredOrders = useMemo(() => {
    return visibleOrders.filter((order) => {
      const text = `${order.id} ${order.customer_name} ${order.status}`.toLowerCase()
      return text.includes(search.toLowerCase())
    })
  }, [visibleOrders, search])

  const openCreateDrawer = () => {
    setSelectedId(null)
    setForm(EMPTY_FORM)
    setProductTypeFilter('all')
    setDrawerOpen(true)
  }

  const openEditDrawer = (order) => {
    setSelectedId(order.id)
    setForm({
      id: order.id,
      customer_name: order.customer_name || '',
      total_price: String(order.total_price || ''),
      status: order.status || 'Pending',
      items: Array.isArray(order.items)
        ? order.items.map((item) => ({
            product_id: item.product_id || '',
            product_name: item.product_name || products.find((product) => product.id === item.product_id)?.name || '',
            product_category:
              item.product_category || products.find((product) => product.id === item.product_id)?.category || '',
            product_query:
              item.product_name || products.find((product) => product.id === item.product_id)?.name || '',
            qty: Number(item.qty || 1),
          }))
        : [{ product_id: '', product_name: '', product_category: '', product_query: '', qty: 1 }],
    })
    setProductTypeFilter('all')
    setDrawerOpen(true)
  }

  const prepareSaveOrder = () => {
    if (!form.customer_name.trim()) {
      pushToast('error', '请输入客户名称')
      return null
    }

    const items = form.items
      .filter((item) => item.product_id && Number(item.qty) > 0)
      .map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name || products.find((product) => product.id === item.product_id)?.name || '',
        product_category:
          item.product_category || products.find((product) => product.id === item.product_id)?.category || '',
        qty: Number(item.qty || 1),
      }))

    if (!items.length) {
      pushToast('error', '请至少选择一个商品')
      return null
    }

    return {
      customer_name: form.customer_name.trim(),
      total_price: Number(form.total_price || 0),
      status: form.status,
      items,
    }
  }

  const requestSaveOrder = () => {
    const payload = prepareSaveOrder()
    if (!payload) return
    setPendingSavePayload(payload)
    setSaveConfirmOpen(true)
  }

  const refreshOrders = scope === 'workspace' ? loadWorkspaceOrders : loadOrders

  const saveOrder = async () => {
    if (!pendingSavePayload) return
    setSaving(true)
    try {
      if (selectedId) {
        await api.put(`/admin/orders/${selectedId}/status`, { status: pendingSavePayload.status })
        pushToast('success', '订单状态已更新')
      } else {
        await api.post(scope === 'workspace' ? '/workspace/orders' : '/admin/orders', pendingSavePayload)
        pushToast('success', '订单已创建')
      }
      await refreshOrders()
      setDrawerOpen(false)
      setSaveConfirmOpen(false)
      setPendingSavePayload(null)
    } catch {
      pushToast('error', '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const requestDeleteOrder = (order) => {
    setPendingDelete(order)
    setDeleteConfirmOpen(true)
  }

  const updateItem = (index, nextItem) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? nextItem : item)),
    }))
  }

  const addItem = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, { product_id: '', product_name: '', product_category: '', product_query: '', qty: 1 }],
    }))
  }

  const removeItem = (index) => {
    setForm((current) => {
      const next = current.items.filter((_, itemIndex) => itemIndex !== index)
      return {
        ...current,
        items: next.length ? next : [{ product_id: '', product_name: '', product_category: '', product_query: '', qty: 1 }],
      }
    })
  }

  const matchProducts = (query) => {
    const normalized = (query || '').trim().toLowerCase()
    if (!normalized) return []

    return products.filter((product) => {
      const matchesCategory = productTypeFilter === 'all' || product.category === productTypeFilter
      const text = `${product.name} ${product.id} ${product.category || ''}`.toLowerCase()
      return matchesCategory && text.includes(normalized)
    })
  }

  return (
    <div className="space-y-5">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>{scope === 'workspace' ? '我的订单' : '订单管理'}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={refreshOrders}>
                <RefreshCw className="h-4 w-4" />
                刷新
              </Button>
              <Button onClick={openCreateDrawer}>
                <Plus className="h-4 w-4" />
                新增订单
              </Button>
            </div>
          </div>

          <div className="relative w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索订单号、客户或状态" className="pl-11" />
          </div>
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
              {(scope === 'workspace' ? workspaceLoading : loading) ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-slate-900">{order.id}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total_price)}</TableCell>
                    <TableCell>{formatDateTime(order.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEditDrawer(order)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => requestDeleteOrder(order)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <SheetTitle>{selectedId ? '编辑订单' : '新增订单'}</SheetTitle>
                <SheetDescription className="mt-2">
                  订单可以先录入客户、金额和商品明细，再点击确认进行二次提交。
                </SheetDescription>
              </div>
              <Button onClick={requestSaveOrder} disabled={saving}>
                {saving ? '保存中...' : '确认保存'}
              </Button>
            </div>
          </SheetHeader>

          <SheetBody>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">客户名称</span>
                <Input value={form.customer_name} onChange={(event) => setForm((current) => ({ ...current, customer_name: event.target.value }))} />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">总金额</span>
                  <Input type="number" value={form.total_price} onChange={(event) => setForm((current) => ({ ...current, total_price: event.target.value }))} />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">状态</span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">订单商品</span>
                  <div className="flex items-center gap-3">
                    <select
                      value={productTypeFilter}
                      onChange={(event) => setProductTypeFilter(event.target.value)}
                      className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm"
                    >
                      {productCategories.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <Button type="button" variant="secondary" onClick={addItem}>
                      <Plus className="h-4 w-4" />
                      添加商品
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {form.items.map((item, index) => (
                    <div key={index} className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
                        <label className="block space-y-2">
                          <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">商品搜索</span>
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              value={item.product_query}
                              onChange={(event) =>
                                updateItem(index, {
                                  ...item,
                                  product_query: event.target.value,
                                  product_id: '',
                                  product_name: '',
                                  product_category: '',
                                })
                              }
                              placeholder="输入商品名称 / ID / 分类"
                              className="pl-11"
                            />
                          </div>
                        </label>

                        <label className="block space-y-2">
                          <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">数量</span>
                          <Input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(event) => updateItem(index, { ...item, qty: Number(event.target.value || 1) })}
                          />
                        </label>

                        <div className="flex items-end justify-end">
                          <Button type="button" variant="destructive" onClick={() => removeItem(index)} disabled={form.items.length === 1}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {item.product_query?.trim() ? (
                        <div className="space-y-2 rounded-3xl border border-white/80 bg-white/90 p-2 shadow-sm">
                          {matchProducts(item.product_query).length ? (
                            matchProducts(item.product_query).map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() =>
                                  updateItem(index, {
                                    ...item,
                                    product_id: product.id,
                                    product_name: product.name,
                                    product_category: product.category || '',
                                    product_query: `${product.name} (${product.id})`,
                                  })
                                }
                                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-100"
                              >
                                <img src={product.image_url} alt={product.name} className="h-12 w-12 rounded-2xl object-cover" />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-semibold text-slate-900">{product.name}</div>
                                  <div className="mt-1 text-xs text-slate-500">
                                    {product.id} · {product.category || 'Uncategorized'}
                                  </div>
                                </div>
                                <div className="text-sm font-semibold text-slate-900">{formatCurrency(product.price)}</div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-4 text-sm text-slate-500">没有匹配商品</div>
                          )}
                        </div>
                      ) : null}

                      {item.product_id ? (
                        <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm text-white">
                          已选商品: {item.product_name || item.product_id}
                          {item.product_category ? ` · ${item.product_category}` : ''}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetBody>

          <SheetFooter>
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
                取消
              </Button>
              <Button onClick={requestSaveOrder} disabled={saving}>
                {saving ? '保存中...' : '确认保存'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={saveConfirmOpen}
        title="确认保存订单"
        description={
          selectedId
            ? `你正在修改订单「${selectedId || ''}」的状态为 ${form.status}，确认后会立即生效。`
            : `你正在创建客户「${form.customer_name || '未命名客户'}」的订单，确认后会立即提交。`
        }
        confirmLabel="确认提交"
        cancelLabel="返回编辑"
        loading={saving}
        onOpenChange={(open) => {
          setSaveConfirmOpen(open)
          if (!open) {
            setPendingSavePayload(null)
          }
        }}
        onConfirm={saveOrder}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="确认删除订单"
        description={`删除后订单「${pendingDelete?.id || ''}」将从系统中移除，此操作不可恢复。`}
        confirmLabel="确认删除"
        cancelLabel="取消"
        destructive
        loading={saving}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open)
          if (!open) {
            setPendingDelete(null)
          }
        }}
        onConfirm={async () => {
          if (!pendingDelete) return
          setSaving(true)
          try {
            await api.delete(`/admin/orders/${pendingDelete.id}`)
            pushToast('success', '订单已删除')
            await refreshOrders()
            setDeleteConfirmOpen(false)
            setPendingDelete(null)
          } catch {
            pushToast('error', '删除失败')
          } finally {
            setSaving(false)
          }
        }}
      />
    </div>
  )
}
