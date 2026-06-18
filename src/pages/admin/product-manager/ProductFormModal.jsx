import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { ImageCardUploader } from '../../../components/ui/ImageCardUploader'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '../../../components/ui/modal'

export default function ProductFormModal({
  open,
  onOpenChange,
  selectedId,
  form,
  setForm,
  categorySelectOptions,
  saving,
  onCancel,
  onSave,
}) {
  const updateGalleryImage = (index, val) => {
    setForm((current) => {
      const next = [...(current.images || [])]
      if (val === null) {
        next.splice(index, 1)
      } else {
        next[index] = val
      }
      return { ...current, images: next }
    })
  }

  const addGalleryImage = (val) => {
    setForm((current) => {
      const next = [...(current.images || [])]
      return { ...current, images: [...next, val] }
    })
  }

  const moveGalleryImage = (e, index, direction) => {
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
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent showClose={false} className="h-[85vh] max-w-7xl overflow-hidden border border-gray-200 bg-gray-50 text-gray-900 shadow-xl rounded-xl">
        <ModalHeader className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                {selectedId ? '编辑商品档案' : '录入新商品'}
              </h2>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-gray-500">
                Product Management System Dashboard
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-500 border border-gray-200">
              ID: {selectedId || 'NEW'}
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="min-h-0 flex-1 overflow-hidden p-0">
          <div className="grid h-full lg:grid-cols-[440px_minmax(0,1fr)]">
            <div className="flex h-full flex-col overflow-y-auto border-r border-gray-200 bg-gray-50 p-8 scrollbar-hide">
              <div className="space-y-10">
                <ImageCardUploader
                  label="主展示封面图 Main Cover (800×800)"
                  value={form.image_url}
                  aspectRatio={1}
                  outputWidth={800}
                  outputHeight={800}
                  onChange={(val) => setForm((c) => ({ ...c, image_url: val }))}
                />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">附属画廊库 Sub-Gallery ({ (form.images || []).length })</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {(form.images || []).map((img, idx) => (
                      <div key={idx} className="relative group">
                        <ImageCardUploader
                          value={img}
                          aspectRatio={3 / 4}
                          outputWidth={800}
                          outputHeight={1067}
                          onChange={(val) => updateGalleryImage(idx, val)}
                          className="space-y-0"
                        />
                        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => moveGalleryImage(e, idx, -1)}
                            disabled={idx === 0}
                            className="bg-white border border-gray-200 p-1 rounded-md text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-40"
                          >
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 17l-7-7h14l-7 7z" transform="rotate(90 10 10)" /></svg>
                          </button>
                          <button
                            onClick={(e) => moveGalleryImage(e, idx, 1)}
                            disabled={idx === (form.images || []).length - 1}
                            className="bg-white border border-gray-200 p-1 rounded-md text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-40"
                          >
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M10 17l-7-7h14l-7 7z" transform="rotate(-90 10 10)" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    {true && (
                      <ImageCardUploader
                        value={null}
                        aspectRatio={3 / 4}
                        outputWidth={800}
                        outputHeight={1067}
                        onChange={(val) => addGalleryImage(val)}
                        className="space-y-0"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col overflow-y-auto bg-white p-8 scrollbar-hide">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h3 className="border-b border-gray-200 pb-3 text-sm font-bold uppercase tracking-widest text-gray-900 flex items-center justify-between">
                    <span>基础信息 Essential Info</span>
                  </h3>

                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">商品名称</span>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                      className="h-12 border-gray-300 bg-white text-gray-900 text-sm focus:ring-blue-500/20 focus:border-blue-500 rounded-lg"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-6">
                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">零售价格 (CNY)</span>
                      <Input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))}
                        className="h-12 border-gray-300 bg-white text-gray-900 text-sm focus:ring-blue-500/20 focus:border-blue-500 rounded-lg"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">库存</span>
                      <Input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm((c) => ({ ...c, stock: e.target.value }))}
                        className="h-12 border-gray-300 bg-white text-gray-900 text-sm focus:ring-blue-500/20 focus:border-blue-500 rounded-lg"
                      />
                    </label>
                  </div>

                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">产品目录分类</span>
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}
                        className="h-12 w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-blue-500/20"
                      >
                        <option value="">点击选择...</option>
                        {categorySelectOptions.map((item) => (
                          <option key={item.id} value={item.name}>{item.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                      </div>
                    </div>
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">描述</span>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                      rows={6}
                      className="resize-none border-gray-300 bg-white text-gray-900 text-sm focus:border-blue-500/20 rounded-lg"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex-shrink-0 border-t border-gray-200 bg-white p-4 px-6">
          <div className="flex w-full items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              System Sync: Ready
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="h-12 rounded-lg border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-8 text-sm font-semibold transition-colors"
              >
                取消
              </Button>
              <Button
                onClick={onSave}
                disabled={saving}
                className="h-12 rounded-lg bg-blue-700 hover:bg-blue-800 px-10 text-sm font-semibold text-white transition-colors border-0"
              >
                {saving ? '正在同步...' : '确认发布商品'}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
