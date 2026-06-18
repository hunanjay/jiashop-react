import { Store, Sparkles, ShoppingCart, User } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useApp } from '../../lib/app-context'

export function MobileNav() {
  const { cartCount } = useApp()

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex w-[90%] max-w-md -translate-x-1/2 items-end justify-around rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-lg md:hidden">
      <Link
        className="flex flex-col items-center justify-center transition-colors duration-150"
        to="/"
      >
        <div className="bg-blue-700 text-white rounded-lg p-2.5">
          <Store className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-semibold text-blue-700 mt-1">选购</span>
      </Link>
      <Link
        className="flex flex-col items-center justify-center transition-colors duration-150"
        to="#"
      >
        <div className="text-gray-400 p-2.5 hover:text-gray-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-medium text-gray-500 mt-1">定制</span>
      </Link>
      <Link
        className="relative flex flex-col items-center justify-center transition-colors duration-150"
        to="/cart"
        aria-label="查看购物车"
      >
        <div className="text-gray-400 p-2.5 hover:text-gray-600">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 ? (
            <span className="absolute right-1 top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-700 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          ) : null}
        </div>
        <span className="text-[10px] font-medium text-gray-500 mt-1">购物车</span>
      </Link>
      <Link
        className="flex flex-col items-center justify-center transition-colors duration-150"
        to="/login"
      >
        <div className="text-gray-400 p-2.5 hover:text-gray-600">
          <User className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-medium text-gray-500 mt-1">我的</span>
      </Link>
    </div>
  );
}

