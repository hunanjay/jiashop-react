import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

export default function ProductManagerCategoryPanel({
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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">类型字典</h3>
          <p className="mt-1 text-sm text-gray-500">开放给 User / Admin / SuperAdmin</p>
        </div>
        <Badge variant="outline" className="border-gray-200 text-gray-700 bg-white">Category Manager</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
        <Input
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
          placeholder="输入新类型名称"
          className="border-gray-300 bg-white text-gray-900 rounded-lg focus:border-blue-500/20"
        />
        <Input
          type="number"
          value={newCategorySort}
          onChange={(event) => setNewCategorySort(event.target.value)}
          placeholder="排序"
          className="border-gray-300 bg-white text-gray-900 rounded-lg focus:border-blue-500/20"
        />
        <Button
          onClick={onCreateCategory}
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg border-0 transition-colors"
        >
          新增类型
        </Button>
      </div>

      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
        {categoryLoading ? (
          <div className="py-6 text-sm text-gray-500">正在加载类型字典...</div>
        ) : categoryCatalog.length ? (
          categoryCatalog.map((item) => {
            const draft = categoryDrafts[item.id] || { name: item.name, sort_order: item.sort_order, active: item.active }
            return (
              <div key={item.id} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <Input
                  value={draft.name}
                  onChange={(event) =>
                    setCategoryDrafts((current) => ({
                      ...current,
                      [item.id]: { ...draft, name: event.target.value },
                    }))
                  }
                  placeholder="类型名称"
                  className="border-gray-300 bg-white text-gray-900 rounded-lg focus:border-blue-500/20"
                />
                <div className="grid gap-3 md:grid-cols-[120px_auto] md:items-center">
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
                    className="border-gray-300 bg-white text-gray-900 rounded-lg focus:border-blue-500/20"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={item.active ? 'default' : 'secondary'}>{item.active ? '启用' : '停用'}</Badge>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => onToggleCategory({ ...item, active: item.active })}
                        className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {item.active ? '停用' : '启用'}
                      </Button>
                      <Button
                        onClick={() => onUpdateCategory(item)}
                        className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg border-0 transition-colors"
                      >
                        保存
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-6 text-sm text-gray-500">还没有类型字典。</div>
        )}
      </div>
    </div>
  )
}
