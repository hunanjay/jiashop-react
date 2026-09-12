import { Edit3, Package, Trash2 } from 'lucide-react'

import { formatCurrency } from '../../../lib/format'

const CARD_IMAGE_ASPECT = '1 / 1'

export default function ProductManagerGrid({ products, loading, selectedId, canEditProduct, canDeleteProduct, onEdit, onDelete, onReset }) {
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
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {products.map((product) => {
        const editable = canEditProduct ? canEditProduct(product) : true
        const deletable = canDeleteProduct ? canDeleteProduct(product) : true
        return (
          <article
            key={product.id}
            id={`product-card-${product.id}`}
            className={[
              'group overflow-hidden rounded-xl border bg-white shadow-sm transition duration-150',
              product.id === selectedId
                ? 'border-blue-600 ring-2 ring-blue-500 ring-offset-2'
                : 'border-gray-200 hover:shadow-md',
            ].join(' ')}
          >
            <div className="relative overflow-hidden bg-slate-100" style={{ aspectRatio: CARD_IMAGE_ASPECT }}>
              <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                <div className="rounded-md bg-white/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-blue-700 border border-gray-200 shadow-xs">
                  {product.category || 'Uncategorized'}
                </div>
                {product.is_featured && (
                  <div className="rounded-md bg-amber-500/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white shadow-xs">
                    主推
                  </div>
                )}
                {product.is_promotion && (
                  <div className="rounded-md bg-red-500/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white shadow-xs">
                    促销
                  </div>
                )}
              </div>
              <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
                {editable ? (
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white/95 text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                ) : null}
                {deletable ? (
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-red-200 bg-red-50/95 text-red-700 shadow-sm transition hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3" />
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

              <div className="flex-shrink-0 rounded-md bg-blue-50 border border-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 shadow-xs">
                {formatCurrency(product.price)}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
