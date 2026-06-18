import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-20 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <span className="text-xl font-bold text-white block mb-6">jiajia'Shop</span>
          <p className="text-gray-400 text-sm leading-relaxed">
            在情感与器物之间架起桥梁。现代设计与传统工艺的完美融合。
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-6 text-sm text-white uppercase tracking-widest">探索</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <Link className="hover:text-white transition-colors duration-150" to="#">
                品牌故事
              </Link>
            </li>
            <li>
              <Link className="hover:text-white transition-colors duration-150" to="#">
                材质指南
              </Link>
            </li>
            <li>
              <Link className="hover:text-white transition-colors duration-150" to="#">
                可持续发展
              </Link>
            </li>
            <li>
              <Link className="hover:text-white transition-colors duration-150" to="#">
                定制志
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-6 text-sm text-white uppercase tracking-widest">支持</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <Link className="hover:text-white transition-colors duration-150" to="#">
                配送与退货
              </Link>
            </li>
            <li>
              <Link className="hover:text-white transition-colors duration-150" to="#">
                常见问题
              </Link>
            </li>
            <li>
              <Link className="hover:text-white transition-colors duration-150" to="#">
                联系我们
              </Link>
            </li>
            <li>
              <Link className="hover:text-white transition-colors duration-150" to="#">
                订单追踪
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-6 text-sm text-white uppercase tracking-widest">灵感速递</h4>
          <p className="text-xs text-gray-400 mb-4">
            加入我们的会员圈,获取独家预览 and 创意灵感。
          </p>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-600 bg-gray-800 text-white placeholder:text-gray-500 rounded-lg px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="您的邮箱"
              type="email"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors duration-150">
              加入
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
        <p>© 2024 匠心礼遇. 版权所有。</p>
        <div className="flex gap-8">
          <Link className="hover:text-white transition-colors duration-150" to="#">隐私政策</Link>
          <Link className="hover:text-white transition-colors duration-150" to="#">服务条款</Link>
        </div>
      </div>
    </footer>
  );
}

