import { Plus, RefreshCw, Search } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Input } from '../../../components/ui/input'

export default function ProductManagerToolbar({
  tabs,
  activeCategory,
  setActiveCategory,
  search,
  setSearch,
  canOpenCategoryModal = true,
  onOpenCategoryModal,
  onRefresh,
  onCreate,
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="relative border-b border-gray-200 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-gray-900 md:text-[28px]">商品管理</h1>
                <div className="relative w-full min-w-[260px] max-w-xl lg:w-[360px]">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="搜索商品名、描述或类型"
                    className="h-10 rounded-lg border-gray-300 bg-white pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {canOpenCategoryModal ? (
              <Button
                variant="outline"
                onClick={onOpenCategoryModal}
                className="h-9 border-gray-300 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                类型字典
              </Button>
            ) : null}
            <Button
              variant="outline"
              onClick={onRefresh}
              className="h-9 border-gray-300 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
            <Button
              onClick={onCreate}
              className="h-9 px-3 text-sm bg-blue-700 hover:bg-blue-800 text-white rounded-lg border-0 transition-colors"
            >
              <Plus className="h-4 w-4" />
              新增商品
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
