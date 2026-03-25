import { Store, Sparkles, ShoppingCart, User } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useApp } from '../../lib/app-context'

export function MobileNav() {
  const { cartCount } = useApp()

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex w-[90%] max-w-md -translate-x-1/2 items-center justify-around rounded-full border border-slate-200/15 bg-white/80 px-6 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.1)] backdrop-blur-3xl md:hidden">
      <Link
        className="flex flex-col items-center justify-center bg-blue-600 text-white rounded-full p-3 transition-transform hover:scale-110"
        to="/"
      >
        <Store className="w-5 h-5" />
        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">选购</span>
      </Link>
      <Link
        className="flex flex-col items-center justify-center text-slate-400 p-3 transition-transform hover:scale-110"
        to="#"
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">定制</span>
      </Link>
      <Link
        className="relative flex flex-col items-center justify-center p-3 text-slate-400 transition-transform hover:scale-110"
        to="/cart"
        aria-label="查看购物车"
      >
        <ShoppingCart className="w-5 h-5" />
        {cartCount > 0 ? (
          <span className="absolute right-2 top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {cartCount}
          </span>
        ) : null}
        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">购物车</span>
      </Link>
      <Link
        className="flex flex-col items-center justify-center p-3 text-slate-400 transition-transform hover:scale-110"
        to="/login"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] uppercase tracking-widest font-bold mt-1">我的</span>
      </Link>
    </div>
  );
}
