import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200/80 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-[0_18px_40px_rgba(129,140,248,0.28)] hover:-translate-y-0.5 hover:brightness-105',
        secondary:
          'border border-slate-200/80 bg-white/75 text-slate-800 shadow-sm backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white',
        ghost: 'bg-transparent text-slate-700 hover:bg-slate-100/80',
        destructive:
          'border border-rose-200 bg-rose-50/90 text-rose-700 shadow-sm hover:-translate-y-0.5 hover:bg-rose-100',
      },
      size: {
        default: 'h-11 px-4 py-2.5',
        sm: 'h-9 px-3',
        lg: 'h-12 px-5',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
})
Button.displayName = 'Button'

export { Button }
