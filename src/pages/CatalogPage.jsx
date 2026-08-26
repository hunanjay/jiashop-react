import { useEffect, useRef, useState } from 'react'
import { Link, useNavigationType } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, LayoutGrid, Search, SlidersHorizontal, Tag, X } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { api } from '../lib/api'
import { getApiErrorMessage } from '../lib/api-error'
import { useDebounce } from '../lib/useDebounce'
import { FloatingCartButton } from '../components/cart/FloatingCartButton'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet'

const CARD_IMAGE_ASPECT = '1 / 1'
const PAGE_SIZE = 20

const PRICE_FILTERS = [
  { label: '全部价格', value: 'all' },
  { label: '¥0 - ¥50', value: '0-50' },
  { label: '¥50 - ¥150', value: '50-150' },
  { label: '¥150+', value: '150+' },
]

function FilterPanel({
  products,
  activeCategory,
  setActiveCategory,
  priceFilter,
  setPriceFilter,
  catalogQuery,
  activeFilterCount,
  availableCategories,
  clearFilters,
  removeFilter,
  priceOpen,
  setPriceOpen,
  tagFilter,
  setTagFilter,
}) {
  return (
    <div className="space-y-4">
      <div className="py-1">
        <p className="mb-2.5 text-sm font-semibold text-gray-900">分类</p>
        <ul className="space-y-1">
          {availableCategories.map((item) => (
            <li key={item.value}>
              <button
                type="button"
                onClick={() => setActiveCategory(item.value)}
                className={[
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all duration-150',
                  activeCategory === item.value
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                ].join(' ')}
              >
                <span>{item.label}</span>
                <span
                  className={[
                    'text-xs font-normal',
                    activeCategory === item.value ? 'text-blue-600 font-medium' : 'text-gray-400',
                  ].join(' ')}
                >
                  {item.value !== 'all'
                    ? products.filter((p) => p.category === item.value).length
                    : products.length}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-4 py-1">
        {/* 标签 */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">标签</p>
          <div className="flex flex-col gap-1.5">
            {[
              { label: '全部', value: 'all' },
              { label: '主推', value: 'featured' },
              { label: '促销', value: 'promotion' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTagFilter(item.value)}
                className={[
                  'w-full rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold transition-all duration-150',
                  tagFilter === item.value
                    ? item.value === 'featured'
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : item.value === 'promotion'
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-blue-700 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 价格 */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">价格</p>
          <div className="flex flex-col gap-1.5">
            {PRICE_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setPriceFilter(item.value)}
                className={[
                  'w-full rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold transition-all duration-150',
                  priceFilter === item.value
                    ? 'border-blue-700 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {[
            activeCategory !== 'all' ? { type: 'category', label: `分类: ${activeCategory}` } : null,
            priceFilter !== 'all' ? { type: 'price', label: `价格: ${PRICE_FILTERS.find((item) => item.value === priceFilter)?.label}` } : null,
            catalogQuery.trim() ? { type: 'globalSearch', label: `关键词: ${catalogQuery.trim()}` } : null,
            tagFilter !== 'all' ? { type: 'tag', label: tagFilter === 'featured' ? '★ 主推' : '促销' } : null,
          ]
            .filter(Boolean)
            .map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => removeFilter(chip.type)}
                className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-xs text-blue-700 transition hover:bg-blue-100"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
        </div>
      )}

      <button
        type="button"
        onClick={clearFilters}
        className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:border-blue-700 hover:text-blue-700"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-200 text-gray-500">
          <X className="h-3.5 w-3.5" />
        </span>
        清空筛选
        {activeFilterCount > 0 ? (
          <span className="ml-auto rounded-md bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700 font-semibold">
            {activeFilterCount}
          </span>
        ) : null}
      </button>
    </div>
  )
}

export default function CatalogPage() {
  const { products, catalogQuery, setCatalogQuery, catalogFilters, setCatalogFilters, categoryOptions, pushToast } = useApp()
  const navigationType = useNavigationType()
  // Filters + page live in AppContext (like catalogQuery) rather than local
  // state, so they survive leaving for a product detail page and back —
  // returning to /catalog re-fetches the same filtered page instead of
  // resetting to "all".
  const { category: activeCategory, price: priceFilter, tag: tagFilter, page, scrollY: savedScrollY } = catalogFilters
  const setActiveCategory = (category) => setCatalogFilters((f) => ({ ...f, category }))
  const setPriceFilter = (price) => setCatalogFilters((f) => ({ ...f, price }))
  const setTagFilter = (tag) => setCatalogFilters((f) => ({ ...f, tag }))
  const setPage = (next) => setCatalogFilters((f) => ({ ...f, page: typeof next === 'function' ? next(f.page) : next }))
  const [priceOpen, setPriceOpen] = useState(true)
  const debouncedQuery = useDebounce(catalogQuery, 300)

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loadedKey, setLoadedKey] = useState('')

  const activeFilterCount = [
    activeCategory !== 'all',
    priceFilter !== 'all',
    catalogQuery.trim().length > 0,
    tagFilter !== 'all',
  ].filter(Boolean).length

  // Loading is derived rather than a separate state flag: it's true
  // whenever the currently-requested filters/page don't match what's loaded.
  const filterKey = `${activeCategory}|${priceFilter}|${debouncedQuery}|${tagFilter}`
  const requestKey = `${filterKey}|${page}`
  const catalogLoading = loadedKey !== requestKey
  // totalPages only describes the current filters once a response for THEM
  // has landed. On a fresh mount it is still the initial 1, so the clamp
  // below must not trust it yet — otherwise returning from a product page
  // on page 3 would snap straight back to page 1.
  const totalPagesIsCurrent = loadedKey.startsWith(`${filterKey}|`)

  // Reset to page 1 whenever the filters change, and clamp to the last page
  // if it shrinks below the current one — done during render (React's
  // "adjust state while rendering" pattern) instead of a useEffect.
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    if (page !== 1) setPage(1)
  } else if (totalPagesIsCurrent && page > totalPages) {
    setPage(totalPages)
  }

  useEffect(() => {
    let mounted = true
    api
      .get('/products/catalog', {
        params: {
          page,
          page_size: PAGE_SIZE,
          q: debouncedQuery.trim() || undefined,
          category: activeCategory,
          price: priceFilter,
          tag: tagFilter,
        },
      })
      .then((response) => {
        if (!mounted) return
        setItems(response.data.items || [])
        setTotal(response.data.total || 0)
        setTotalPages(response.data.total_pages || 1)
        setLoadedKey(requestKey)
      })
      .catch((error) => {
        if (mounted) pushToast('error', '商品加载失败', getApiErrorMessage(error, '请检查后端服务是否已启动'))
      })
    return () => {
      mounted = false
    }
  }, [activeCategory, priceFilter, debouncedQuery, tagFilter, page, requestKey, pushToast])

  // Manual scroll restore: browsers don't restore scroll position for
  // client-side (pushState) route changes, only real document navigations.
  //
  // The offset is tracked in a ref on every scroll rather than read at
  // unmount: an effect cleanup is a *passive* effect, so React runs it only
  // after the next route has painted — by which point the shorter detail
  // page has shrunk the document and the browser has already clamped
  // window.scrollY to 0, which is all we would ever save.
  //
  // The ref is seeded with the saved offset (not 0) because StrictMode
  // mounts, unmounts and remounts every effect on the first mount: that
  // simulated cleanup runs before any scroll event, so a 0-seeded ref would
  // immediately overwrite the position we came back to restore.
  const scrollYRef = useRef(savedScrollY || 0)
  useEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      setCatalogFilters((f) => ({ ...f, scrollY: scrollYRef.current }))
    }
  }, [setCatalogFilters])

  // Restore only when arriving back via a real "back" navigation, and only
  // once the real items (not the skeleton) have rendered so the page has
  // its final height.
  const restoredScrollRef = useRef(false)
  useEffect(() => {
    if (catalogLoading || restoredScrollRef.current) return
    restoredScrollRef.current = true
    if (navigationType === 'POP' && savedScrollY) {
      window.scrollTo(0, savedScrollY)
    }
  }, [catalogLoading, navigationType, savedScrollY])

  const clearFilters = () => {
    setActiveCategory('all')
    setPriceFilter('all')
    setCatalogQuery('')
    setTagFilter('all')
  }

  const removeFilter = (type) => {
    if (type === 'category') setActiveCategory('all')
    if (type === 'price') setPriceFilter('all')
    if (type === 'globalSearch') setCatalogQuery('')
    if (type === 'tag') setTagFilter('all')
  }

  const filterProps = {
    products,
    activeCategory,
    setActiveCategory,
    priceFilter,
    setPriceFilter,
    catalogQuery,
    setCatalogQuery,
    activeFilterCount,
    availableCategories: categoryOptions,
    clearFilters,
    removeFilter,
    priceOpen,
    setPriceOpen,
    tagFilter,
    setTagFilter,
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <FloatingCartButton />
      <div className="flex w-full flex-col gap-4 px-3 py-4 sm:px-5 lg:px-8 lg:py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
              <Tag className="h-3.5 w-3.5" />
              选品中心
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">热销精选</h1>
            <p className="mt-1 text-sm text-gray-500">从畅销商品中挑选，进入详情继续定制。</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <div className="relative w-full sm:w-[320px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={catalogQuery}
                onChange={(event) => setCatalogQuery(event.target.value)}
                placeholder="搜索商品名称、描述或分类"
                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {catalogQuery && (
                <button
                  onClick={() => setCatalogQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
                <LayoutGrid className="h-4 w-4" />
                <span>{total} 件商品</span>
              </div>
              <Link
                to="/"
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-blue-700 hover:text-blue-700"
              >
                返回主页
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile filter button */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-700 hover:text-blue-700"
              >
                <SlidersHorizontal className="h-4 w-4" />
                筛选
                {activeFilterCount > 0 && (
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>筛选条件</SheetTitle>
              </SheetHeader>
              <SheetBody>
                <FilterPanel {...filterProps} />
              </SheetBody>
            </SheetContent>
          </Sheet>
        </div>

        {/* Content */}
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm self-start">
            <FilterPanel {...filterProps} />
          </aside>

          <main className="space-y-5">
            {catalogLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="animate-pulse bg-gray-100" style={{ aspectRatio: CARD_IMAGE_ASPECT }} />
                    <div className="space-y-3 px-4 py-4">
                      <div className="h-4 w-24 rounded-md bg-gray-200" />
                      <div className="h-6 w-3/4 rounded-md bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length ? (
              <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {items.map((product) => {
                  return (
                    <Link
                      key={product.id}
                      to={`/catalog/${product.id}`}
                      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-300 hover:border-blue-700 hover:shadow-md"
                    >
                      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: CARD_IMAGE_ASPECT }}>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        {(product.is_featured || product.is_promotion) && (
                          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
                            {product.is_featured && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1.5 text-sm font-bold tracking-wide text-white shadow">
                                ★ 主推
                              </span>
                            )}
                            {product.is_promotion && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-red-500 px-3 py-1.5 text-sm font-bold tracking-wide text-white shadow">
                                ◆ 促销
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="border-t border-gray-100 px-4 py-3">
                        <div className="truncate text-base font-semibold tracking-tight text-gray-900">{product.name}</div>
                        <div className="mt-1 truncate text-xs text-gray-500">{product.description}</div>
                        <div className="mt-1.5 text-sm font-medium text-blue-700">¥{Number(product.price).toLocaleString()}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-blue-700 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2 text-sm text-gray-600">
                    第 {page} / {totalPages} 页
                  </span>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-blue-700 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
              </>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-gray-900">没有找到商品</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">试试清空筛选，或者换一个分类和关键词。</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-blue-700 hover:text-blue-700"
                >
                  重置筛选
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
