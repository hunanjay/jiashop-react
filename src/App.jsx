import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppContext } from './lib/app-context'
import { api, setAuthToken } from './lib/api'
import AdminLayout from './layouts/AdminLayout'
import ClientLayout from './layouts/ClientLayout'
import UserLayout from './layouts/UserLayout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import AdminDashboardPage from './pages/admin/DashboardPage'
import AdminOrdersPage from './pages/admin/OrdersPage'
import AdminProductsPage from './pages/admin/ProductManagerPage'
import AdminRbacPage from './pages/admin/RbacPage'
import AdminCustomerPage from './pages/admin/CustomerManagerPage'
import AdminAccountPage from './pages/admin/AccountManagerPage'
import WorkspaceDashboardPage from './pages/workspace/WorkspaceDashboardPage'
import AdminExportPage from './pages/admin/ExportPage'
import WorkspaceCustomerPage from './pages/admin/CustomerManagerPage'

const DEFAULT_CATEGORY_OPTIONS = [
  { label: '全部分类', value: 'all' },
  { label: 'Awards', value: 'Awards' },
  { label: 'Stationery', value: 'Stationery' },
  { label: 'Corporate Gifts', value: 'Corporate Gifts' },
  { label: 'Accessories', value: 'Accessories' },
  { label: 'Other', value: 'Other' },
]

const STORAGE_KEYS = {
  session: 'giftcraft-session',
  cart: 'giftcraft-cart',
}

function safeParseJSON(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function loadSession() {
  if (typeof window === 'undefined') return null
  return safeParseJSON(window.localStorage.getItem(STORAGE_KEYS.session), null)
}

function loadCart() {
  if (typeof window === 'undefined') return {}
  return safeParseJSON(window.localStorage.getItem(STORAGE_KEYS.cart), {})
}

function AppProvider({ children }) {
  const [session, setSession] = useState(loadSession)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [catalogQuery, setCatalogQuery] = useState('')
  const [cart, setCart] = useState(loadCart)
  const [toasts, setToasts] = useState([])
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_CATEGORY_OPTIONS)

  useEffect(() => {
    setAuthToken(session?.access_token || null)
    if (typeof window !== 'undefined') {
      if (session) {
        window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.session)
      }
    }
  }, [session])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart))
    }
  }, [cart])

  const pushToast = useCallback((type, title, detail = '') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((current) => [...current, { id, type, title, detail }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 2600)
  }, [])

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true)
    try {
      const response = await api.get('/products')
      setProducts(response.data || [])
    } catch {
      pushToast('error', '商品加载失败', '请检查后端服务是否已启动')
    } finally {
      setLoadingProducts(false)
    }
  }, [pushToast])

  const loadProductCategories = useCallback(async () => {
    try {
      const response = await api.get('/product-categories')
      const categories = response.data || []
      setCategoryOptions([
        { label: '全部分类', value: 'all' },
        ...categories.map((item) => ({ label: item.name, value: item.name })),
      ])
    } catch {
      setCategoryOptions(DEFAULT_CATEGORY_OPTIONS)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    loadProductCategories()
  }, [loadProductCategories])

  const login = useCallback(async (username, password) => {
    setLoadingAuth(true)
    try {
      const response = await api.post('/auth/login', { username, password })
      const nextSession = {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        role: response.data.role,
        username: response.data.username,
        email: response.data.email,
        session_id: response.data.session_id,
        user: response.data.user,
      }
      setAuthToken(nextSession.access_token)
      setSession(nextSession)
      pushToast('success', '登录成功', `欢迎回来，${nextSession.username}`)
      return nextSession
    } finally {
      setLoadingAuth(false)
    }
  }, [pushToast])

  const logout = useCallback(() => {
    setSession(null)
    setAuthToken(null)
    pushToast('info', '已退出登录')
  }, [pushToast])

  const addToCart = useCallback((product, quantity = 1) => {
    setCart((current) => {
      const nextQty = Number(current[product.id] || 0) + quantity
      return {
        ...current,
        [product.id]: Math.max(0, nextQty),
      }
    })
    pushToast('success', '已加入购物车', product.name)
  }, [pushToast])

  const updateCartQuantity = useCallback((productId, quantity) => {
    setCart((current) => {
      const next = { ...current }
      if (quantity <= 0) {
        delete next[productId]
      } else {
        next[productId] = quantity
      }
      return next
    })
  }, [])

  const clearCart = useCallback(() => setCart({}), [])

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = products.find((item) => item.id === productId)
        if (!product) return null
        return {
          ...product,
          quantity,
          subtotal: Number(product.price || 0) * quantity,
        }
      })
      .filter(Boolean)
  }, [cart, products])

  const cartCount = useMemo(
    () => Object.values(cart).reduce((sum, quantity) => sum + Number(quantity || 0), 0),
    [cart],
  )

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.subtotal, 0),
    [cartItems],
  )

  const isAdmin = Boolean(session && ['admin', 'superadmin'].includes(session.role))
  const isSuperAdmin = Boolean(session && session.role === 'superadmin')

  const value = useMemo(
    () => ({
      api,
      session,
      login,
      logout,
      loadingAuth,
      products,
      loadingProducts,
      reloadProducts: loadProducts,
      catalogQuery,
      setCatalogQuery,
      cart,
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      updateCartQuantity,
      clearCart,
      toasts,
      pushToast,
      categoryOptions,
      reloadProductCategories: loadProductCategories,
      isAdmin,
      isSuperAdmin,
    }),
    [
      addToCart,
      cart,
      cartCount,
      cartItems,
      cartTotal,
      catalogQuery,
      clearCart,
      isAdmin,
      isSuperAdmin,
      categoryOptions,
      loadProducts,
      loadProductCategories,
      loadingAuth,
      loadingProducts,
      login,
      logout,
      products,
      pushToast,
      session,
      toasts,
      updateCartQuantity,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

function RequireRole({ roles, children }) {
  const { session } = React.useContext(AppContext)

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(session.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/workspace"
        element={
          <RequireRole roles={['user', 'admin', 'superadmin']}>
            <UserLayout />
          </RequireRole>
        }
      >
        <Route index element={<WorkspaceDashboardPage />} />
        <Route path="my-products" element={<AdminProductsPage scope="workspace" />} />
        <Route path="my-orders" element={<AdminOrdersPage scope="workspace" />} />
        <Route path="customers" element={<WorkspaceCustomerPage scope="workspace" />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireRole roles={['admin', 'superadmin']}>
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="customers" element={<AdminCustomerPage />} />
        <Route path="accounts" element={<AdminAccountPage />} />
        <Route path="export" element={<AdminExportPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route
          path="rbac"
          element={
            <RequireRole roles={['superadmin']}>
              <AdminRbacPage />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
