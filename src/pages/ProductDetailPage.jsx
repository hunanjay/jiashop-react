import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { formatCurrency } from '../lib/format'
import { FloatingCartButton } from '../components/cart/FloatingCartButton'

export default function ProductDetailPage() {
  const id = useParams().id
  const { products, cartItems, addToCart } = useApp()
  const product = products.find((item) => item.id === id)
  const existingQuantity = cartItems.find((item) => item.id === id)?.quantity || 0
  const [quantity, setQuantity] = useState('1')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)

  const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0
  const displayPrice = selectedVariant?.price ?? product?.price


  const allImages = useMemo(() => {
    if (!product) return []
    const list = []
    if (product.image_url) list.push(product.image_url)
    if (Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && img !== product.image_url) {
          list.push(img)
        }
      })
    }
    return list
  }, [product])

  const normalizedQuantity = Math.min(99, Math.max(1, Number.parseInt(quantity || '1', 10) || 1))

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">商品不存在</h1>
          <p className="mt-2 text-sm text-gray-500">请返回选品页查看其它商品。</p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-blue-700 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            返回选品页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 text-gray-900">
      <FloatingCartButton />
      <div className="flex h-full flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex w-full flex-1 flex-col overflow-hidden">
          <div className="mb-6 flex-shrink-0">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-700 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              返回列表
            </Link>
          </div>

          <div className="grid min-h-0 flex-1 gap-10 overflow-hidden lg:grid-cols-2 lg:items-stretch">
            <div className="flex flex-col gap-5 overflow-hidden">
              <div className="relative aspect-square max-h-[72vh] overflow-hidden rounded-xl bg-[rgb(249,250,251)]">
                <div 
                  className="flex h-full w-full transition-transform duration-600 ease-out"
                  style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
                >
                  {allImages.map((src, idx) => (
                    <img 
                      key={idx} 
                      src={src} 
                      alt={`${product.name}-${idx}`} 
                      className="h-full w-full flex-shrink-0 object-contain bg-[rgb(249,250,251)]"
                    />
                  ))}
                </div>
                
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((i) => Math.max(0, i - 1))}
                      disabled={activeImageIndex === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm transition hover:bg-white disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((i) => Math.min(allImages.length - 1, i + 1))}
                      disabled={activeImageIndex === allImages.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm transition hover:bg-white disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-700" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gray-200/80 border border-gray-300 px-3 py-1.5">
                      {allImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === activeImageIndex ? 'w-4 bg-blue-700' : 'w-1.5 bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex flex-shrink-0 flex-wrap gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                  {allImages.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-square w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                        idx === activeImageIndex 
                          ? 'border-blue-700 shadow-sm ring-2 ring-blue-500/20' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={src} className="h-full w-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex h-6 items-center rounded-md bg-blue-50 px-2.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    {product.category || '未分类'}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-blue-700">{formatCurrency(displayPrice)}</span>
                    {hasVariants && !selectedVariant && (
                      <span className="text-sm font-medium text-gray-400">起</span>
                    )}
                    {!hasVariants && (
                      <span className="text-xs text-gray-400 line-through opacity-70">{(displayPrice * 1.2).toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-3xl">{product.name}</h1>
                
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 opacity-70">商品描述</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-gray-600">
                    {product.description || '暂无商品描述。'}
                  </p>
                </div>

                {hasVariants && (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 opacity-70">选择规格</h3>
                      {selectedVariant && (
                        <span className="text-xs text-gray-500">{selectedVariant.name}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {product.variants.map((variant, index) => {
                        const isSelected = selectedVariant?.name === variant.name
                        return (
                          <button
                            key={index}
                            type="button"
                            title={variant.name.length > 15 ? variant.name : undefined}
                            onClick={() => setSelectedVariant(isSelected ? null : variant)}
                            className={`relative flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left transition-colors ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400'
                            }`}
                          >
                            <span className="truncate whitespace-nowrap text-sm font-semibold max-w-[15ch]">
                              {variant.name.length > 15 ? variant.name.slice(0, 15) + '…' : variant.name}
                            </span>
                            <span className={`ml-2 flex-shrink-0 text-xs font-medium ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
                              {formatCurrency(variant.price)}
                            </span>
                            {isSelected && (
                              <span className="absolute bottom-0 right-0 inline-flex h-4 w-4 items-center justify-center rounded-tl-lg rounded-br-lg bg-blue-600 text-[9px] text-white">✓</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 items-center rounded-lg border border-gray-300 bg-gray-50 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(String(Math.max(1, normalizedQuantity - 1)))}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-white hover:shadow-sm"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value.replace(/[^\d]/g, ''))}
                      className="h-7 w-10 border-0 bg-transparent text-center text-sm font-bold text-gray-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(String(Math.min(99, normalizedQuantity + 1)))}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-white hover:shadow-sm"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={hasVariants && !selectedVariant}
                    onClick={(event) => addToCart(product, normalizedQuantity, { variant: selectedVariant, sourceRect: event.currentTarget.getBoundingClientRect() })}
                    className="flex-1 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {hasVariants && !selectedVariant ? '请先选择规格' : '加入购物车'}
                  </button>
                  {existingQuantity > 0 && (
                    <span className="flex-shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      已有 {existingQuantity} 件
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
