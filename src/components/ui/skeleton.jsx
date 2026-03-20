import React from 'react'

import { cn } from '../../lib/utils'

const Skeleton = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('animate-pulse rounded-2xl bg-slate-200/80', className)} {...props} />
))
Skeleton.displayName = 'Skeleton'

export { Skeleton }

