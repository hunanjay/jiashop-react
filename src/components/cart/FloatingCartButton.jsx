import { useEffect, useRef, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useApp } from '../../lib/app-context'

export function FloatingCartButton() {
  const { cartCount } = useApp()
  const buttonRef = useRef(null)
  const [flights, setFlights] = useState([])

  useEffect(() => {
    const handleFly = (event) => {
      const sourceRect = event.detail?.sourceRect
      if (!sourceRect || !buttonRef.current) return

      const targetRect = buttonRef.current.getBoundingClientRect()
      const sourceCenterX = sourceRect.left + sourceRect.width / 2
      const sourceCenterY = sourceRect.top + sourceRect.height / 2
      const targetCenterX = targetRect.left + targetRect.width / 2
      const targetCenterY = targetRect.top + targetRect.height / 2

      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      setFlights((current) => [
        ...current,
        {
          id,
          left: sourceCenterX,
          top: sourceCenterY,
          dx: targetCenterX - sourceCenterX,
          dy: targetCenterY - sourceCenterY,
        },
      ])

      window.setTimeout(() => {
        setFlights((current) => current.filter((flight) => flight.id !== id))
      }, 780)
    }

    window.addEventListener('giftcraft:cart-fly', handleFly)
    return () => window.removeEventListener('giftcraft:cart-fly', handleFly)
  }, [])

  return (
    <>
      {flights.map((flight) => (
        <div
          key={flight.id}
          className="pointer-events-none fixed z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white shadow-md"
          style={{
            left: `${flight.left}px`,
            top: `${flight.top}px`,
            transform: 'translate(-50%, -50%)',
            animation: 'cart-fly 760ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
            '--cart-fly-dx': `${flight.dx}px`,
            '--cart-fly-dy': `${flight.dy}px`,
          }}
        >
          <ShoppingCart className="h-4 w-4" />
        </div>
      ))}
      <Link
        ref={buttonRef}
        to="/cart"
        className="fixed right-4 top-5 z-40 inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-3.5 text-sm font-semibold text-slate-800 shadow-[0_8px_24px_rgba(48,70,110,0.10)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:translate-y-0 sm:right-6 sm:top-7 dark:border-white/10 dark:bg-[#191c23]/90 dark:text-slate-100 dark:hover:border-blue-400/50 dark:hover:text-blue-300 dark:focus-visible:ring-offset-[#111318]"
        aria-label="查看购物车"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden sm:inline">购物车</span>
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-blue-700 px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-blue-300 dark:text-slate-950">
          {cartCount}
        </span>
      </Link>
    </>
  )
}
