import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '../../lib/utils'

const Sheet = Dialog.Root
const SheetTrigger = Dialog.Trigger
const SheetClose = Dialog.Close
const SheetPortal = Dialog.Portal

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-slate-950/25 backdrop-blur-md transition-opacity', className)}
    {...props}
  />
))
SheetOverlay.displayName = 'SheetOverlay'

const sheetSideClasses = {
  top: 'inset-x-0 top-0 rounded-b-[32px] border-b',
  bottom: 'inset-x-0 bottom-0 rounded-t-[32px] border-t',
  left: 'inset-y-0 left-0 h-full w-full max-w-[560px] rounded-r-[32px] border-r',
  right: 'inset-y-0 right-0 h-full w-full max-w-[560px] rounded-l-[32px] border-l',
}

const SheetContent = React.forwardRef(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <Dialog.Content
      ref={ref}
      className={cn(
        'fixed z-50 overflow-hidden border border-white/15 bg-slate-950/72 text-slate-100 shadow-[0_30px_80px_rgba(2,6,23,0.45)] outline-none backdrop-blur-2xl',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-300',
        'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
        'data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
        sheetSideClasses[side] || sheetSideClasses.right,
        className,
      )}
      {...props}
    >
      {children}
      <SheetClose className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-slate-100 shadow-sm backdrop-blur-xl transition hover:bg-white/20">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetClose>
    </Dialog.Content>
  </SheetPortal>
))
SheetContent.displayName = 'SheetContent'

const SheetHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-1.5 border-b border-white/10 bg-white/5 px-6 py-5 backdrop-blur-xl', className)} {...props} />
)
SheetHeader.displayName = 'SheetHeader'

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <Dialog.Title ref={ref} className={cn('text-2xl font-semibold tracking-[-0.03em] text-white', className)} {...props} />
))
SheetTitle.displayName = 'SheetTitle'

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <Dialog.Description ref={ref} className={cn('text-sm leading-6 text-slate-200', className)} {...props} />
))
SheetDescription.displayName = 'SheetDescription'

const SheetBody = ({ className, ...props }) => (
  <div className={cn('flex-1 overflow-y-auto p-6', className)} {...props} />
)

const SheetFooter = ({ className, ...props }) => (
  <div className={cn('border-t border-white/10 bg-white/5 px-6 py-5 backdrop-blur-xl', className)} {...props} />
)

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
}
