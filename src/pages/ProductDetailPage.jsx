import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ZoomIn,
} from 'lucide-react'

import { useApp } from '../lib/app-context'
import { formatCurrency } from '../lib/format'
import { FloatingCartButton } from '../components/cart/FloatingCartButton'
import { ImageViewer } from '../components/ui/ImageViewer'

export default function ProductDetailPage() {
  const id = useParams().id
  const navigate = useNavigate()
  const location = useLocation()
  const { products, loadingProducts, cartItems, addToCart } = useApp()

  const goBackToCatalog = () => {
    // Pop to the existing /catalog history entry (if we came from one) so the
    // browser restores its scroll position, instead of pushing a fresh entry
    // that always mounts scrolled to the top.
    if (location.key !== 'default') {
      navigate(-1)
    } else {
      navigate('/catalog')
    }
  }
  const product = products.find((item) => item.id === id)
  const [quantity, setQuantity] = useState('1')
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  // Each (product, variant) is its own cart line, so count only the line
  // matching what is currently selected.
  const existingQuantity = cartItems.find(
    (item) => item.id === id && (item.variantName || null) === (selectedVariant?.name || null),
  )?.quantity || 0

  const hasVariants = Array.isArray(product?.variants) && product.variants.length > 0
  const displayPrice = selectedVariant?.price ?? product?.price

  const needsVariant = hasVariants && !selectedVariant
  // 定制商品按单生产，详情页不对客户暴露库存
  const purchaseDisabled = needsVariant

  const allImages = useMemo(() => {
    if (!product) return []
    const seen = new Set()
    const list = []
    const pushUnique = (img) => {
      if (img && !seen.has(img)) {
        seen.add(img)
        list.push(img)
      }
    }

    if (Array.isArray(product.main_images) && product.main_images.length) {
      product.main_images.forEach(pushUnique)
    } else {
      pushUnique(product.image_url)
    }
    if (Array.isArray(product.images)) {
      product.images.forEach(pushUnique)
    }
    return list
  }, [product])

  const normalizedQuantity = Math.min(99, Math.max(1, Number.parseInt(quantity || '1', 10) || 1))

  const handleAddToCart = (event) => {
    addToCart(product, normalizedQuantity, { variant: selectedVariant, sourceRect: event.currentTarget.getBoundingClientRect() })
  }

  const handleBuyNow = (event) => {
    addToCart(product, normalizedQuantity, { variant: selectedVariant, sourceRect: event.currentTarget.getBoundingClientRect() })
    navigate('/cart')
  }

  if (!product) {
    if (loadingProducts) {
      return (
        <div className="min-h-[100dvh] bg-[#f3f6fb] text-slate-950 dark:bg-[#111318] dark:text-slate-100">
          <div className="mx-auto w-full max-w-[1500px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7 lg:px-10">
            <div className="mb-7 h-11 w-28 rounded-xl bg-slate-200 motion-safe:animate-pulse dark:bg-white/10" />
            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)] lg:gap-10 xl:gap-14">
              <div>
                <div className="aspect-square w-full rounded-[28px] bg-white shadow-[0_28px_70px_rgba(52,72,112,0.08)] motion-safe:animate-pulse dark:bg-[#191c23] dark:shadow-none" />
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-12 rounded-2xl bg-white/70 motion-safe:animate-pulse dark:bg-white/[0.05]" />
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 shadow-[0_24px_64px_rgba(52,72,112,0.08)] sm:p-8 dark:bg-[#191c23] dark:shadow-none">
                <div className="h-7 w-24 rounded-full bg-slate-100 motion-safe:animate-pulse dark:bg-white/10" />
                <div className="mt-5 h-10 w-4/5 rounded-xl bg-slate-200 motion-safe:animate-pulse dark:bg-white/10" />
                <div className="mt-3 h-10 w-3/5 rounded-xl bg-slate-200 motion-safe:animate-pulse dark:bg-white/10" />
                <div className="mt-6 space-y-2.5">
                  <div className="h-3 w-full rounded bg-slate-100 motion-safe:animate-pulse dark:bg-white/[0.06]" />
                  <div className="h-3 w-5/6 rounded bg-slate-100 motion-safe:animate-pulse dark:bg-white/[0.06]" />
                </div>
                <div className="my-7 h-px bg-slate-100 dark:bg-white/10" />
                <div className="h-10 w-36 rounded-xl bg-slate-200 motion-safe:animate-pulse dark:bg-white/10" />
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="h-16 rounded-xl bg-slate-100 motion-safe:animate-pulse dark:bg-white/[0.06]" />
                  <div className="h-16 rounded-xl bg-slate-100 motion-safe:animate-pulse dark:bg-white/[0.06]" />
                </div>
                <div className="mt-7 h-12 w-36 rounded-xl bg-slate-100 motion-safe:animate-pulse dark:bg-white/[0.06]" />
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="h-12 rounded-xl bg-blue-100 motion-safe:animate-pulse dark:bg-blue-400/10" />
                  <div className="h-12 rounded-xl bg-slate-100 motion-safe:animate-pulse dark:bg-white/[0.06]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex min-h-[100dvh] items-center bg-[#f3f6fb] px-4 py-10 text-slate-950 dark:bg-[#111318] dark:text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-xl rounded-[28px] border border-white/80 bg-white p-8 text-center shadow-[0_24px_64px_rgba(52,72,112,0.12)] sm:p-12 dark:border-white/10 dark:bg-[#191c23] dark:shadow-none">
          <h1 className="text-2xl font-semibold tracking-tight">没有找到这件商品</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">商品可能已下架，请返回选品中心查看其它商品。</p>
          <Link
            to="/catalog"
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:translate-y-0 dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300 dark:focus-visible:ring-offset-[#191c23]"
          >
            <ArrowLeft className="h-4 w-4" />
            返回选品页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#f3f6fb] text-slate-950 dark:bg-[#111318] dark:text-slate-100">
      <FloatingCartButton />

      <div className="mx-auto w-full max-w-[1500px] px-4 pb-20 pt-5 sm:px-6 sm:pt-7 lg:px-10 lg:pb-12">
        <div className="mb-5 flex min-h-11 items-center gap-3 pr-20 sm:mb-7 sm:pr-36">
          <button
            type="button"
            onClick={goBackToCatalog}
            className="group inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-4 text-sm font-semibold text-slate-700 shadow-[0_8px_24px_rgba(48,70,110,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:translate-y-0 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:border-blue-400/50 dark:hover:text-blue-300 dark:focus-visible:ring-offset-[#111318]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            返回列表
          </button>

          <nav className="hidden min-w-0 items-center gap-2 text-sm text-slate-500 sm:flex dark:text-slate-400" aria-label="面包屑导航">
            <Link to="/" className="transition hover:text-blue-700 dark:hover:text-blue-300">首页</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
            <Link to="/catalog" className="transition hover:text-blue-700 dark:hover:text-blue-300">选品中心</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
            <span className="truncate font-medium text-slate-700 dark:text-slate-200">{product.name}</span>
          </nav>
        </div>

        <main className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)] lg:gap-10 xl:gap-14">
          <section className="min-w-0" aria-label={`${product.name} 商品图片`}>
            <div className="flex min-w-0 gap-3 sm:gap-4">
              {allImages.length > 1 && (
                <div className="hidden w-[72px] flex-shrink-0 flex-col gap-3 overflow-y-auto pb-1 sm:flex xl:w-20">
                  {allImages.map((src, idx) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-square w-full flex-shrink-0 overflow-hidden rounded-xl border bg-white transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:bg-white/[0.06] dark:focus-visible:ring-offset-[#111318] ${
                        idx === activeImageIndex
                          ? 'border-blue-600 shadow-[0_8px_24px_rgba(37,99,235,0.16)]'
                          : 'border-slate-200 opacity-70 hover:border-slate-300 hover:opacity-100 dark:border-white/10 dark:hover:border-white/25'
                      }`}
                      aria-label={`查看第 ${idx + 1} 张商品图片`}
                      aria-pressed={idx === activeImageIndex}
                    >
                      <img src={src} className="h-full w-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}

              <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_28px_70px_rgba(52,72,112,0.13)] dark:border-white/10 dark:bg-[#191c23] dark:shadow-[0_28px_70px_rgba(0,0,0,0.28)]">
                {allImages.length ? (
                  <button
                    type="button"
                    className="group h-full w-full cursor-zoom-in overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                    onClick={() => setViewerOpen(true)}
                    aria-label="放大查看商品图片"
                  >
                    <span
                      className="flex h-full w-full"
                      style={{ transform: `translateX(-${activeImageIndex * 100}%)`, transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      {allImages.map((src, idx) => (
                        <span key={src} className="relative h-full w-full flex-shrink-0 overflow-hidden bg-[linear-gradient(145deg,#ffffff_0%,#f4f7fb_100%)] dark:bg-[linear-gradient(145deg,#1e222b_0%,#15181e_100%)]">
                          <img
                            src={src}
                            alt={idx === 0 ? product.name : `${product.name} 图片 ${idx + 1}`}
                            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.025] sm:p-7 lg:p-9"
                          />
                        </span>
                      ))}
                    </span>
                  </button>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">暂无商品图片</div>
                )}

                {allImages.length > 0 && (
                  <div className="pointer-events-none absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80 text-slate-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#111318]/70 dark:text-slate-200">
                    <ZoomIn className="h-4 w-4" />
                  </div>
                )}

                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((i) => Math.max(0, i - 1))}
                      disabled={activeImageIndex === 0}
                      className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-700 shadow-md backdrop-blur-md transition hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-30 dark:border-white/10 dark:bg-[#111318]/75 dark:text-slate-200"
                      aria-label="上一张图片"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImageIndex((i) => Math.min(allImages.length - 1, i + 1))}
                      disabled={activeImageIndex === allImages.length - 1}
                      className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-700 shadow-md backdrop-blur-md transition hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-30 dark:border-white/10 dark:bg-[#111318]/75 dark:text-slate-200"
                      aria-label="下一张图片"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-semibold tabular-nums text-slate-600 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#111318]/70 dark:text-slate-300">
                      {activeImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 sm:hidden">
                {allImages.map((src, idx) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded-xl border bg-white transition ${
                      idx === activeImageIndex
                        ? 'border-blue-600 shadow-sm'
                        : 'border-slate-200 opacity-65 dark:border-white/10'
                    }`}
                    aria-label={`查看第 ${idx + 1} 张商品图片`}
                    aria-pressed={idx === activeImageIndex}
                  >
                    <img src={src} className="h-full w-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/65 p-1 sm:grid-cols-3 dark:border-white/10 dark:bg-white/[0.035]">
              <div className="flex min-w-0 items-center gap-3 px-3 py-3 text-sm text-slate-600 sm:px-4 dark:text-slate-300">
                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-blue-700 dark:text-blue-300" />
                <span>品质保障</span>
              </div>
              <div className="flex min-w-0 items-center gap-3 border-l border-slate-200/80 px-3 py-3 text-sm text-slate-600 sm:px-4 dark:border-white/10 dark:text-slate-300">
                <PackageCheck className="h-5 w-5 flex-shrink-0 text-blue-700 dark:text-blue-300" />
                <span>企业采购支持</span>
              </div>
              <div className="col-span-2 flex min-w-0 items-center gap-3 border-t border-slate-200/80 px-3 py-3 text-sm text-slate-600 sm:col-span-1 sm:border-l sm:border-t-0 sm:px-4 dark:border-white/10 dark:text-slate-300">
                <Check className="h-5 w-5 flex-shrink-0 text-blue-700 dark:text-blue-300" />
                <span>个性化定制</span>
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_24px_64px_rgba(52,72,112,0.12)] sm:p-7 lg:sticky lg:top-7 xl:p-8 dark:border-white/10 dark:bg-[#191c23] dark:shadow-[0_24px_64px_rgba(0,0,0,0.25)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
                {product.category || '未分类'}
              </span>
              {product.is_featured && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/[0.07] dark:text-slate-200">
                  精选商品
                </span>
              )}
              {product.is_promotion && (
                <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-400/10 dark:text-rose-300">
                  限时优惠
                </span>
              )}
            </div>

            <h1 className="mt-4 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-slate-950 dark:text-white">
              {product.name}
            </h1>
            <p className="mt-4 max-w-[58ch] text-[15px] leading-7 text-slate-600 dark:text-slate-300">
              {product.description || '暂无商品描述。'}
            </p>

            {product.specs && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.specs
                  .split(/[\n,，;；]/)
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                    >
                      {spec}
                    </span>
                  ))}
              </div>
            )}

            <div className="my-6 h-px bg-slate-200/80 dark:bg-white/10" />

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-semibold tracking-[-0.03em] text-blue-700 sm:text-[2.15rem] dark:text-blue-300">
                    {formatCurrency(displayPrice)}
                  </span>
                  {needsVariant && <span className="text-sm font-medium text-slate-400">起</span>}
                </div>
              </div>
              {existingQuantity > 0 && (
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
                  购物车已有 {existingQuantity} 件
                </span>
              )}
            </div>

            {hasVariants && (
              <fieldset className="mt-6">
                <legend className="flex w-full items-center justify-between gap-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <span>选择规格</span>
                  {selectedVariant && <span className="truncate text-xs font-medium text-blue-700 dark:text-blue-300">已选 {selectedVariant.name}</span>}
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {product.variants.map((variant, index) => {
                    const isSelected = selectedVariant?.name === variant.name
                    return (
                      <button
                        key={`${variant.name}-${index}`}
                        type="button"
                        title={variant.name}
                        onClick={() => setSelectedVariant(isSelected ? null : variant)}
                        aria-pressed={isSelected}
                        className={`relative min-w-0 rounded-xl border p-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:scale-[0.98] dark:focus-visible:ring-offset-[#191c23] ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 shadow-[0_8px_20px_rgba(37,99,235,0.10)] dark:bg-blue-400/10'
                            : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 dark:border-white/10 dark:bg-white/[0.025] dark:hover:border-blue-400/50'
                        }`}
                      >
                        <span className={`block truncate text-sm font-semibold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'}`}>
                          {variant.name}
                        </span>
                        <span className="mt-1.5 flex items-center justify-between gap-2 text-xs">
                          <span className={isSelected ? 'text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}>
                            {formatCurrency(variant.price)}
                          </span>
                        </span>
                        {isSelected && (
                          <span className="absolute right-2.5 top-2.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-700 text-white dark:bg-blue-300 dark:text-slate-950">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )}

            <div className="mt-6">
              <label htmlFor="product-quantity" className="text-sm font-semibold text-slate-900 dark:text-slate-100">购买数量</label>
              <div className="mt-2.5 flex h-12 w-fit items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setQuantity(String(Math.max(1, normalizedQuantity - 1)))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-blue-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-blue-300"
                  aria-label="减少数量"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  id="product-quantity"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value.replace(/[^\d]/g, ''))}
                  onBlur={() => setQuantity(String(normalizedQuantity))}
                  className="h-9 w-12 border-0 bg-transparent text-center text-sm font-semibold text-slate-950 outline-none dark:text-white"
                  aria-label="购买数量"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(String(Math.min(99, normalizedQuantity + 1)))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-blue-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-blue-300"
                  aria-label="增加数量"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={purchaseDisabled}
                onClick={handleBuyNow}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(29,78,216,0.24)] transition duration-200 hover:-translate-y-0.5 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300 dark:focus-visible:ring-offset-[#191c23]"
              >
                {needsVariant ? '请先选择规格' : '立即购买'}
              </button>
              <button
                type="button"
                disabled={purchaseDisabled}
                onClick={handleAddToCart}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-blue-700 bg-white px-5 text-sm font-semibold text-blue-700 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 dark:border-blue-300 dark:bg-transparent dark:text-blue-300 dark:hover:bg-blue-400/10 dark:focus-visible:ring-offset-[#191c23]"
              >
                加入购物车
              </button>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
              提交订单后，客服将与您确认定制内容及交付时间。
            </p>
          </aside>
        </main>
      </div>

      <ImageViewer
        images={allImages}
        initialIndex={activeImageIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  )
}
