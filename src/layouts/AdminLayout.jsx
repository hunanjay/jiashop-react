import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  ReceiptText,
  ShieldCheck,
  Sun,
  Users,
} from 'lucide-react'

import { useApp } from '../lib/app-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet'
import { ConfirmDialog } from '../components/ui/confirm-dialog'

const adminNavigation = [
  { label: '看板', to: '/admin', icon: LayoutDashboard },
  { label: '商品管理', to: '/admin/products', icon: Package },
  { label: '客户管理', to: '/admin/customers', icon: Users },
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
]

export default function AdminLayout({ scope = 'admin' }) {
  const { session, logout, isSuperAdmin, theme, toggleTheme } = useApp()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const navigate = useNavigate()

  const currentNavigation = scope === 'workspace' ? workspaceNavigation : adminNavigation
  const visibleNavigation = currentNavigation.filter((item) => item.to !== '/admin/rbac' || isSuperAdmin)
  const isWorkspaceScope = scope === 'workspace'
  const menuTitle = isWorkspaceScope ? '工作台菜单' : '管理菜单'
  const panelLabel = isWorkspaceScope ? 'Workspace' : 'Ops Panel'
  const isSunTheme = theme === 'sun'
  const appTextClass = isSunTheme ? 'text-zinc-900' : 'text-zinc-100'
  const shellBackgroundClass = isSunTheme
    ? 'bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.16),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_52%,_#ecfeff_100%)]'
    : 'bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(192,132,252,0.14),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.08),_transparent_18%),linear-gradient(180deg,_#09090b_0%,_#0d0d12_48%,_#111114_100%)]'
  const navClass = isSunTheme
    ? 'border-b border-sky-200/70 bg-white/75 px-3 py-2.5 backdrop-blur-2xl lg:px-4'
    : 'border-b border-white/10 bg-black/45 px-3 py-2.5 backdrop-blur-2xl lg:px-4'
  const appNameClass = isSunTheme ? 'text-zinc-900' : 'text-white'
  const panelClass = isSunTheme ? 'text-sky-700/70' : 'text-zinc-500'
  const activeNavClass = isSunTheme
    ? 'bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white shadow-[0_14px_30px_rgba(14,165,233,0.24)]'
    : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 text-white shadow-[0_14px_30px_rgba(99,102,241,0.24)]'
  const inactiveNavClass = isSunTheme
    ? 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 border border-sky-100'
    : 'bg-white/6 text-zinc-400 hover:bg-white/10 hover:text-white'
  const accountCardClass = isSunTheme
    ? 'ml-auto hidden items-center gap-3 rounded-full border border-sky-200 bg-white/80 px-2 py-1.5 shadow-sm sm:flex'
    : 'ml-auto hidden items-center gap-3 rounded-full border border-white/10 bg-white/6 px-2 py-1.5 shadow-sm sm:flex'
  const usernameClass = isSunTheme ? 'text-zinc-900' : 'text-white'
  const roleClass = isSunTheme ? 'text-sky-700/70' : 'text-zinc-500'
  const iconButtonClass = isSunTheme
    ? 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700 transition hover:bg-sky-200 hover:text-sky-900'
    : 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-zinc-300 transition hover:bg-white/12 hover:text-white'
  const chevronClass = isSunTheme ? 'h-4 w-4 text-sky-700/70' : 'h-4 w-4 text-zinc-500'
  const mobileMenuButtonClass = isSunTheme
    ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-200 bg-white/80 text-sky-800 shadow-sm'
    : 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white shadow-sm'
  const sheetClass = isSunTheme ? 'max-w-[320px] bg-[#f8fafc]/95 text-slate-900' : 'max-w-[320px] bg-[#111114]/95 text-white'
  const mobileActiveNavClass = isSunTheme
    ? 'bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 text-white'
    : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 text-white'
  const mobileInactiveNavClass = isSunTheme ? 'bg-white text-slate-700 shadow-sm border border-sky-100' : 'bg-white/6 text-zinc-300 shadow-sm'

  return (
    <div className={`admin-shell min-h-screen theme-${theme} ${appTextClass}`}>
      <div className={`min-h-screen w-full ${shellBackgroundClass}`}>
        <nav className={navClass}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400 text-white shadow-[0_12px_30px_rgba(129,140,248,0.28)]">
                <Package className="h-4.5 w-4.5" />
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-[15px] font-semibold tracking-[-0.03em] ${appNameClass}`}>琵琶行</div>
                <div className="hidden h-4 w-px bg-white/10 lg:block" />
                <div className={`hidden text-[11px] font-medium uppercase tracking-[0.18em] lg:block ${panelClass}`}>
                  {panelLabel}
                </div>
              </div>
            </div>

            <div className="hidden flex-1 items-center justify-center gap-2 overflow-x-auto px-4 lg:flex">
              {visibleNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin' || item.to === '/workspace'}
                  className={({ isActive }) =>
                    [
                      'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition',
                      isActive ? activeNavClass : inactiveNavClass,
                    ].join(' ')
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className={accountCardClass}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400 text-white shadow-[0_12px_24px_rgba(129,140,248,0.28)]">
                {session?.username?.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className={`text-sm font-semibold ${usernameClass}`}>{session?.username}</div>
                <div className={`text-xs ${roleClass}`}>{session?.role}</div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={iconButtonClass}
                title={isSunTheme ? '切换到夜间主题' : '切换到日间主题'}
              >
                {isSunTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                className={iconButtonClass}
              >
                <LogOut className="h-4 w-4" />
              </button>
              <ChevronDown className={chevronClass} />
            </div>

            <div className="ml-auto lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button type="button" className={mobileMenuButtonClass}>
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className={sheetClass}>
                  <SheetHeader>
                    <SheetTitle>{menuTitle}</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-3 p-5">
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isSunTheme ? 'bg-sky-100 text-sky-800' : 'bg-white/10 text-zinc-200'
                      }`}
                    >
                      {isSunTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      {isSunTheme ? '切换夜间主题' : '切换日间主题'}
                    </button>
                    {visibleNavigation.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/admin' || item.to === '/workspace'}
                        className={({ isActive }) =>
                          [
                            'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                            isActive ? mobileActiveNavClass : mobileInactiveNavClass,
                          ].join(' ')
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>

        <main className="px-3 py-3 sm:px-4 lg:px-4">
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
