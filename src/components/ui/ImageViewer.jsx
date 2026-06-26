import { useEffect, useRef, useState, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'

const ZOOM_MIN = 1
const ZOOM_MAX = 8
const ZOOM_STEP = 0.4

function Viewer({ images, initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)
  const containerRef = useRef(null)

  const clampOffset = useCallback((ox, oy, currentZoom) => {
    if (!containerRef.current) return { x: ox, y: oy }
    const { width, height } = containerRef.current.getBoundingClientRect()
    const maxX = (width * (currentZoom - 1)) / 2
    const maxY = (height * (currentZoom - 1)) / 2
    return {
      x: Math.max(-maxX, Math.min(maxX, ox)),
      y: Math.max(-maxY, Math.min(maxY, oy)),
    }
  }, [])

  const applyZoom = useCallback((delta, cx, cy) => {
    setZoom((prev) => {
      const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev + delta))
      if (next === prev) return prev
      setOffset((o) => {
        if (!containerRef.current) return o
        const rect = containerRef.current.getBoundingClientRect()
        const px = cx !== undefined ? cx - rect.left - rect.width / 2 : 0
        const py = cy !== undefined ? cy - rect.top - rect.height / 2 : 0
        const scale = next / prev
        const nx = o.x * scale + px * (1 - scale)
        const ny = o.y * scale + py * (1 - scale)
        return clampOffset(nx, ny, next)
      })
      return next
    })
  }, [clampOffset])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    applyZoom(e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP, e.clientX, e.clientY)
  }, [applyZoom])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const resetView = useCallback(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const goTo = useCallback((next) => {
    setIndex((prev) => {
      const i = ((next ?? prev) + images.length) % images.length
      return i
    })
    resetView()
  }, [images.length, resetView])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') goTo(index + 1)
      if (e.key === 'ArrowLeft') goTo(index - 1)
      if (e.key === '+' || e.key === '=') applyZoom(ZOOM_STEP)
      if (e.key === '-') applyZoom(-ZOOM_STEP)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, onClose, applyZoom, goTo])

  const handleMouseDown = (e) => {
    if (zoom <= 1) return
    setDragging(true)
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }

  const handleMouseMove = (e) => {
    if (!dragging || !dragStart.current) return
    setOffset(clampOffset(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y, zoom))
  }

  const handleMouseUp = () => setDragging(false)

  const handleDoubleClick = (e) => {
    if (zoom > 1) {
      resetView()
    } else {
      applyZoom(2, e.clientX, e.clientY)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <span className="text-xs text-white/60 tabular-nums mr-1">{Math.round(zoom * 100)}%</span>
        <button onClick={() => applyZoom(ZOOM_STEP)} disabled={zoom >= ZOOM_MAX} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button onClick={() => applyZoom(-ZOOM_STEP)} disabled={zoom <= ZOOM_MIN} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button onClick={resetView} disabled={zoom === 1} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80 tabular-nums">
          {index + 1} / {images.length}
        </div>
      )}

      {/* prev / next */}
      {images.length > 1 && (
        <>
          <button onClick={() => goTo(index - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => goTo(index + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* image */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={images[index]}
          alt=""
          draggable={false}
          className="max-w-[90vw] max-h-[90vh] select-none object-contain"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 0.1s ease-out',
          }}
        />
      </div>

      {/* thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 rounded-2xl bg-black/40 p-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); resetView() }}
              className={`h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === index ? 'border-white opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ImageViewer({ images = [], initialIndex = 0, open, onClose }) {
  if (!open || images.length === 0) return null
  return <Viewer key={initialIndex} images={images} initialIndex={initialIndex} onClose={onClose} />
}
