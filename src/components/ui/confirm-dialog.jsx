import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button'

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = '确认',
  cancelLabel = '取消',
  destructive = false,
  loading = false,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)] outline-none',
          )}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4">
            <div
              className={cn(
                'mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                destructive ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700',
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">{title}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-slate-500">{description}</Dialog.Description>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button variant={destructive ? 'destructive' : 'default'} onClick={onConfirm} disabled={loading}>
              {loading ? '处理中...' : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export { ConfirmDialog }
