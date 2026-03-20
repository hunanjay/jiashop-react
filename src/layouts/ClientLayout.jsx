import { Outlet, Link, NavLink } from 'react-router-dom'
import { Home, ShoppingBag, User2, Search, ShoppingCart, Menu } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet'

export default function ClientLayout() {
  const { session, cartCount, catalogQuery, setCatalogQuery } = useApp()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(244,247,250,1)_36%,_rgba(232,236,243,1)_100%)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/55 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">GiftCraft</div>
              <div className="text-lg font-semibold tracking-[-0.03em] text-slate-900">礼品定制商店</div>
            </div>
          </Link>

          <div className="flex flex-1 items-center justify-center">
            <div className="relative w-full max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={catalogQuery}
                onChange={(event) => setCatalogQuery(event.target.value)}
                placeholder="搜索礼品、分类、定制方式"
                className="h-12 rounded-full border-white/70 bg-white/80 pl-11 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              />
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/cart"
              className="relative inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <ShoppingCart className="h-4 w-4" />
              购物车
              <Badge variant="default" className="ml-1 bg-slate-900 px-2 py-0.5 text-[11px]">
                {cartCount}
              </Badge>
            </Link>
            <Link
              to={session ? '/admin' : '/login'}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-medium text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <User2 className="h-4 w-4" />
              {session ? session.username : '个人中心'}
            </Link>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="max-w-[340px]">
                <SheetHeader>
                  <SheetTitle>导航</SheetTitle>
                </SheetHeader>
                <div className="space-y-3 p-5">
                  <Link to="/" className="block rounded-2xl bg-white px-4 py-3 shadow-sm">
                    首页
                  </Link>
                  <Link to="/cart" className="block rounded-2xl bg-white px-4 py-3 shadow-sm">
                    购物车
                  </Link>
                  <Link to={session ? '/admin' : '/login'} className="block rounded-2xl bg-white px-4 py-3 shadow-sm">
                    {session ? '个人中心' : '登录'}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/70 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>备案信息：粤 ICP 备 XXXX 号</div>
          <div className="flex items-center gap-3 lg:justify-center">
            <span>支付方式</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Visa</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Mastercard</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Alipay</span>
          </div>
          <div className="text-left lg:text-right">Apple-style storefront for premium gifting</div>
        </div>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/70 bg-white/70 backdrop-blur-2xl md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-3 px-3 py-2">
          <NavLink to="/" className={({ isActive }) => navClass(isActive)}>
            <Home className="h-5 w-5" />
            首页
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => navClass(isActive)}>
            <ShoppingCart className="h-5 w-5" />
            购物车
          </NavLink>
          <NavLink to={session ? '/admin' : '/login'} className={({ isActive }) => navClass(isActive)}>
            <User2 className="h-5 w-5" />
            {session ? '我的' : '登录'}
          </NavLink>
        </div>
      </nav>
    </div>
  )
}

function navClass(isActive) {
  return [
    'flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition',
    isActive ? 'text-slate-900' : 'text-slate-500',
  ].join(' ')
}
