import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[var(--surface-container-low)] py-20 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <span className="text-2xl font-black text-blue-700 block mb-6">琵琶行</span>
          <p className="text-[var(--on-surface-variant)] text-sm leading-relaxed">
            在情感与器物之间架起桥梁。现代设计与传统工艺的完美融合。
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">探索</h4>
          <ul className="space-y-4 text-sm text-[var(--on-surface-variant)]">
            <li>
              <Link className="hover:text-[var(--primary)] transition-colors" to="#">
                品牌故事
              </Link>
            </li>
            <li>
              <Link className="hover:text-[var(--primary)] transition-colors" to="#">
                材质指南
              </Link>
            </li>
            <li>
              <Link className="hover:text-[var(--primary)] transition-colors" to="#">
                可持续发展
              </Link>
            </li>
            <li>
              <Link className="hover:text-[var(--primary)] transition-colors" to="#">
                定制志
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">支持</h4>
          <ul className="space-y-4 text-sm text-[var(--on-surface-variant)]">
            <li>
              <Link className="hover:text-[var(--primary)] transition-colors" to="#">
                配送与退货
              </Link>
            </li>
            <li>
              <Link className="hover:text-[var(--primary)] transition-colors" to="#">
                常见问题
              </Link>
            </li>
            <li>
              <Link className="hover:text-[var(--primary)] transition-colors" to="#">
                联系我们
              </Link>
            </li>
            <li>
              <Link className="hover:text-[var(--primary)] transition-colors" to="#">
                订单追踪
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-widest">灵感速递</h4>
          <p className="text-xs text-[var(--on-surface-variant)] mb-4">
            加入我们的会员圈,获取独家预览 and 创意灵感。
          </p>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-white border border-[var(--outline-variant)]/30 rounded-xl px-4 py-2 text-sm focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none"
              placeholder="您的邮箱"
              type="email"
            />
            <button className="bg-[var(--on-background)] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 duration-200">
              加入
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-[var(--outline-variant)]/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-[var(--on-surface-variant)] uppercase tracking-[0.2em] font-bold gap-4">
        <p>© 2024 匠心礼遇. 版权所有。</p>
        <div className="flex gap-8">
          <Link to="#">隐私政策</Link>
          <Link to="#">服务条款</Link>
        </div>
      </div>
    </footer>
  );
}
