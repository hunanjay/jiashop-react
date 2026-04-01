import { Edit3, Package, Trash2 } from 'lucide-react'

import { formatCurrency } from '../../../lib/format'

const CARD_IMAGE_ASPECT = '1 / 1'

export default function ProductManagerGrid({ products, loading, canEditProduct, canDeleteProduct, onEdit, onDelete, onReset }) {
  if (loading) {
    return (
      <div className="rounded-[20px] border border-white/10 bg-white/6 p-6 text-center text-zinc-500 shadow-[0_16px_50px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
        加载中...
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="rounded-[20px] border border-white/10 bg-white/6 p-6 text-center shadow-[0_16px_50px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400 text-white shadow-lg shadow-indigo-500/20">
          <Package className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-white">没有找到商品</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500">试试切换分类，或者重置筛选。</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 px-4 py-2 text-sm font-medium text-white transition hover:brightness-105"
        >
          重置筛选
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
      {products.map((product) => {
        const editable = canEditProduct ? canEditProduct(product) : true
        const deletable = canDeleteProduct ? canDeleteProduct(product) : true
        return (
          <article
            key={product.id}
            className="group overflow-hidden rounded-[20px] border border-white/10 bg-white/6 shadow-[0_14px_36px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(0,0,0,0.32)]"
          >
            <div className="relative overflow-hidden bg-slate-100" style={{ aspectRatio: CARD_IMAGE_ASPECT }}>
              <div className="absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-indigo-700 backdrop-blur-xl">
                {product.category || 'Uncategorized'}
              </div>
              <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
                {editable ? (
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/85 text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
                {deletable ? (
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50/95 text-rose-700 shadow-sm backdrop-blur-xl transition hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </div>

            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold tracking-[-0.03em] text-slate-950">{product.name}</div>
                <div className="mt-1 truncate text-xs text-slate-500">{product.description || 'No description'}</div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400 px-2.5 py-1.5 text-right text-white shadow-lg shadow-indigo-500/20">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/55">Price</div>
                <div className="text-sm font-semibold">{formatCurrency(product.price)}</div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
