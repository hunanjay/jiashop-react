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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-md" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/15 bg-slate-950/72 p-5 text-slate-100 shadow-[0_40px_120px_rgba(2,6,23,0.55)] outline-none backdrop-blur-2xl',
          )}
        >
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-slate-100 backdrop-blur-xl transition hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4">
            <div
              className={cn(
                'mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                destructive ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-200',
              )}
            >
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-xl font-semibold tracking-[-0.03em] text-white">{title}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-slate-200">{description}</Dialog.Description>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
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
