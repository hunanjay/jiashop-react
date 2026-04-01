import { Search, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useApp } from '../../lib/app-context'

export function Navigation() {
  const { cartCount, session } = useApp()
  const accountHref = session ? (session.role === 'user' ? '/workspace' : '/admin') : '/login'
  const accountLabel = session ? '个人中心' : '登录'

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/70 px-8 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-blue-700">琵琶行</Link>
          <div className="hidden md:flex gap-8 items-center">

          </div>
        </div>
        <div className="flex items-center gap-4">

          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--outline-variant)]/30 bg-white/75 px-4 py-2.5 text-sm font-medium text-[var(--on-surface)] transition hover:border-[var(--primary)]/30 hover:text-[var(--primary)]"
            aria-label="查看购物车"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">购物车</span>
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--primary)] px-2 py-0.5 text-[11px] font-semibold text-[var(--on-primary)]">
              {cartCount}
            </span>
          </Link>
          <Link to="/catalog" className="px-6 py-2.5 bg-[var(--primary)] text-[var(--on-primary)] rounded-xl font-medium text-sm transition-transform active:scale-95 duration-200">
            开始定制
          </Link>
          <Link to={accountHref} className="hidden sm:block text-slate-500 font-medium hover:text-blue-500 transition-all text-sm">
            {accountLabel}
          </Link>
        </div>
      </div>
    </nav>
  );
}
