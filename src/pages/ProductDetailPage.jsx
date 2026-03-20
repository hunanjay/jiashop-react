import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ShoppingCart } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { formatCurrency } from '../lib/format'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { products, addToCart } = useApp()
  const product = products.find((item) => item.id === id)

  if (!product) {
    return (
      <div className="rounded-[32px] border border-white/70 bg-white/65 p-10 text-center shadow-sm backdrop-blur-xl">
        <h1 className="text-2xl font-semibold">商品不存在</h1>
        <p className="mt-2 text-sm text-slate-500">请返回首页查看其它商品。</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <Card className="overflow-hidden border-white/70 bg-white/75 shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
        <img src={product.image_url} alt={product.name} className="h-[540px] w-full object-cover" />
      </Card>

      <div className="space-y-6">
        <div className="space-y-4">
          <Badge variant="outline" className="bg-white/80">
            {product.category || 'Uncategorized'}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-slate-950 md:text-6xl">{product.name}</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">{product.description}</p>
        </div>

        <Card className="border-white/70 bg-white/75">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
            <Stat label="价格" value={formatCurrency(product.price)} />
            <Stat label="库存" value={`${product.stock} 件`} />
            <Stat label="定制" value={product.customization?.type || 'N/A'} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => addToCart(product)} className="rounded-full px-6">
            <ShoppingCart className="h-4 w-4" />
            加入购物车
          </Button>
          <Button asChild variant="secondary" className="rounded-full px-6">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              返回列表
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-4">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  )
}
