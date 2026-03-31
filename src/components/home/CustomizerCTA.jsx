import { Pencil, Palette, PenTool, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CustomizerCTA() {
  return (
    <section className="px-8 mb-32">
      <div className="max-w-7xl mx-auto rounded-[3rem] bg-[var(--on-background)] overflow-hidden relative">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          <div className="flex-1 p-16 flex flex-col justify-center text-white space-y-8">
            <h2 className="text-5xl font-bold leading-tight">
              定义专属。
              <br />
              匠心工作室。
            </h2>
            <p className="text-lg text-white/70 max-w-md">
              体验创作的乐趣。我们直观的工作室让您选择字体、材质和寄语,通过实时数字预览完美呈现最终实物效果。
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 text-white/90">
                <Pencil className="text-[var(--tertiary-fixed)] w-6 h-6" />
                <span>在线刻制预览</span>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <Palette className="text-[var(--tertiary-fixed)] w-6 h-6" />
                <span>样品极速发货</span>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <PenTool className="text-[var(--tertiary-fixed)] w-6 h-6" />
                <span>手工艺术字体选项</span>
              </div>
            </div>
            <Link to="/catalog" className="w-fit px-10 py-4 bg-[var(--primary)] text-white rounded-2xl font-bold hover:bg-blue-500 transition-colors shadow-xl">
              进入工作室
            </Link>
          </div>
          <div className="flex-1 bg-[var(--surface-variant)]/10 relative overflow-hidden flex items-center justify-center">
            {/* Mockup of the UI */}
            <div className="glass-panel bg-white/10 border border-white/10 rounded-3xl w-4/5 h-4/5 shadow-2xl p-8 flex flex-col gap-6 transform lg:translate-x-12 lg:rotate-2">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-white font-bold text-lg">定制工作室</span>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="flex-1 flex gap-8">
                <div className="w-1/3 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                      材质
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 bg-white/20 rounded-lg ring-2 ring-[var(--primary)]"></div>
                      <div className="h-10 bg-white/5 rounded-lg border border-white/10"></div>
                      <div className="h-10 bg-white/5 rounded-lg border border-white/10"></div>
                      <div className="h-10 bg-white/5 rounded-lg border border-white/10"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                      刻制寄语
                    </label>
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white/60 italic">
                      "一生所托..."
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  <div className="w-48 h-48 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Sparkles className="text-white/20 w-20 h-20" />
                  </div>
                  <div className="absolute bottom-4 text-center">
                    <span className="text-[10px] text-white/40 uppercase">预览渲染中...</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/30 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
