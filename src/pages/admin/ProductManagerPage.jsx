import { useCallback, useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'

import { api } from '../../lib/api'
import { useApp } from '../../lib/app-context'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../../components/ui/sheet'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import { formatCurrency } from '../../lib/format'

const EMPTY_FORM = {
  id: null,
  name: '',
  description: '',
  price: '',
  stock: '',
  image_url: '',
  category: 'Awards',
  customization: '{\n  "type": "Engraving",\n  "fields": ["Name"]\n}',
}

export default function ProductManagerPage({ scope = 'admin' }) {
  const { products, reloadProducts, reloadProductCategories, pushToast, categoryOptions, isAdmin } = useApp()
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
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [pendingSavePayload, setPendingSavePayload] = useState(null)

  const visibleProducts = scope === 'workspace' ? workspaceProducts : products
  const canCustomCategory = scope === 'admin' && isAdmin

  const categories = useMemo(
    () => ['all', ...new Set(visibleProducts.map((product) => product.category).filter(Boolean))],
    [visibleProducts],
  )

  const workspaceCategoryOptions = useMemo(() => {
    const activeOptions = categoryOptions.filter((item) => item.value !== 'all')
    if (scope !== 'workspace' || !form.category) {
      return activeOptions
    }
    if (activeOptions.some((item) => item.value === form.category)) {
      return activeOptions
    }
    return [...activeOptions, { label: form.category, value: form.category }]
  }, [categoryOptions, form.category, scope])

  const filteredProducts = useMemo(() => {
    return visibleProducts.filter((product) => {
      const matchesSearch = `${product.name} ${product.description || ''}`.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || product.category === category
      return matchesSearch && matchesCategory
    })
  }, [visibleProducts, search, category])

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
    if (scope !== 'workspace') return

    let mounted = true
    setWorkspaceLoading(true)
    api
      .get('/workspace/products')
      .then((response) => {
        if (mounted) setWorkspaceProducts(response.data || [])
      })
      .catch(() => {
        if (mounted) pushToast('error', '商品加载失败')
      })
      .finally(() => {
        if (mounted) setWorkspaceLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [scope, pushToast])

  useEffect(() => {
    if (scope !== 'admin') return
    refreshCategoryCatalog().catch(() => {
      pushToast('error', '类型字典加载失败')
    })
  }, [scope, refreshCategoryCatalog, pushToast])

  const openCreateDrawer = () => {
    setSelectedId(null)
    const defaultCategory = (categoryOptions.find((item) => item.value !== 'all') || {}).value || ''
    setForm({
      ...EMPTY_FORM,
      category: defaultCategory,
    })
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
      category: product.category || (categoryOptions.find((item) => item.value !== 'all') || {}).value || '',
      customization: JSON.stringify(product.customization || {}, null, 2),
    })
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
      if (selectedId) {
        await api.put(`/products/${selectedId}`, pendingSavePayload)
        pushToast('success', '商品已更新')
      } else {
        await api.post('/products', pendingSavePayload)
        pushToast('success', '商品已创建')
      }
      if (scope === 'admin') {
        await refreshCategoryCatalog()
      } else {
        await reloadProductCategories()
      }
      await (scope === 'workspace' ? api.get('/workspace/products').then((response) => setWorkspaceProducts(response.data || [])) : reloadProducts())
      closeDrawer()
      setSaveConfirmOpen(false)
      setPendingSavePayload(null)
    } catch {
      pushToast('error', '保存失败')
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
      await reloadProducts()
      setCategoryConfirmOpen(false)
      setCategoryPendingAction(null)
      setNewCategoryName('')
      setNewCategorySort('0')
    } catch {
      pushToast('error', '类型操作失败')
    } finally {
      setCategorySaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>商品管理</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={scope === 'workspace' ? () => api.get('/workspace/products').then((response) => setWorkspaceProducts(response.data || [])) : reloadProducts}>
                <RefreshCw className="h-4 w-4" />
                刷新
              </Button>
              <Button onClick={openCreateDrawer}>
                <Plus className="h-4 w-4" />
                新增商品
              </Button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative w-full max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索商品名称、描述"
                className="pl-11"
              />
            </div>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? '全部分类' : item}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>库存</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(scope === 'workspace' ? workspaceLoading : false) ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={product.image_url} alt={product.name} className="h-14 w-14 rounded-2xl object-cover" />
                      <div>
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="line-clamp-1 text-sm text-slate-500">{product.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock <= 3 ? 'destructive' : 'secondary'}>
                      {product.stock <= 3 ? '库存紧张' : product.stock <= 10 ? '库存关注' : '库存充足'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEditDrawer(product)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => requestDeleteProduct(product)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {scope === 'admin' && isAdmin ? (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>类型字典</CardTitle>
              <Badge variant="outline">仅 Admin / SuperAdmin</Badge>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_120px_auto]">
              <Input
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="输入新类型名称"
              />
              <Input
                type="number"
                value={newCategorySort}
                onChange={(event) => setNewCategorySort(event.target.value)}
                placeholder="排序"
              />
              <Button onClick={requestCreateCategory}>
                <Plus className="h-4 w-4" />
                新增类型
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {categoryLoading ? (
              <div className="py-6 text-sm text-slate-500">正在加载类型字典...</div>
            ) : categoryCatalog.length ? (
              categoryCatalog.map((item) => {
                const draft = categoryDrafts[item.id] || { name: item.name, sort_order: item.sort_order, active: item.active }
                return (
                  <div key={item.id} className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_120px_120px_auto]">
                    <Input
                      value={draft.name}
                      onChange={(event) =>
                        setCategoryDrafts((current) => ({
                          ...current,
                          [item.id]: { ...draft, name: event.target.value },
                        }))
                      }
                      placeholder="类型名称"
                    />
                    <Input
                      type="number"
                      value={draft.sort_order}
                      onChange={(event) =>
                        setCategoryDrafts((current) => ({
                          ...current,
                          [item.id]: { ...draft, sort_order: event.target.value },
                        }))
                      }
                      placeholder="排序"
                    />
                    <div className="flex items-center justify-center">
                      <Badge variant={item.active ? 'default' : 'secondary'}>{item.active ? '启用' : '停用'}</Badge>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => requestToggleCategory({ ...item, active: item.active })}
                      >
                        {item.active ? '停用' : '启用'}
                      </Button>
                      <Button onClick={() => requestUpdateCategory(item)}>保存</Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-6 text-sm text-slate-500">还没有类型字典。</div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <SheetTitle>{selectedId ? '编辑商品' : '新增商品'}</SheetTitle>
                <SheetDescription className="mt-2">
                  点击确认按钮保存，表单会在右侧抽屉中完成编辑，不会打断当前页面上下文。
                </SheetDescription>
              </div>
              <Button onClick={requestSaveProduct} disabled={saving}>
                {saving ? '保存中...' : '确认保存'}
              </Button>
            </div>
          </SheetHeader>

          <SheetBody>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">商品名称</span>
                <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">商品类型</span>
                {canCustomCategory ? (
                  <>
                    <Input
                      list="product-category-options"
                      value={form.category}
                      onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                      placeholder="输入自定义类型，如 Premium Gifts"
                    />
                    <datalist id="product-category-options">
                      {[...categoryCatalog]
                        .sort((left, right) => left.sort_order - right.sort_order || left.name.localeCompare(right.name))
                        .map((item) => (
                          <option key={item.id} value={item.name} />
                        ))}
                    </datalist>
                  </>
                ) : (
                  <select
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"
                  >
                    <option value="">请选择类型</option>
                    {workspaceCategoryOptions
                      .map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                  </select>
                )}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">价格</span>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">库存</span>
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">图片链接</span>
                <Input
                  value={form.image_url}
                  onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">商品描述</span>
                <Textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">自定义 JSON</span>
                <Textarea
                  value={form.customization}
                  onChange={(event) => setForm((current) => ({ ...current, customization: event.target.value }))}
                  rows={4}
                />
              </label>
            </div>
          </SheetBody>

          <SheetFooter>
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={closeDrawer}>
                取消
              </Button>
              <Button onClick={requestSaveProduct} disabled={saving}>
                {saving ? '保存中...' : '确认保存'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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
            scope === 'workspace'
              ? api.get('/workspace/products').then((response) => setWorkspaceProducts(response.data || []))
              : reloadProducts()
            setDeleteConfirmOpen(false)
            setPendingDelete(null)
            if (selectedId === pendingDelete.id) {
              closeDrawer()
            }
          } catch {
            pushToast('error', '删除失败')
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
