import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Menu, Package, ReceiptText, Search, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

import { useApp } from '../lib/app-context'
import { Input } from '../components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet'
import { ConfirmDialog } from '../components/ui/confirm-dialog'

const navigation = [
  { label: '我的商品', to: '/workspace/my-products', icon: Package },
  { label: '我的订单', to: '/workspace/my-orders', icon: ReceiptText },
]

export default function UserLayout() {
  const { session, logout, catalogQuery, setCatalogQuery } = useApp()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-slate-200/80 bg-white/90 backdrop-blur-2xl lg:flex">
          <div className="flex w-full flex-col">
            <div className="border-b border-slate-200/80 px-5 py-5">
              <Link to="/workspace/my-products" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">GiftCraft</div>
                  <div className="text-lg font-semibold tracking-[-0.03em]">User Workspace</div>
                </div>
              </Link>
            </div>

            <nav className="flex-1 space-y-2 p-4">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                        isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
                      ].join(' ')
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:pl-[272px]">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-2xl">
            <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative hidden w-full max-w-xl md:block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={catalogQuery}
                    onChange={(event) => setCatalogQuery(event.target.value)}
                    placeholder="搜索我的商品 / 订单"
                    className="h-11 rounded-full border-slate-200 bg-slate-50 pl-11 shadow-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
              >
                <LogOut className="h-4 w-4" />
              </button>

              <div className="hidden sm:block rounded-full border border-slate-200 bg-white px-3 py-2 text-sm">
                {session?.username} / {session?.role}
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
                      <SheetTitle>工作台</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-3 p-5">
                      {navigation.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
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
                      ))}
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
