import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '../../lib/api'
import { getApiErrorMessage } from '../../lib/api-error'
import { useApp } from '../../lib/app-context'
import { matchesProductQuery } from '../../lib/product-search'
import { ConfirmDialog } from '../../components/ui/confirm-dialog'
import ProductManagerToolbar from './product-manager/ProductManagerToolbar'
import ProductManagerGrid from './product-manager/ProductManagerGrid'
import ProductManagerCategoryModal from './product-manager/ProductManagerCategoryModal'

const ADMIN_PAGE_SIZE = 24

export default function ProductManagerPage({ scope = 'admin' }) {
  const navigate = useNavigate()
  const { products, reloadProducts, reloadProductCategories, pushToast, session, productManagerFilters, setProductManagerFilters } = useApp()
  const [workspaceProducts, setWorkspaceProducts] = useState([])
  const [workspaceLoading, setWorkspaceLoading] = useState(false)
  const [adminProducts, setAdminProducts] = useState([])
  const [adminLoading, setAdminLoading] = useState(false)
  const { search, activeCategory, page: adminPage } = productManagerFilters[scope]
  const [adminTotalPages, setAdminTotalPages] = useState(1)
  const [categoryCatalog, setCategoryCatalog] = useState([])
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategorySort, setNewCategorySort] = useState('0')
  const [categoryDrafts, setCategoryDrafts] = useState({})
  const [categoryPendingAction, setCategoryPendingAction] = useState(null)
  const [categoryConfirmOpen, setCategoryConfirmOpen] = useState(false)
  const [categorySaving, setCategorySaving] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const setSearch = useCallback(
    (value) =>
      setProductManagerFilters((prev) => ({
        ...prev,
        [scope]: { ...prev[scope], search: value, page: 1 },
      })),
    [scope, setProductManagerFilters],
  )
  const setActiveCategory = useCallback(
    (value) =>
      setProductManagerFilters((prev) => ({
        ...prev,
        [scope]: { ...prev[scope], activeCategory: value, page: 1 },
      })),
    [scope, setProductManagerFilters],
  )
  const setAdminPage = useCallback(
    (updater) =>
      setProductManagerFilters((prev) => ({
        ...prev,
        [scope]: {
          ...prev[scope],
          page: typeof updater === 'function' ? updater(prev[scope].page) : updater,
        },
      })),
    [scope, setProductManagerFilters],
  )

  const visibleProducts = scope === 'workspace' ? workspaceProducts : products
  const canManageCategoryDictionary = Boolean(session && ['user', 'admin', 'superadmin'].includes(session.role))
  const canEditProduct = useCallback(
    (product) => {
      if (!session || !product) return false
      if (scope === 'workspace') {
        return product?.owner_id === session?.user?.id
      }
      return ['admin', 'superadmin'].includes(session.role) || product?.owner_id === session?.user?.id
    },
    [scope, session],
  )
  const canDeleteProduct = canEditProduct

  const tabs = useMemo(() => {
    const categoryItems =
      categoryCatalog.length > 0
        ? categoryCatalog.filter((c) => c.active).sort((a, b) => a.sort_order - b.sort_order)
        : Array.from(new Set(visibleProducts.map((p) => p.category).filter(Boolean))).map((name) => ({ name }))

    return [
      {
        label: '全部商品',
        value: '全部商品',
        count: visibleProducts.length,
      },
      ...categoryItems.map((category) => ({
        label: category.name,
        value: category.name,
        count: visibleProducts.filter((p) => p.category === category.name).length,
      })),
    ]
  }, [categoryCatalog, visibleProducts])

  const filteredProducts = useMemo(() => {
    return visibleProducts.filter((product) => {
      const matchesSearch = matchesProductQuery(product, search)
      const matchesCategory =
        activeCategory === '全部商品' ||
        product.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [activeCategory, search, visibleProducts])

  // Debounce search so it doesn't refetch on every keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchAdminProducts = useCallback(async () => {
    if (scope === 'workspace') return
    setAdminLoading(true)
    try {
      const response = await api.get('/products/catalog', {
        params: {
          page: adminPage,
          page_size: ADMIN_PAGE_SIZE,
          q: debouncedSearch || undefined,
          category: activeCategory === '全部商品' ? 'all' : activeCategory,
        },
      })
      setAdminProducts(response.data?.items || [])
      setAdminTotalPages(response.data?.total_pages || 1)
    } catch (error) {
      pushToast('error', '商品加载失败', getApiErrorMessage(error))
    } finally {
      setAdminLoading(false)
    }
  }, [scope, adminPage, activeCategory, debouncedSearch, pushToast])

  useEffect(() => {
    fetchAdminProducts()
  }, [fetchAdminProducts])

  const refreshVisibleProducts = useCallback(async () => {
    if (scope === 'workspace') {
      setWorkspaceLoading(true)
      try {
        const response = await api.get('/products')
        setWorkspaceProducts(response.data || [])
      } catch (error) {
        pushToast('error', '商品加载失败', getApiErrorMessage(error))
      } finally {
        setWorkspaceLoading(false)
      }
      return
    }

    await Promise.all([reloadProducts(), fetchAdminProducts()])
  }, [pushToast, reloadProducts, scope, fetchAdminProducts])

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
      pushToast('error', '类型字典加载失败', getApiErrorMessage(error))
    })
  }, [canManageCategoryDictionary, refreshCategoryCatalog, pushToast])

  const openCreateDrawer = () => {
    navigate('new')
  }

  const openEditDrawer = (product) => {
    navigate(`edit/${product.id}`)
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

  const requestDeleteCategory = (category) => {
    setCategoryPendingAction({
      type: 'delete',
      category,
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
      } else if (categoryPendingAction.type === 'delete') {
        await api.delete(`/admin/product-categories/${categoryPendingAction.category.id}`)
        pushToast('success', '类型已删除')
      }

      await refreshCategoryCatalog()
      await refreshVisibleProducts()
      setCategoryConfirmOpen(false)
      setCategoryPendingAction(null)
      setNewCategoryName('')
      setNewCategorySort('0')
    } catch (error) {
      pushToast('error', '类型操作失败', getApiErrorMessage(error))
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

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* 左侧分类侧边栏 (Vertical Category Sidebar) */}
        <aside className="space-y-2 py-1">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">分类</p>
          <ul className="space-y-1">
            {tabs.map((item) => {
              const active = activeCategory === item.value
              return (
                <li key={item.value}>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(item.value)}
                    className={[
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all duration-150',
                      active
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    ].join(' ')}
                  >
                    <span className="truncate">{item.label}</span>
                    <span
                      className={[
                        'text-xs font-normal px-2 py-0.5 rounded-full',
                        active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500',
                      ].join(' ')}
                    >
                      {item.count}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* 右侧商品管理列表 (Products Grid) */}
        <main className="space-y-6">
          <ProductManagerGrid
            products={scope === 'workspace' ? filteredProducts : adminProducts}
            loading={scope === 'workspace' ? workspaceLoading : adminLoading}
            canEditProduct={canEditProduct}
            canDeleteProduct={canDeleteProduct}
            onEdit={openEditDrawer}
            onDelete={requestDeleteProduct}
            onReset={() => {
              setSearch('')
              setActiveCategory('全部商品')
            }}
          />

          {scope !== 'workspace' && adminTotalPages > 1 ? (
            <div className="flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                disabled={adminPage <= 1}
                onClick={() => setAdminPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                上一页
              </button>
              <span className="text-gray-500">
                第 {adminPage} / {adminTotalPages} 页
              </span>
              <button
                type="button"
                disabled={adminPage >= adminTotalPages}
                onClick={() => setAdminPage((p) => Math.min(adminTotalPages, p + 1))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          ) : null}
        </main>
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
          onDeleteCategory={requestDeleteCategory}
        />
      ) : null}

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
          } catch (error) {
            pushToast('error', '删除失败', getApiErrorMessage(error))
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
              : categoryPendingAction?.type === 'delete'
                ? '确认删除类型'
                : '确认更新类型'
        }
        description={
          categoryPendingAction?.type === 'create'
            ? `你正在新增类型「${categoryPendingAction?.payload?.name || ''}」，确认后将立即生效。`
            : categoryPendingAction?.type === 'toggle'
              ? `你正在${categoryPendingAction?.payload?.active ? '启用' : '停用'}类型「${categoryPendingAction?.category?.name || ''}」。`
              : categoryPendingAction?.type === 'delete'
                ? `你正在删除类型「${categoryPendingAction?.category?.name || ''}」，确认后将立即删除该类型，属于该类型的商品分类将被置空。`
                : `你正在更新类型「${categoryPendingAction?.category?.name || ''}」，确认后会立即保存。`
        }
        confirmLabel="确认提交"
        cancelLabel="返回编辑"
        destructive={categoryPendingAction?.type === 'delete'}
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
