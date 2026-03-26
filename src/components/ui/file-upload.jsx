import { useEffect, useRef, useState } from 'react'
import { Crop, Edit, RotateCcw, Upload, X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { ImageCropModal } from './ImageCropModal'

export const CARD_IMAGE_ASPECT = '3 / 4'

function isImageLike(value) {
  return typeof value === 'string' && (value.startsWith('data:image/') || /\.(avif|bmp|gif|heic|jpeg|jpg|png|svg|webp)(\?|#|$)/i.test(value))
}

export function FileUploadField({
  label,
  value,
  onChange,
  accept = 'image/*',
  className,
}) {
  const inputRef = useRef(null)
  const [cropOpen, setCropOpen] = useState(false)
  const [pendingSource, setPendingSource] = useState('')
  const [pendingName, setPendingName] = useState('')
  const originalSourceRef = useRef('')

  const resetCropState = () => {
    setPendingSource('')
    setPendingName('')
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

    const reader = new FileReader()
    reader.onload = () => {
      const source = String(reader.result || '')
      originalSourceRef.current = source
      setPendingSource(source)
      setPendingName(file.name)
      setCropOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleClear = () => {
    onChange('')
    originalSourceRef.current = ''
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    resetCropState()
  }

  const handleEditImage = () => {
    if (!originalSourceRef.current) {
      handlePickFile()
      return
    }

    setPendingSource(originalSourceRef.current)
    setPendingName(pendingName || label)
    setCropOpen(true)
  }

  const handleRestoreOriginal = () => {
    if (originalSourceRef.current) {
      onChange(originalSourceRef.current)
    }
  }

  const handleCropOpenChange = (open) => {
    setCropOpen(open)
    if (!open) {
      resetCropState()
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleCropComplete = async (base64Image) => {
    onChange(base64Image)
    setCropOpen(false)
    resetCropState()
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const hasPreview = isImageLike(value)

  return (
    <>
      <div className={cn('overflow-hidden rounded-3xl border border-black/5 bg-slate-50/50 shadow-inner transition-all', className)}>
        {hasPreview ? (
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-200">
            <img src={value} alt={label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity hover:opacity-100">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEditImage}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-950 shadow-lg backdrop-blur-md transition hover:bg-white"
                  title="编辑图片"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRestoreOriginal}
                  disabled={!originalSourceRef.current}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-950 shadow-lg backdrop-blur-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  title="恢复原图"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handlePickFile}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-950 shadow-lg backdrop-blur-md transition hover:bg-white"
                  title="更换图片"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/80 text-white shadow-lg backdrop-blur-md transition hover:bg-rose-600"
                  title="删除"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-slate-800 backdrop-blur-md ring-1 ring-black/5 shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              主图规格 3:4
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handlePickFile}
            className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 bg-white/40 text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 shadow-sm ring-1 ring-black/5">
              <Upload className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
              <p className="mt-1 text-[9px] opacity-60">点击上传封面</p>
            </div>
          </button>
        )}

        <input ref={inputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      </div>

      <ImageCropModal
        open={cropOpen}
        onOpenChange={handleCropOpenChange}
        source={pendingSource}
        onComplete={handleCropComplete}
        title="裁剪图片"
        subtitle="Precision Cropping Dashboard"
        badge={pendingName || 'Untitled Asset'}
        minZoom={0.1}
        maxZoom={5}
        confirmText="同步裁剪结果"
        savingText="正在生成..."
      />
    </>
  )
}

export function MultiFileUploadField({
  label,
  values = [],
  onChange,
  className,
}) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [internalCropOpen, setInternalCropOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(-1)
  const [editSource, setEditSource] = useState('')
  const originalSourcesRef = useRef(values.slice())

  useEffect(() => {
    if (originalSourcesRef.current.length !== values.length) {
      originalSourcesRef.current = values.slice()
    }
  }, [values])

  const handlePickFiles = () => {
    if (values.length >= 5) return
    if (inputRef.current) inputRef.current.value = ''
    inputRef.current?.click()
  }

  const processFiles = async (files) => {
    if (!files || files.length === 0) return
    const remainingSlots = 5 - values.length
    if (remainingSlots <= 0) return

    const newImages = []
    const limitedFiles = Array.from(files).slice(0, remainingSlots)
    
    for (const file of limitedFiles) {
      if (!file.type.startsWith('image/')) continue
      const reader = new FileReader()
      const promise = new Promise((resolve) => {
        reader.onload = () => resolve(String(reader.result || ''))
        reader.readAsDataURL(file)
      })
      const base64 = await promise
      newImages.push(base64)
    }
    
    if (newImages.length > 0) {
      originalSourcesRef.current = [...originalSourcesRef.current.slice(0, values.length), ...newImages]
      onChange([...values, ...newImages])
    }
  }

  const handleFileChange = (e) => processFiles(e.target.files)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const removeImage = (index) => {
    const next = [...values]
    next.splice(index, 1)
    const nextOriginals = [...originalSourcesRef.current]
    nextOriginals.splice(index, 1)
    originalSourcesRef.current = nextOriginals
    onChange(next)
  }

  const startCrop = (index) => {
    setEditIndex(index)
    setEditSource(originalSourcesRef.current[index] || values[index])
    setInternalCropOpen(true)
  }

  const restoreImage = (index) => {
    const original = originalSourcesRef.current[index]
    if (!original) return
    const next = [...values]
    next[index] = original
    onChange(next)
  }

  const handleApplyCrop = (newBase64) => {
    if (editIndex >= 0) {
      const next = [...values]
      next[editIndex] = newBase64
      if (!originalSourcesRef.current[editIndex]) {
        originalSourcesRef.current[editIndex] = editSource
      }
      onChange(next)
    }
  }

  return (
    <div className={cn('space-y-4 text-left', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full ring-1", 
          values.length >= 5 ? "bg-amber-50 text-amber-600 ring-amber-200" : "bg-blue-50 text-blue-600 ring-blue-100"
        )}>
          {values.length} / 5
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {values.length < 5 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handlePickFiles}
          className={cn(
            'group relative flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300',
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
          )}
        >
          <div className="flex flex-col items-center gap-2 text-slate-400 transition-colors group-hover:text-slate-600">
            <div className="rounded-full bg-white p-2.5 shadow-sm ring-1 ring-black/5 group-hover:shadow-md">
              <Upload className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest">点击或拖拽上传</p>
          </div>
        </div>
      )}

      {values.length > 0 && (
        <div className="grid max-w-full grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-3">
          {values.map((src, index) => (
            <div
              key={index}
              className="group relative aspect-[3/4] min-w-0 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
            >
              <img src={src} alt={`${label}-${index}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); startCrop(index); }}
                  className="rounded-full bg-white/90 p-1.5 text-slate-900 shadow-lg backdrop-blur-md transition hover:bg-white"
                  title="裁剪"
                >
                  <Crop className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); restoreImage(index); }}
                  disabled={!originalSourcesRef.current[index] || originalSourcesRef.current[index] === values[index]}
                  className="rounded-full bg-white/90 p-1.5 text-slate-900 shadow-lg backdrop-blur-md transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
                  title="恢复原图"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className="rounded-full bg-rose-500/90 p-1.5 text-white shadow-lg backdrop-blur-md transition hover:bg-rose-600"
                  title="移除"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="absolute bottom-1.5 left-2 rounded-md bg-white/90 px-1 py-0.5 text-[9px] font-bold tabular-nums text-slate-800 backdrop-blur-md shadow-sm ring-1 ring-black/5">
                # {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <ImageCropModal
        open={internalCropOpen}
        onOpenChange={setInternalCropOpen}
        source={editSource}
        onComplete={async (base64) => {
          handleApplyCrop(base64)
        }}
        title="调整附图裁剪"
        subtitle="Fixed 3:4 preview with zoom"
        badge="3:4"
        minZoom={0.6}
        maxZoom={3.2}
        confirmText="确认裁剪"
        savingText="同步中..."
      />
    </div>
  )
}
