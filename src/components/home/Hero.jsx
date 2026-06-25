import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Hero({ heroImage }) {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 min-h-[100dvh] flex items-center pt-16">
        <div className="w-full grid md:grid-cols-[6fr_5fr] gap-10 lg:gap-14 items-center py-16">

          {/* Left: text — floats above the ambient canvas */}
          <div className="space-y-8">
            <h1
              className="hero-rise text-[64px] lg:text-[84px] font-black tracking-tight leading-[0.93] text-zinc-900"
              style={{ animationDelay: '0.08s' }}
            >
              让每份礼物
              <br />
              <span className="text-blue-700">独一无二</span>
            </h1>

            <p
              className="hero-rise text-base text-zinc-500 leading-relaxed max-w-[420px]"
              style={{ animationDelay: '0.22s' }}
            >
              精选材质，匠心工艺，将您的心意转化为可触摸的珍贵体验。
            </p>

            <div
              className="hero-rise flex items-center gap-4 flex-wrap"
              style={{ animationDelay: '0.36s' }}
            >
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 active:scale-[0.98] transition-all duration-150 shadow-sm shadow-blue-900/20"
              >
                浏览全部商品
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
              <Link
                to="/catalog"
                className="text-sm font-medium text-zinc-400 hover:text-zinc-700 transition-colors duration-150 underline underline-offset-4 decoration-zinc-300"
              >
                了解定制流程
              </Link>
            </div>
          </div>

          {/* Right: deep glass frame around the product image */}
          <div
            className="hero-img-in hidden md:block"
            style={{ animationDelay: '0.04s' }}
          >
            <div className="glass-deep rounded-3xl p-1.5">
              {/* Refraction highlight overlay — sits above the image */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 45% at 22% 0%, rgba(255,255,255,0.46), transparent 55%), ' +
                    'linear-gradient(160deg, rgba(255,255,255,0.20) 0%, transparent 38%)',
                }}
              />
              <div className="relative rounded-[20px] overflow-hidden">
                <img
                  src={heroImage}
                  alt="精选定制礼品"
                  className="w-full aspect-square object-cover object-center"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile image */}
      <div className="md:hidden px-6 pb-16">
        <div className="glass rounded-2xl p-1.5">
          <div className="rounded-[14px] overflow-hidden">
            <img
              src={heroImage}
              alt="精选定制礼品"
              className="w-full aspect-[4/3] object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
