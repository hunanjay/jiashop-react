import { useEffect, useRef, useState } from 'react'
import { Crop, FileImage, Move, Upload, X, ZoomIn } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from './modal'

export const CARD_IMAGE_ASPECT = '5 / 4'
const CARD_IMAGE_ASPECT_RATIO = 5 / 4
const CROP_OUTPUT_WIDTH = 1200
const CROP_OUTPUT_HEIGHT = Math.round(CROP_OUTPUT_WIDTH / CARD_IMAGE_ASPECT_RATIO)

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function isImageLike(value) {
  return typeof value === 'string' && (value.startsWith('data:image/') || /\.(avif|bmp|gif|heic|jpeg|jpg|png|svg|webp)(\?|#|$)/i.test(value))
}

function getPoint(event) {
  return { x: event.clientX, y: event.clientY }
}

export function FileUploadField({
  label,
  value,
  onChange,
  accept = 'image/*',
  helperText = '上传后会在前端转换并裁剪成卡片比例',
  className,
}) {
  const inputRef = useRef(null)
  const stageRef = useRef(null)
  const [isReading, setIsReading] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [pendingSource, setPendingSource] = useState('')
  const [pendingName, setPendingName] = useState('')
  const [imageMeta, setImageMeta] = useState(null)
  const [stageWidth, setStageWidth] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragState, setDragState] = useState(null)

  useEffect(() => {
    if (!cropOpen || !stageRef.current) return undefined

    const element = stageRef.current
    const observer = new ResizeObserver(([entry]) => {
      setStageWidth(entry.contentRect.width)
    })
    observer.observe(element)

    return () => observer.disconnect()
  }, [cropOpen])

  useEffect(() => {
    if (!dragState || !imageMeta || !stageWidth) return undefined

    const handleMove = (event) => {
      const nextPoint = getPoint(event)
      const deltaX = nextPoint.x - dragState.startX
      const deltaY = nextPoint.y - dragState.startY

      const stageHeight = stageWidth / CARD_IMAGE_ASPECT_RATIO
      const baseScale = Math.max(stageWidth / imageMeta.width, stageHeight / imageMeta.height)
      const displayScale = baseScale * zoom
      const displayWidth = imageMeta.width * displayScale
      const displayHeight = imageMeta.height * displayScale
      const maxOffsetX = Math.max(0, (displayWidth - stageWidth) / 2)
      const maxOffsetY = Math.max(0, (displayHeight - stageHeight) / 2)

      setOffset({
        x: clamp(dragState.originX + deltaX, -maxOffsetX, maxOffsetX),
        y: clamp(dragState.originY + deltaY, -maxOffsetY, maxOffsetY),
      })
    }

    const handleUp = () => {
      setDragState(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
    }
  }, [dragState, imageMeta, stageWidth, zoom])

  const resetCropState = () => {
    setPendingSource('')
    setPendingName('')
    setImageMeta(null)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setDragState(null)
  }

  const handlePickFile = () => {
    inputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsReading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setPendingSource(String(reader.result || ''))
      setPendingName(file.name)
      setCropOpen(true)
      setIsReading(false)
    }
    reader.onerror = () => {
      setIsReading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleClear = () => {
    onChange('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    resetCropState()
  }

  const handleCropConfirm = () => {
    if (!pendingSource || !imageMeta || !stageWidth) return

    const image = new Image()
    image.onload = () => {
      const stageHeight = stageWidth / CARD_IMAGE_ASPECT_RATIO
      const baseScale = Math.max(stageWidth / imageMeta.width, stageHeight / imageMeta.height)
      const displayScale = baseScale * zoom
      const cropSourceWidth = stageWidth / displayScale
      const cropSourceHeight = stageHeight / displayScale

      let sourceX = imageMeta.width / 2 - cropSourceWidth / 2 - offset.x / displayScale
      let sourceY = imageMeta.height / 2 - cropSourceHeight / 2 - offset.y / displayScale

      sourceX = clamp(sourceX, 0, Math.max(0, imageMeta.width - cropSourceWidth))
      sourceY = clamp(sourceY, 0, Math.max(0, imageMeta.height - cropSourceHeight))

      const canvas = document.createElement('canvas')
      canvas.width = CROP_OUTPUT_WIDTH
      canvas.height = CROP_OUTPUT_HEIGHT
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(image, sourceX, sourceY, cropSourceWidth, cropSourceHeight, 0, 0, canvas.width, canvas.height)
      onChange(canvas.toDataURL('image/jpeg', 0.92))
      setCropOpen(false)
      resetCropState()
    }
    image.src = pendingSource
  }

  const handleCropCancel = () => {
    setCropOpen(false)
    resetCropState()
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const hasPreview = isImageLike(value)
  const stageHeight = stageWidth ? stageWidth / CARD_IMAGE_ASPECT_RATIO : 0
  const baseScale = imageMeta && stageWidth ? Math.max(stageWidth / imageMeta.width, stageHeight / imageMeta.height) : 1
  const displayScale = baseScale * zoom
  const displayWidth = imageMeta ? imageMeta.width * displayScale : 0
  const displayHeight = imageMeta ? imageMeta.height * displayScale : 0
  const displayLeft = imageMeta ? (stageWidth - displayWidth) / 2 + offset.x : 0
  const displayTop = imageMeta ? (stageHeight - displayHeight) / 2 + offset.y : 0

  return (
    <>
      <div className={cn('space-y-3 rounded-[22px] border border-slate-200/80 bg-white/75 p-4 shadow-sm backdrop-blur-xl', className)}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-950">{label}</div>
            <div className="mt-1 text-xs text-slate-500">{helperText}</div>
          </div>
          <FileImage className="h-4 w-4 text-slate-400" />
        </div>

        <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />

        {hasPreview ? (
          <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100" style={{ aspectRatio: CARD_IMAGE_ASPECT }}>
            <img src={value} alt={label} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div
            className="flex items-center justify-center rounded-[18px] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400"
            style={{ aspectRatio: CARD_IMAGE_ASPECT }}
          >
            预览会显示在这里
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" onClick={handlePickFile} disabled={isReading}>
            <Upload className="h-4 w-4" />
            {isReading ? '处理中...' : '选择文件'}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" onClick={handleClear} className="text-slate-500">
              <X className="h-4 w-4" />
              清空
            </Button>
          ) : null}
        </div>

        {value ? (
          <div className="truncate rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
            已保存前端裁剪结果，长度 {value.length}
          </div>
        ) : null}
      </div>

      <Modal open={cropOpen} onOpenChange={(open) => (!open ? handleCropCancel() : setCropOpen(open))}>
        <ModalContent className="max-w-6xl border-white/60 bg-white/80 shadow-[0_40px_120px_rgba(15,23,42,0.28)]">
          <ModalHeader className="border-white/70 bg-white/80">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900">裁剪图片</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  裁剪比例和商品卡一致，直接拖动图片并调整缩放。
                </p>
              </div>
              <div className="rounded-full border border-slate-200/80 bg-white/75 px-3 py-2 text-xs text-slate-500 backdrop-blur-xl">
                {pendingName || '未命名文件'}
              </div>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_320px]">
              <div className="space-y-3">
                <div
                  ref={stageRef}
                  className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 shadow-sm"
                  style={{ aspectRatio: CARD_IMAGE_ASPECT }}
                  onPointerDown={(event) => {
                    if (!imageMeta || !stageWidth) return
                    event.currentTarget.setPointerCapture?.(event.pointerId)
                    setDragState({
                      startX: getPoint(event).x,
                      startY: getPoint(event).y,
                      originX: offset.x,
                      originY: offset.y,
                    })
                  }}
                >
                  {pendingSource ? (
                    <img
                      src={pendingSource}
                      alt="crop preview"
                      onLoad={(event) => {
                        setImageMeta({
                          width: event.currentTarget.naturalWidth,
                          height: event.currentTarget.naturalHeight,
                        })
                        setZoom(1)
                        setOffset({ x: 0, y: 0 })
                      }}
                      className="absolute left-0 top-0 select-none"
                      style={{
                        width: displayWidth,
                        height: displayHeight,
                        transform: `translate(${displayLeft}px, ${displayTop}px)`,
                        cursor: dragState ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        pointerEvents: 'none',
                      }}
                      draggable={false}
                    />
                  ) : null}

                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.03),rgba(15,23,42,0))]" />
                  <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-slate-950/70 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-xl">
                    <Move className="mr-1 inline-block h-3.5 w-3.5" />
                    拖动调整位置
                  </div>
                </div>

                <div className="rounded-[20px] border border-slate-200/80 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">缩放</div>
                      <div className="mt-1 text-xs text-slate-500">让裁剪内容更贴近卡片展示</div>
                    </div>
                    <div className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">{zoom.toFixed(2)}x</div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <ZoomIn className="h-4 w-4 text-slate-400" />
                    <input
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.01"
                      value={zoom}
                      onChange={(event) => {
                        const nextZoom = Number(event.target.value)
                        setZoom(nextZoom)

                        if (!imageMeta || !stageWidth) return
                        const nextStageHeight = stageWidth / CARD_IMAGE_ASPECT_RATIO
                        const nextBaseScale = Math.max(stageWidth / imageMeta.width, nextStageHeight / imageMeta.height)
                        const nextDisplayScale = nextBaseScale * nextZoom
                        const nextDisplayWidth = imageMeta.width * nextDisplayScale
                        const nextDisplayHeight = imageMeta.height * nextDisplayScale
                        const maxOffsetX = Math.max(0, (nextDisplayWidth - stageWidth) / 2)
                        const maxOffsetY = Math.max(0, (nextDisplayHeight - nextStageHeight) / 2)
                        setOffset((current) => ({
                          x: clamp(current.x, -maxOffsetX, maxOffsetX),
                          y: clamp(current.y, -maxOffsetY, maxOffsetY),
                        }))
                      }}
                      className="h-2 w-full cursor-pointer accent-slate-900"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>最小 1.00x</span>
                    <span>最大 2.50x</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[22px] border border-slate-200/80 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                  <div className="text-sm font-semibold text-slate-950">说明</div>
                  <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                    <p>1. 裁剪比例和商品卡一致。</p>
                    <p>2. 拖动图片调整位置，右侧滑杆控制放大倍数。</p>
                    <p>3. 确认后会直接生成前端可保存的图片字符串。</p>
                  </div>
                </div>

                <div className="rounded-[22px] border border-slate-200/80 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                  <div className="text-sm font-semibold text-slate-950">输出预览</div>
                  <div className="mt-3 overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100" style={{ aspectRatio: CARD_IMAGE_ASPECT }}>
                    {pendingSource ? <img src={pendingSource} alt="original" className="h-full w-full object-cover opacity-60" /> : null}
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    输出会被压成 {CROP_OUTPUT_WIDTH} x {CROP_OUTPUT_HEIGHT}，比例和卡片一致。
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="border-white/70 bg-white/80">
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={handleCropCancel}>
                取消
              </Button>
              <Button onClick={handleCropConfirm} disabled={!pendingSource || !imageMeta}>
                <Crop className="h-4 w-4" />
                确认裁剪
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
