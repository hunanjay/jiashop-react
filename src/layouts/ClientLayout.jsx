import { useEffect, useMemo, useState } from 'react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { Home, ShoppingBag, User2, Search, ShoppingCart, Menu } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/format'
import { useDebounce } from '../lib/useDebounce'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet'

export default function ClientLayout() {
  const { session, cartCount, catalogQuery, setCatalogQuery } = useApp()
  const navigate = useNavigate()
  const debouncedQuery = useDebounce(catalogQuery, 300)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    const query = debouncedQuery.trim()
    if (!query) {
      return
    }

    let mounted = true
    api
      .get('/products/search', { params: { q: query } })
      .then((response) => {
        if (!mounted) return
        setSearchResults(response.data || [])
        setActiveIndex(response.data?.length ? 0 : -1)
      })
      .catch(() => {
        if (mounted) setSearchResults([])
      })
      .finally(() => {
        if (mounted) setSearchLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [debouncedQuery])

  const hasPreview = searchOpen && debouncedQuery.trim().length > 0
  const activeProduct = useMemo(() => searchResults[activeIndex] || null, [searchResults, activeIndex])

  const handleSearchKeyDown = (event) => {
    if (!hasPreview) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, searchResults.length - 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
    }
    if (event.key === 'Enter' && activeProduct) {
      event.preventDefault()
      navigate(`/product/${activeProduct.id}`)
      setSearchOpen(false)
    }
    if (event.key === 'Escape') {
      setSearchOpen(false)
    }
  }

  return (
    <div className="min-h-screen text-zinc-100">
      {hasPreview ? <div className="fixed inset-0 z-30 bg-black/55 backdrop-blur-[2px]" onClick={() => setSearchOpen(false)} /> : null}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/45 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">GiftCraft</div>
              <div className="text-lg font-semibold tracking-[-0.03em] text-white">礼品定制商店</div>
            </div>
          </Link>

          <div className="flex flex-1 items-center justify-center">
            <div className="relative w-full max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={catalogQuery}
                onFocus={() => {
                  setSearchOpen(true)
                  setSearchLoading(Boolean(debouncedQuery.trim()))
                }}
                onChange={(event) => {
                  const nextValue = event.target.value
                  setCatalogQuery(nextValue)
                  setSearchOpen(true)
                  setSearchLoading(Boolean(nextValue.trim()))
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="搜索礼品、分类、定制方式"
                className="h-12 rounded-full border border-white/10 bg-white/6 pl-11 text-white shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl placeholder:text-zinc-500"
              />
              {hasPreview ? (
                <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-40 overflow-hidden rounded-[28px] border border-white/10 bg-[#101014]/95 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                  <div className="border-b border-white/10 px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                    {searchLoading ? '搜索中...' : '搜索预览'}
                  </div>
                  <div className="max-h-[420px] overflow-auto p-2">
                    {searchResults.length ? (
                      searchResults.map((product, index) => (
                        <button
                          key={product.id}
                          type="button"
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => {
                            setSearchOpen(false)
                            navigate(`/product/${product.id}`)
                          }}
                          className={[
                            'flex w-full items-center gap-4 rounded-3xl p-3 text-left transition',
                            index === activeIndex ? 'bg-white/10 text-white' : 'text-zinc-200 hover:bg-white/6',
                          ].join(' ')}
                        >
                          <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="truncate text-sm font-semibold">{product.name}</div>
                              <span className="rounded-full bg-white/8 px-2 py-1 text-[11px] text-zinc-400">
                                {product.category || 'Uncategorized'}
                              </span>
                            </div>
                            <div className="mt-1 line-clamp-1 text-sm opacity-75">{product.description}</div>
                          </div>
                          <div className="text-sm font-semibold">{formatCurrency(product.price)}</div>
                        </button>
                      ))
                    ) : searchLoading ? (
                      <div className="p-5 text-sm text-zinc-500">正在查找匹配商品...</div>
                    ) : (
                      <div className="p-5 text-sm text-zinc-500">没有找到匹配结果</div>
                    )}
                  </div>
                </div>
              ) : null}
              </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/cart"
              className="relative inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 text-sm font-medium text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              <ShoppingCart className="h-4 w-4" />
              购物车
              <Badge variant="default" className="ml-1 bg-cyan-400 px-2 py-0.5 text-[11px] text-slate-950">
                {cartCount}
              </Badge>
            </Link>
            <Link
              to={session ? '/admin' : '/login'}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 text-sm font-medium text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-white/14"
            >
              <User2 className="h-4 w-4" />
              {session ? session.username : '个人中心'}
            </Link>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white shadow-sm"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="max-w-[340px] bg-[#0f0f13] text-white">
                <SheetHeader>
                  <SheetTitle>导航</SheetTitle>
                </SheetHeader>
                <div className="space-y-3 p-5">
                  <Link to="/" className="block rounded-2xl border border-white/10 bg-white/6 px-4 py-3 shadow-sm">
                    首页
                  </Link>
                  <Link to="/cart" className="block rounded-2xl border border-white/10 bg-white/6 px-4 py-3 shadow-sm">
                    购物车
                  </Link>
                  <Link to={session ? '/admin' : '/login'} className="block rounded-2xl border border-white/10 bg-white/6 px-4 py-3 shadow-sm">
                    {session ? '个人中心' : '登录'}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-black/35 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 text-sm text-zinc-500 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>备案信息：粤 ICP 备 XXXX 号</div>
          <div className="flex items-center gap-3 lg:justify-center">
            <span>支付方式</span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1">Visa</span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1">Mastercard</span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1">Alipay</span>
          </div>
          <div className="text-left lg:text-right">Apple-style storefront for premium gifting</div>
        </div>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/55 backdrop-blur-2xl md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-3 px-3 py-2">
          <NavLink to="/" className={({ isActive }) => navClass(isActive)}>
            <Home className="h-5 w-5" />
            首页
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => navClass(isActive)}>
            <ShoppingCart className="h-5 w-5" />
            购物车
          </NavLink>
          <NavLink to={session ? '/admin' : '/login'} className={({ isActive }) => navClass(isActive)}>
            <User2 className="h-5 w-5" />
            {session ? '我的' : '登录'}
          </NavLink>
        </div>
      </nav>
    </div>
  )
}

function navClass(isActive) {
  return [
    'flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition',
    isActive ? 'text-white' : 'text-zinc-500',
  ].join(' ')
}
