import { Link, NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { Button } from '../ui/button'

export default function SidebarShell({
  title,
  subtitle,
  icon: Icon,
  collapsed,
  onToggleCollapse,
  links,
  activePrefix,
  account,
  footer,
  children,
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden border-r border-white/80 bg-white/72 backdrop-blur-2xl transition-all duration-300 lg:flex ${
        collapsed ? 'lg:w-[92px]' : 'lg:w-[292px]'
      }`}
    >
      <div className="flex w-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-white/70 px-5 py-5">
          <Link to={links[0]?.to || '/'} className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400 text-white shadow-[0_16px_30px_rgba(129,140,248,0.28)]">
              {Icon ? <Icon className="h-5 w-5" /> : null}
            </div>
            {!collapsed ? (
              <div>
                <div className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">{title}</div>
                <div className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{subtitle}</div>
              </div>
            ) : null}
          </Link>

          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={onToggleCollapse}
            className="h-10 w-10 rounded-full"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {links.map((item) => {
            if (item.hidden) return null
            const IconItem = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === activePrefix}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-[0_16px_30px_rgba(129,140,248,0.24)]'
                      : 'text-slate-700 hover:bg-white/80',
                  ].join(' ')
                }
              >
                <IconItem className="h-4 w-4 shrink-0" />
                {!collapsed ? <span>{item.label}</span> : null}
              </NavLink>
            )
          })}
        </nav>

        {children}

        {account ? (
          <div className="border-t border-white/70 p-4">
            <div className="rounded-[24px] bg-white/75 p-4 shadow-sm backdrop-blur-xl">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">当前账号</div>
              <div className="mt-2 text-sm font-semibold text-slate-950">{account.username}</div>
              <div className="mt-1 text-xs text-slate-500">{account.role}</div>
            </div>
          </div>
        ) : null}
        {footer}
      </div>
    </aside>
  )
}
