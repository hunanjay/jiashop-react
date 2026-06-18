import { useCallback, useEffect, useMemo, useState } from 'react'

import { api } from '../../lib/api'
import { useApp } from '../../lib/app-context'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { formatDateTime } from '../../lib/format'

const FALLBACK_ROLES = ['guest', 'user', 'admin', 'superadmin']

export default function RbacPage() {
  const { pushToast } = useApp()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState(FALLBACK_ROLES)
  const [draftRoles, setDraftRoles] = useState({})
  const [savingId, setSavingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingUser, setPendingUser] = useState(null)

  const roleOptions = useMemo(() => roles.map((role) => ({ label: role, value: role })), [roles])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/roles').catch(() => null),
      ])

      const nextUsers = usersResponse.data || []
      setUsers(nextUsers)
      setRoles(rolesResponse?.data?.map((item) => item.name) || FALLBACK_ROLES)
      setDraftRoles(
        nextUsers.reduce((accumulator, user) => {
          accumulator[user.id] = user.role || 'guest'
          return accumulator
        }, {}),
      )
    } catch {
      pushToast('error', '角色列表加载失败')
    } finally {
      setLoading(false)
    }
  }, [pushToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveRole = async (userId) => {
    const user = users.find((item) => item.id === userId)
    const role = draftRoles[userId]
    if (!user || !role) return
    setPendingUser(user)
    setConfirmOpen(true)
  }

  const confirmSaveRole = async () => {
    if (!pendingUser) return
    const role = draftRoles[pendingUser.id]
    if (!role) return
    setSavingId(pendingUser.id)
    try {
      await api.patch(`/admin/users/${pendingUser.id}/role`, { role })
      pushToast('success', '角色已更新')
      await loadData()
    } catch {
      pushToast('error', '更新角色失败')
    } finally {
      setSavingId(null)
      setConfirmOpen(false)
      setPendingUser(null)
    }
  }

  return (
    <div className="space-y-6 text-gray-900">
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="relative px-4 py-4 sm:px-5">
          <CardTitle className="text-2xl font-semibold text-gray-900 md:text-[28px]">RBAC 权限设置</CardTitle>
          <p className="mt-1.5 text-sm text-gray-500">仅 SuperAdmin 可查看和修改用户角色。</p>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="text-gray-700 font-semibold">用户名</TableHead>
            <TableHead className="text-gray-700 font-semibold">邮箱</TableHead>
            <TableHead className="text-gray-700 font-semibold">当前角色</TableHead>
            <TableHead className="text-gray-700 font-semibold">目标角色</TableHead>
            <TableHead className="text-gray-700 font-semibold">创建时间</TableHead>
            <TableHead className="text-gray-700 font-semibold">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                加载中...
              </TableCell>
            </TableRow>
          ) : users.length ? (
            users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">{user.username}</TableCell>
                <TableCell className="text-gray-700">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <select
                    value={draftRoles[user.id] || user.role || 'Guest'}
                    onChange={(event) =>
                      setDraftRoles((current) => ({
                        ...current,
                        [user.id]: event.target.value,
                      }))
                    }
                    className="h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-sm"
                  >
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-gray-500">{formatDateTime(user.created_at)}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => saveRole(user.id)} disabled={savingId === user.id}>
                    {savingId === user.id ? '保存中...' : '保存'}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-gray-500">
                暂无用户
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={confirmOpen}
        title="确认修改角色"
        description={`你正在把「${pendingUser?.username || ''}」的角色调整为 ${pendingUser ? draftRoles[pendingUser.id] : ''}，确认后会立即生效。`}
        confirmLabel="确认修改"
        cancelLabel="返回修改"
        loading={savingId === pendingUser?.id}
        onOpenChange={(open) => {
          setConfirmOpen(open)
          if (!open) {
            setPendingUser(null)
          }
        }}
        onConfirm={confirmSaveRole}
      />
    </div>
  )
}
