import { useCallback, useRef, useState } from 'react'
import { Crop, FileImage, Move, Upload, X, ZoomIn } from 'lucide-react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'

import { cn } from '../../lib/utils'
import { Button } from './button'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from './modal'
import { api } from '../../lib/api'

export const CARD_IMAGE_ASPECT = '5 / 4'
const CARD_IMAGE_ASPECT_RATIO = 5 / 4
const ZOOM_PRESETS = [
  { label: '50%', value: 0.5 },
  { label: '100%', value: 1 },
  { label: '200%', value: 2 },
]

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function isImageLike(value) {
  return typeof value === 'string' && (value.startsWith('data:image/') || /\.(avif|bmp|gif|heic|jpeg|jpg|png|svg|webp)(\?|#|$)/i.test(value))
}

function createImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
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
  const [isReading, setIsReading] = useState(false)
  const [isCropping, setIsCropping] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [pendingSource, setPendingSource] = useState('')
  const [pendingName, setPendingName] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const resetCropState = () => {
    setPendingSource('')
    setPendingName('')
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setIsCropping(false)
  }

  const handlePickFile = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
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
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
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

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const handleCropConfirm = async () => {
    if (!pendingSource || !croppedAreaPixels) return

    setIsCropping(true)
    try {
      const image = await createImage(pendingSource)
      const sourceX = clamp(Math.round(croppedAreaPixels.x), 0, Math.max(0, image.naturalWidth - 1))
      const sourceY = clamp(Math.round(croppedAreaPixels.y), 0, Math.max(0, image.naturalHeight - 1))
      const sourceWidth = clamp(
        Math.round(croppedAreaPixels.width),
        1,
        Math.max(1, image.naturalWidth - sourceX),
      )
      const sourceHeight = clamp(
        Math.round(croppedAreaPixels.height),
        1,
        Math.max(1, image.naturalHeight - sourceY),
      )

      const canvas = document.createElement('canvas')
      let outputWidth = sourceWidth
      let outputHeight = sourceHeight
      // 防止图片过大，最宽限制在 1200
      if (outputWidth > 1200) {
        outputWidth = 1200
        outputHeight = Math.round(1200 / CARD_IMAGE_ASPECT_RATIO)
      }
      canvas.width = outputWidth
      canvas.height = outputHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
      const base64Image = canvas.toDataURL('image/jpeg', 0.92)
      
      onChange(base64Image)

      setCropOpen(false)
      resetCropState()
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } finally {
      setIsCropping(false)
    }
  }

  const handleCropCancel = () => {
    setCropOpen(false)
    resetCropState()
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const hasPreview = isImageLike(value)

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

        {value && value.startsWith('http') ? (
          <div className="truncate rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
            已上传到 OSS
          </div>
        ) : value ? (
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
                  使用 React Easy Crop，拖动并缩放到商品卡的最佳展示范围。
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
                  className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 shadow-sm"
                  style={{ aspectRatio: CARD_IMAGE_ASPECT }}
                >
                  {pendingSource ? (
                    <Cropper
                      image={pendingSource}
                      crop={crop}
                      zoom={zoom}
                      aspect={CARD_IMAGE_ASPECT_RATIO}
                      minZoom={0.1}
                      maxZoom={5}
                      restrictPosition={false}
                      objectFit="contain"
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      showGrid={false}
                    />
                  ) : null}

                  <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-slate-950/70 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-xl">
                    <Move className="mr-1 inline-block h-3.5 w-3.5" />
                    拖动调整位置
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[20px] border border-slate-200/80 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">缩放</div>
                      <div className="mt-1 text-xs text-slate-500">让裁剪内容更贴近卡片展示</div>
                    </div>
                    <div className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">{Math.round(zoom * 100)}%</div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {ZOOM_PRESETS.map((preset) => {
                      const active = Math.abs(zoom - preset.value) < 0.01
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setZoom(preset.value)}
                          className={[
                            'rounded-full border px-3 py-1 text-xs transition',
                            active
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                          ].join(' ')}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <ZoomIn className="h-4 w-4 text-slate-400" />
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.01"
                      value={zoom}
                      onChange={(event) => setZoom(Number(event.target.value))}
                      className="h-2 w-full cursor-pointer accent-slate-900"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>最小 10%</span>
                    <span>最大 500%</span>
                  </div>
                </div>

                <div className="rounded-[22px] border border-slate-200/80 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                  <div className="text-sm font-semibold text-slate-950">说明</div>
                  <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                    <p>1. 裁剪比例和商品卡一致。</p>
                    <p>2. 拖动图片调整位置，右侧滑杆控制放大倍数。</p>
                    <p>3. 确认后会直接生成前端可保存的图片字符串。</p>
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
              <Button onClick={handleCropConfirm} disabled={!pendingSource || !croppedAreaPixels || isCropping}>
                <Crop className="h-4 w-4" />
                {isCropping ? '生成中...' : '确认裁剪'}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
