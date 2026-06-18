import { useCallback, useEffect, useState } from 'react'
import { Building2, Edit3, MapPin, Phone, Plus, RefreshCw, Search, Trash2, User, Users } from 'lucide-react'

import { api } from '../../lib/api'
import { useApp } from '../../lib/app-context'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../../components/ui/sheet'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { formatDateTime } from '../../lib/format'

const EMPTY_FORM = {
  id: null,
  company_name: '',
  purchaser: '',
  phone: '',
  shipping_address: '',
  owner_id: '',
  owner_username: '',
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
]

function CompanyAvatar({ name }) {
  const char = (name || '?')[0].toUpperCase()
  const color = AVATAR_COLORS[char.charCodeAt(0) % AVATAR_COLORS.length]
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${color}`}>
      {char}
    </div>
  )
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

export default function CustomerManagerPage({ scope = 'admin' }) {
  const { pushToast, session } = useApp()
  const [customers, setCustomers] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [pendingSavePayload, setPendingSavePayload] = useState(null)

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get(scope === 'workspace' ? '/workspace/customers' : '/admin/customers')
      setCustomers(response.data || [])
    } catch {
      pushToast('error', '客户加载失败')
    } finally {
      setLoading(false)
    }
  }, [pushToast, scope])

  const loadUsers = useCallback(async () => {
    if (scope !== 'admin') return
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data || [])
    } catch {
      setUsers([])
    }
  }, [scope])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

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

  const filteredCustomers = customers.filter((customer) =>
    `${customer.company_name} ${customer.purchaser || ''} ${customer.phone || ''}`.toLowerCase().includes(search.toLowerCase()),
  )

  const openCreateDrawer = () => {
    setSelectedId(null)
    setForm({
      ...EMPTY_FORM,
      owner_id: scope === 'workspace' ? session?.user?.id || '' : session?.user?.id || '',
      owner_username: scope === 'workspace' ? session?.username || session?.user?.username || '' : '',
    })
    setDrawerOpen(true)
  }

  const openEditDrawer = (customer) => {
    setSelectedId(customer.id)
    setForm({
      id: customer.id,
      company_name: customer.company_name || '',
      purchaser: customer.purchaser || '',
      phone: customer.phone || '',
      shipping_address: customer.shipping_address || '',
      owner_id: customer.owner_id || '',
      owner_username: ownerNameById(customer.owner_id),
    })
    setDrawerOpen(true)
  }

  const prepareSaveCustomer = () => {
    if (!form.company_name.trim()) {
      pushToast('error', '请输入公司名')
      return null
    }
    return {
      company_name: form.company_name.trim(),
      purchaser: form.purchaser.trim(),
      phone: form.phone.trim(),
      shipping_address: form.shipping_address.trim(),
      owner_id:
        scope === 'workspace'
          ? form.owner_id.trim()
          : (users.find((user) => user.username === form.owner_username.trim())?.id || form.owner_id.trim()),
    }
  }

  const requestSaveCustomer = () => {
    const payload = prepareSaveCustomer()
    if (!payload) return
    setPendingSavePayload(payload)
    setSaveConfirmOpen(true)
  }

  const saveCustomer = async () => {
    if (!pendingSavePayload) return
    setSaving(true)
    try {
      if (selectedId) {
        await api.patch(`${scope === 'workspace' ? '/workspace/customers' : '/admin/customers'}/${selectedId}`, pendingSavePayload)
        pushToast('success', '客户已更新')
      } else {
        await api.post(scope === 'workspace' ? '/workspace/customers' : '/admin/customers', pendingSavePayload)
        pushToast('success', '客户已创建')
      }
      await loadCustomers()
      setDrawerOpen(false)
      setSaveConfirmOpen(false)
      setPendingSavePayload(null)
    } catch {
      pushToast('error', '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const requestDeleteCustomer = (customer) => {
    setPendingDelete(customer)
    setDeleteConfirmOpen(true)
  }

  const deleteCustomer = async () => {
    if (!pendingDelete) return
    setSaving(true)
    try {
      await api.delete(`${scope === 'workspace' ? '/workspace/customers' : '/admin/customers'}/${pendingDelete.id}`)
      pushToast('success', '客户已删除')
      await loadCustomers()
      setDeleteConfirmOpen(false)
      setPendingDelete(null)
    } catch {
      pushToast('error', '删除失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 text-gray-900">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
          <p className="mt-0.5 text-sm text-gray-500">管理所有客户的基本信息与联系方式</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={loadCustomers}
            className="border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
          <Button size="sm" onClick={openCreateDrawer} className="shadow-sm">
            <Plus className="h-4 w-4" />
            新增客户
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="客户总数" value={customers.length} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard
          label="本次筛选"
          value={search ? filteredCustomers.length : customers.length}
          icon={Search}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="有联系电话"
          value={customers.filter((c) => c.phone).length}
          icon={Phone}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Search + table card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索公司名、采购员、电话…"
              className="h-9 border-gray-200 bg-gray-50 pl-9 text-sm placeholder:text-gray-400 focus:bg-white"
            />
          </div>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              清除
            </button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">公司</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">采购员</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">联系电话</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">发货地址</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">归属</TableHead>
              <TableHead className="py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">创建时间</TableHead>
              <TableHead className="py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j} className="py-3.5">
                      <div
                        className="h-4 animate-pulse rounded-md bg-gray-100"
                        style={{ width: j === 0 ? '80%' : j === 6 ? '60%' : '65%' }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredCustomers.length ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="group transition-colors hover:bg-blue-50/40">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <CompanyAvatar name={customer.company_name} />
                      <span className="font-semibold text-gray-900">{customer.company_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {customer.purchaser ? (
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        {customer.purchaser}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    {customer.phone ? (
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        {customer.phone}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[220px] py-3">
                    {customer.shipping_address ? (
                      <div className="flex items-start gap-1.5 text-sm text-gray-600">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="line-clamp-1">{customer.shipping_address}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    {customer.owner_id ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        <User className="h-3 w-3" />
                        {ownerNameById(customer.owner_id)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-gray-400">{formatDateTime(customer.created_at)}</TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEditDrawer(customer)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        title="编辑"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDeleteCustomer(customer)}
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
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                      <Building2 className="h-7 w-7 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {search ? '没有匹配的客户' : '还没有客户'}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {search ? `尝试清除搜索词「${search}」` : '点击右上角「新增客户」开始添加'}
                      </p>
                    </div>
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        清除搜索
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {!loading && filteredCustomers.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
            共 <span className="font-semibold text-gray-600">{filteredCustomers.length}</span> 条
            {search && customers.length !== filteredCustomers.length && (
              <span>，筛选自全部 {customers.length} 条</span>
            )}
          </div>
        )}
      </div>

      {/* Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl">
          <SheetHeader className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-gray-900">
                  {selectedId ? '编辑客户' : '新增客户'}
                </SheetTitle>
                <SheetDescription className="text-xs text-gray-400">
                  {selectedId ? '修改客户基础信息' : '填写新客户的基础信息'}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <SheetBody className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormField label="公司名称" icon={Building2}>
              <Input
                value={form.company_name}
                onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                placeholder="请输入公司名称"
                className="border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
              />
            </FormField>

            <FormField label="采购员" icon={User}>
              <Input
                value={form.purchaser}
                onChange={(e) => setForm((f) => ({ ...f, purchaser: e.target.value }))}
                placeholder="采购员姓名"
                className="border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
              />
            </FormField>

            <FormField label="联系电话" icon={Phone}>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="联系电话"
                className="border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
              />
            </FormField>

            <FormField label="发货地址" icon={MapPin}>
              <Textarea
                value={form.shipping_address}
                onChange={(e) => setForm((f) => ({ ...f, shipping_address: e.target.value }))}
                placeholder="详细收货地址"
                rows={3}
                className="resize-none border-gray-200 bg-gray-50 text-gray-900 focus:bg-white"
              />
            </FormField>

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
                  <option value="">— 不指定 —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.username}>
                      {u.username}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
          </SheetBody>

          <SheetFooter className="border-t border-gray-100 bg-gray-50/60 px-6 py-4">
            <div className="flex w-full gap-2">
              <Button
                variant="secondary"
                onClick={() => setDrawerOpen(false)}
                className="flex-1 border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              >
                取消
              </Button>
              <Button onClick={requestSaveCustomer} className="flex-1">
                保存
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={saveConfirmOpen}
        title="确认保存客户"
        description="确认后客户信息会立即更新。"
        confirmLabel={saving ? '保存中...' : '确认保存'}
        cancelLabel="返回修改"
        loading={saving}
        onOpenChange={(open) => {
          setSaveConfirmOpen(open)
          if (!open) setPendingSavePayload(null)
        }}
        onConfirm={saveCustomer}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="确认删除客户"
        description={`确定要删除「${pendingDelete?.company_name || ''}」吗？`}
        confirmLabel={saving ? '删除中...' : '确认删除'}
        cancelLabel="取消"
        destructive
        loading={saving}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open)
          if (!open) setPendingDelete(null)
        }}
        onConfirm={deleteCustomer}
      />
    </div>
  )
}
