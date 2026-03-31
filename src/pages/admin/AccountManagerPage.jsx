import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, RefreshCw, Search, Shield, Trash2 } from 'lucide-react'

import { api } from '../../lib/api'
import { useApp } from '../../lib/app-context'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../../components/ui/sheet'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { formatDateTime } from '../../lib/format'

const EMPTY_FORM = {
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 'user',
}

function generateTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const length = 10

  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(length)
    window.crypto.getRandomValues(bytes)
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
  }

  return Math.random().toString(36).slice(2, 2 + length)
}

export default function AccountManagerPage() {
  const { pushToast, isSuperAdmin } = useApp()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [pendingUser, setPendingUser] = useState(null)
  const [pendingPayload, setPendingPayload] = useState(null)
  const [pendingTempPassword, setPendingTempPassword] = useState('')

  const roleOptions = useMemo(() => roles.map((role) => ({ label: role.name, value: role.name })), [roles])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersResponse, rolesResponse] = await Promise.all([api.get('/admin/users'), api.get('/admin/roles')])
      setUsers(usersResponse.data || [])
      setRoles(rolesResponse.data || [])
    } catch {
      pushToast('error', '账号数据加载失败')
    } finally {
      setLoading(false)
    }
  }, [pushToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredUsers = users.filter((user) =>
    `${user.username} ${user.email} ${user.phone || ''} ${user.role || ''}`.toLowerCase().includes(search.toLowerCase()),
  )

  const openCreateDrawer = () => {
    setSelectedId(null)
    setForm({ ...EMPTY_FORM, role: roleOptions[0]?.value || 'user' })
    setDrawerOpen(true)
  }

  const openEditDrawer = (user) => {
    setSelectedId(user.id)
    setForm({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || roleOptions[0]?.value || 'user',
    })
    setDrawerOpen(true)
  }

  const prepareSaveUser = () => {
    if (!form.username.trim() || !form.email.trim()) {
      pushToast('error', '请输入用户名和邮箱')
      return null
    }
    if (!selectedId && !form.password.trim()) {
      pushToast('error', '新建账号必须填写密码')
      return null
    }
    return {
      username: form.username.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password.trim(),
      role: form.role,
    }
  }

  const requestSaveUser = () => {
    const payload = prepareSaveUser()
    if (!payload) return
    setPendingPayload(payload)
    setSaveConfirmOpen(true)
  }

  const saveUser = async () => {
    if (!pendingPayload) return
    setSaving(true)
    try {
      if (selectedId) {
        const { password, ...updatePayload } = pendingPayload
        await api.patch(`/admin/users/${selectedId}`, updatePayload)
        if (password) {
          await api.patch(`/admin/users/${selectedId}/password`, { password })
        }
        pushToast('success', '账号已更新')
      } else {
        await api.post('/admin/users', pendingPayload)
        pushToast('success', '账号已创建')
      }
      await loadData()
      setDrawerOpen(false)
      setSaveConfirmOpen(false)
      setPendingPayload(null)
    } catch {
      pushToast('error', '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const requestResetPassword = (user) => {
    setPendingUser(user)
    setPendingTempPassword(generateTemporaryPassword())
    setResetConfirmOpen(true)
  }

  const resetPassword = async () => {
    if (!pendingUser || !pendingTempPassword) return
    setSaving(true)
    try {
      await api.patch(`/admin/users/${pendingUser.id}/password`, { password: pendingTempPassword })
      pushToast('success', '密码已重置')
      setResetConfirmOpen(false)
      setPendingUser(null)
      setPendingTempPassword('')
    } catch {
      pushToast('error', '重置失败')
    } finally {
      setSaving(false)
    }
  }

  const requestDeleteUser = (user) => {
    setPendingUser(user)
    setDeleteConfirmOpen(true)
  }

  const deleteUser = async () => {
    if (!pendingUser) return
    setSaving(true)
    try {
      await api.delete(`/admin/users/${pendingUser.id}`)
      pushToast('success', '账号已删除')
      await loadData()
      setDeleteConfirmOpen(false)
      setPendingUser(null)
    } catch {
      pushToast('error', '删除失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-white/10 bg-white/6 text-zinc-100 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-white">账号管理</CardTitle>
            <p className="mt-1 text-sm text-zinc-500">支持账号新增、编辑、删除、角色分配和密码重置。</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadData} className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10">
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
            <Button onClick={openCreateDrawer}>
              <Plus className="h-4 w-4" />
              新增账号
            </Button>
          </div>
        </div>
        <div className="max-w-md">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索用户名、邮箱、手机号、角色"
            className="border-white/10 bg-white/6 text-white placeholder:text-zinc-500"
          />
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>手机号</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-zinc-500">
                  加载中...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-white">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(user.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEditDrawer(user)} className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10">
                        <Edit3 className="h-4 w-4" />
                        编辑
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => requestResetPassword(user)} disabled={!isSuperAdmin} className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10">
                        <Shield className="h-4 w-4" />
                        重置密码
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => requestDeleteUser(user)} disabled={!isSuperAdmin}>
                        <Trash2 className="h-4 w-4" />
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-zinc-500">
                  暂无账号
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full max-w-2xl bg-[#111114]/96 text-zinc-100">
          <SheetHeader>
            <SheetTitle>{selectedId ? '编辑账号' : '新增账号'}</SheetTitle>
            <SheetDescription>维护用户名、邮箱、手机号和角色。</SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-4 p-5">
            <Input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} placeholder="用户名" />
            <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="邮箱" />
            <Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="手机号" />
            <Input
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder={selectedId ? '留空则不修改密码' : '初始密码'}
              type="password"
            />
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              className="h-11 w-full rounded-2xl border border-white/10 bg-white/6 px-4 text-sm text-white"
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </SheetBody>
          <SheetFooter className="border-t border-white/10 p-5">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)} className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10">
              取消
            </Button>
            <Button onClick={requestSaveUser}>保存</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={saveConfirmOpen}
        title="确认保存账号"
        description="确认后账号信息会立即更新。"
        confirmLabel={saving ? '保存中...' : '确认保存'}
        cancelLabel="返回修改"
        loading={saving}
        onOpenChange={(open) => {
          setSaveConfirmOpen(open)
          if (!open) setPendingPayload(null)
        }}
        onConfirm={saveUser}
      />

      <ConfirmDialog
        open={resetConfirmOpen}
        title="确认重置密码"
        description={`将「${pendingUser?.username || ''}」的密码重置为临时密码：${pendingTempPassword || '******'}。确认后可立即登录。`}
        confirmLabel={saving ? '重置中...' : '确认重置'}
        cancelLabel="取消"
        loading={saving}
        onOpenChange={(open) => {
          setResetConfirmOpen(open)
          if (!open) {
            setPendingUser(null)
            setPendingTempPassword('')
          }
        }}
        onConfirm={resetPassword}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="确认删除账号"
        description={`确定要删除「${pendingUser?.username || ''}」吗？`}
        confirmLabel={saving ? '删除中...' : '确认删除'}
        cancelLabel="取消"
        destructive
        loading={saving}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open)
          if (!open) setPendingUser(null)
        }}
        onConfirm={deleteUser}
      />
    </Card>
  )
}
