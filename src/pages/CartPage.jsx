import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { formatCurrency } from '../lib/format'

export default function CartPage() {
  const { cartItems, cartTotal, updateCartQuantity, clearCart } = useApp()

  if (cartItems.length === 0) {
    return (
      <div className="rounded-[32px] border border-white/70 bg-white/65 p-10 text-center shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold">购物车是空的</h1>
        <p className="mt-2 text-sm text-slate-500">回到首页挑选一些商品吧。</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/">去逛逛</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        {cartItems.map((item) => (
          <Card key={item.id} className="border-white/70 bg-white/75">
            <CardContent className="flex gap-4 p-4 sm:p-5">
              <img src={item.image_url} alt={item.name} className="h-28 w-28 rounded-[24px] object-cover" />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{item.description}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="min-w-12 text-center text-sm font-semibold">{item.quantity}</div>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <div className="text-right text-lg font-semibold">{formatCurrency(item.subtotal)}</div>
                <button
                  type="button"
                  onClick={() => updateCartQuantity(item.id, 0)}
                  className="inline-flex items-center gap-2 text-sm text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                  移除
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit border-white/70 bg-white/75">
        <CardHeader>
          <CardTitle>订单汇总</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">商品件数</span>
            <span className="font-medium">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">商品小计</span>
            <span className="font-medium">{formatCurrency(cartTotal)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full rounded-full">去结算</Button>
          <Button variant="secondary" className="w-full rounded-full" onClick={clearCart}>
            清空购物车
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
