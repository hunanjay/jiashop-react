import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Plus } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { formatCurrency } from '../lib/format'
import { FloatingCartButton } from '../components/cart/FloatingCartButton'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { products, cartItems, addToCart } = useApp()
  const product = products.find((item) => item.id === id)
  const existingQuantity = cartItems.find((item) => item.id === id)?.quantity || 0
  const [quantity, setQuantity] = useState('1')

  const normalizedQuantity = Math.min(99, Math.max(1, Number.parseInt(quantity || '1', 10) || 1))

  if (!product) {
    return (
      <div className="home-page-theme min-h-screen bg-[var(--surface)] px-4 py-10 text-[var(--on-surface)] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">商品不存在</h1>
          <p className="mt-2 text-sm text-[var(--on-surface-variant)]">请返回选品页查看其它商品。</p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--outline-variant)]/35 bg-[var(--surface-container-low)] px-5 py-3 text-sm font-medium transition hover:border-[var(--primary)]/35 hover:text-[var(--primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            返回选品页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="home-page-theme min-h-screen bg-[var(--surface)] px-4 py-8 text-[var(--on-surface)] sm:px-6 lg:px-8 lg:py-10">
      <FloatingCartButton />
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] px-4 py-2 text-sm font-medium text-[var(--on-surface)] transition hover:border-[var(--primary)]/35 hover:text-[var(--primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-stretch">
          <div className="overflow-hidden rounded-3xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] shadow-sm">
            <img src={product.image_url} alt={product.name} className="h-full min-h-[520px] w-full object-cover lg:min-h-[620px]" />
          </div>

          <div className="flex h-full flex-col gap-5">
            <div className="rounded-3xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] p-6 shadow-sm">
              <div className="inline-flex h-8 items-center rounded-full border border-[var(--outline-variant)]/35 bg-[var(--surface-container-low)] px-3 text-xs text-[var(--on-surface-variant)]">
                {product.category || '未分类'}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{product.name}</h1>
              <p className="mt-3 text-[15px] leading-7 text-[var(--on-surface-variant)]">
                {product.description || '暂无商品描述。'}
              </p>
              <div className="mt-5 text-3xl font-bold text-[var(--primary)]">{formatCurrency(product.price)}</div>
            </div>

            <div className="mt-auto rounded-3xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] p-5">
              <div className="text-sm font-medium text-[var(--on-surface)]">下一步</div>
              <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                选择数量后即可加入购物车。
              </p>
              {existingQuantity > 0 ? (
                <div className="mt-3 inline-flex items-center rounded-full border border-[var(--outline-variant)]/35 bg-[var(--surface-container-low)] px-3 py-1 text-xs font-medium text-[var(--on-surface-variant)]">
                  购物车中已有 {existingQuantity} 件，当前输入框不会自动覆盖
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="inline-flex h-11 items-center rounded-full border border-[var(--outline-variant)]/35 bg-[var(--surface-container-low)] p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(String(Math.max(1, normalizedQuantity - 1)))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]"
                    aria-label="减少数量"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    value={quantity}
                    onChange={(event) => {
                      const nextValue = event.target.value.replace(/[^\d]/g, '')
                      setQuantity(nextValue)
                    }}
                    onBlur={() => setQuantity(String(normalizedQuantity))}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="h-9 w-16 border-0 bg-transparent px-3 text-center text-sm font-semibold text-[var(--on-surface)] outline-none"
                    aria-label="数量"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(String(Math.min(99, normalizedQuantity + 1)))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]"
                    aria-label="增加数量"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={(event) => addToCart(product, normalizedQuantity, { sourceRect: event.currentTarget.getBoundingClientRect() })}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--outline-variant)]/35 bg-[var(--surface-container-low)] px-5 text-sm font-medium text-[var(--on-surface)] transition hover:border-[var(--primary)]/35 hover:text-[var(--primary)]"
                >
                  添加到购物车
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
