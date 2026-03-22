import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'

export default function LoginPage() {
  const { login, loadingAuth } = useApp()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (event) => {
    event.preventDefault()

    const session = await login(username, password)
    const destination =
      location.state?.from?.pathname ||
      (session.role === 'user' ? '/workspace' : session.role === 'guest' ? '/' : '/admin')
    navigate(destination, { replace: true })
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(244,247,250,1)_40%,_rgba(232,236,243,1)_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="relative overflow-hidden border-white/70 bg-white/60 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,_rgba(255,255,255,0.95),_rgba(255,255,255,0.65),_rgba(235,240,248,0.88))]" />
          <CardContent className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                <Sparkles className="h-4 w-4 text-slate-900" />
                GiftCraft Ops
              </div>
              <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-slate-900 md:text-6xl">
                让商品管理像
                <span className="block text-slate-500">苹果产品一样克制精致。</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
                客户侧提供沉浸式导购体验，管理侧提供高密度数据工作台。统一的设计语言让品牌感和效率感并行。
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['客户侧', '沉浸、极简、转化导向'],
                ['管理侧', '紧凑、功能性、快速操作'],
                ['权限隔离', 'guest / user / admin / superadmin'],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-3xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                  <div className="text-sm font-semibold text-slate-900">{title}</div>
                  <div className="mt-1 text-sm text-slate-500">{desc}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex items-center border-white/70 bg-white/70 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
          <CardContent className="w-full p-6 sm:p-8">
            <CardHeader className="p-0">
              <div className="text-sm font-semibold tracking-[0.22em] text-slate-500 uppercase">登录面板</div>
              <CardTitle className="mt-2 text-2xl">进入后台</CardTitle>
              <CardDescription>默认账号：admin / admin123</CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">用户名</span>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">密码</span>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
              </label>

              <Button type="submit" className="w-full rounded-2xl" disabled={loadingAuth}>
                {loadingAuth ? '登录中...' : '进入系统'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
