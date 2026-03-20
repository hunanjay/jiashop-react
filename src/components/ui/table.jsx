import React from 'react'

import { cn } from '../../lib/utils'

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
    <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('border-b border-slate-200 bg-slate-50/80 text-slate-500', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('divide-y divide-slate-100', className)} {...props} />
))
TableBody.displayName = 'TableBody'

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('transition-colors hover:bg-slate-50/70', className)} {...props} />
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500', className)}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('px-4 py-4 align-middle text-slate-700', className)} {...props} />
))
TableCell.displayName = 'TableCell'

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }

