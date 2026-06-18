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
        className="fixed right-4 top-4 z-40 inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 shadow-md px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition duration-150 sm:right-6 sm:top-6"
        aria-label="查看购物车"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="hidden sm:inline">购物车</span>
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-blue-700 px-2 py-0.5 text-[11px] font-semibold text-white">
          {cartCount}
        </span>
      </Link>
    </>
  )
}
