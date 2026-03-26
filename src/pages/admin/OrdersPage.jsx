import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'

import { api } from '../../lib/api'
import { useApp } from '../../lib/app-context'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '../../components/ui/modal'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { FileUploadField } from '../../components/ui/file-upload'
import { formatCurrency, formatDateTime } from '../../lib/format'
import { searchProducts } from '../../lib/product-search'

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled']

const EMPTY_FORM = {
  id: null,
  customer_name: '',
  customer_id: '',
  customer_phone: '',
  shipping_address: '',
  custom_logo_url: '',
  design_file_url: '',
  remarks: '',
  total_price: '',
  status: 'Pending',
  items: [{ product_id: '', product_name: '', product_query: '', qty: 1 }],
}

function resolveApiError(error, fallback = '请稍后重试') {
  const payload = error?.response?.data
  if (typeof payload === 'string' && payload.trim()) return payload.trim()
  if (payload && typeof payload === 'object') {
    const text = [payload.error, payload.message, payload.detail].find((item) => typeof item === 'string' && item.trim())
    if (text) return text.trim()
  }
  if (typeof error?.message === 'string' && error.message.trim()) return error.message.trim()
  return fallback
}

export default function OrdersPage({ scope = 'admin' }) {
  const { pushToast, products, categoryOptions } = useApp()
  const [orders, setOrders] = useState([])
  const [workspaceOrders, setWorkspaceOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [customerQuery, setCustomerQuery] = useState('')
  const [productTypeFilter, setProductTypeFilter] = useState('all')
  const [form, setForm] = useState(EMPTY_FORM)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [pendingSavePayload, setPendingSavePayload] = useState(null)
  const [detailOrder, setDetailOrder] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [noteDraft, setNoteDraft] = useState('')
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/orders')
      setOrders(response.data || [])
    } catch (error) {
      pushToast('error', '订单加载失败', resolveApiError(error))
    } finally {
      setLoading(false)
    }
  }, [pushToast])

  const loadWorkspaceOrders = useCallback(async () => {
    setWorkspaceLoading(true)
    try {
      const response = await api.get('/workspace/orders')
      setWorkspaceOrders(response.data || [])
    } catch (error) {
      pushToast('error', '订单加载失败', resolveApiError(error))
    } finally {
      setWorkspaceLoading(false)
    }
  }, [pushToast])

  const loadCustomers = useCallback(async () => {
    try {
      const response = await api.get(scope === 'workspace' ? '/workspace/customers' : '/admin/customers')
      setCustomers(response.data || [])
    } catch (error) {
      setCustomers([])
      pushToast('error', '客户列表加载失败', resolveApiError(error))
    }
  }, [pushToast, scope])

  useEffect(() => {
    if (scope === 'workspace') {
      loadWorkspaceOrders()
    } else {
      loadOrders()
    }
    loadCustomers()
  }, [scope, loadOrders, loadWorkspaceOrders, loadCustomers])

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
    setCustomerQuery('')
    setProductTypeFilter('all')
    setDrawerOpen(true)
  }

  const openEditDrawer = (order) => {
    setSelectedId(order.id)
    setForm({
      id: order.id,
      customer_name: order.customer_name || '',
      customer_id: order.customer_id || '',
      customer_phone: order.customer_phone || '',
      shipping_address: order.shipping_address || '',
      custom_logo_url: order.custom_logo_url || '',
      design_file_url: order.design_file_url || '',
      remarks: order.remarks || '',
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
    setCustomerQuery(order.customer_name || '')
    setProductTypeFilter('all')
    setDrawerOpen(true)
  }

  const matchCustomers = (query) => {
    const normalized = (query || '').trim().toLowerCase()
    if (!normalized) return []
    return customers
      .filter((customer) => {
        const text = `${customer.company_name || ''} ${customer.purchaser || ''} ${customer.phone || ''} ${customer.id || ''}`.toLowerCase()
        return text.includes(normalized)
      })
      .slice(0, 8)
  }

  const applyCustomerToForm = (customer) => {
    setForm((current) => ({
      ...current,
      customer_name: customer.company_name || '',
      customer_id: customer.id || '',
      customer_phone: customer.phone || '',
      shipping_address: customer.shipping_address || '',
    }))
    setCustomerQuery(customer.company_name || '')
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
      customer_id: form.customer_id.trim(),
      customer_phone: form.customer_phone.trim(),
      shipping_address: form.shipping_address.trim(),
      custom_logo_url: form.custom_logo_url.trim(),
      design_file_url: form.design_file_url.trim(),
      remarks: form.remarks.trim(),
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
      let finalPayload = { ...pendingSavePayload }

      if (finalPayload.custom_logo_url && finalPayload.custom_logo_url.startsWith('data:')) {
        const uploadRes = await api.post('/upload', { image: finalPayload.custom_logo_url })
        finalPayload.custom_logo_url = uploadRes.data.key
      }
      if (finalPayload.design_file_url && finalPayload.design_file_url.startsWith('data:')) {
        const uploadRes = await api.post('/upload', { image: finalPayload.design_file_url })
        finalPayload.design_file_url = uploadRes.data.key
      }


      if (selectedId) {
        await api.put(`/admin/orders/${selectedId}/status`, { status: finalPayload.status })
        pushToast('success', '订单状态已更新')
      } else {
        await api.post(scope === 'workspace' ? '/workspace/orders' : '/admin/orders', finalPayload)
        pushToast('success', '订单已创建')
      }
      await refreshOrders()
      setDrawerOpen(false)
      setSaveConfirmOpen(false)
      setPendingSavePayload(null)
    } catch (error) {
      pushToast('error', '保存失败', resolveApiError(error))
    } finally {
      setSaving(false)
    }
  }

  const requestDeleteOrder = (order) => {
    setPendingDelete(order)
    setDeleteConfirmOpen(true)
  }

  const openDetail = async (order) => {
    setDetailOrder(order)
    setTimeline([])
    setNoteDraft(order.remarks || '')
    try {
      const response = await api.get(`/admin/orders/${order.id}/timeline`)
      setTimeline(response.data || [])
    } catch (error) {
      pushToast('error', '时间线加载失败', resolveApiError(error))
    }
  }

  const saveNote = async () => {
    if (!detailOrder || !noteDraft.trim()) return
    try {
      await api.post(`/admin/orders/${detailOrder.id}/note`, { note: noteDraft.trim() })
      pushToast('success', '备注已更新')
      await refreshOrders()
      const response = await api.get(`/admin/orders/${detailOrder.id}/timeline`)
      setTimeline(response.data || [])
    } catch (error) {
      pushToast('error', '备注保存失败', resolveApiError(error))
    }
  }

  const updateOrderStatusInline = async (order, nextStatus) => {
    if (!order || !nextStatus || nextStatus === order.status) return
    const previousStatus = order.status
    setStatusUpdatingId(order.id)
    setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item)))
    setWorkspaceOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item)))
    try {
      await api.put(`/admin/orders/${order.id}/status`, { status: nextStatus })
      pushToast('success', '订单状态已更新')
    } catch (error) {
      setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status: previousStatus } : item)))
      setWorkspaceOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status: previousStatus } : item)))
      pushToast('error', '状态更新失败', resolveApiError(error))
    } finally {
      setStatusUpdatingId(null)
    }
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
    return searchProducts(products, query).filter((product) => {
      const matchesCategory = productTypeFilter === 'all' || product.category === productTypeFilter
      return matchesCategory
    })
  }

  return (
    <div className="space-y-5">
      <Card className="border-white/10 bg-white/6 text-zinc-100 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-white">{scope === 'workspace' ? '我的订单' : '订单管理'}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={refreshOrders} className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10">
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
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索订单号、客户或状态"
              className="border-white/10 bg-white/6 pl-11 text-white placeholder:text-zinc-500"
            />
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
                  <TableCell colSpan={6} className="py-10 text-center text-zinc-500">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer" onClick={() => openDetail(order)}>
                    <TableCell className="font-medium text-white">{order.id}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>
                      <select
                        value={order.status}
                        disabled={statusUpdatingId === order.id}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => updateOrderStatusInline(order, event.target.value)}
                        className="h-8 min-w-[120px] rounded-lg border border-white/10 bg-white/6 px-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-70"
                        title="选择新状态可直接更新"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total_price)}</TableCell>
                    <TableCell>{formatDateTime(order.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            openEditDrawer(order)
                          }}
                          className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            requestDeleteOrder(order)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-zinc-500">
                    暂无订单
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal open={drawerOpen} onOpenChange={setDrawerOpen}>
        <ModalContent className="w-[95vw] max-w-[1500px] border-white/10 bg-[#111114]/96 text-zinc-100 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <ModalHeader className="border-b border-white/10 bg-white/5">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">{selectedId ? '编辑订单' : '新增订单'}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                订单可以先录入客户、金额和商品明细，再点击确认进行二次提交。
              </p>
            </div>
          </ModalHeader>

          <ModalBody className="max-h-[78vh] overflow-y-auto">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="space-y-4">
                <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-xl">
                  <div className="text-sm font-semibold text-white">订单基础信息</div>
                  <div className="mt-4 space-y-4">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-zinc-300">选择客户（从客户管理检索）</span>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <Input
                          value={customerQuery}
                          onChange={(event) => {
                            const nextQuery = event.target.value
                            setCustomerQuery(nextQuery)
                            if (!nextQuery.trim()) {
                              setForm((current) => ({
                                ...current,
                                customer_id: '',
                              }))
                            }
                          }}
                          placeholder="输入公司名 / 采购员 / 电话 / 客户ID"
                          className="pl-11"
                        />
                      </div>
                    </label>

                    {customerQuery.trim() ? (
                      <div className="space-y-2 rounded-[18px] border border-white/10 bg-white/5 p-2">
                        {matchCustomers(customerQuery).length ? (
                          matchCustomers(customerQuery).map((customer) => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => applyCustomerToForm(customer)}
                              className="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/10"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-white">{customer.company_name}</div>
                                <div className="mt-1 text-xs text-zinc-500">
                                  {customer.purchaser || '未填写采购员'} · {customer.phone || '无电话'} · {customer.id}
                                </div>
                              </div>
                              <div className="text-xs text-zinc-500">选择</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-sm text-zinc-500">没有匹配客户</div>
                        )}
                      </div>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-zinc-300">客户名称</span>
                        <Input value={form.customer_name} onChange={(event) => setForm((current) => ({ ...current, customer_name: event.target.value }))} />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-zinc-300">客户 ID</span>
                        <Input value={form.customer_id} onChange={(event) => setForm((current) => ({ ...current, customer_id: event.target.value }))} />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-zinc-300">客户电话</span>
                        <Input value={form.customer_phone} onChange={(event) => setForm((current) => ({ ...current, customer_phone: event.target.value }))} />
                      </label>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-zinc-300">发货地址</span>
                      <Input value={form.shipping_address} onChange={(event) => setForm((current) => ({ ...current, shipping_address: event.target.value }))} />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-zinc-300">总金额</span>
                        <Input type="number" value={form.total_price} onChange={(event) => setForm((current) => ({ ...current, total_price: event.target.value }))} />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-zinc-300">状态</span>
                        <select
                          value={form.status}
                          onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                          className="h-11 w-full rounded-2xl border border-white/10 bg-white/6 px-4 text-sm text-white backdrop-blur-xl"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

              </div>

              <div className="space-y-4">
                <div className="space-y-3 rounded-[22px] border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">订单商品</span>
                    <div className="flex items-center gap-3">
                      <select
                        value={productTypeFilter}
                        onChange={(event) => setProductTypeFilter(event.target.value)}
                        className="h-10 rounded-full border border-white/10 bg-white/6 px-4 text-sm text-white backdrop-blur-xl"
                      >
                        {productCategories.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <Button type="button" variant="secondary" onClick={addItem} className="h-10 border-white/10 bg-white/6 px-3 text-zinc-200 hover:bg-white/10">
                        <Plus className="h-4 w-4" />
                        添加商品
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-zinc-500">选择商品后会自动保留名称和分类</div>
                  </div>

                  <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
                    {form.items.map((item, index) => (
                      <div key={index} className="space-y-3 rounded-[20px] border border-white/10 bg-white/6 p-4 shadow-sm">
                        <div className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
                          <label className="block space-y-2">
                            <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">商品搜索</span>
                            <div className="relative">
                              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
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
                            <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">数量</span>
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
                          <div className="space-y-2 rounded-[18px] border border-white/10 bg-white/5 p-2">
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
                                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/10"
                                >
                                  <img src={product.image_url} alt={product.name} className="h-12 w-12 rounded-2xl object-cover" />
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold text-white">{product.name}</div>
                                    <div className="mt-1 text-xs text-zinc-500">
                                      {product.id} · {product.category || 'Uncategorized'}
                                    </div>
                                  </div>
                                  <div className="text-sm font-semibold text-white">{formatCurrency(product.price)}</div>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-sm text-zinc-500">没有匹配商品</div>
                            )}
                          </div>
                        ) : null}

                        {item.product_id ? (
                          <div className="rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 px-3 py-2 text-sm text-white shadow-sm">
                            已选商品: {item.product_name || item.product_id}
                            {item.product_category ? ` · ${item.product_category}` : ''}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FileUploadField
                    label="Logo"
                    value={form.custom_logo_url}
                    onChange={(nextValue) => setForm((current) => ({ ...current, custom_logo_url: nextValue }))}
                    helperText="前端转码后保存，适合直接贴到订单里"
                  />
                  <FileUploadField
                    label="设计图"
                    value={form.design_file_url}
                    onChange={(nextValue) => setForm((current) => ({ ...current, design_file_url: nextValue }))}
                    helperText="和 Logo 一样走前端转换，支持实时预览"
                  />
                </div>

                <label className="block space-y-2 rounded-[22px] border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-xl">
                  <span className="text-sm font-medium text-zinc-300">备注</span>
                  <Input value={form.remarks} onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))} />
                </label>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setDrawerOpen(false)} className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10">
                取消
              </Button>
              <Button onClick={requestSaveOrder} disabled={saving}>
                {saving ? '保存中...' : '确认保存'}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

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

      <Modal open={Boolean(detailOrder)} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <ModalContent className="max-w-2xl border-white/10 bg-[#111114]/96 text-zinc-100 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <ModalHeader className="border-b border-white/10 bg-white/5">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">订单详情</h2>
            <p className="mt-2 text-sm text-zinc-500">{detailOrder?.id}</p>
          </ModalHeader>
          <ModalBody className="space-y-5">
            {detailOrder ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-zinc-500">客户</div>
                    <div className="mt-1 font-medium text-white">{detailOrder.customer_name}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-zinc-500">状态</div>
                    <div className="mt-1 font-medium text-white">{detailOrder.status}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-zinc-500">备注</div>
                  <Input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="输入跟进备注" />
                  <div className="mt-3 flex justify-end">
                    <Button onClick={saveNote}>保存备注</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-white">状态 / 备注记录</div>
                  {timeline.length ? (
                    timeline.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-medium text-white">{item.action}</div>
                        <div className="mt-1 text-xs text-zinc-500">{formatDateTime(item.timestamp)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-zinc-500">暂无记录</div>
                  )}
                </div>
              </>
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}
