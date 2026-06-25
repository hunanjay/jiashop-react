import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CustomizerCTA() {
  return (
    <section className="px-6 lg:px-10 pb-28 max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden min-h-[420px]">
        <img
          src="https://picsum.photos/seed/craft-workshop-gift/1600/700"
          alt="定制工作室展示"
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 bg-zinc-900/50" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full min-h-[420px] px-8 py-16 space-y-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-[1.08] tracking-tight">
            定义专属。匠心工作室。
          </h2>
          <p className="text-base text-white/70 max-w-md leading-relaxed">
            直观的创作工具，让您自由选择字体、材质与寄语，实时数字预览最终效果。
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-zinc-900 rounded-xl font-semibold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150"
          >
            进入工作室
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  )
}
