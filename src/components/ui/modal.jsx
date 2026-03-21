import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '../../lib/utils'

const Modal = Dialog.Root
const ModalTrigger = Dialog.Trigger

const ModalContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-md" />
    <Dialog.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-[96vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/15 bg-slate-950/72 text-slate-100 shadow-[0_40px_120px_rgba(2,6,23,0.55)] backdrop-blur-2xl outline-none',
        className,
      )}
      {...props}
    >
      {children}
      <Dialog.Close className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-slate-100 backdrop-blur-xl transition hover:bg-white/20">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
))
ModalContent.displayName = 'ModalContent'

const ModalHeader = ({ className, ...props }) => (
  <div className={cn('border-b border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl', className)} {...props} />
)

const ModalBody = ({ className, ...props }) => (
  <div className={cn('max-h-[82vh] overflow-y-auto p-5', className)} {...props} />
)

const ModalFooter = ({ className, ...props }) => (
  <div className={cn('border-t border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl', className)} {...props} />
)

export { Modal, ModalTrigger, ModalContent, ModalHeader, ModalBody, ModalFooter }
