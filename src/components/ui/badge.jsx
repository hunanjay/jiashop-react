import React from 'react'

import { cn } from '../../lib/utils'

const badgeVariants = {
  default: 'border-transparent bg-slate-900 text-white',
  secondary: 'border-transparent bg-slate-100 text-slate-700',
  destructive: 'border-transparent bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  outline: 'border-slate-200 bg-white text-slate-700',
}

const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide',
      badgeVariants[variant] || badgeVariants.default,
      className,
    )}
    {...props}
  />
))
Badge.displayName = 'Badge'

export { Badge }
