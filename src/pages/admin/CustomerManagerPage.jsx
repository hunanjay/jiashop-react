import { useCallback, useEffect, useState } from 'react'
import { Edit3, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { api } from '../../lib/api'
import { useApp } from '../../lib/app-context'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
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
    <Card className="border-white/10 bg-white/6 text-zinc-100 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <CardHeader className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base text-white">客户管理</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索公司名、采购员、电话"
              className="h-9 w-[280px] border-white/10 bg-white/6 text-sm text-white placeholder:text-zinc-500"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={loadCustomers}
              className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
            <Button size="sm" onClick={openCreateDrawer}>
              <Plus className="h-4 w-4" />
              新增客户
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-2.5">公司名</TableHead>
              <TableHead className="py-2.5">采购员</TableHead>
              <TableHead className="py-2.5">电话</TableHead>
              <TableHead className="py-2.5">发货地址</TableHead>
              <TableHead className="py-2.5">归属</TableHead>
              <TableHead className="py-2.5">创建时间</TableHead>
              <TableHead className="py-2.5">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-zinc-500">加载中...</TableCell>
              </TableRow>
            ) : filteredCustomers.length ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="py-2.5 font-medium text-white">{customer.company_name}</TableCell>
                  <TableCell className="py-2.5">{customer.purchaser || '-'}</TableCell>
                  <TableCell className="py-2.5">{customer.phone || '-'}</TableCell>
                  <TableCell className="max-w-[260px] truncate py-2.5">{customer.shipping_address || '-'}</TableCell>
                  <TableCell className="py-2.5 text-zinc-400">{ownerNameById(customer.owner_id)}</TableCell>
                  <TableCell className="py-2.5">{formatDateTime(customer.created_at)}</TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEditDrawer(customer)} className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10">
                        <Edit3 className="h-4 w-4" />
                        编辑
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => requestDeleteCustomer(customer)}>
                        <Trash2 className="h-4 w-4" />
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-zinc-500">暂无客户</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full max-w-2xl bg-[#111114]/96 text-zinc-100">
          <SheetHeader>
            <SheetTitle>{selectedId ? '编辑客户' : '新增客户'}</SheetTitle>
            <SheetDescription>维护客户基础信息。</SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-4 p-5">
            <Input value={form.company_name} onChange={(event) => setForm((current) => ({ ...current, company_name: event.target.value }))} placeholder="公司名" />
            <Input value={form.purchaser} onChange={(event) => setForm((current) => ({ ...current, purchaser: event.target.value }))} placeholder="采购员" />
            <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="联系电话" />
            <Textarea value={form.shipping_address} onChange={(event) => setForm((current) => ({ ...current, shipping_address: event.target.value }))} placeholder="发货地址" />
            {scope === 'admin' ? (
              <Input
                value={form.owner_username}
                onChange={(event) => setForm((current) => ({ ...current, owner_username: event.target.value }))}
                placeholder="归属人员用户名"
              />
            ) : null}
          </SheetBody>
          <SheetFooter className="border-t border-white/10 p-5">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)} className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10">取消</Button>
            <Button onClick={requestSaveCustomer}>保存</Button>
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
    </Card>
  )
}
