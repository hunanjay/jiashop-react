import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { formatCurrency } from '../lib/format'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { products } = useApp()
  const product = products.find((item) => item.id === id)

  if (!product) {
    return (
      <div className="rounded-[32px] border border-white/15 bg-slate-950/65 p-10 text-center text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <h1 className="text-2xl font-semibold text-white">商品不存在</h1>
        <p className="mt-2 text-sm text-slate-300">请返回首页查看其它商品。</p>
        <Button asChild className="mt-6 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20">
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
      <Card className="overflow-hidden border-white/15 bg-slate-950/62 shadow-[0_20px_60px_rgba(2,6,23,0.42)]">
        <img src={product.image_url} alt={product.name} className="h-[540px] w-full object-cover" />
      </Card>

      <div className="space-y-6">
        <div className="space-y-4">
          <Badge variant="outline" className="border-white/20 bg-white/10 text-slate-100">
            {product.category || 'Uncategorized'}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white md:text-6xl">{product.name}</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-200 md:text-lg">{product.description}</p>
        </div>

        <Card className="border-white/15 bg-slate-950/62">
          <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
            <Stat label="价格" value={formatCurrency(product.price)} />
            <Stat label="库存" value={`${product.stock} 件`} />
            <Stat label="定制" value={product.customization?.type || 'N/A'} />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            asChild
            variant="secondary"
            className="rounded-full border border-white/20 bg-white/10 px-6 text-white hover:bg-white/20"
          >
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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  )
}
