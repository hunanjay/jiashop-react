import { Navigation } from '../components/home/Navigation'
import { Hero } from '../components/home/Hero'
import { FeaturedCollections } from '../components/home/FeaturedCollections'
import { Testimonials } from '../components/home/Testimonials'
import { MobileNav } from '../components/home/MobileNav'
import { CustomProcess } from '../components/home/CustomProcess'

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
        <CustomProcess />
        <Testimonials imgCoopBrand={imgCoopBrand} />
      </main>
      <MobileNav />
    </div>
  )
}
