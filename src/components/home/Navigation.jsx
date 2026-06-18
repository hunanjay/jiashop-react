import { Search, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useApp } from '../../lib/app-context'

export function Navigation() {
  const { cartCount, session } = useApp()
  const accountHref = session ? (session.role === 'user' ? '/workspace' : '/admin') : '/login'
  const accountLabel = session ? '个人中心' : '登录'

  return (
    <nav className="fixed top-0 z-50 w-full bg-white px-8 py-4 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="text-xl font-bold text-gray-900">jiajia'Shop</Link>
          <div className="hidden md:flex gap-8 items-center">

          </div>
        </div>
        <div className="flex items-center gap-4">

          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            aria-label="查看购物车"
          >
            <ShoppingCart className="h-4 w-4 text-gray-500" />
            <span className="hidden sm:inline">购物车</span>
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-blue-700 px-2 py-0.5 text-[11px] font-semibold text-white">
              {cartCount}
            </span>
          </Link>
          <Link to="/catalog" className="px-6 py-2.5 bg-blue-700 text-white rounded-lg font-medium text-sm shadow-sm hover:bg-blue-800 transition-colors duration-150">
            开始定制
          </Link>
          <Link to={accountHref} className="hidden sm:block text-gray-500 font-medium hover:text-blue-700 transition-colors duration-150 text-sm">
            {accountLabel}
          </Link>
        </div>
      </div>
    </nav>
  );
}

