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
      <ModalContent className="max-w-6xl border-white/10 bg-[#111114]/96 text-zinc-100 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <ModalHeader className="border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">类型字典</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">左边看列表，右边直接编辑，减少滚动。</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{categoryCatalog.length} items</Badge>
              <Badge variant="outline">Only Admin</Badge>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">分类列表</div>
                  <div className="mt-1 text-xs text-zinc-500">点击一项进行编辑</div>
                </div>
                <Badge variant="outline">{categoryCatalog.length}</Badge>
              </div>

              <div className="mt-4 max-h-[58vh] space-y-2 overflow-y-auto pr-1">
                {categoryLoading ? (
                  <div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-6 text-sm text-zinc-500">
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
                          'flex w-full items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-left transition',
                          active
                            ? 'border-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 text-white shadow-[0_14px_30px_rgba(99,102,241,0.18)]'
                            : 'border-white/10 bg-white/6 hover:border-white/20 hover:bg-white/10',
                        ].join(' ')}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{item.name}</div>
                          <div className={['mt-1 text-xs', active ? 'text-white/70' : 'text-zinc-500'].join(' ')}>
                            sort {item.sort_order ?? 0}
                          </div>
                        </div>
                        <Badge
                          variant={item.active ? 'default' : 'secondary'}
                          className={active ? 'bg-white/15 text-white hover:bg-white/15' : ''}
                        >
                          {item.active ? '启用' : '停用'}
                        </Badge>
                      </button>
                    )
                  })
                ) : (
                  <div className="rounded-[18px] border border-white/10 bg-white/6 px-4 py-6 text-sm text-zinc-500">
                    还没有类型字典。
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">新增类型</div>
                    <div className="mt-1 text-xs text-zinc-500">快速添加一个新分类</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_120px_auto]">
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
                  <Button onClick={onCreateCategory}>新增类型</Button>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">编辑当前类型</div>
                    <div className="mt-1 text-xs text-zinc-500">修改名称、排序或启停状态</div>
                  </div>
                  {selectedCategory ? <Badge variant="outline">Selected</Badge> : null}
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
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={selectedCategory.active ? 'default' : 'secondary'}>
                          {selectedCategory.active ? '启用' : '停用'}
                        </Badge>
                        <span className="text-sm text-zinc-300">{selectedCategory.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => onToggleCategory({ ...selectedCategory, active: selectedCategory.active })}
                          className="border-white/10 bg-white/6 text-zinc-200 hover:bg-white/10"
                        >
                          {selectedCategory.active ? '停用' : '启用'}
                        </Button>
                        <Button onClick={() => onUpdateCategory(selectedCategory)}>保存更改</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-[18px] border border-dashed border-white/10 bg-white/5 px-4 py-8 text-sm text-zinc-500">
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
