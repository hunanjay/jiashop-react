import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, LayoutGrid, Search, Tag, X } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { FloatingCartButton } from '../components/cart/FloatingCartButton'

const CARD_IMAGE_ASPECT = '1 / 1'

const PRICE_FILTERS = [
  { label: '全部价格', value: 'all' },
  { label: '¥0 - ¥50', value: '0-50' },
  { label: '¥50 - ¥150', value: '50-150' },
  { label: '¥150+', value: '150+' },
]

export default function CatalogPage() {
  const { products, loadingProducts, catalogQuery, setCatalogQuery } = useApp()
  const [activeCategory, setActiveCategory] = useState('all')
  const [brandQuery, setBrandQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState('all')
  const [priceOpen, setPriceOpen] = useState(true)
  const [categoryOpen, setCategoryOpen] = useState(true)

  const activeFilterCount = [
    activeCategory !== 'all',
    priceFilter !== 'all',
    brandQuery.trim().length > 0,
    catalogQuery.trim().length > 0,
  ].filter(Boolean).length

  const availableCategories = useMemo(() => {
    return [
      { label: '全部分类', value: 'all' },
      ...Array.from(new Set(products.map((product) => product.category).filter(Boolean))).map((name) => ({
        label: name,
        value: name,
      })),
    ]
  }, [products])

  const productRows = useMemo(() => {
    return products
      .filter((product) => {
        const text = [
          product.name,
          product.description,
          product.category,
          product.customization?.type,
          product.specs,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (catalogQuery.trim() && !text.includes(catalogQuery.trim().toLowerCase())) {
          return false
        }

        if (activeCategory !== 'all' && product.category !== activeCategory) {
          return false
        }

        if (brandQuery.trim()) {
          const needle = brandQuery.trim().toLowerCase()
          const haystack = [product.category, product.name, product.customization?.type]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(needle)) {
            return false
          }
        }

        const price = Number(product.price || 0)
        if (priceFilter === '0-50' && !(price < 50)) return false
        if (priceFilter === '50-150' && !(price >= 50 && price < 150)) return false
        if (priceFilter === '150+' && !(price >= 150)) return false

        return true
      })
      .sort((left, right) => Number(right.sales_count || 0) - Number(left.sales_count || 0))
  }, [activeCategory, brandQuery, catalogQuery, priceFilter, products])

  const clearFilters = () => {
    setActiveCategory('all')
    setBrandQuery('')
    setPriceFilter('all')
    setCatalogQuery('')
  }

  const removeFilter = (type) => {
    if (type === 'category') setActiveCategory('all')
    if (type === 'brand') setBrandQuery('')
    if (type === 'price') setPriceFilter('all')
    if (type === 'globalSearch') setCatalogQuery('')
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <FloatingCartButton />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
              <Tag className="h-3.5 w-3.5" />
              选品中心
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">热销精选</h1>
            <p className="mt-1 text-sm text-gray-500">从畅销商品中挑选，进入详情继续定制。</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <div className="relative min-w-[260px] sm:w-[320px]">
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

            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
              <LayoutGrid className="h-4 w-4" />
              <span>{productRows.length} 件商品</span>
            </div>
            <Link
              to="/"
              className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-blue-700 hover:text-blue-700"
            >
              返回主页
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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

            <div className="flex flex-wrap gap-2">
              {[
                activeCategory !== 'all' ? { type: 'category', label: `分类: ${activeCategory}` } : null,
                priceFilter !== 'all' ? { type: 'price', label: `价格: ${PRICE_FILTERS.find((item) => item.value === priceFilter)?.label}` } : null,
                brandQuery.trim() ? { type: 'brand', label: `分类搜索: ${brandQuery.trim()}` } : null,
                catalogQuery.trim() ? { type: 'globalSearch', label: `关键词: ${catalogQuery.trim()}` } : null,
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

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <button
                type="button"
                onClick={() => setPriceOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="text-sm font-semibold text-gray-900">价格</span>
                {priceOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {priceOpen ? (
                <div className="mt-4 grid gap-2">
                  {PRICE_FILTERS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPriceFilter(item.value)}
                      className={[
                        'rounded-lg border px-4 py-3 text-left text-sm transition',
                        priceFilter === item.value
                          ? 'border-blue-700 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <button
                type="button"
                onClick={() => setCategoryOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="text-sm font-semibold text-gray-900">分类</span>
                {categoryOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {categoryOpen ? (
                <>
                  <div className="relative mt-4">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={brandQuery}
                      onChange={(event) => setBrandQuery(event.target.value)}
                      placeholder="搜索分类或关键词"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    {availableCategories.map((item) => {
                      const active = activeCategory === item.value
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setActiveCategory(item.value)}
                          className={[
                            'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition',
                            active
                              ? 'border-blue-700 bg-blue-50 text-blue-700 font-medium'
                              : 'border-gray-200 bg-white text-gray-950 hover:border-gray-300 hover:bg-gray-50',
                          ].join(' ')}
                        >
                          <span
                            className={[
                              'inline-flex h-4 w-4 items-center justify-center rounded-[5px] border text-[10px]',
                              active
                                ? 'border-blue-700 bg-blue-700 text-white'
                                : 'border-gray-300 bg-gray-50 text-transparent',
                            ].join(' ')}
                          >
                            ✓
                          </span>
                          <span className="flex-1 text-sm">{item.label}</span>
                          <span className="text-xs text-gray-500">
                            {item.value === 'all'
                              ? products.length
                              : products.filter((product) => product.category === item.value).length}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </aside>

          <main className="space-y-5">
            {loadingProducts ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="animate-pulse bg-gray-100" style={{ aspectRatio: CARD_IMAGE_ASPECT }} />
                    <div className="space-y-3 px-3 py-3">
                      <div className="h-4 w-24 rounded-md bg-gray-200" />
                      <div className="h-6 w-3/4 rounded-md bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productRows.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                {productRows.map((product) => {
                  return (
                    <Link
                      key={product.id}
                      to={`/catalog/${product.id}`}
                      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-300 hover:border-blue-700 hover:shadow-md"
                    >
                      <div className="overflow-hidden bg-gray-50" style={{ aspectRatio: CARD_IMAGE_ASPECT }}>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="border-t border-gray-100 px-3 py-3">
                        <div className="truncate text-sm font-medium tracking-tight text-gray-900">{product.name}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
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
