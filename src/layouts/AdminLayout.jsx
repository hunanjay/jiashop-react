import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { useApp } from '../lib/app-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet'
import { ConfirmDialog } from '../components/ui/confirm-dialog'

const navigation = [
  { label: '看板', to: '/admin', icon: LayoutDashboard },
  { label: '商品管理', to: '/admin/products', icon: Package },
  { label: '客户管理', to: '/admin/customers', icon: Users },
  { label: '账号管理', to: '/admin/accounts', icon: Users },
  { label: '数据导出', to: '/admin/export', icon: Download },
  { label: '订单处理', to: '/admin/orders', icon: ReceiptText },
  { label: 'RBAC 权限', to: '/admin/rbac', icon: ShieldCheck },
]

export default function AdminLayout() {
  const { session, logout, isSuperAdmin } = useApp()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const navigate = useNavigate()

  const visibleNavigation = navigation.filter((item) => item.to !== '/admin/rbac' || isSuperAdmin)

  return (
    <div className="min-h-screen text-zinc-100">
      <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(192,132,252,0.14),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(34,197,94,0.08),_transparent_18%),linear-gradient(180deg,_#09090b_0%,_#0d0d12_48%,_#111114_100%)]">
        <nav className="border-b border-white/10 bg-black/45 px-3 py-2.5 backdrop-blur-2xl lg:px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400 text-white shadow-[0_12px_30px_rgba(129,140,248,0.28)]">
                <Package className="h-4.5 w-4.5" />
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[15px] font-semibold tracking-[-0.03em] text-white">琵琶行</div>
                <div className="hidden h-4 w-px bg-white/10 lg:block" />
                <div className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 lg:block">
                  Ops Panel
                </div>
              </div>
            </div>

            <div className="hidden flex-1 items-center justify-center gap-2 overflow-x-auto px-4 lg:flex">
              {visibleNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) =>
                    [
                      'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 text-white shadow-[0_14px_30px_rgba(99,102,241,0.24)]'
                        : 'bg-white/6 text-zinc-400 hover:bg-white/10 hover:text-white',
                    ].join(' ')
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="ml-auto hidden items-center gap-3 rounded-full border border-white/10 bg-white/6 px-2 py-1.5 shadow-sm sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400 text-white shadow-[0_12px_24px_rgba(129,140,248,0.28)]">
                {session?.username?.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-white">{session?.username}</div>
                <div className="text-xs text-zinc-500">{session?.role}</div>
              </div>
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-zinc-300 transition hover:bg-white/12 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </div>

            <div className="ml-auto lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white shadow-sm"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="max-w-[320px] bg-[#111114]/95 text-white">
                  <SheetHeader>
                    <SheetTitle>管理菜单</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-3 p-5">
                    {visibleNavigation.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/admin'}
                        className={({ isActive }) =>
                          [
                            'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                            isActive ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 text-white' : 'bg-white/6 text-zinc-300 shadow-sm',
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
