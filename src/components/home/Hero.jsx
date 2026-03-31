import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero({ heroImage }) {
  return (
    <section className="relative px-8 mb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 py-12">
        <div className="flex-1 space-y-8 z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--tertiary-fixed)] text-[var(--on-tertiary-fixed-variant)] text-xs font-bold tracking-widest uppercase">
            匠心高端定制
          </span>
          <h1 className="text-6xl md:text-7xl font-bold text-[var(--on-surface)] tracking-tight leading-[1.05]">
            为每一个重要时刻 <br />
            <span className="text-[var(--primary)] italic">匠心定制</span>
          </h1>
          <p className="text-xl text-[var(--on-surface-variant)] max-w-lg leading-relaxed">
            设计能够产生共鸣的私人礼物。我们精选的材质与精准的定制工艺，将您的灵感转化为触手可及的非凡体验。
          </p>
          <div className="flex items-center gap-6">
            <Link to="/catalog" className="px-8 py-4 bg-[var(--primary)] text-[var(--on-primary)] rounded-2xl font-semibold shadow-lg shadow-blue-500/20 hover:bg-[var(--primary-dim)] transition-all">
              立即开始定制
            </Link>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="w-full aspect-square rounded-[3rem] overflow-hidden shadow-2xl rotate-3 scale-105">
            <img
              alt="奢华礼品"
              className="w-full h-full object-cover"
              src={heroImage}
            />
          </div>
        </div>
      </div>
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
    </section>
  );
}
