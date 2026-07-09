import { Navigation } from '../components/home/Navigation'
import { Hero } from '../components/home/Hero'
import { FeaturedCollections } from '../components/home/FeaturedCollections'
import { Testimonials } from '../components/home/Testimonials'
import { MobileNav } from '../components/home/MobileNav'
import { Footer } from '../components/home/Footer'

import heroImage from './admin/images/hero.png'
import imgMouse from './admin/images/鼠标.jpeg'
import imgKeyboard from './admin/images/折叠键盘.png'
import imgHub from './admin/images/wuheyituozhanwu.png'
import imgPowerBank from './admin/images/shubiaochongdianbao.jpeg'
import imgCoopBrand from '../assets/coop-brand.png'

export default function HomePage() {
  return (
    <div className="home-page-theme min-h-screen bg-[#eef2ff] relative">
      {/* Ambient light canvas — stationary behind all glass panels */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[680px] h-[680px] rounded-full bg-blue-300/25 blur-[120px]" />
        <div className="absolute -top-20 right-[5%] w-[520px] h-[520px] rounded-full bg-indigo-300/20 blur-[100px]" />
        <div className="absolute top-[38%] left-[8%] w-[380px] h-[380px] rounded-full bg-blue-200/18 blur-[90px]" />
        <div className="absolute top-[30%] right-[12%] w-[300px] h-[300px] rounded-full bg-violet-300/15 blur-[80px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full bg-violet-200/25 blur-[140px]" />
        <div className="absolute bottom-[22%] right-[6%] w-[260px] h-[260px] rounded-full bg-indigo-200/18 blur-[70px]" />
      </div>

      <Navigation />
      <main className="relative z-10">
        <Hero heroImage={heroImage} />
        <FeaturedCollections
          images={{
            main: imgMouse,
            secondary: imgKeyboard,
            watch: imgHub,
            basket: imgPowerBank,
          }}
        />
        <Testimonials />

        {/* Cooperative Brands Section */}
        <section className="px-6 lg:px-10 pb-32 max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-zinc-900">合作伙伴</h2>
            <p className="mt-2 text-sm text-zinc-400 font-medium">已服务 500+ 企业及机构客户</p>
          </div>

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
        </section>

        <Footer />
      </main>
      <MobileNav />
    </div>
  )
}
