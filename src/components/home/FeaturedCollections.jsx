import { ChevronLeft, ChevronRight } from 'lucide-react';

export function FeaturedCollections({ images = {} }) {
  return (
    <section className="px-8 mb-32 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-gray-900">精选系列</h2>
          <p className="text-gray-600 max-w-md">
            为您创意之旅准备的完美起点,按赠礼心意精心分类。
          </p>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors duration-150">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors duration-150">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Large Feature Card */}
        <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-150 h-[600px]">
          <img
            alt="场合系列"
            className="absolute inset-0 w-full h-full object-cover"
            src={images.main}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-10 text-white">

          </div>
        </div>
        {/* Secondary Cards */}
        <div className="md:col-span-2 h-[288px] group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-150">
          <img
            alt="场合系列"
            className="absolute inset-0 w-full h-full object-cover"
            src={images.secondary}
          />
          <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-gray-900/30 transition-colors duration-150"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">

          </div>
        </div>
        <div className="md:col-span-1 h-[288px] group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-150">
          <img
            alt="场合系列"
            className="absolute inset-0 w-full h-full object-cover"
            src={images.watch}
          />
          <div className="absolute inset-0 bg-gray-900/20"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          </div>
        </div>
        <div className="md:col-span-1 h-[288px] group relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-150">
          <img
            alt="场合系列"
            className="absolute inset-0 w-full h-full object-cover"
            src={images.basket}
          />
          <div className="absolute inset-0 bg-gray-900/20"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          </div>
        </div>
      </div>
    </section>
  );
}

