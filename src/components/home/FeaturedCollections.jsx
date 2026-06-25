import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const collections = [
  {
    key: 'main',
    title: '精选电子外设',
    sub: '高品质定制外设',
    span: 'md:col-span-2 md:row-span-2',
    height: 'h-[580px] md:h-auto',
  },
  {
    key: 'secondary',
    title: '折叠键盘系列',
    sub: '便携精工',
    span: 'md:col-span-2',
    height: 'h-[280px]',
  },
  {
    key: 'watch',
    title: '多功能扩展',
    sub: '一站式连接',
    span: 'md:col-span-1',
    height: 'h-[280px]',
  },
  {
    key: 'basket',
    title: '定制充电系列',
    sub: '随身能量',
    span: 'md:col-span-1',
    height: 'h-[280px]',
  },
]

export function FeaturedCollections({ images = {} }) {
  return (
    <section className="px-6 lg:px-10 pt-16 pb-28 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-900">精选系列</h2>
        <Link
          to="/catalog"
          className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors duration-150"
        >
          查看全部
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {collections.map(({ key, title, sub, span, height }) => (
          <div
            key={key}
            className={`relative overflow-hidden rounded-2xl ring-1 ring-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.50),0_4px_24px_rgba(99,102,241,0.10)] transition-[transform,box-shadow] duration-300 ease-out hover:scale-[1.02] hover:ring-2 hover:ring-blue-400/40 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.60),0_12px_40px_rgba(99,102,241,0.22)] cursor-default ${span} ${height}`}
          >
            <img
              src={images[key]}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="sm:hidden mt-6 text-center">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700"
        >
          查看全部系列
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </section>
  )
}
