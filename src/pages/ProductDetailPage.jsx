import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Plus } from 'lucide-react'

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
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden">
          <div className="mb-6 flex-shrink-0">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-700 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              返回列表
            </Link>
          </div>

          <div className="grid min-h-0 flex-1 gap-10 overflow-hidden lg:grid-cols-[auto_1fr] lg:items-stretch">
            <div className="flex flex-shrink-0 flex-col gap-5 overflow-hidden">
              <div className="relative aspect-square max-h-[72vh] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <div 
                  className="flex h-full w-full transition-transform duration-600 ease-out"
                  style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
                >
                  {allImages.map((src, idx) => (
                    <img 
                      key={idx} 
                      src={src} 
                      alt={`${product.name}-${idx}`} 
                      className="h-full w-full flex-shrink-0 object-contain bg-white" 
                    />
                  ))}
                </div>
                
                {allImages.length > 1 && (
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
              <div className="rounded-xl border border-gray-200 bg-white p-7 shadow-sm">
                <div className="inline-flex h-6 items-center rounded-md bg-blue-50 px-2.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  {product.category || '未分类'}
                </div>
                <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-3xl">{product.name}</h1>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-700">{formatCurrency(product.price)}</span>
                  <span className="text-xs text-gray-400 line-through opacity-70">{(product.price * 1.2).toFixed(2)}</span>
                </div>
                
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 opacity-70">商品描述</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-gray-600">
                    {product.description || '暂无商品描述。'}
                  </p>
                </div>

                {product.specs && (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 opacity-70 mb-3">规格参数</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.specs
                        .split(/[\n,，;；]/)
                        .map((item) => item.trim())
                        .filter(Boolean)
                        .map((spec, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-lg bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            {spec}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">立即订购</span>
                  {existingQuantity > 0 && (
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      购物车已有 {existingQuantity} 件
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-11 items-center rounded-lg border border-gray-300 bg-gray-50 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(String(Math.max(1, normalizedQuantity - 1)))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition hover:bg-white hover:shadow-sm"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value.replace(/[^\d]/g, ''))}
                      className="h-9 w-12 border-0 bg-transparent text-center text-sm font-bold text-gray-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(String(Math.min(99, normalizedQuantity + 1)))}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition hover:bg-white hover:shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => addToCart(product, normalizedQuantity, { sourceRect: event.currentTarget.getBoundingClientRect() })}
                    className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800"
                  >
                    加入购物车
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
