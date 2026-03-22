import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Search,
  Tag,
  X,
} from 'lucide-react'

import { useApp } from '../lib/app-context'
import { CARD_IMAGE_ASPECT } from '../components/ui/file-upload'

const PRICE_FILTERS = [
  { label: '全部价格', value: 'all' },
  { label: '¥0 - ¥50', value: '0-50' },
  { label: '¥50 - ¥150', value: '50-150' },
  { label: '¥150+', value: '150+' },
]

export default function HomePage() {
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
        const text = [
          product.name,
          product.description,
          product.category,
          product.customization?.type,
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
  }

  const removeFilter = (type) => {
    if (type === 'category') setActiveCategory('all')
    if (type === 'brand') setBrandQuery('')
    if (type === 'price') setPriceFilter('all')
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            <Tag className="h-3.5 w-3.5" />
            首页
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.05em] text-white sm:text-3xl">热销精选</h1>
          <p className="mt-1 text-sm text-zinc-500">黑色系毛玻璃商品墙，点击任意卡片进入详情。</p>
        </div>

        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-3 text-sm text-zinc-300 backdrop-blur-xl">
          <LayoutGrid className="h-4 w-4 text-zinc-500" />
          <span>{productRows.length} 件商品</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
        <aside className="space-y-4 rounded-[30px] border border-white/10 bg-white/6 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={clearFilters}
            className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-left text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
              <X className="h-3.5 w-3.5" />
            </span>
            清空筛选
            {activeFilterCount > 0 ? (
              <span className="ml-auto rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-xs text-zinc-300">
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
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/10"
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur-2xl">
            <button
              type="button"
              onClick={() => setPriceOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="text-sm font-semibold text-white">价格</span>
              {priceOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
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
                        ? 'border-cyan-400/50 bg-cyan-400/15 text-white'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:bg-white/10',
                    ].join(' ')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 backdrop-blur-2xl">
            <button
              type="button"
              onClick={() => setCategoryOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="text-sm font-semibold text-white">分类</span>
              {categoryOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
            </button>

            {categoryOpen ? (
              <>
                <div className="relative mt-4">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={brandQuery}
                    onChange={(event) => setBrandQuery(event.target.value)}
                    placeholder="搜索分类或关键词"
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/6 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-white/20 focus:bg-white/10"
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
                            ? 'border-cyan-400/40 bg-cyan-400/12 text-white'
                            : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/10',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'inline-flex h-4 w-4 items-center justify-center rounded-[5px] border text-[10px]',
                            active ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-white/15 bg-white/5 text-transparent',
                          ].join(' ')}
                        >
                          ✓
                        </span>
                        <span className="flex-1 text-sm">{item.label}</span>
                        <span className="text-xs text-zinc-500">
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[20px] border border-white/10 bg-white/6 shadow-[0_14px_36px_rgba(0,0,0,0.24)] backdrop-blur-2xl"
                >
                  <div className="animate-pulse bg-white/10" style={{ aspectRatio: CARD_IMAGE_ASPECT }} />
                  <div className="space-y-3 px-3 py-3">
                    <div className="h-4 w-24 rounded-full bg-white/10" />
                    <div className="h-6 w-3/4 rounded-full bg-white/10" />
                    <div className="h-4 w-full rounded-full bg-white/10" />
                    <div className="h-4 w-5/6 rounded-full bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : productRows.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {productRows.map((product) => {
                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group overflow-hidden rounded-[20px] border border-white/10 bg-white/6 shadow-[0_14px_36px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_22px_48px_rgba(0,0,0,0.32)]"
                  >
                    <div className="overflow-hidden bg-black/40" style={{ aspectRatio: CARD_IMAGE_ASPECT }}>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="border-t border-white/10 bg-black/55 px-3 py-3 backdrop-blur-xl">
                      <div className="truncate text-sm font-medium tracking-[-0.02em] text-white">
                        {product.name}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[30px] border border-white/10 bg-white/6 p-10 text-center shadow-sm backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-white shadow-lg shadow-black/20">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">没有找到商品</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                试试清空筛选，或者换一个分类和关键词。
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15"
              >
                重置筛选
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
