import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { ImageCardUploader } from '../../../components/ui/ImageCardUploader'
import { useApp } from '../../../lib/app-context'
import { api } from '../../../lib/api'
import { extractClipboardImage } from '../../../lib/clipboard-image'
import { ArrowLeft, Save, Globe } from 'lucide-react'

const EMPTY_FORM = {
  name: '',
  price: '',
  stock: 99,
  description: '',
  category: '',
  mainImages: [],
  images: [],
  variants: [],
}

const EMPTY_VARIANT = { name: '', price: '', stock: '' }

export default function ProductEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pushToast, categoryOptions, reloadProducts, reloadProductCategories } = useApp()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  const activeVariants = (form.variants || []).filter((v) => v.name?.trim())
  const hasVariants = activeVariants.length > 0
  const autoPrice = hasVariants
    ? Math.min(...activeVariants.map((v) => Number(v.price) || 0))
    : null
  const [saving, setSaving] = useState(false)
  const [selectedPasteTarget, setSelectedPasteTarget] = useState('main')
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) {
      pushToast('warning', '分类名称不能为空')
      return
    }

    const exists = categoryOptions.some(
      (o) => o.value.toLowerCase() === name.toLowerCase()
    )
    if (exists) {
      pushToast('warning', '该分类已存在，已为您自动选择')
      setForm((current) => ({ ...current, category: name }))
      setShowNewCategoryInput(false)
      setNewCategoryName('')
      return
    }

    setCreatingCategory(true)
    try {
      await api.post('/admin/product-categories', {
        name,
        sort_order: 0,
        active: true,
      })
      pushToast('success', '分类已创建')
      if (reloadProductCategories) {
        await reloadProductCategories()
      }
      setForm((current) => ({ ...current, category: name }))
      setShowNewCategoryInput(false)
      setNewCategoryName('')
    } catch (error) {
      console.error('Create category failed:', error)
      pushToast('error', '创建分类失败', '请检查是否重名或服务器状态')
    } finally {
      setCreatingCategory(false)
    }
  }

  const isEdit = Boolean(id && id !== 'new')

  const loadProduct = useCallback(async () => {
    if (!isEdit) return
    setLoading(true)
    try {
      const res = await api.get(`/products/${id}`)
      const product = res.data
      setForm({
        name: product.name || '',
        price: product.price || '',
        stock: Number(product.stock) || 99,
        description: product.description || '',
        category: product.category || '',
        mainImages: [product.image_url].filter(Boolean),
        images: product.images || [],
        variants: product.variants || [],
      })
    } catch {
      pushToast('error', '加载失败', '无法获取商品信息')
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }, [id, isEdit, pushToast, navigate])

  useEffect(() => {
    loadProduct()
  }, [loadProduct])

  const handleSave = async () => {
    const hasVariants = (form.variants || []).filter((v) => v.name?.trim()).length > 0
    if (!form.name || (!hasVariants && !form.price)) {
      pushToast('warning', '请填写必填项', hasVariants ? '商品名称为必填项' : '商品名称和价格为必填项')
      return
    }

    setSaving(true)
    try {
      pushToast('info', '正在保存', '图片正在上传中...')

      const normalizeImg = async (img) => {
        if (img.startsWith('data:')) {
          const res = await api.post('/upload', { image: img })
          return res.data.key
        }
        if (img.includes('/uploads/')) {
          const parts = img.split('/uploads/')
          return 'uploads/' + parts[1].split('?')[0]
        }
        return img
      }

      const uploadedMain = await Promise.all((form.mainImages || []).map(normalizeImg))
      const uploadedGallery = await Promise.all((form.images || []).map(normalizeImg))

      const cleanVariants = (form.variants || [])
        .filter((v) => v.name?.trim())
        .map((v) => ({
          name: v.name.trim(),
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
        }))

      const basePrice = cleanVariants.length > 0
        ? Math.min(...cleanVariants.map((v) => v.price))
        : Number(form.price) || 0

      const { mainImages: _m, ...formRest } = form
      const finalPayload = {
        ...formRest,
        price: basePrice,
        stock: Number(form.stock) || 99,
        image_url: uploadedMain[0] || '',
        images: [...uploadedMain.slice(1), ...uploadedGallery],
        variants: cleanVariants,
      }

      if (isEdit) {
        await api.put(`/products/${id}`, finalPayload)
      } else {
        await api.post('/products', finalPayload)
      }

      pushToast('success', isEdit ? '更新成功' : '创建成功', '商品已完全录入系统')
      await reloadProducts()
      navigate(-1)
    } catch (err) {
      console.error('Save failed:', err)
      pushToast('error', '存档失败', '请检查网络或数据格式')
    } finally {
      setSaving(false)
    }
  }

  const updateMainImage = useCallback((index, val) => {
    setForm((current) => {
      const next = [...(current.mainImages || [])]
      if (val === null) next.splice(index, 1)
      else next[index] = val
      return { ...current, mainImages: next }
    })
  }, [])

  const addMainImage = useCallback((val) => {
    setForm((current) => ({ ...current, mainImages: [...(current.mainImages || []), val] }))
  }, [])

  const updateGalleryImage = useCallback((index, val) => {
    setForm((current) => {
      const next = [...(current.images || [])]
      if (val === null) next.splice(index, 1)
      else next[index] = val
      return { ...current, images: next }
    })
  }, [])

  const addGalleryImage = useCallback((val) => {
    setForm((current) => ({ ...current, images: [...(current.images || []), val] }))
  }, [])

  const handlePasteImage = useCallback(async (event) => {
    const pastedImage = await extractClipboardImage(event)
    if (!pastedImage) return

    event.preventDefault()
    event.stopPropagation()

    if (typeof selectedPasteTarget === 'string') {
      if (selectedPasteTarget.startsWith('main-')) {
        const suffix = selectedPasteTarget.slice('main-'.length)
        if (suffix === 'new') { addMainImage(pastedImage); pushToast('success', '主图已添加'); return }
        const idx = Number(suffix)
        if (!Number.isNaN(idx)) { updateMainImage(idx, pastedImage); pushToast('success', `主图第 ${idx + 1} 张已替换`); return }
      }
      if (selectedPasteTarget.startsWith('gallery-')) {
        const suffix = selectedPasteTarget.slice('gallery-'.length)
        if (suffix === 'new') { addGalleryImage(pastedImage); pushToast('success', '附图已添加'); return }
        const idx = Number(suffix)
        if (!Number.isNaN(idx)) { updateGalleryImage(idx, pastedImage); pushToast('success', `附图第 ${idx + 1} 张已替换`); return }
      }
    }

    addMainImage(pastedImage)
    pushToast('success', '图片已添加到主图')
  }, [addMainImage, addGalleryImage, pushToast, selectedPasteTarget, updateMainImage, updateGalleryImage])

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">正在拉取商品档案...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4 lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="group flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white shadow-sm transition hover:bg-gray-50"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {isEdit ? '编辑商品' : '新增商品'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {isEdit ? `商品编号：${id}` : '填写商品信息后即可保存'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 h-11 px-8 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium transition border-0"
            >
              <Save className="h-4 w-4" />
              {saving ? '正在保存...' : '保存商品'}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="mx-auto grid h-full w-full max-w-[1600px] grid-cols-1 bg-white border-x border-gray-200 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-full overflow-y-auto border-b border-gray-200 p-5 scrollbar-hide lg:border-b-0 lg:border-r lg:p-8 xl:p-10">
            <div className="mx-auto max-w-3xl space-y-6">
              <section className="space-y-4">
                <header className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h3 className="flex items-center gap-3 text-sm font-semibold tracking-wider text-gray-900">
                    <div className="h-4 w-1 rounded bg-blue-700"></div>
                    基础信息
                  </h3>
                </header>

                <div className="grid gap-5">
                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">商品名称</span>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                      className="h-11 border border-gray-300 bg-white text-sm text-gray-900 px-4 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="请输入商品名称"
                    />
                  </label>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                        零售价格{hasVariants && <span className="ml-1 text-[10px] font-normal text-gray-400 normal-case">由规格自动取最低价</span>}
                      </span>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-900">¥</span>
                        <Input
                          type="number"
                          value={hasVariants ? autoPrice ?? '' : form.price}
                          onChange={(e) => !hasVariants && setForm((c) => ({ ...c, price: e.target.value }))}
                          readOnly={hasVariants}
                          className={`h-11 border border-gray-300 text-sm text-gray-900 pl-10 pr-4 rounded-lg focus:border-blue-500 focus:ring-blue-500/20 ${hasVariants ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
                        />
                      </div>
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">商品分类</span>
                      {!showNewCategoryInput ? (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <select
                              value={form.category}
                              onChange={(e) => {
                                const val = e.target.value
                                if (val === '__NEW__') {
                                  setShowNewCategoryInput(true)
                                } else {
                                  setForm((c) => ({ ...c, category: val }))
                                }
                              }}
                              className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500/20"
                            >
                              <option value="">请选择分类</option>
                              {categoryOptions.filter(o => o.value !== 'all').map((item) => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                              ))}
                              <option value="__NEW__" className="text-blue-700 font-semibold bg-blue-50">+ 新建分类...</option>
                            </select>
                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                              <Globe className="h-4 w-4" />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowNewCategoryInput(true)}
                            className="h-11 border border-gray-300 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex-shrink-0"
                          >
                            + 新建
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="新分类名称"
                            className="h-11 border border-gray-300 bg-white text-sm text-gray-900 px-4 rounded-lg flex-1"
                          />
                          <Button
                            type="button"
                            disabled={creatingCategory}
                            onClick={handleCreateCategory}
                            className="h-11 bg-blue-700 hover:bg-blue-800 text-white px-3 text-sm rounded-lg flex-shrink-0"
                          >
                            {creatingCategory ? '保存中...' : '保存'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowNewCategoryInput(false)
                              setNewCategoryName('')
                            }}
                            className="h-11 border border-gray-300 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex-shrink-0"
                          >
                            取消
                          </Button>
                        </div>
                      )}
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">商品库存</span>
                      <Input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm((c) => ({ ...c, stock: e.target.value }))}
                        className="h-11 border border-gray-300 bg-white text-sm text-gray-900 px-4 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="请输入库存"
                      />
                    </label>
                  </div>

                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">商品描述</span>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                      rows={8}
                      className="resize-none border border-gray-300 bg-white text-sm leading-relaxed text-gray-700 p-3 rounded-lg focus:border-blue-500 focus:ring-blue-500/20 scrollbar-hide"
                      placeholder="请输入商品描述"
                    />
                  </label>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">商品规格</span>
                      <span className="text-[10px] text-gray-400">可选 · 有规格时客户须选规格才能加入购物车</span>
                    </div>

                    {(form.variants || []).length > 0 && (
                      <div className="rounded-lg border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-[1fr_100px_80px_32px] gap-0 bg-gray-50 border-b border-gray-200 px-3 py-2">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">规格名称</span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">价格 (¥)</span>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">库存</span>
                          <span />
                        </div>
                        {(form.variants || []).map((v, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr_100px_80px_32px] gap-0 items-center border-b border-gray-100 last:border-b-0 px-3 py-2">
                            <input
                              value={v.name}
                              onChange={(e) => setForm((c) => {
                                const next = [...c.variants]
                                next[idx] = { ...next[idx], name: e.target.value }
                                return { ...c, variants: next }
                              })}
                              placeholder="如：5000mAh 红色"
                              className="h-8 w-full border border-gray-200 bg-white rounded px-2 text-sm text-gray-900 outline-none focus:border-blue-500 mr-2"
                            />
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => setForm((c) => {
                                const next = [...c.variants]
                                next[idx] = { ...next[idx], price: e.target.value }
                                return { ...c, variants: next }
                              })}
                              placeholder="0.00"
                              className="h-8 w-full border border-gray-200 bg-white rounded px-2 text-sm text-gray-900 outline-none focus:border-blue-500 mr-2"
                            />
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => setForm((c) => {
                                const next = [...c.variants]
                                next[idx] = { ...next[idx], stock: e.target.value }
                                return { ...c, variants: next }
                              })}
                              placeholder="99"
                              className="h-8 w-full border border-gray-200 bg-white rounded px-2 text-sm text-gray-900 outline-none focus:border-blue-500 mr-2"
                            />
                            <button
                              type="button"
                              onClick={() => setForm((c) => {
                                const next = [...c.variants]
                                next.splice(idx, 1)
                                return { ...c, variants: next }
                              })}
                              className="h-8 w-8 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setForm((c) => ({ ...c, variants: [...(c.variants || []), { ...EMPTY_VARIANT }] }))}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      + 添加规格
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <aside className="h-full overflow-y-auto bg-gray-50 p-5 scrollbar-hide lg:p-8 xl:p-10" onPasteCapture={handlePasteImage}>
            <div className="mx-auto max-w-4xl space-y-6">
              <header className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-sm font-semibold tracking-wider text-gray-900">商品图片</h3>
              </header>

              <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                {/* 主图 */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">主图 ({(form.mainImages || []).length})</h4>
                    <span className="text-[9px] text-gray-400">第一张为封面</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(form.mainImages || []).map((img, idx) => (
                      <div
                        key={idx}
                        draggable={true}
                        onDragStart={(e) => { e.dataTransfer.setData('sourceIndex', idx.toString()); e.currentTarget.classList.add('opacity-50', 'scale-95') }}
                        onDragEnd={(e) => e.currentTarget.classList.remove('opacity-50', 'scale-95')}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const src = parseInt(e.dataTransfer.getData('sourceIndex'))
                          if (src === idx) return
                          const next = [...(form.mainImages || [])]
                          const [moved] = next.splice(src, 1)
                          next.splice(idx, 0, moved)
                          setForm((c) => ({ ...c, mainImages: next }))
                        }}
                        className={`relative group cursor-grab active:cursor-grabbing rounded-xl border bg-white overflow-hidden transition-all ${selectedPasteTarget === `main-${idx}` ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 hover:border-blue-400'}`}
                      >
                        {idx === 0 && <span className="absolute top-1.5 left-1.5 z-10 rounded px-1.5 py-0.5 text-[9px] font-bold bg-blue-600 text-white">封面</span>}
                        <ImageCardUploader
                          value={img}
                          aspectRatio={1}
                          outputWidth={800}
                          outputHeight={800}
                          enablePaste={false}
                          onActivate={() => setSelectedPasteTarget(`main-${idx}`)}
                          onChange={(val) => { setSelectedPasteTarget(`main-${idx}`); updateMainImage(idx, val) }}
                          className="space-y-0"
                        />
                      </div>
                    ))}
                    <div className={`relative group rounded-xl overflow-hidden border bg-white transition-all ${selectedPasteTarget === 'main-new' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-dashed border-gray-200 hover:border-blue-400'}`}>
                      <ImageCardUploader
                        value={null}
                        aspectRatio={1}
                        outputWidth={800}
                        outputHeight={800}
                        enablePaste={false}
                        onActivate={() => setSelectedPasteTarget('main-new')}
                        onChange={(val) => { setSelectedPasteTarget('main-new'); addMainImage(val) }}
                        onFilesSelect={(vals) => {
                          setSelectedPasteTarget('main-new')
                          const filtered = vals.filter(Boolean)
                          if (filtered.length) setForm((c) => ({ ...c, mainImages: [...(c.mainImages || []), ...filtered] }))
                        }}
                        multiple={true}
                        className="space-y-0"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-400">支持粘贴或拖拽排序</p>
                </section>

                {/* 附图 */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">附图 ({(form.images || []).length})</h4>
                    <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">3:4</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(form.images || []).map((img, idx) => (
                      <div
                        key={idx}
                        draggable={true}
                        onDragStart={(e) => { e.dataTransfer.setData('sourceIndex', idx.toString()); e.currentTarget.classList.add('opacity-50', 'scale-95') }}
                        onDragEnd={(e) => e.currentTarget.classList.remove('opacity-50', 'scale-95')}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const src = parseInt(e.dataTransfer.getData('sourceIndex'))
                          if (src === idx) return
                          const next = [...(form.images || [])]
                          const [moved] = next.splice(src, 1)
                          next.splice(idx, 0, moved)
                          setForm((c) => ({ ...c, images: next }))
                        }}
                        className={`relative group cursor-grab active:cursor-grabbing rounded-xl border bg-white overflow-hidden transition-all ${selectedPasteTarget === `gallery-${idx}` ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 hover:border-blue-400'}`}
                      >
                        <ImageCardUploader
                          value={img}
                          aspectRatio={3 / 4}
                          outputWidth={800}
                          outputHeight={1067}
                          enablePaste={false}
                          onActivate={() => setSelectedPasteTarget(`gallery-${idx}`)}
                          onChange={(val) => { setSelectedPasteTarget(`gallery-${idx}`); updateGalleryImage(idx, val) }}
                          className="space-y-0"
                        />
                      </div>
                    ))}
                    <div className={`relative group rounded-xl overflow-hidden border bg-white transition-all ${selectedPasteTarget === 'gallery-new' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-dashed border-gray-200 hover:border-blue-400'}`}>
                      <ImageCardUploader
                        value={null}
                        aspectRatio={3 / 4}
                        outputWidth={800}
                        outputHeight={1067}
                        enablePaste={false}
                        onActivate={() => setSelectedPasteTarget('gallery-new')}
                        onChange={(val) => { setSelectedPasteTarget('gallery-new'); addGalleryImage(val) }}
                        onFilesSelect={(vals) => {
                          setSelectedPasteTarget('gallery-new')
                          const filtered = vals.filter(Boolean)
                          if (filtered.length) setForm((c) => ({ ...c, images: [...(c.images || []), ...filtered] }))
                        }}
                        multiple={true}
                        className="space-y-0"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-gray-400">点击卡片粘贴或按住拖拽排序</p>
                </section>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
