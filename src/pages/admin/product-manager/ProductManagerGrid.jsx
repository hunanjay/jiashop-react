import { Edit3, Package, Trash2 } from 'lucide-react'

import { formatCurrency } from '../../../lib/format'

const CARD_IMAGE_ASPECT = '1 / 1'

export default function ProductManagerGrid({ products, loading, canEditProduct, canDeleteProduct, onEdit, onDelete, onReset }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm">
        加载中...
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Package className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-gray-900">没有找到商品</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">试试切换分类，或者重置筛选。</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
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
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-150 hover:shadow-md"
          >
            <div className="relative overflow-hidden bg-slate-100" style={{ aspectRatio: CARD_IMAGE_ASPECT }}>
              <div className="absolute left-2 top-2 z-10 rounded-md bg-white/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-blue-700 border border-gray-200 shadow-xs">
                {product.category || 'Uncategorized'}
              </div>
              <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
                {editable ? (
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
                {deletable ? (
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 shadow-sm transition hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover transition duration-150 group-hover:opacity-90"
              />
            </div>

            <div className="flex items-center justify-between gap-3 px-3 py-3">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-gray-900">{product.name}</div>
                <div className="mt-1 truncate text-xs text-gray-500">{product.description || 'No description'}</div>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1.5 text-right text-blue-700 shadow-xs">
                <div className="text-[9px] uppercase tracking-wider text-blue-600/75">Price</div>
                <div className="text-sm font-semibold text-blue-800">{formatCurrency(product.price)}</div>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
