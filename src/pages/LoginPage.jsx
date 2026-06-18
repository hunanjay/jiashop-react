import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

import { useApp } from '../lib/app-context'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export default function LoginPage() {
  const { login, loadingAuth, session } = useApp()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!session) return
    const destination = session.role === 'user' ? '/workspace' : session.role === 'guest' ? '/' : '/admin'
    navigate(location.state?.from?.pathname || destination, { replace: true })
  }, [location.state?.from?.pathname, navigate, session])

  const handleSubmit = async (event) => {
    event.preventDefault()

    const session = await login(identifier, password)
    const destination =
      location.state?.from?.pathname ||
      (session.role === 'user' ? '/workspace' : session.role === 'guest' ? '/' : '/admin')
    navigate(destination, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-blue-700" />
            GiftCraft Ops
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">进入后台</h2>
          <p className="mt-2 text-sm text-gray-500 text-center">请输入邮箱或手机号码登录系统。</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 block">邮箱 / 手机号码</span>
            <Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="name@example.com / 13800000000"
              autoComplete="off"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700 block">密码</span>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="w-full"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium py-2.5 shadow-sm transition-colors flex items-center justify-center gap-2" 
            disabled={loadingAuth}
          >
            {loadingAuth ? '登录中...' : '进入系统'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

