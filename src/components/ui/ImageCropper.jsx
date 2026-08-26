import { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import { Crop, Minus, Plus, RotateCcw, RotateCw, Check, Loader2, X } from 'lucide-react'
import { Modal, ModalContent, ModalTitle, ModalHeader, ModalBody, ModalFooter } from './modal'
import { Button } from './button'
import { getCroppedImg } from '../../lib/crop-image'
import { useApp } from '../../lib/app-context'

const ZOOM_PRESETS = [
  { label: '1×', value: 1 },
  { label: '1.5×', value: 1.5 },
  { label: '2×', value: 2 },
  { label: '3×', value: 3 },
]

export function ImageCropper({
  image,
  open,
  onClose,
  onCropComplete,
  aspectRatio = 1,
  outputWidth,
  outputHeight,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [processing, setProcessing] = useState(false)
  const processingRef = useRef(false)
  const { pushToast } = useApp()

  const onCropCompleteHandler = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleReset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
  }

  const rotate = (deg) => setRotation((r) => (r + deg + 360) % 360)

  const handleConfirm = async () => {
    if (!croppedAreaPixels || processingRef.current) return
    processingRef.current = true
    setProcessing(true)
    try {
      const result = await getCroppedImg(image, croppedAreaPixels, { outputWidth, outputHeight, rotation })
      onCropComplete(result)
      onClose()
    } catch (err) {
      console.error('裁剪失败:', err)
      pushToast('error', '裁剪失败', '图片处理出错，请重试')
    } finally {
      processingRef.current = false
      setProcessing(false)
    }
  }

  const nudgeZoom = (delta) => {
    setZoom((z) => Math.min(3, Math.max(1, Math.round((z + delta) * 10) / 10)))
  }

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent showClose={false} className="max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 shadow-2xl">
        {/* Header */}
        <ModalHeader className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Crop className="h-4 w-4" />
            </div>
            <div>
              <ModalTitle>裁剪图片</ModalTitle>
              {(outputWidth && outputHeight) && (
                <p className="text-[10px] text-gray-400">{outputWidth} × {outputHeight} px</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <RotateCcw className="h-3 w-3" />
              重置
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </ModalHeader>

        {/* Crop canvas */}
        <ModalBody className="p-0">
          <div className="relative h-[420px] bg-gray-900">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropCompleteHandler}
              style={{
                containerStyle: { background: '#111827' },
                cropAreaStyle: { border: '2px solid rgba(59,130,246,0.9)', boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' },
              }}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4 border-t border-gray-100 bg-gray-50 px-6 py-5">
            {/* Zoom row */}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => nudgeZoom(-0.1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input type="range" value={zoom} min={1} max={3} step={0.05}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600" />
              <button type="button" onClick={() => nudgeZoom(0.1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700">
                <Plus className="h-3.5 w-3.5" />
              </button>
              <span className="w-12 text-right text-xs font-semibold tabular-nums text-blue-600">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Zoom presets + Rotation */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-widest text-gray-400">缩放</span>
                <div className="flex gap-1.5">
                  {ZOOM_PRESETS.map((p) => (
                    <button key={p.value} type="button" onClick={() => setZoom(p.value)}
                      className={['rounded-md px-2.5 py-1 text-[11px] font-semibold transition',
                        zoom === p.value
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700',
                      ].join(' ')}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[10px] font-medium uppercase tracking-widest text-gray-400">旋转</span>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => rotate(-90)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                    title="逆时针 90°">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-semibold tabular-nums text-gray-600">
                    {rotation}°
                  </span>
                  <button type="button" onClick={() => rotate(90)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                    title="顺时针 90°">
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        {/* Footer */}
        <ModalFooter className="flex items-center justify-between border-t border-gray-100 bg-white px-5 py-4">
          <p className="text-[10px] text-gray-400">拖动移动 · 滚轮缩放</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}
              className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              取消
            </Button>
            <Button onClick={handleConfirm} disabled={processing}
              className="h-9 min-w-[100px] rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {processing ? (
                <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" />处理中</span>
              ) : (
                <span className="flex items-center gap-2"><Check className="h-3.5 w-3.5" />确认裁剪</span>
              )}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
