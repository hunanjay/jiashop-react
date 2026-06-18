import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-blue-700 text-white shadow-sm hover:bg-blue-800',
        secondary:
          'border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
        destructive:
          'border border-red-200 bg-red-50 text-red-700 shadow-sm hover:bg-red-100',
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
