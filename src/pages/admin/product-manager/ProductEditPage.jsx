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
  specs: '',
  category: '',
  image_url: '',
  images: [],
}

export default function ProductEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pushToast, categoryOptions, reloadProducts, reloadProductCategories } = useApp()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
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
        specs: product.specs || '',
        category: product.category || '',
        image_url: product.image_url || '',
        images: product.images || [],
      })
    } catch (err) {
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
    if (!form.name || !form.price) {
      pushToast('warning', '请填写必填项', '商品名称和价格为必填项')
      return
    }

    setSaving(true)
    try {
      pushToast('info', '正在保存', '图片正在上传中...')

      // 1. Upload base64 main image if needed
      let finalImageUrl = form.image_url
      if (finalImageUrl?.startsWith('data:')) {
        const uploadRes = await api.post('/upload', { image: finalImageUrl })
        finalImageUrl = uploadRes.data.key
      }

      // 2. Upload base64 gallery images if needed
      let finalImages = [...(form.images || [])]
      if (finalImages.length > 0) {
        const uploaded = await Promise.all(
          finalImages.map(async (img) => {
            if (img.startsWith('data:')) {
              const res = await api.post('/upload', { image: img })
              return res.data.key
            }
            if (img.includes('/uploads/')) {
              const parts = img.split('/uploads/')
              return 'uploads/' + parts[1].split('?')[0]
            }
            return img
          })
        )
        finalImages = uploaded
      }

      // Normalize main image key if it is a signed URL
      if (finalImageUrl && finalImageUrl.includes('/uploads/')) {
        const parts = finalImageUrl.split('/uploads/')
        finalImageUrl = 'uploads/' + parts[1].split('?')[0]
      }

      const finalPayload = {
        ...form,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 99,
        image_url: finalImageUrl,
        images: finalImages,
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

  const updateGalleryImage = useCallback((index, val) => {
    setForm((current) => {
      const next = [...(current.images || [])]
      if (val === null) {
        next.splice(index, 1)
      } else {
        next[index] = val
      }
      return { ...current, images: next }
    })
  }, [])

  const addGalleryImage = useCallback((val) => {
    setForm((current) => {
      const next = [...(current.images || [])]
      return { ...current, images: [...next, val] }
    })
  }, [])

  const moveGalleryImage = useCallback((e, index, direction) => {
    e.stopPropagation()
    setForm((current) => {
      const next = [...(current.images || [])]
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= next.length) return current
      const temp = next[index]
      next[index] = next[targetIndex]
      next[targetIndex] = temp
      return { ...current, images: next }
    })
  }, [])

  const handlePasteImage = useCallback(async (event) => {
    const pastedImage = await extractClipboardImage(event)
    if (!pastedImage) return

    event.preventDefault()
    event.stopPropagation()

    if (selectedPasteTarget === 'main') {
      setForm((current) => ({ ...current, image_url: pastedImage }))
      pushToast('success', '主图已选中', '已粘贴到主图位置')
      return
    }

    if (typeof selectedPasteTarget === 'string' && selectedPasteTarget.startsWith('gallery-')) {
      const suffix = selectedPasteTarget.slice('gallery-'.length)
      if (suffix === 'new') {
        addGalleryImage(pastedImage)
        pushToast('success', '附图已选中', '已粘贴到新附图位置')
        return
      }

      const index = Number(suffix)
      if (!Number.isNaN(index)) {
        updateGalleryImage(index, pastedImage)
        pushToast('success', '附图已选中', `已粘贴到第 ${index + 1} 张附图`)
        return
      }
    }

    setForm((current) => ({ ...current, image_url: pastedImage }))
    pushToast('success', '主图已选中', '已粘贴到主图位置')
  }, [addGalleryImage, pushToast, selectedPasteTarget, updateGalleryImage])

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
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">零售价格</span>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-900">¥</span>
                        <Input
                          type="number"
                          value={form.price}
                          onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))}
                          className="h-11 border border-gray-300 bg-white text-sm text-gray-900 pl-10 pr-4 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
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

                  <label className="block space-y-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">规格参数</span>
                      <span className="text-[10px] text-gray-400 font-normal">💡 提示：每一个规格属性必须占一行，以换行区分并生成不同的标签</span>
                    </div>
                    <Textarea
                      value={form.specs}
                      onChange={(e) => setForm((c) => ({ ...c, specs: e.target.value }))}
                      rows={4}
                      className="resize-none border border-gray-300 bg-white text-sm leading-relaxed text-gray-700 p-3 rounded-lg focus:border-blue-500 focus:ring-blue-500/20 scrollbar-hide"
                      placeholder={"请输入商品规格，例如：\n材质: K9水晶\n尺寸: 20cm x 12cm"}
                    />
                    {form.specs && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {form.specs
                          .split(/[\n,，;；]/)
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .map((spec, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-md bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 animate-fade-in"
                            >
                              {spec}
                            </span>
                          ))}
                      </div>
                    )}
                  </label>
                </div>
              </section>
            </div>
          </div>

          <aside className="h-full overflow-y-auto bg-gray-50 p-5 scrollbar-hide lg:p-8 xl:p-10" onPasteCapture={handlePasteImage}>
            <div className="mx-auto max-w-4xl space-y-6">
              <header className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-sm font-semibold tracking-wider text-gray-900">商品图片</h3>
              </header>

              <div className="grid gap-6 xl:grid-cols-[250px_1fr]">
                {/* Main Image column */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">主图</h4>
                    <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[9px] font-medium text-blue-700">800×800</span>
                  </div>
                  <div
                    className={`rounded-xl p-1 border border-gray-200 bg-white shadow-sm transition-all ${selectedPasteTarget === 'main' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20' : ''}`}
                  >
                    <ImageCardUploader
                      value={form.image_url}
                      aspectRatio={1}
                      outputWidth={800}
                      outputHeight={800}
                      enablePaste={false}
                      onActivate={() => setSelectedPasteTarget('main')}
                      onChange={(val) => {
                        setSelectedPasteTarget('main')
                        setForm((c) => ({ ...c, image_url: val }))
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-400">支持点击上传或剪贴板直接粘贴图片</p>
                </section>

                {/* Secondary Images column */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">附图 ({(form.images || []).length})</h4>
                    <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">3:4</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {(form.images || []).map((img, idx) => (
                      <div 
                        key={idx} 
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('sourceIndex', idx.toString())
                          e.currentTarget.classList.add('opacity-50', 'scale-95')
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.classList.remove('opacity-50', 'scale-95')
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const sourceIdx = parseInt(e.dataTransfer.getData('sourceIndex'))
                          if (sourceIdx === idx) return
                          const next = [...(form.images || [])]
                          const [moved] = next.splice(sourceIdx, 1)
                          next.splice(idx, 0, moved)
                          setForm(c => ({ ...c, images: next }))
                        }}
                        className={`relative group cursor-grab active:cursor-grabbing transition-all hover:border-blue-500 rounded-xl border border-gray-200 bg-white overflow-hidden ${selectedPasteTarget === `gallery-${idx}` ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50' : ''}`}
                      >
                        <ImageCardUploader
                          value={img}
                          aspectRatio={3 / 4}
                          outputWidth={800}
                          outputHeight={1067}
                          enablePaste={false}
                          onActivate={() => setSelectedPasteTarget(`gallery-${idx}`)}
                          onChange={(val) => {
                            setSelectedPasteTarget(`gallery-${idx}`)
                            updateGalleryImage(idx, val)
                          }}
                          className="space-y-0"
                        />
                      </div>
                    ))}
                    {true && (
                      <div
                        className={`relative group rounded-xl overflow-hidden border border-gray-200 bg-white transition-all ${selectedPasteTarget === 'gallery-new' ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50' : ''}`}
                      >
                        <ImageCardUploader
                          value={null}
                          aspectRatio={3 / 4}
                          outputWidth={800}
                          outputHeight={1067}
                          enablePaste={false}
                          onActivate={() => setSelectedPasteTarget('gallery-new')}
                          onChange={(val) => {
                            setSelectedPasteTarget('gallery-new')
                            addGalleryImage(val)
                          }}
                          onFilesSelect={(vals) => {
                            setSelectedPasteTarget('gallery-new')
                            const filtered = vals.filter(Boolean)
                            if (!filtered.length) return
                            setForm((current) => {
                              const currentImages = current.images || []
                              return { ...current, images: [...currentImages, ...filtered] }
                            })
                          }}
                          multiple={true}
                          className="space-y-0"
                        />
                      </div>
                    )}
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
