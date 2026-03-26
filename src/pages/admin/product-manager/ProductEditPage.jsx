import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { ImageCardUploader } from '../../../components/ui/ImageCardUploader'
import { useApp } from '../../../lib/app-context'
import { api } from '../../../lib/api'
import { ArrowLeft, Save, Globe, Eye } from 'lucide-react'

const EMPTY_FORM = {
  name: '',
  price: '',
  stock: 99,
  description: '',
  category: '',
  image_url: '',
  images: [],
}

export default function ProductEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pushToast, categoryOptions, reloadProducts } = useApp()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

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
      // Step 1: Initial Sync (Database Metadata)
      const initialPayload = { 
        ...form,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 99
      }
      
      let productId = id
      if (isEdit) {
        await api.put(`/products/${id}`, initialPayload)
      } else {
        const res = await api.post('/products', initialPayload)
        productId = res.data.id || res.data._id
      }
      pushToast('info', '元数据已同步', '正在上传资产...')

      // Step 2: Asset Upload (OSS)
      let finalImageUrl = form.image_url
      let finalImages = [...(form.images || [])]
      let needsUpdate = false

      if (finalImageUrl?.startsWith('data:')) {
        const uploadRes = await api.post('/upload', { image: finalImageUrl })
        finalImageUrl = uploadRes.data.key
        needsUpdate = true
      }

      if (finalImages.length > 0) {
        const uploaded = await Promise.all(
          finalImages.map(async (img) => {
            if (img.startsWith('data:')) {
              const res = await api.post('/upload', { image: img })
              needsUpdate = true
              return res.data.key
            }
            return img
          })
        )
        finalImages = uploaded
      }

      // Step 3: Final Sync (Reconcile OSS Keys)
      if (needsUpdate) {
        await api.put(`/products/${productId}`, {
          ...initialPayload,
          image_url: finalImageUrl,
          images: finalImages
        })
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

  const updateGalleryImage = (index, val) => {
    const next = [...(form.images || [])]
    if (val === null) {
      next.splice(index, 1)
    } else {
      next[index] = val
    }
    setForm((c) => ({ ...c, images: next }))
  }

  const addGalleryImage = (val) => {
    if ((form.images || []).length >= 5) return
    setForm((c) => ({ ...c, images: [...(form.images || []), val] }))
  }

  const moveGalleryImage = (e, index, direction) => {
    e.stopPropagation()
    const next = [...(form.images || [])]
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= next.length) return
    const temp = next[index]
    next[index] = next[targetIndex]
    next[targetIndex] = temp
    setForm((c) => ({ ...c, images: next }))
  }

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">正在拉取商品档案...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#f9f9fe]">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-black/5 px-8 py-5">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 ring-1 ring-black/5 transition-all hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 transition-transform group-hover:-translate-x-1" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {isEdit ? '编辑产品档案' : '录入新产品'}
                </h1>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ring-1 ring-blue-500/20">
                  {isEdit ? 'Manual Mode' : 'New Entry'}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Administration Portal / Product Manager / {isEdit ? `ID: ${id}` : 'Draft'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:scale-95 disabled:scale-100 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? '正在同步数据...' : '同步并保存档案'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex w-full mx-auto bg-white">
          {/* Left Panel: Content (Form) */}
          <div className="flex-1 h-full overflow-y-auto p-12 scrollbar-hide border-r border-black/5">
            <div className="max-w-4xl mx-auto space-y-12">
              {/* Basic Info */}
              <section className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                <header className="flex items-center justify-between border-b border-black/5 pb-4">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-3">
                    <div className="h-4 w-1 bg-blue-600 rounded-full"></div>
                    1. 产品档案定义 Product Definition
                  </h3>
                </header>

                <div className="grid gap-8">
                  <label className="block space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">商品名称 Product Name</span>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                      className="h-14 border-none bg-slate-50/80 text-base font-bold text-slate-900 px-6 rounded-2xl focus:bg-white ring-1 ring-black/5 focus:ring-blue-500 transition-all"
                      placeholder="输入商品标题..."
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">零售标价 Price (CNY)</span>
                    <div className="relative group">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-900">¥</span>
                      <Input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))}
                        className="h-14 border-none bg-slate-50/80 text-base font-black text-slate-900 pl-10 pr-6 rounded-2xl focus:bg-white ring-1 ring-black/5 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">产品目录分类 Category</span>
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}
                        className="h-14 w-full appearance-none rounded-2xl border-none bg-slate-50/80 px-6 text-sm font-bold text-slate-900 outline-none ring-1 ring-black/5 focus:bg-white focus:ring-blue-500 transition-all"
                      >
                        <option value="">点击选择品类...</option>
                        {categoryOptions.filter(o => o.value !== 'all').map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">
                        <Globe className="h-4 w-4" />
                      </div>
                    </div>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">营销描述档案 Description</span>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                      rows={10}
                      className="resize-none border-none bg-slate-50/80 text-sm font-medium leading-relaxed text-slate-700 p-6 rounded-2xl focus:bg-white ring-1 ring-black/5 focus:ring-blue-500 transition-all scrollbar-hide"
                      placeholder="输入详细描述..."
                    />
                  </label>
                </div>
              </section>

            </div>
          </div>

          {/* Right Panel: Media */}
          <aside className="w-[520px] h-full flex flex-col overflow-y-auto bg-slate-50/50 p-12 scrollbar-hide">
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <header className="flex items-center justify-between border-b border-black/5 pb-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">2. 视觉媒体库 Visual Assets</h3>
              </header>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">主展示封面 Cover</h4>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ring-1 ring-blue-500/10 uppercase tracking-tighter">HD 1200x1600</span>
                </div>
                <div className="max-w-[240px] mx-auto">
                  <ImageCardUploader
                    value={form.image_url}
                    onChange={(val) => setForm((c) => ({ ...c, image_url: val }))}
                  />
                </div>
              </section>

              <section className="space-y-6 pt-6 border-t border-black/5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">画廊附录集 Gallery ({(form.images || []).length}/5)</h4>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Single Row Mode</span>
                </div>

                <div className="grid grid-cols-5 gap-2.5">
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
                      className="relative group cursor-grab active:cursor-grabbing transition-all hover:ring-2 hover:ring-blue-500 rounded-3xl overflow-hidden"
                    >
                      <ImageCardUploader
                        value={img}
                        onChange={(val) => updateGalleryImage(idx, val)}
                        className="space-y-0"
                      />
                    </div>
                  ))}
                  {(form.images || []).length < 5 && (
                    <ImageCardUploader
                      value={null}
                      onChange={(val) => addGalleryImage(val)}
                      onFilesSelect={(vals) => {
                        const current = form.images || []
                        const remaining = 5 - current.length
                        const toAdd = vals.slice(0, remaining)
                        setForm(c => ({ ...c, images: [...current, ...toAdd] }))
                      }}
                      multiple={true}
                      className="space-y-0"
                    />
                  )}
                </div>
              </section>

            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
