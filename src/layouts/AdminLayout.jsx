import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Search,
  LayoutDashboard,
} from 'lucide-react'

import { useApp } from '../lib/app-context'
import { Input } from '../components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet'
import { ConfirmDialog } from '../components/ui/confirm-dialog'

const navigation = [
  { label: '看板', to: '/admin', icon: LayoutDashboard },
  { label: '商品管理', to: '/admin/products', icon: Package },
  { label: '订单处理', to: '/admin/orders', icon: ReceiptText },
  { label: 'RBAC 权限', to: '/admin/rbac', icon: ShieldCheck },
]

export default function AdminLayout() {
  const { session, logout, catalogQuery, setCatalogQuery, isSuperAdmin } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const breadcrumb = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    if (parts.length <= 1) return ['管理后台', '看板']
    const segmentLabel = {
      products: '商品管理',
      orders: '订单处理',
      rbac: 'RBAC 权限',
    }
    return ['管理后台', segmentLabel[parts[1]] || '看板']
  }, [location.pathname])

  const sidebarWidth = collapsed ? 'lg:w-[92px]' : 'lg:w-[292px]'

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-900">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200/80 bg-white/90 backdrop-blur-2xl transition-all duration-300 lg:flex ${sidebarWidth}`}
        >
          <div className="flex w-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-5">
              <Link to="/admin" className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                  <Package className="h-5 w-5" />
                </div>
                {!collapsed ? (
                  <div>
                    <div className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">GiftCraft</div>
                    <div className="text-lg font-semibold tracking-[-0.03em]">Ops Panel</div>
                  </div>
                ) : null}
              </Link>

              <button
                type="button"
                onClick={() => setCollapsed((value) => !value)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            </div>

            <nav className="flex-1 space-y-2 p-4">
              {navigation.map((item) => {
                if (item.to === '/admin/rbac' && !isSuperAdmin) {
                  return null
                }
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                        isActive ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15' : 'text-slate-600 hover:bg-slate-100',
                      ].join(' ')
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </NavLink>
                )
              })}
            </nav>

            <div className="border-t border-slate-200/80 p-4">
              <div className="rounded-[24px] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">当前账号</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{session?.username}</div>
                <div className="mt-1 text-xs text-slate-500">{session?.role}</div>
              </div>
            </div>
          </div>
        </aside>

        <div className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${collapsed ? 'lg:pl-[92px]' : 'lg:pl-[292px]'}`}>
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-2xl">
            <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-1 items-center gap-3">
                <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
                  {breadcrumb.map((item, index) => (
                    <div key={item} className="flex items-center gap-2">
                      {index > 0 ? <ChevronRight className="h-4 w-4" /> : null}
                      <span className={index === breadcrumb.length - 1 ? 'font-semibold text-slate-900' : ''}>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-1 items-center justify-center">
                  <div className="relative hidden w-full max-w-xl md:block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={catalogQuery}
                      onChange={(event) => setCatalogQuery(event.target.value)}
                      placeholder="搜索商品 / 订单 / 用户"
                      className="h-11 rounded-full border-slate-200 bg-slate-50 pl-11 shadow-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 md:hidden"
              >
                <Search className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <Bell className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                  {session?.username?.slice(0, 1).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold">{session?.username}</div>
                  <div className="text-xs text-slate-500">{session?.role}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setLogoutConfirmOpen(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm">
                      <Menu className="h-5 w-5" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="max-w-[320px]">
                    <SheetHeader>
                      <SheetTitle>管理菜单</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-3 p-5">
                      {navigation.map((item) => {
                        if (item.to === '/admin/rbac' && !isSuperAdmin) {
                          return null
                        }
                        return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/admin'}
                          className={({ isActive }) =>
                            [
                              'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                              isActive ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 shadow-sm',
                            ].join(' ')
                          }
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </NavLink>
                        )
                      })}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
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
