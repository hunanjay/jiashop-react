import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, LayoutGrid, Search, Tag, X } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { CARD_IMAGE_ASPECT } from '../components/ui/file-upload'
import { FloatingCartButton } from '../components/cart/FloatingCartButton'

const PRICE_FILTERS = [
  { label: '全部价格', value: 'all' },
  { label: '¥0 - ¥50', value: '0-50' },
  { label: '¥50 - ¥150', value: '50-150' },
  { label: '¥150+', value: '150+' },
]

export default function CatalogPage() {
  const { products, loadingProducts, catalogQuery } = useApp()
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
        const text = [product.name, product.description, product.category, product.customization?.type]
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
  }

  const removeFilter = (type) => {
    if (type === 'category') setActiveCategory('all')
    if (type === 'brand') setBrandQuery('')
    if (type === 'price') setPriceFilter('all')
  }

  return (
    <div className="home-page-theme min-h-screen bg-[var(--surface)] text-[var(--on-surface)]">
      <FloatingCartButton />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-3 rounded-3xl border border-[var(--outline-variant)]/45 bg-[var(--surface-container-lowest)] px-5 py-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--on-surface-variant)]">
              <Tag className="h-3.5 w-3.5" />
              选品中心
            </div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--on-surface)] sm:text-3xl">热销精选</h1>
            <p className="mt-1 text-sm text-[var(--on-surface-variant)]">从畅销商品中挑选，进入详情继续定制。</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--outline-variant)]/40 bg-[var(--surface-container-low)] px-4 py-2.5 text-sm text-[var(--on-surface-variant)]">
              <LayoutGrid className="h-4 w-4" />
              <span>{productRows.length} 件商品</span>
            </div>
            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-[var(--outline-variant)]/40 px-4 py-2.5 text-sm font-medium text-[var(--on-surface)] transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
            >
                返回主页
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 rounded-3xl border border-[var(--outline-variant)]/45 bg-[var(--surface-container-lowest)] p-5 shadow-sm">
            <button
              type="button"
              onClick={clearFilters}
              className="flex w-full items-center gap-3 rounded-2xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-low)] px-4 py-3 text-left text-sm font-medium text-[var(--on-surface)] transition hover:border-[var(--primary)]/35"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-container)] text-[var(--on-surface-variant)]">
                <X className="h-3.5 w-3.5" />
              </span>
              清空筛选
              {activeFilterCount > 0 ? (
                <span className="ml-auto rounded-full bg-[var(--primary-container)] px-2.5 py-0.5 text-xs text-[var(--on-primary-container)]">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>

            <div className="flex flex-wrap gap-2">
              {[
                activeCategory !== 'all' ? { type: 'category', label: `分类: ${activeCategory}` } : null,
                priceFilter !== 'all' ? { type: 'price', label: `价格: ${PRICE_FILTERS.find((item) => item.value === priceFilter)?.label}` } : null,
                brandQuery.trim() ? { type: 'brand', label: `搜索: ${brandQuery.trim()}` } : null,
              ]
                .filter(Boolean)
                .map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => removeFilter(chip.type)}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--outline-variant)]/35 bg-[var(--surface-container-low)] px-3 py-2 text-xs text-[var(--on-surface-variant)] transition hover:border-[var(--primary)]/35"
                  >
                    {chip.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
            </div>

            <div className="rounded-2xl border border-[var(--outline-variant)]/40 bg-[var(--surface-container-low)] p-4">
              <button
                type="button"
                onClick={() => setPriceOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="text-sm font-semibold text-[var(--on-surface)]">价格</span>
                {priceOpen ? (
                  <ChevronUp className="h-4 w-4 text-[var(--on-surface-variant)]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[var(--on-surface-variant)]" />
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
                        'rounded-2xl border px-4 py-3 text-left text-sm transition',
                        priceFilter === item.value
                          ? 'border-[var(--primary)]/35 bg-[var(--primary-container)] text-[var(--on-primary-container)]'
                          : 'border-[var(--outline-variant)]/40 bg-[var(--surface-container-lowest)] text-[var(--on-surface-variant)] hover:border-[var(--primary)]/30',
                      ].join(' ')}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[var(--outline-variant)]/40 bg-[var(--surface-container-low)] p-4">
              <button
                type="button"
                onClick={() => setCategoryOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="text-sm font-semibold text-[var(--on-surface)]">分类</span>
                {categoryOpen ? (
                  <ChevronUp className="h-4 w-4 text-[var(--on-surface-variant)]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[var(--on-surface-variant)]" />
                )}
              </button>

              {categoryOpen ? (
                <>
                  <div className="relative mt-4">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--on-surface-variant)]" />
                    <input
                      value={brandQuery}
                      onChange={(event) => setBrandQuery(event.target.value)}
                      placeholder="搜索分类或关键词"
                      className="h-11 w-full rounded-2xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] pl-11 pr-4 text-sm text-[var(--on-surface)] outline-none transition placeholder:text-[var(--on-surface-variant)] focus:border-[var(--primary)]/40"
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
                            'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
                            active
                              ? 'border-[var(--primary)]/35 bg-[var(--primary-container)] text-[var(--on-primary-container)]'
                              : 'border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] text-[var(--on-surface)] hover:border-[var(--primary)]/30',
                          ].join(' ')}
                        >
                          <span
                            className={[
                              'inline-flex h-4 w-4 items-center justify-center rounded-[5px] border text-[10px]',
                              active
                                ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]'
                                : 'border-[var(--outline-variant)]/40 bg-[var(--surface-container-low)] text-transparent',
                            ].join(' ')}
                          >
                            ✓
                          </span>
                          <span className="flex-1 text-sm">{item.label}</span>
                          <span className="text-xs text-[var(--on-surface-variant)]">
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
                    className="overflow-hidden rounded-3xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)]"
                  >
                    <div className="animate-pulse bg-[var(--surface-container)]" style={{ aspectRatio: CARD_IMAGE_ASPECT }} />
                    <div className="space-y-3 px-3 py-3">
                      <div className="h-4 w-24 rounded-full bg-[var(--surface-container)]" />
                      <div className="h-6 w-3/4 rounded-full bg-[var(--surface-container)]" />
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
                      className="group overflow-hidden rounded-3xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] transition duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/35 hover:shadow-lg"
                    >
                      <div className="overflow-hidden bg-[var(--surface-container-low)]" style={{ aspectRatio: CARD_IMAGE_ASPECT }}>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="border-t border-[var(--outline-variant)]/30 px-3 py-3">
                        <div className="truncate text-sm font-medium tracking-[-0.01em] text-[var(--on-surface)]">{product.name}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--surface-container)] text-[var(--on-surface-variant)]">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[var(--on-surface)]">没有找到商品</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--on-surface-variant)]">试试清空筛选，或者换一个分类和关键词。</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--outline-variant)]/35 bg-[var(--surface-container-low)] px-5 py-3 text-sm font-medium text-[var(--on-surface)] transition hover:border-[var(--primary)]/35 hover:text-[var(--primary)]"
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
