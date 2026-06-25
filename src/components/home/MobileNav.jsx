import { Store, Sparkles, ShoppingCart, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../../lib/app-context'

export function MobileNav() {
  const { cartCount } = useApp()
  const { pathname } = useLocation()

  const links = [
    { to: '/', icon: Store, label: '选购', match: '/' },
    { to: '/catalog', icon: Sparkles, label: '定制', match: '/catalog' },
    { to: '/cart', icon: ShoppingCart, label: '购物车', match: '/cart', badge: cartCount },
    { to: '/login', icon: User, label: '我的', match: '/login' },
  ]

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 md:hidden">
      <div
        className="glass-deep flex items-center gap-1 rounded-2xl px-3 py-2"
        style={{
          boxShadow:
            'inset 0 2px 0 rgba(255,255,255,0.74), inset 0 -1px 0 rgba(255,255,255,0.10), ' +
            '0 24px 64px rgba(99,102,241,0.24), 0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        {links.map(({ to, icon: Icon, label, match, badge }) => {
          const active = pathname === match
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150"
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 ${
                  active
                    ? 'bg-blue-700 text-white shadow-[0_2px_12px_rgba(26,86,219,0.35)]'
                    : 'text-zinc-400'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={active ? 2 : 1.5} />
                {badge > 0 && !active && (
                  <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-blue-700" />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors duration-150 ${
                  active ? 'text-blue-700' : 'text-zinc-400'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
