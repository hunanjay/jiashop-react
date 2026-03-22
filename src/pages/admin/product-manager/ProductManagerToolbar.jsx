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
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/6 shadow-[0_16px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute right-0 top-16 h-56 w-56 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-sky-400/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_rgba(255,255,255,0.03)_36%,_rgba(255,255,255,0.02)_100%)]" />
      </div>

      <div className="relative border-b border-white/10 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-[-0.05em] text-white md:text-[28px]">商品管理</h1>
                <div className="relative w-full min-w-[260px] max-w-xl lg:w-[360px]">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="搜索商品名、描述或类型"
                    className="h-10 rounded-full border-white/10 bg-white/6 pl-10 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl placeholder:text-zinc-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {canOpenCategoryModal ? (
              <Button
                variant="secondary"
                onClick={onOpenCategoryModal}
                className="h-9 border-white/10 bg-white/6 px-3 text-sm text-zinc-200 backdrop-blur-xl hover:bg-white/10"
              >
                类型字典
              </Button>
            ) : null}
            <Button
              variant="secondary"
              onClick={onRefresh}
              className="h-9 border-white/10 bg-white/6 px-3 text-sm text-zinc-200 backdrop-blur-xl hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
            <Button onClick={onCreate} className="h-9 px-3 text-sm">
              <Plus className="h-4 w-4" />
              新增商品
            </Button>
          </div>
        </div>
      </div>

      <div className="relative px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.slice(0, 5).map((item) => {
            const active = activeCategory === item.value
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setActiveCategory(item.value)}
                className={[
                  'inline-flex min-w-max items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition',
                  active
                    ? 'border-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-400 text-white shadow-[0_14px_30px_rgba(99,102,241,0.22)]'
                    : 'border-white/10 bg-white/6 text-zinc-300 hover:border-white/20 hover:bg-white/10 hover:text-white',
                ].join(' ')}
              >
                {item.label}
                <Badge
                  variant="outline"
                  className={[
                    'rounded-full px-2 py-0.5 text-[11px]',
                    active ? 'border-white/10 bg-white/15 text-white' : 'border-white/10 bg-white/8 text-zinc-400',
                  ].join(' ')}
                >
                  {item.count}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
