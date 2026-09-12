import { useCallback, useEffect, useState } from 'react'
import { Calendar, Coins, Download, Edit3, Hash, Package, Plus, RefreshCw, Search, Store, Trash2, User } from 'lucide-react'

import { api } from '../../lib/api'
import { useApp } from '../../lib/app-context'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ImageCardUploader } from '../../components/ui/ImageCardUploader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '../../components/ui/modal'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { formatCurrency, formatDateTime } from '../../lib/format'

const PLATFORMS = ['淘宝', '小红书']

const PLATFORM_BADGE_STYLES = {
  淘宝: 'bg-orange-50 text-orange-700 border-orange-200',
  小红书: 'bg-rose-50 text-rose-700 border-rose-200',
}

const PLATFORM_TOGGLE_STYLES = {
  淘宝: {
    active: 'border-orange-500 bg-orange-100 text-orange-800',
    inactive: 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100',
  },
  小红书: {
    active: 'border-rose-500 bg-rose-100 text-rose-800',
    inactive: 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100',
  },
}

const EMPTY_FORM = {
  id: null,
  platform: PLATFORMS[0],
  shop_name: '',
  product_name: '',
  product_image: null,
  order_no: '',
  order_time: '',
  quantity: '1',
  amount: '',
  commission: '',
  owner_id: '',
  owner_username: '',
}

function FormField({ label, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
        {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
        {label}
      </label>
      {children}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-bold tabular-nums text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function CommissionManagerPage({ scope = 'admin' }) {
  const { pushToast, session } = useApp()
  const [records, setRecords] = useState([])
  const [users, setUsers] = useState([])
  const [shopNames, setShopNames] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportMonth, setExportMonth] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [pendingSavePayload, setPendingSavePayload] = useState(null)

  const basePath = scope === 'workspace' ? '/workspace/commissions' : '/admin/commissions'

  const loadRecords = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get(basePath, {
        params: { platform: platformFilter || undefined, month: monthFilter || undefined },
      })
      setRecords(response.data || [])
    } catch {
      pushToast('error', '佣金记录加载失败')
    } finally {
      setLoading(false)
    }
  }, [pushToast, basePath, platformFilter, monthFilter])

  const loadUsers = useCallback(async () => {
    if (scope !== 'admin') return
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data || [])
    } catch {
      setUsers([])
    }
  }, [scope])

  const loadShopNames = useCallback(async () => {
    if (scope !== 'workspace') return
    try {
      const response = await api.get('/workspace/shops')
      setShopNames(response.data || [])
    } catch {
      setShopNames([])
    }
  }, [scope])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    loadShopNames()
  }, [loadShopNames])

  const ownerNameById = useCallback(
    (ownerId) => {
      if (!ownerId) return '-'
      if (scope === 'workspace' && ownerId === session?.user?.id) {
        return session?.username || session?.user?.username || ownerId
      }
      return users.find((user) => user.id === ownerId)?.username || ownerId
    },
    [scope, session?.user?.id, session?.user?.username, session?.username, users],
  )

  const filteredRecords = records.filter((record) =>
    `${record.platform} ${record.shop_name} ${record.product_name} ${record.order_no}`.toLowerCase().includes(search.toLowerCase()),
  )

  const openCreateDrawer = () => {
    setSelectedId(null)
    setForm({
      ...EMPTY_FORM,
      owner_id: session?.user?.id || '',
      owner_username: session?.username || session?.user?.username || '',
    })
    setDrawerOpen(true)
  }

  const openEditDrawer = (record) => {
    setSelectedId(record.id)
    setForm({
      id: record.id,
      platform: record.platform || PLATFORMS[0],
      shop_name: record.shop_name || '',
      product_name: record.product_name || '',
      product_image: record.product_image || null,
      order_no: record.order_no || '',
      order_time: record.order_time ? record.order_time.slice(0, 16) : '',
      quantity: String(record.quantity ?? 1),
      amount: String(record.amount ?? ''),
      commission: String(record.commission ?? ''),
      owner_id: record.owner_id || '',
      owner_username: ownerNameById(record.owner_id),
    })
    setDrawerOpen(true)
  }

  const prepareSaveRecord = () => {
    if (!form.shop_name.trim() || !form.product_name.trim() || !form.order_no.trim()) {
      pushToast('error', '请填写店铺名、产品名称和订单号')
      return null
    }
    const payload = {
      platform: form.platform,
      shop_name: form.shop_name.trim(),
      product_name: form.product_name.trim(),
      order_no: form.order_no.trim(),
      order_time: form.order_time || null,
      quantity: Number(form.quantity) || 1,
      amount: Number(form.amount) || 0,
      commission: Number(form.commission) || 0,
      product_image: form.product_image,
    }
    if (scope === 'admin') {
      payload.owner_id = users.find((user) => user.username === form.owner_username.trim())?.id || form.owner_id.trim()
    }
    return payload
  }

  const requestSaveRecord = () => {
    const payload = prepareSaveRecord()
    if (!payload) return
    setPendingSavePayload(payload)
    setSaveConfirmOpen(true)
  }

  const saveRecord = async () => {
    if (!pendingSavePayload) return
    setSaving(true)
    try {
      if (selectedId) {
        await api.patch(`${basePath}/${selectedId}`, pendingSavePayload)
        pushToast('success', '佣金记录已更新')
      } else {
        await api.post(basePath, pendingSavePayload)
        pushToast('success', '佣金记录已创建')
      }
      await loadRecords()
      await loadShopNames()
      setDrawerOpen(false)
      setSaveConfirmOpen(false)
      setPendingSavePayload(null)
    } catch {
      pushToast('error', '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const requestDeleteRecord = (record) => {
    setPendingDelete(record)
    setDeleteConfirmOpen(true)
  }

  const deleteRecord = async () => {
    if (!pendingDelete) return
    setSaving(true)
    try {
      await api.delete(`${basePath}/${pendingDelete.id}`)
      pushToast('success', '佣金记录已删除')
      await loadRecords()
      setDeleteConfirmOpen(false)
      setPendingDelete(null)
    } catch {
      pushToast('error', '删除失败')
    } finally {
      setSaving(false)
    }
  }

  const openExportDialog = () => {
    setExportMonth(monthFilter)
    setExportDialogOpen(true)
  }

  const exportRecords = async () => {
    setExporting(true)
    try {
      const response = await api.get(`${basePath}/export`, {
        params: { platform: platformFilter || undefined, month: exportMonth || undefined },
        responseType: 'blob',
      })
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `commissions${exportMonth ? `-${exportMonth}` : ''}${platformFilter ? `-${platformFilter}` : ''}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      pushToast('success', '导出完成')
      setExportDialogOpen(false)
    } catch {
      pushToast('error', '导出失败')
    } finally {
      setExporting(false)
    }
  }

  const totalCommission = records.reduce((sum, r) => sum + Number(r.commission || 0), 0)

  return (
    <div className="min-w-0 space-y-5 text-gray-900">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">分销佣金</h1>
          <p className="mt-0.5 text-sm text-gray-500">记录带货订单与佣金到账情况</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={loadRecords}
            className="border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={openExportDialog}
            className="border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            导出 Excel
          </Button>
          <Button size="sm" onClick={openCreateDrawer} className="shadow-sm">
            <Plus className="h-4 w-4" />
            新增记录
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="记录总数" value={records.length} icon={Hash} color="bg-blue-50 text-blue-600" />
        <StatCard
          label="本次筛选"
          value={search ? filteredRecords.length : records.length}
          icon={Search}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard label="佣金合计" value={formatCurrency(totalCommission)} icon={Coins} color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Search + table card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3.5">
          <div className="relative min-w-0 flex-1 sm:min-w-64 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索店铺、产品、订单号…"
              className="h-9 border-gray-200 bg-gray-50 pl-9 text-sm placeholder:text-gray-400 focus:bg-white"
            />
          </div>
          {search && (
            <button type="button" onClick={() => setSearch('')} className="text-xs text-gray-400 hover:text-gray-600">
              清除
            </button>
          )}

          <div className="ml-auto flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              title="按下单时间筛选月份"
              className="h-9 w-full border-gray-200 bg-gray-50 text-sm text-gray-700 focus:bg-white sm:w-[150px]"
            />
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-auto"
            >
              <option value="">全部平台</option>
              {PLATFORMS.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            {(monthFilter || platformFilter) && (
              <button
                type="button"
                onClick={() => {
                  setMonthFilter('')
                  setPlatformFilter('')
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>

        <Table className={scope === 'admin' ? 'min-w-[1180px]' : 'min-w-[1080px]'}>
          <TableHeader>
            <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">平台</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">店铺名</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">产品</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">订单号</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">下单时间</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">数量</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">金额</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">佣金</TableHead>
              {scope === 'admin' && (
                <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">归属</TableHead>
              )}
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">创建时间</TableHead>
              <TableHead className="py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {Array.from({ length: scope === 'admin' ? 10 : 9 }).map((_, j) => (
                    <TableCell key={j} className="py-3.5">
                      <div className="h-4 animate-pulse rounded-md bg-gray-100" style={{ width: '70%' }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredRecords.length ? (
              filteredRecords.map((record) => (
                <TableRow key={record.id} className="group transition-colors hover:bg-blue-50/40">
                  <TableCell className="py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${PLATFORM_BADGE_STYLES[record.platform] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
                    >
                      {record.platform}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                      <Store className="h-3.5 w-3.5 text-gray-400" />
                      {record.shop_name}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      {record.product_image ? (
                        <img
                          src={record.product_image}
                          alt={record.product_name}
                          className="h-9 w-9 shrink-0 rounded-lg border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                      <span className="text-sm text-gray-700">{record.product_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-gray-600">{record.order_no}</TableCell>
                  <TableCell className="py-3 text-sm text-gray-500">{record.order_time ? formatDateTime(record.order_time) : '-'}</TableCell>
                  <TableCell className="py-3 text-sm text-gray-600">{record.quantity}</TableCell>
                  <TableCell className="py-3 text-sm text-gray-700">{formatCurrency(record.amount)}</TableCell>
                  <TableCell className="py-3 text-sm font-semibold text-emerald-700">{formatCurrency(record.commission)}</TableCell>
                  {scope === 'admin' && (
                    <TableCell className="py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        <User className="h-3 w-3" />
                        {ownerNameById(record.owner_id)}
                      </span>
                    </TableCell>
                  )}
                  <TableCell className="py-3 text-sm text-gray-400">{formatDateTime(record.created_at)}</TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEditDrawer(record)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        title="编辑"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDeleteRecord(record)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        title="删除"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={scope === 'admin' ? 10 : 9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                      <Coins className="h-7 w-7 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{search ? '没有匹配的记录' : '还没有佣金记录'}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {search ? `尝试清除搜索词「${search}」` : '点击右上角「新增记录」开始添加'}
                      </p>
                    </div>
                    {search && (
                      <button type="button" onClick={() => setSearch('')} className="text-xs font-medium text-blue-600 hover:underline">
                        清除搜索
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {!loading && filteredRecords.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
            共 <span className="font-semibold text-gray-600">{filteredRecords.length}</span> 条
            {search && records.length !== filteredRecords.length && <span>，筛选自全部 {records.length} 条</span>}
          </div>
        )}
      </div>

      {/* Drawer */}
      <Modal open={drawerOpen} onOpenChange={setDrawerOpen}>
        <ModalContent className="max-w-3xl">
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <ModalTitle className="text-base font-bold text-gray-900">{selectedId ? '编辑佣金记录' : '新增佣金记录'}</ModalTitle>
                <p className="text-xs text-gray-400">
                  {selectedId ? '修改这笔带货订单的信息' : '填写新的带货订单与佣金信息'}
                </p>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="grid grid-cols-1 gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
            <ImageCardUploader
              value={form.product_image}
              onChange={(img) => setForm((f) => ({ ...f, product_image: img }))}
              label="产品图片"
              aspectRatio={1}
            />

            <div className="min-w-0 space-y-5">
              <FormField label="平台">
                <div className="flex gap-2">
                  {PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, platform }))}
                      className={[
                        'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150',
                        form.platform === platform
                          ? PLATFORM_TOGGLE_STYLES[platform].active
                          : PLATFORM_TOGGLE_STYLES[platform].inactive,
                      ].join(' ')}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="店铺名" icon={Store}>
                  <Input
                    value={form.shop_name}
                    onChange={(e) => setForm((f) => ({ ...f, shop_name: e.target.value }))}
                    placeholder="带货所在的店铺名称，可自定义"
                    list="shop-name-options"
                    className="border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
                  />
                  {scope === 'workspace' && (
                    <datalist id="shop-name-options">
                      {shopNames.map((name) => (
                        <option key={name} value={name} />
                      ))}
                    </datalist>
                  )}
                </FormField>

                <FormField label="产品名称" icon={Package}>
                  <Input
                    value={form.product_name}
                    onChange={(e) => setForm((f) => ({ ...f, product_name: e.target.value }))}
                    placeholder="产品名称"
                    className="border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="订单号" icon={Hash}>
                  <Input
                    value={form.order_no}
                    onChange={(e) => setForm((f) => ({ ...f, order_no: e.target.value }))}
                    placeholder="平台订单号"
                    className="border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
                  />
                </FormField>

                <FormField label="下单时间" icon={Calendar}>
                  <Input
                    type="datetime-local"
                    value={form.order_time}
                    onChange={(e) => setForm((f) => ({ ...f, order_time: e.target.value }))}
                    className="border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FormField label="数量">
                  <Input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
                  />
                </FormField>
                <FormField label="金额">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    className="border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
                  />
                </FormField>
                <FormField label="佣金">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.commission}
                    onChange={(e) => setForm((f) => ({ ...f, commission: e.target.value }))}
                    className="border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
                  />
                </FormField>
              </div>

              {scope === 'admin' && (
                <FormField label="归属人员" icon={User}>
                  <select
                    value={form.owner_username}
                    onChange={(e) => {
                      const username = e.target.value
                      const user = users.find((u) => u.username === username)
                      setForm((f) => ({ ...f, owner_username: username, owner_id: user?.id || '' }))
                    }}
                    className="h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">- 不指定 -</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.username}>
                        {u.username}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <div className="flex w-full gap-2">
              <Button
                variant="secondary"
                onClick={() => setDrawerOpen(false)}
                className="flex-1 border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              >
                取消
              </Button>
              <Button onClick={requestSaveRecord} className="flex-1">
                保存
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <ModalContent className="max-w-sm">
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <ModalTitle className="text-base font-bold text-gray-900">导出 Excel</ModalTitle>
                <p className="text-xs text-gray-400">选择要导出的下单月份</p>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="space-y-4">
            <FormField label="月份" icon={Calendar}>
              <Input
                type="month"
                value={exportMonth}
                onChange={(e) => setExportMonth(e.target.value)}
                className="border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
              />
            </FormField>
            {exportMonth && (
              <button
                type="button"
                onClick={() => setExportMonth('')}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                不限月份，导出全部
              </button>
            )}
            <p className="text-xs text-gray-400">
              平台：{platformFilter || '全部平台'}（跟随上方筛选）
            </p>
          </ModalBody>

          <ModalFooter>
            <div className="flex w-full gap-2">
              <Button
                variant="secondary"
                onClick={() => setExportDialogOpen(false)}
                className="flex-1 border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              >
                取消
              </Button>
              <Button onClick={exportRecords} disabled={exporting} className="flex-1">
                {exporting ? '导出中...' : '导出'}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={saveConfirmOpen}
        title="确认保存佣金记录"
        description="确认后记录会立即更新。"
        confirmLabel={saving ? '保存中...' : '确认保存'}
        cancelLabel="返回修改"
        loading={saving}
        onOpenChange={(open) => {
          setSaveConfirmOpen(open)
          if (!open) setPendingSavePayload(null)
        }}
        onConfirm={saveRecord}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="确认删除佣金记录"
        description={`确定要删除订单「${pendingDelete?.order_no || ''}」的记录吗？`}
        confirmLabel={saving ? '删除中...' : '确认删除'}
        cancelLabel="取消"
        destructive
        loading={saving}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open)
          if (!open) setPendingDelete(null)
        }}
        onConfirm={deleteRecord}
      />
    </div>
  )
}
