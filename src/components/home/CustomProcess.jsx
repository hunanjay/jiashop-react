import { ShoppingBag, UploadCloud, Palette, Cpu, Truck, ChevronRight } from 'lucide-react'

const steps = [
  {
    num: '01',
    title: '选择产品',
    enTitle: 'Choose Item',
    desc: '挑选心仪的精品礼品，确定定制规格。',
    icon: ShoppingBag,
  },
  {
    num: '02',
    title: '提供文件',
    enTitle: 'Provide Logo',
    desc: '上传您的企业 LOGO、文字或设计稿源文件。',
    icon: UploadCloud,
  },
  {
    num: '03',
    title: '产品效果图',
    enTitle: 'Product Proof',
    desc: '专属设计师一对一服务，快速生成定制效果图。',
    icon: Palette,
  },
  {
    num: '04',
    title: '定制加工',
    enTitle: 'Production',
    desc: '现代化生产线精密加工，严苛品质把控。',
    icon: Cpu,
  },
  {
    num: '05',
    title: '完成交付',
    enTitle: 'Delivery',
    desc: '顺丰速运极速送达，售后无忧全程跟踪。',
    icon: Truck,
  },
]

export function CustomProcess() {
  return (
    <section className="px-6 lg:px-10 pb-28 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl font-bold tracking-tight text-zinc-900">定制流程</h2>
        <p className="mt-2 text-sm text-zinc-400 font-medium">简单五步，轻松开启您的专属礼品定制之旅</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
        {steps.map((step, idx) => {
          const IconComponent = step.icon
          return (
            <div key={idx} className="relative group">
              <div className="glass-deep rounded-2xl p-6 h-full flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.80),0_20px_60px_rgba(99,102,241,0.15),0_4px_16px_rgba(0,0,0,0.04)]">
                {/* Refraction highlight */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      'radial-gradient(ellipse 90% 50% at 15% 0%, rgba(255,255,255,0.44), transparent 55%)',
                  }}
                />

                <div className="relative z-10 flex flex-col gap-5">
                  {/* Icon & Number Badge */}
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-5xl font-extrabold tracking-tight text-blue-600/10 select-none transition-colors group-hover:text-blue-600/20 duration-300">
                      {step.num}
                    </span>
                  </div>

                  {/* Copywriting */}
                  <div>
                    <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
                      {step.enTitle}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connecting arrows between items on desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-20 items-center justify-center text-blue-500/40 pointer-events-none">
                  <ChevronRight className="w-6 h-6 animate-pulse" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
