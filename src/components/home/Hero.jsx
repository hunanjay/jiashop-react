import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero({ heroImage }) {
  return (
    <section className="relative px-8 mb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 py-12">
        <div className="flex-1 space-y-8 z-10">
          <span className="inline-block px-4 py-1.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium tracking-widest uppercase">
            匠心高端定制
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.05]">
            为每一个重要时刻 <br />
            <span className="text-blue-700 italic">匠心定制</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
            设计能够产生共鸣的私人礼物。我们精选的材质与精准的定制工艺，将您的灵感转化为触手可及的非凡体验。
          </p>
          <div className="flex items-center gap-6">
            <Link to="/catalog" className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold shadow-sm hover:bg-blue-800 transition-colors duration-150">
              立即开始定制
            </Link>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="w-full aspect-square rounded-xl overflow-hidden shadow-lg">
            <img
              alt="奢华礼品"
              className="w-full h-full object-cover"
              src={heroImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

