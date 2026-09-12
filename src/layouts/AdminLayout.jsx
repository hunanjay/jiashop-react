import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Coins,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'

import { useApp } from '../lib/app-context'
import { ConfirmDialog } from '../components/ui/confirm-dialog'

const adminNavigation = [
  { label: '看板', to: '/admin', icon: LayoutDashboard },
  { label: '商品管理', to: '/admin/products', icon: Package },
  { label: '客户管理', to: '/admin/customers', icon: Users },
  { label: '分销佣金', to: '/admin/commissions', icon: Coins },
  { label: '账号管理', to: '/admin/accounts', icon: Users },
  { label: '数据导出', to: '/admin/export', icon: Download },
  { label: '订单处理', to: '/admin/orders', icon: ReceiptText },
  { label: 'RBAC 权限', to: '/admin/rbac', icon: ShieldCheck },
]

const workspaceNavigation = [
  { label: '工作台', to: '/workspace', icon: LayoutDashboard },
  { label: '我的商品', to: '/workspace/my-products', icon: Package },
  { label: '我的订单', to: '/workspace/my-orders', icon: ReceiptText },
  { label: '客户管理', to: '/workspace/customers', icon: Users },
  { label: '分销佣金', to: '/workspace/commissions', icon: Coins },
]

export default function AdminLayout({ scope = 'admin' }) {
  const { session, logout, isSuperAdmin } = useApp()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const currentNavigation = scope === 'workspace' ? workspaceNavigation : adminNavigation
  const visibleNavigation = currentNavigation.filter((item) => item.to !== '/admin/rbac' || isSuperAdmin)
  const isWorkspaceScope = scope === 'workspace'
  const panelLabel = isWorkspaceScope ? 'Workspace' : 'Ops Panel'
  const rootPrefix = isWorkspaceScope ? '/workspace' : '/admin'

  const sidebarWidth = collapsed ? 'lg:w-[72px]' : 'lg:w-[220px]'

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className={`flex items-center gap-3 border-b border-gray-100 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <Package className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold text-gray-900">jiajia'Shop</div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-gray-400">{panelLabel}</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {visibleNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === rootPrefix}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Account */}
        <div className="border-t border-gray-100 p-3">
          <div className={`flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm">
              {session?.username?.slice(0, 1).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-gray-900">{session?.username}</div>
                <div className="text-[11px] text-gray-500">{session?.role}</div>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {collapsed && (
            <button
              type="button"
              onClick={() => setLogoutConfirmOpen(true)}
              className="mt-2 flex w-full items-center justify-center rounded-lg py-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="hidden lg:flex items-center justify-center gap-2 border-t border-gray-100 px-4 py-3 text-[11px] font-medium text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : (
            <>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>收起菜单</span>
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-200 lg:flex ${sidebarWidth}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside
            className="absolute inset-y-0 left-0 w-[240px] bg-white border-r border-gray-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className={`flex min-h-screen min-w-0 flex-1 flex-col transition-all duration-200 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-[220px]'}`}>
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Package className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold text-gray-900">jiajia'Shop</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">{panelLabel}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm">
              {session?.username?.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-6 lg:py-6">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="确认退出登录"
        description="退出后将返回登录页，当前会话会被清除。"
        confirmLabel="确认退出"
        cancelLabel="取消"
        destructive
        onOpenChange={setLogoutConfirmOpen}
        onConfirm={() => {
          logout()
          setLogoutConfirmOpen(false)
          navigate('/login')
        }}
      />
    </div>
  )
}
