import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'

import { AppContext } from './lib/app-context'
import { api, setAuthToken } from './lib/api'
import AdminLayout from './layouts/AdminLayout'
import ClientLayout from './layouts/ClientLayout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import AdminDashboardPage from './pages/admin/DashboardPage'
import AdminOrdersPage from './pages/admin/OrdersPage'
import AdminProductsPage from './pages/admin/ProductManagerPage'
import AdminRbacPage from './pages/admin/RbacPage'
import AdminCustomerPage from './pages/admin/CustomerManagerPage'
import AdminAccountPage from './pages/admin/AccountManagerPage'
import AdminExportPage from './pages/admin/ExportPage'
import WorkspaceCustomerPage from './pages/admin/CustomerManagerPage'
import ProductEditPage from './pages/admin/product-manager/ProductEditPage'

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
  cartToken: 'giftcraft-cart-token',
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

function createCartToken() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  return `cart-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function loadCartToken() {
  if (typeof window === 'undefined') return createCartToken()
  const existing = window.localStorage.getItem(STORAGE_KEYS.cartToken)
  if (existing) return existing
  const next = createCartToken()
  window.localStorage.setItem(STORAGE_KEYS.cartToken, next)
  return next
}

function toCartObject(items) {
  return (items || []).reduce((acc, item) => {
    const quantity = Number(item?.quantity || 0)
    if (item?.product_id && quantity > 0) {
      acc[item.product_id] = quantity
    }
    return acc
  }, {})
}

function AppProvider({ children }) {
  const [session, setSession] = useState(loadSession)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [catalogQuery, setCatalogQuery] = useState('')
  const [cart, setCart] = useState(loadCart)
  const [cartToken] = useState(loadCartToken)
  const [toasts, setToasts] = useState([])
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_CATEGORY_OPTIONS)
  const theme = 'sun'

  const pushToast = useCallback((type, title, detail = '') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((current) => [...current, { id, type, title, detail }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 2600)
  }, [])

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
    const handleSessionExpired = () => {
      setSession(null)
      setAuthToken(null)
      pushToast('warning', '登录已过期', '请刷新页面后重新登录')
    }

    window.addEventListener('giftcraft:session-expired', handleSessionExpired)
    return () => window.removeEventListener('giftcraft:session-expired', handleSessionExpired)
  }, [pushToast])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart))
    }
  }, [cart])

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

  const syncCartFromApi = useCallback(async () => {
    try {
      const response = await api.get('/cart', {
        headers: { 'X-Cart-Token': cartToken },
      })
      setCart(toCartObject(response.data?.items))
    } catch {
      // Keep local cart when sync fails.
    }
  }, [cartToken])

  useEffect(() => {
    syncCartFromApi()
  }, [syncCartFromApi])

  const login = useCallback(async (identifier, password) => {
    setLoadingAuth(true)
    try {
      const response = await api.post('/auth/login', { identifier, password })
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

  const addToCart = useCallback((product, quantity = 1, options = {}) => {
    setCart((current) => {
      const nextQty = Number(current[product.id] || 0) + quantity
      return {
        ...current,
        [product.id]: Math.max(0, nextQty),
      }
    })
    void api
      .post(
        '/cart/items',
        { product_id: product.id, quantity },
        { headers: { 'X-Cart-Token': cartToken } },
      )
      .then((response) => {
        setCart(toCartObject(response.data?.items))
      })
      .catch(() => {
        pushToast('error', '购物车同步失败', '已保留本地购物车')
      })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('giftcraft:cart-fly', {
          detail: {
            sourceRect: options?.sourceRect || null,
            product,
          },
        }),
      )
    }
    pushToast('success', '已加入购物车', product.name)
  }, [cartToken, pushToast])

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
    void api
      .put(
        `/cart/items/${productId}`,
        { quantity },
        { headers: { 'X-Cart-Token': cartToken } },
      )
      .then((response) => {
        setCart(toCartObject(response.data?.items))
      })
      .catch(() => {
        pushToast('error', '购物车同步失败', '请稍后重试')
      })
  }, [cartToken, pushToast])

  const clearCart = useCallback(() => {
    setCart({})
    void api
      .delete('/cart', { headers: { 'X-Cart-Token': cartToken } })
      .then((response) => {
        setCart(toCartObject(response.data?.items))
      })
      .catch(() => {
        pushToast('error', '清空购物车失败', '请稍后重试')
      })
  }, [cartToken, pushToast])

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
    () => cartItems.length,
    [cartItems],
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
      theme,
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
      theme,
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

function LegacyProductRouteRedirect() {
  const { id } = useParams()
  return <Navigate to={id ? `/catalog/${id}` : '/catalog'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/catalog/:id" element={<ProductDetailPage />} />
      <Route path="/product/:id" element={<LegacyProductRouteRedirect />} />
      <Route element={<ClientLayout />}>
        <Route path="/cart" element={<CartPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/workspace"
        element={
          <RequireRole roles={['user', 'admin', 'superadmin']}>
            <AdminLayout scope="workspace" />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboardPage scope="workspace" />} />
        <Route path="dashboard" element={<AdminDashboardPage scope="workspace" />} />
        <Route path="my-products" element={<AdminProductsPage scope="workspace" />} />
        <Route path="my-products/new" element={<ProductEditPage />} />
        <Route path="my-products/edit/:id" element={<ProductEditPage />} />
        <Route path="customers" element={<WorkspaceCustomerPage scope="workspace" />} />
        <Route path="my-orders" element={<AdminOrdersPage scope="workspace" />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireRole roles={['admin', 'superadmin']}>
            <AdminLayout scope="admin" />
          </RequireRole>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<ProductEditPage />} />
        <Route path="products/edit/:id" element={<ProductEditPage />} />
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
