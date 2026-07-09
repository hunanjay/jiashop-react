import { Star } from 'lucide-react'

const testimonials = [
  {
    name: '中国电信',
    role: '企业采购部',
    text: '充电宝彩印的细节令人惊叹，交付的每一件都像是一件艺术品。',
    image: 'https://www.chinatelecom.com.cn/ct/image/img/favicon.ico',
  },
  {
    name: '清华大学',
    role: '行政采购中心',
    text: '企业订单处理精准高效，定制完美匹配了我们品牌的审美，超出预期。',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Tsinghua_University_Logo.svg',
  },
  {
    name: '中信银行',
    role: '品牌定制团队',
    text: '物流速度出奇地快，包装本身已非常精美，合作体验五星好评。',
    image: 'https://s1.aigei.com/src/img/png/c6/c644b94f9d1b4b69b5f3d4500452caf0.png?imageMogr2/auto-orient/thumbnail/!282x282r/gravity/Center/crop/282x282/quality/85/%7CimageView2/2/w/282&e=2051020800&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:Ou4nF3r6kP_VSoZbjxJ5ecsjq-g=',
  },
]

export function Testimonials({ imgCoopBrand }) {
  return (
    <section className="px-6 lg:px-10 pb-32 max-w-7xl mx-auto space-y-16">
      {/* Consolidated Main Header */}
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-zinc-900">合作与口碑</h2>
        <p className="mt-2 text-sm text-zinc-400 font-medium">已服务 500+ 企业及机构客户，多方信赖之选</p>
      </div>

      {/* Customer Reviews Sub-section */}
      <div>
        <h3 className="text-lg font-bold text-zinc-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
          客户评价
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="glass-deep rounded-2xl p-7 flex flex-col justify-between gap-6 overflow-hidden transition-shadow duration-300 hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.80),0_20px_60px_rgba(99,102,241,0.18),0_4px_16px_rgba(0,0,0,0.06)]"
            >
              {/* Refraction highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{
                  background:
                    'radial-gradient(ellipse 90% 50% at 15% 0%, rgba(255,255,255,0.44), transparent 55%)',
                }}
              />

              <div className="relative space-y-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-base text-zinc-700 leading-relaxed">
                  "{t.text}"
                </p>
              </div>

              <div className="relative flex items-center gap-3 pt-4 border-t border-white/40">
                <div className="glass w-10 h-10 rounded-full p-0.5 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-zinc-100 overflow-hidden flex items-center justify-center">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{t.name}</p>
                  <p className="text-xs text-zinc-400 font-medium">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cooperative Brands Sub-section */}
      {imgCoopBrand && (
        <div>
          <h3 className="text-lg font-bold text-zinc-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
            合作品牌
          </h3>
          <div className="glass-deep rounded-2xl p-8 md:p-12 flex justify-center items-center overflow-hidden transition-all duration-300 hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.80),0_20px_60px_rgba(99,102,241,0.18),0_4px_16px_rgba(0,0,0,0.06)]">
            {/* Refraction highlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background:
                  'radial-gradient(ellipse 90% 50% at 15% 0%, rgba(255,255,255,0.44), transparent 55%)',
              }}
            />

            <img
              src={imgCoopBrand}
              alt="合作品牌"
              className="w-full max-w-5xl h-auto object-contain opacity-85 hover:opacity-100 transition-opacity duration-300 relative z-10"
            />
          </div>
        </div>
      )}
    </section>
  )
}
