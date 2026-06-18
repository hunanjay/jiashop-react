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
      className={`fixed inset-y-0 left-0 z-40 hidden border-r border-gray-200 bg-white transition-all duration-300 lg:flex ${
        collapsed ? 'lg:w-[92px]' : 'lg:w-[292px]'
      }`}
    >
      <div className="flex w-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-5">
          <Link to={links[0]?.to || '/'} className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm">
              {Icon ? <Icon className="h-5 w-5" /> : null}
            </div>
            {!collapsed ? (
              <div>
                <div className="text-sm font-semibold tracking-[0.18em] text-gray-500 uppercase">{title}</div>
                <div className="text-lg font-semibold text-gray-900">{subtitle}</div>
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
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100',
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
          <div className="border-t border-gray-200 p-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">当前账号</div>
              <div className="mt-2 text-sm font-semibold text-gray-900">{account.username}</div>
              <div className="mt-1 text-xs text-gray-500">{account.role}</div>
            </div>
          </div>
        ) : null}
        {footer}
      </div>
    </aside>
  )
}
