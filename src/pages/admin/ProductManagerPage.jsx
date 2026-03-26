import { useCallback, useEffect, useMemo, useState } from 'react'

import { api } from '../../lib/api'
import { useApp } from '../../lib/app-context'
import { matchesProductQuery } from '../../lib/product-search'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '../../components/ui/modal'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { FileUploadField } from '../../components/ui/file-upload'
import ProductManagerToolbar from './product-manager/ProductManagerToolbar'
import ProductManagerGrid from './product-manager/ProductManagerGrid'
import ProductManagerCategoryModal from './product-manager/ProductManagerCategoryModal'

const EMPTY_FORM = {
  id: null,
  name: '',
  description: '',
  price: '',
  stock: '',
  image_url: '',
  category: 'Awards',
  customization: '',
}

function resolveApiError(error, fallback = '请稍后重试') {
  const payload = error?.response?.data
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim()
  }
  if (payload && typeof payload === 'object') {
    const explicit = [payload.error, payload.message, payload.detail].find((item) => typeof item === 'string' && item.trim())
    if (explicit) return explicit.trim()
  }
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim()
  }
  return fallback
}

export default function ProductManagerPage({ scope = 'admin' }) {
  const { products, reloadProducts, reloadProductCategories, pushToast, session } = useApp()
  const [workspaceProducts, setWorkspaceProducts] = useState([])
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [categoryCatalog, setCategoryCatalog] = useState([])
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategorySort, setNewCategorySort] = useState('0')
  const [categoryDrafts, setCategoryDrafts] = useState({})
  const [categoryPendingAction, setCategoryPendingAction] = useState(null)
  const [categoryConfirmOpen, setCategoryConfirmOpen] = useState(false)
  const [categorySaving, setCategorySaving] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All Products')
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [pendingSavePayload, setPendingSavePayload] = useState(null)

  const visibleProducts = scope === 'workspace' ? workspaceProducts : products
  const canManageCategoryDictionary = Boolean(session && ['user', 'admin', 'superadmin'].includes(session.role))
  const canEditProduct = useCallback(
    (product) => {
      if (!session) return false
      if (['admin', 'superadmin'].includes(session.role)) return true
      return session.role === 'user' ? product?.owner_id === session?.user?.id : false
    },
    [session],
  )
  const canDeleteProduct = canEditProduct

  const tabs = useMemo(() => {
    const uniqueCategories = Array.from(new Set(visibleProducts.map((product) => product.category).filter(Boolean)))
    return [
      {
        label: 'All Products',
        value: 'All Products',
        count: visibleProducts.length,
      },
      {
        label: 'Most Purchased',
        value: 'Most Purchased',
        count: visibleProducts.filter((product) => Number(product.sales_count || 0) > 0).length,
      },
      ...uniqueCategories.map((category) => ({
        label: category,
        value: category,
        count: visibleProducts.filter((product) => product.category === category).length,
      })),
    ]
  }, [visibleProducts])

  const categorySelectOptions = useMemo(() => {
    const sortedCategories = [...categoryCatalog].sort((left, right) => left.sort_order - right.sort_order || left.name.localeCompare(right.name))
    if (!form.category) {
      return sortedCategories
    }
    if (sortedCategories.some((item) => item.name === form.category)) {
      return sortedCategories
    }
    return [...sortedCategories, { id: '__current__', name: form.category, sort_order: 0, active: true }]
  }, [categoryCatalog, form.category])

  const filteredProducts = useMemo(() => {
    const next = visibleProducts.filter((product) => {
      const matchesSearch = matchesProductQuery(product, search)
      const matchesCategory =
        activeCategory === 'All Products' ||
        activeCategory === 'Most Purchased' ||
        product.category === activeCategory
      return matchesSearch && matchesCategory
    })

    if (activeCategory === 'Most Purchased') {
      return [...next].sort((left, right) => Number(right.sales_count || 0) - Number(left.sales_count || 0))
    }

    return next
  }, [activeCategory, search, visibleProducts])

  const customizationError = useMemo(() => {
    const content = form.customization.trim()
    if (!content) return ''
    try {
      JSON.parse(content)
      return ''
    } catch {
      return 'JSON 格式有误，请检查括号、引号和逗号。'
    }
  }, [form.customization])

  const refreshVisibleProducts = useCallback(async () => {
    if (scope === 'workspace') {
      setWorkspaceLoading(true)
      try {
        const response = await api.get('/workspace/products')
        setWorkspaceProducts(response.data || [])
      } catch (error) {
        pushToast('error', '商品加载失败', resolveApiError(error))
      } finally {
        setWorkspaceLoading(false)
      }
      return
    }

    await reloadProducts()
  }, [pushToast, reloadProducts, scope])

  const refreshCategoryCatalog = useCallback(async () => {
    setCategoryLoading(true)
    try {
      const response = await api.get('/admin/product-categories')
      const categories = response.data || []
      setCategoryCatalog(categories)
      setCategoryDrafts(
        categories.reduce((acc, item) => {
          acc[item.id] = { name: item.name, sort_order: item.sort_order, active: item.active }
          return acc
        }, {}),
      )
      await reloadProductCategories()
    } finally {
      setCategoryLoading(false)
    }
  }, [reloadProductCategories])

  useEffect(() => {
    refreshVisibleProducts()
  }, [refreshVisibleProducts])

  useEffect(() => {
    if (!canManageCategoryDictionary) return
    refreshCategoryCatalog().catch((error) => {
      pushToast('error', '类型字典加载失败', resolveApiError(error))
    })
  }, [canManageCategoryDictionary, refreshCategoryCatalog, pushToast])

  const openCreateDrawer = () => {
    setSelectedId(null)
    const defaultCategory = categoryCatalog.find((item) => item.active)?.name || categoryCatalog[0]?.name || ''
    setForm({
      ...EMPTY_FORM,
      category: defaultCategory,
    })
    setAdvancedOpen(false)
    setDrawerOpen(true)
  }

  const openEditDrawer = (product) => {
    setSelectedId(product.id)
    setForm({
      id: product.id,
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      stock: String(product.stock || ''),
      image_url: product.image_url || '',
      category: product.category || categoryCatalog.find((item) => item.active)?.name || categoryCatalog[0]?.name || '',
      customization: JSON.stringify(product.customization || {}, null, 2),
    })
    setAdvancedOpen(Boolean(product.customization && Object.keys(product.customization || {}).length))
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
  }

  const prepareSaveProduct = () => {
    if (!form.name.trim()) {
      pushToast('error', '请输入商品名称')
      return null
    }

    let customization = {}
    if (form.customization.trim()) {
      try {
        customization = JSON.parse(form.customization)
      } catch {
        pushToast('error', '自定义 JSON 格式有误')
        return null
      }
    }

    return {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      image_url: form.image_url.trim(),
      category: form.category.trim(),
      customization,
    }
  }

  const requestSaveProduct = () => {
    const payload = prepareSaveProduct()
    if (!payload) return
    setPendingSavePayload(payload)
    setSaveConfirmOpen(true)
  }

  const saveProduct = async () => {
    if (!pendingSavePayload) return
    setSaving(true)
    try {
      let finalPayload = { ...pendingSavePayload }

      // 如果包含 base64 格式的商品图，则先进行统一上传
      if (finalPayload.image_url && finalPayload.image_url.startsWith('data:')) {
        const uploadRes = await api.post('/upload', { image: finalPayload.image_url })
        finalPayload.image_url = uploadRes.data.key
      }


      if (selectedId) {
        await api.put(`/products/${selectedId}`, finalPayload)
        pushToast('success', '商品已更新')
      } else {
        await api.post('/products', finalPayload)
        pushToast('success', '商品已创建')
      }

      if (scope === 'admin') {
        await refreshCategoryCatalog()
      } else {
        await reloadProductCategories()
      }

      await refreshVisibleProducts()
      closeDrawer()
      setSaveConfirmOpen(false)
      setPendingSavePayload(null)
    } catch (error) {
      pushToast('error', '保存失败', resolveApiError(error))
    } finally {
      setSaving(false)
    }
  }

  const requestDeleteProduct = (product) => {
    setPendingDelete(product)
    setDeleteConfirmOpen(true)
  }

  const requestCreateCategory = () => {
    const name = newCategoryName.trim()
    if (!name) {
      pushToast('error', '请输入类型名称')
      return
    }

    setCategoryPendingAction({
      type: 'create',
      payload: {
        name,
        sort_order: Number(newCategorySort || 0),
      },
    })
    setCategoryConfirmOpen(true)
  }

  const requestUpdateCategory = (category) => {
    const draft = categoryDrafts[category.id] || {}
    const name = (draft.name || '').trim()
    if (!name) {
      pushToast('error', '请输入类型名称')
      return
    }

    setCategoryPendingAction({
      type: 'update',
      category,
      payload: {
        name,
        sort_order: Number(draft.sort_order ?? category.sort_order ?? 0),
      },
    })
    setCategoryConfirmOpen(true)
  }

  const requestToggleCategory = (category) => {
    setCategoryPendingAction({
      type: 'toggle',
      category,
      payload: { active: !category.active },
    })
    setCategoryConfirmOpen(true)
  }

  const applyCategoryAction = async () => {
    if (!categoryPendingAction) return
    setCategorySaving(true)
    try {
      if (categoryPendingAction.type === 'create') {
        await api.post('/admin/product-categories', {
          name: categoryPendingAction.payload.name,
          sort_order: categoryPendingAction.payload.sort_order,
          active: true,
        })
        pushToast('success', '类型已创建')
      } else if (categoryPendingAction.type === 'update') {
        await api.patch(`/admin/product-categories/${categoryPendingAction.category.id}`, categoryPendingAction.payload)
        pushToast('success', '类型已更新')
      } else if (categoryPendingAction.type === 'toggle') {
        await api.patch(`/admin/product-categories/${categoryPendingAction.category.id}`, categoryPendingAction.payload)
        pushToast('success', categoryPendingAction.payload.active ? '类型已启用' : '类型已停用')
      }

      await refreshCategoryCatalog()
      await refreshVisibleProducts()
      setCategoryConfirmOpen(false)
      setCategoryPendingAction(null)
      setNewCategoryName('')
      setNewCategorySort('0')
    } catch (error) {
      pushToast('error', '类型操作失败', resolveApiError(error))
    } finally {
      setCategorySaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <ProductManagerToolbar
        tabs={tabs}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        search={search}
        setSearch={setSearch}
        canOpenCategoryModal={canManageCategoryDictionary}
        onOpenCategoryModal={() => setCategoryModalOpen(true)}
        onRefresh={refreshVisibleProducts}
        onCreate={openCreateDrawer}
      />

      <div className="space-y-6">
        <ProductManagerGrid
          products={filteredProducts}
          loading={scope === 'workspace' ? workspaceLoading : false}
          canEditProduct={canEditProduct}
          canDeleteProduct={canDeleteProduct}
          onEdit={openEditDrawer}
          onDelete={requestDeleteProduct}
          onReset={() => {
            setSearch('')
            setActiveCategory('All Products')
          }}
        />
      </div>

      {canManageCategoryDictionary ? (
        <ProductManagerCategoryModal
          open={categoryModalOpen}
          onOpenChange={setCategoryModalOpen}
          categoryLoading={categoryLoading}
          categoryCatalog={categoryCatalog}
          categoryDrafts={categoryDrafts}
          setCategoryDrafts={setCategoryDrafts}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          newCategorySort={newCategorySort}
          setNewCategorySort={setNewCategorySort}
          onCreateCategory={requestCreateCategory}
          onUpdateCategory={requestUpdateCategory}
          onToggleCategory={requestToggleCategory}
        />
      ) : null}

      <Modal open={drawerOpen} onOpenChange={setDrawerOpen}>
        <ModalContent className="max-w-6xl border-white/10 bg-[#111114]/96 text-zinc-100 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <ModalHeader className="border-b border-white/10 bg-white/5">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                {selectedId ? '编辑商品' : '新增商品'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                按顺序填写信息，最后在底部统一提交。
              </p>
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
              <div className="space-y-4">
                <FileUploadField
                  label="商品图片"
                  value={form.image_url}
                  onChange={(nextValue) => setForm((current) => ({ ...current, image_url: nextValue }))}
                  helperText="选择图片后会直接转成前端字符串并实时预览"
                />
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-zinc-300">商品名称</span>
                    <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-zinc-300">商品类型</span>
                    <select
                      value={form.category}
                      onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                      className="h-11 w-full rounded-2xl border border-white/10 bg-white/6 px-4 text-sm text-white backdrop-blur-xl"
                    >
                      <option value="">请选择类型</option>
                      {categorySelectOptions.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-zinc-300">价格</span>
                    <Input type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-zinc-300">库存</span>
                    <Input type="number" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} />
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-zinc-300">商品描述</span>
                  <Textarea
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    rows={3}
                  />
                </label>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-zinc-200">高级设置（可选）</div>
                      <div className="mt-1 text-xs text-zinc-500">普通商品可跳过，只有需要特殊定制时再展开。</div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setAdvancedOpen((current) => !current)}
                      className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10"
                    >
                      {advancedOpen ? '收起设置' : '展开设置'}
                    </Button>
                  </div>

                  {advancedOpen ? (
                    <div className="mt-4 space-y-3">
                      <label className="block space-y-2">
                        <span className="text-sm font-medium text-zinc-300">自定义 JSON</span>
                        <Textarea
                          value={form.customization}
                          onChange={(event) => setForm((current) => ({ ...current, customization: event.target.value }))}
                          rows={5}
                          placeholder={'{\n  "type": "Engraving",\n  "fields": ["Name"]\n}'}
                        />
                      </label>
                      {customizationError ? <div className="text-xs text-rose-400">{customizationError}</div> : null}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              customization: '{\n  "type": "Engraving",\n  "fields": ["Name"]\n}',
                            }))
                          }
                          className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10"
                        >
                          填入示例模板
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setForm((current) => ({ ...current, customization: '' }))}
                          className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10"
                        >
                          清空配置
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={closeDrawer} className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10">
                取消
              </Button>
              <Button onClick={requestSaveProduct} disabled={saving}>
                {saving ? '保存中...' : '确认保存'}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={saveConfirmOpen}
        title="确认保存商品"
        description={
          selectedId
            ? `你正在修改「${form.name || '未命名商品'}」的商品信息，确认后将立即更新。`
            : `你正在创建「${form.name || '未命名商品'}」，确认后将立即提交。`
        }
        confirmLabel="确认提交"
        cancelLabel="返回编辑"
        loading={saving}
        onOpenChange={(open) => {
          setSaveConfirmOpen(open)
          if (!open) {
            setPendingSavePayload(null)
          }
        }}
        onConfirm={saveProduct}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="确认删除商品"
        description={`删除后商品「${pendingDelete?.name || ''}」将从列表中移除，此操作不可恢复。`}
        confirmLabel="确认删除"
        cancelLabel="取消"
        destructive
        loading={saving}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open)
          if (!open) {
            setPendingDelete(null)
          }
        }}
        onConfirm={async () => {
          if (!pendingDelete) return
          setSaving(true)
          try {
            await api.delete(`/products/${pendingDelete.id}`)
            pushToast('success', '商品已删除')
            await refreshVisibleProducts()
            setDeleteConfirmOpen(false)
            setPendingDelete(null)
            if (selectedId === pendingDelete.id) {
              closeDrawer()
            }
          } catch (error) {
            pushToast('error', '删除失败', resolveApiError(error))
          } finally {
            setSaving(false)
          }
        }}
      />

      <ConfirmDialog
        open={categoryConfirmOpen}
        title={
          categoryPendingAction?.type === 'create'
            ? '确认新增类型'
            : categoryPendingAction?.type === 'toggle'
              ? categoryPendingAction?.payload?.active
                ? '确认启用类型'
                : '确认停用类型'
              : '确认更新类型'
        }
        description={
          categoryPendingAction?.type === 'create'
            ? `你正在新增类型「${categoryPendingAction?.payload?.name || ''}」，确认后将立即生效。`
            : categoryPendingAction?.type === 'toggle'
              ? `你正在${categoryPendingAction?.payload?.active ? '启用' : '停用'}类型「${categoryPendingAction?.category?.name || ''}」。`
              : `你正在更新类型「${categoryPendingAction?.category?.name || ''}」，确认后会立即保存。`
        }
        confirmLabel="确认提交"
        cancelLabel="返回编辑"
        loading={categorySaving}
        onOpenChange={(open) => {
          setCategoryConfirmOpen(open)
          if (!open) {
            setCategoryPendingAction(null)
          }
        }}
        onConfirm={applyCategoryAction}
      />
    </div>
  )
}
