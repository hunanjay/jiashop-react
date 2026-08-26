import { useMemo, useState } from 'react'

import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Modal, ModalBody, ModalContent, ModalHeader } from '../../../components/ui/modal'

export default function ProductManagerCategoryModal({
  open,
  onOpenChange,
  categoryLoading,
  categoryCatalog,
  categoryDrafts,
  setCategoryDrafts,
  newCategoryName,
  setNewCategoryName,
  newCategorySort,
  setNewCategorySort,
  onCreateCategory,
  onUpdateCategory,
  onToggleCategory,
  onDeleteCategory,
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)

  const selectedCategoryIdResolved =
    selectedCategoryId && categoryCatalog.some((item) => item.id === selectedCategoryId)
      ? selectedCategoryId
      : categoryCatalog[0]?.id ?? null

  const selectedCategory = useMemo(
    () => categoryCatalog.find((item) => item.id === selectedCategoryIdResolved) || null,
    [categoryCatalog, selectedCategoryIdResolved],
  )

  const activeCategoryId = selectedCategory?.id ?? null

  const selectedDraft = selectedCategory
    ? categoryDrafts[selectedCategory.id] || {
        name: selectedCategory.name,
        sort_order: selectedCategory.sort_order,
        active: selectedCategory.active,
      }
    : null

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-6xl border border-gray-200 bg-white text-gray-900 shadow-xl rounded-xl">
        <ModalHeader className="border-b border-gray-200 bg-gray-50/75 rounded-t-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">类型字典</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">左边看列表，右边直接编辑，减少滚动。</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white">
                {categoryCatalog.length} items
              </Badge>
              <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white">
                User / Admin / SuperAdmin
              </Badge>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">分类列表</div>
                  <div className="mt-1 text-xs text-gray-500">点击一项进行编辑</div>
                </div>
                <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white">
                  {categoryCatalog.length}
                </Badge>
              </div>

              <div className="mt-4 max-h-[58vh] space-y-2 overflow-y-auto pr-1">
                {categoryLoading ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                    正在加载类型字典...
                  </div>
                ) : categoryCatalog.length ? (
                  categoryCatalog.map((item) => {
                    const active = item.id === activeCategoryId
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(item.id)}
                        className={[
                          'flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition',
                          active
                            ? 'bg-blue-50 border-l-4 border-blue-700 border-y-blue-100 border-r-blue-100 text-blue-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                        ].join(' ')}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{item.name}</div>
                          <div className={['mt-1 text-xs', active ? 'text-blue-700 font-medium' : 'text-gray-500'].join(' ')}>
                            sort {item.sort_order ?? 0}
                          </div>
                        </div>
                        <Badge
                          variant={item.active ? 'default' : 'secondary'}
                          className={active ? 'bg-blue-700 text-white hover:bg-blue-800' : ''}
                        >
                          {item.active ? '启用' : '停用'}
                        </Badge>
                      </button>
                    )
                  })
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                    还没有类型字典。
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">新增类型</div>
                    <div className="mt-1 text-xs text-gray-500">快速添加一个新分类</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_100px_auto]">
                  <Input
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="输入新类型名称"
                    className="border-gray-300 bg-white text-gray-900 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  <Input
                    type="number"
                    value={newCategorySort}
                    onChange={(event) => setNewCategorySort(event.target.value)}
                    placeholder="排序"
                    title="展示顺序，数字越小越靠前"
                    className="border-gray-300 bg-white text-gray-900 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  <Button
                    onClick={onCreateCategory}
                    className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg border-0 transition-colors"
                  >
                    新增类型
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">编辑当前类型</div>
                    <div className="mt-1 text-xs text-gray-500">修改名称、排序或启停状态</div>
                  </div>
                  {selectedCategory ? <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white">Selected</Badge> : null}
                </div>

                {selectedCategory ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_120px]">
                      <Input
                        value={selectedDraft?.name || ''}
                        onChange={(event) =>
                          setCategoryDrafts((current) => ({
                            ...current,
                            [selectedCategory.id]: { ...selectedDraft, name: event.target.value },
                          }))
                        }
                        placeholder="类型名称"
                        className="border-gray-300 bg-white text-gray-900 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                      />
                      <Input
                        type="number"
                        value={selectedDraft?.sort_order ?? 0}
                        onChange={(event) =>
                          setCategoryDrafts((current) => ({
                            ...current,
                            [selectedCategory.id]: { ...selectedDraft, sort_order: event.target.value },
                          }))
                        }
                        placeholder="排序"
                        title="展示顺序，数字越小越靠前"
                        className="border-gray-300 bg-white text-gray-900 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={selectedCategory.active ? 'default' : 'secondary'}>
                          {selectedCategory.active ? '启用' : '停用'}
                        </Badge>
                        <span className="text-sm text-gray-700">{selectedCategory.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => onDeleteCategory(selectedCategory)}
                          className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          删除
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onToggleCategory({ ...selectedCategory, active: selectedCategory.active })}
                          className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {selectedCategory.active ? '停用' : '启用'}
                        </Button>
                        <Button
                          onClick={() => onUpdateCategory(selectedCategory)}
                          className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg border-0 transition-colors"
                        >
                          保存更改
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm text-gray-500">
                    先从左侧选择一个分类。
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
