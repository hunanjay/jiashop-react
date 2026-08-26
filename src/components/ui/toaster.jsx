import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

import { useApp } from '../../lib/app-context'

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    iconClassName: 'text-emerald-600',
  },
  error: {
    icon: XCircle,
    className: 'border-red-200 bg-red-50 text-red-800',
    iconClassName: 'text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    iconClassName: 'text-amber-600',
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-800',
    iconClassName: 'text-blue-600',
  },
}

export function Toaster() {
  const { toasts } = useApp()

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => {
        const variant = VARIANTS[toast.type] || VARIANTS.info
        const Icon = variant.icon
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-md ${variant.className}`}
          >
            <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${variant.iconClassName}`} />
            <div className="min-w-0">
              <div className="text-sm font-semibold">{toast.title}</div>
              {toast.detail ? <div className="mt-0.5 text-xs opacity-80">{toast.detail}</div> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
