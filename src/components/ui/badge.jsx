import React from 'react'

import { cn } from '../../lib/utils'

const badgeVariants = {
  default: 'border-transparent bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  secondary: 'border-transparent bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  destructive: 'border-transparent bg-red-50 text-red-700 ring-1 ring-red-200',
  outline: 'border border-gray-300 bg-white text-gray-700',
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
