import { Link } from 'react-router-dom'
import { ArrowRight, Heart, ShoppingCart, Sparkles } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { formatCurrency } from '../lib/format'

export default function HomePage() {
  const { products, loadingProducts, catalogQuery, categoryOptions, addToCart } = useApp()

  const filteredProducts = products.filter((product) => {
    const text = `${product.name} ${product.description || ''} ${product.category || ''}`.toLowerCase()
    return text.includes(catalogQuery.toLowerCase())
  })

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/55 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <Badge variant="outline" className="bg-white/80 px-4 py-2 text-slate-600">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Premium gifting storefront
            </Badge>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-6xl">
              为每一个重要时刻，选择更有质感的礼物。
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              简约的商品卡片、柔和的动效与沉浸式浏览，让转化更顺滑，品牌感更统一。
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {categoryOptions.slice(1, 5).map((item) => (
                <span key={item.value} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['热销礼盒', '企业客户、节日礼赠'],
              ['定制雕刻', '名字 / LOGO / 寄语'],
              ['快速配送', '适合活动和批量下单'],
              ['品牌包装', '统一审美，开箱有感'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
                <div className="text-sm font-semibold text-slate-900">{title}</div>
                <div className="mt-2 text-sm leading-6 text-slate-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {loadingProducts ? <ProductGridSkeleton /> : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </section>
      )}

      {!loadingProducts && filteredProducts.length === 0 ? (
        <div className="rounded-[32px] border border-white/70 bg-white/65 p-10 text-center shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">没有找到商品</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">试试更换搜索关键词，或者查看其它分类。</p>
        </div>
      ) : null}
    </div>
  )
}

function ProductCard({ product, addToCart }) {
  return (
    <Card className="group overflow-hidden border-white/70 bg-white/75 shadow-[0_20px_60px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.14)]">
      <div className="relative overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-64 w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-white/85 backdrop-blur-xl">
            {product.category || 'Uncategorized'}
          </Badge>
          <Badge
            variant={product.stock <= 3 ? 'destructive' : 'secondary'}
            className={`breathing-badge ${product.stock <= 3 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}
          >
            {product.stock <= 3 ? '库存紧张' : product.stock <= 10 ? '库存关注' : '库存充足'}
          </Badge>
        </div>
      </div>

      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription className="mt-2 line-clamp-2">{product.description}</CardDescription>
          </div>
          <div className="rounded-2xl bg-slate-900 px-3 py-2 text-right text-white shadow-lg shadow-slate-900/10">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">Price</div>
            <div className="text-sm font-semibold">{formatCurrency(product.price)}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">库存</div>
            <div className="mt-1 text-base font-semibold">{product.stock} 件</div>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">定制</div>
            <div className="mt-1 text-base font-semibold">{product.customization?.type || 'N/A'}</div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3">
        <Button asChild variant="secondary" className="rounded-full">
          <Link to={`/product/${product.id}`}>
            查看详情
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button onClick={() => addToCart(product)} className="rounded-full">
          <Heart className="h-4 w-4" />
          加入购物车
        </Button>
      </CardFooter>
    </Card>
  )
}

function ProductGridSkeleton() {
  return (
    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <Card key={index} className="overflow-hidden border-white/70 bg-white/75 shadow-sm">
          <Skeleton className="h-64 w-full rounded-none rounded-t-[28px]" />
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex justify-between gap-3 pt-2">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
