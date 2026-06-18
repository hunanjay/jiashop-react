import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import { cn } from '../../lib/utils'

const Modal = Dialog.Root
const ModalTrigger = Dialog.Trigger

const ModalContent = React.forwardRef(({ className, children, showClose = true, ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
    <Dialog.Content
      ref={ref}
      aria-describedby={undefined}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-[96vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-xl outline-none',
        className,
      )}
      {...props}
    >
      {children}
      {showClose && (
        <Dialog.Close className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Dialog.Close>
      )}
    </Dialog.Content>
  </Dialog.Portal>
))
ModalContent.displayName = 'ModalContent'

const ModalTitle = React.forwardRef(({ className, ...props }, ref) => (
  <Dialog.Title ref={ref} className={cn('text-sm font-semibold text-gray-900', className)} {...props} />
))
ModalTitle.displayName = 'ModalTitle'

const ModalHeader = ({ className, ...props }) => (
  <div className={cn('border-b border-gray-200 px-5 py-4', className)} {...props} />
)

const ModalBody = ({ className, ...props }) => (
  <div className={cn('max-h-[82vh] overflow-y-auto p-5', className)} {...props} />
)

const ModalFooter = ({ className, ...props }) => (
  <div className={cn('border-t border-gray-200 px-5 py-4', className)} {...props} />
)

export { Modal, ModalTrigger, ModalContent, ModalTitle, ModalHeader, ModalBody, ModalFooter }
