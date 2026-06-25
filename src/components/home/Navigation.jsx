import { ShoppingCart, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../../lib/app-context'

export function Navigation() {
  const { cartCount, session } = useApp()
  const accountHref = session ? (session.role === 'user' ? '/workspace' : '/admin') : '/login'
  const accountLabel = session ? '个人中心' : '登录'

  return (
    <nav className="glass-nav fixed top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-0">
          <span className="text-[15px] font-bold tracking-tight text-zinc-900">jiajia</span>
          <span className="text-[15px] font-light text-zinc-300 mx-1">/</span>
          <span className="text-[15px] font-bold tracking-tight text-blue-700">Shop</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link
            to={accountHref}
            className="hidden sm:block px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-150"
          >
            {accountLabel}
          </Link>
          <Link
            to="/cart"
            aria-label="查看购物车"
            className="glass flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-zinc-700 hover:brightness-105 active:scale-[0.98] transition-all duration-150"
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">购物车</span>
            {cartCount > 0 && (
              <span className="inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/catalog"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 active:scale-[0.98] transition-all duration-150 shadow-sm shadow-blue-900/20"
          >
            开始定制
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
