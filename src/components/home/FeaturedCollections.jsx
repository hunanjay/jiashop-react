import { ChevronLeft, ChevronRight } from 'lucide-react';

export function FeaturedCollections({ images = {} }) {
  return (
    <section className="px-8 mb-32 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">精选系列</h2>
          <p className="text-[var(--on-surface-variant)] max-w-md">
            为您创意之旅准备的完美起点,按赠礼心意精心分类。
          </p>
        </div>
        <div className="flex gap-2">
          <button className="w-12 h-12 rounded-full border border-[var(--outline-variant)]/30 flex items-center justify-center hover:bg-[var(--surface-container-low)] transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="w-12 h-12 rounded-full border border-[var(--outline-variant)]/30 flex items-center justify-center hover:bg-[var(--surface-container-low)] transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Large Feature Card */}
        <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-3xl bg-[var(--surface-container-low)] h-[600px]">
          <img
            alt="场合系列"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={images.main}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--on-background)]/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-10 text-white">

          </div>
        </div>
        {/* Secondary Cards */}
        <div className="md:col-span-2 h-[288px] group relative overflow-hidden rounded-3xl bg-[var(--surface-container-low)]">
          <img
            alt="场合系列"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={images.secondary}
          />
          <div className="absolute inset-0 bg-[var(--on-background)]/20 group-hover:bg-[var(--on-background)]/40 transition-colors"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">

          </div>
        </div>
        <div className="md:col-span-1 h-[288px] group relative overflow-hidden rounded-3xl bg-[var(--surface-container-low)]">
          <img
            alt="场合系列"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={images.watch}
          />
          <div className="absolute inset-0 bg-[var(--on-background)]/20"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          </div>
        </div>
        <div className="md:col-span-1 h-[288px] group relative overflow-hidden rounded-3xl bg-[var(--surface-container-low)]">
          <img
            alt="场合系列"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={images.basket}
          />
          <div className="absolute inset-0 bg-[var(--on-background)]/20"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          </div>
        </div>
      </div>
    </section>
  );
}
