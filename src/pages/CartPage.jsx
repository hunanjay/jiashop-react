import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Check, ChevronDown, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'

import { api } from '../lib/api'
import { getApiErrorMessage } from '../lib/api-error'
import { useApp } from '../lib/app-context'
import { Button } from '../components/ui/button'
import { ConfirmDialog } from '../components/ui/confirm-dialog'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '../components/ui/modal'
import { formatCurrency } from '../lib/format'

const EMPTY_CHECKOUT_FORM = {
  company_name: '',
  purchaser: '',
  phone: '',
  shipping_address: '',
  owner_username: '',
  remarks: '',
}

const SUMMARY_BUTTON_BASE =
  'h-11 w-full rounded-lg px-4 text-sm font-semibold transition'
const SUMMARY_BUTTON_PRIMARY =
  `${SUMMARY_BUTTON_BASE} bg-blue-700 text-white hover:bg-blue-800`
const SUMMARY_BUTTON_DANGER =
  `${SUMMARY_BUTTON_BASE} border border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:text-red-750`

export default function CartPage() {
  const navigate = useNavigate()
  const { session, cartItems, cartCount, cartTotal, updateCartQuantity, clearCart, pushToast } = useApp()
  const [clearOpen, setClearOpen] = useState(false)
  const [removeOpen, setRemoveOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pendingItem, setPendingItem] = useState(null)
  const [checkoutForm, setCheckoutForm] = useState(EMPTY_CHECKOUT_FORM)
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [ownerQuery, setOwnerQuery] = useState('')
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false)

  const isAdminLike = Boolean(session && ['admin', 'superadmin'].includes(session.role))
  const ownerOptions = useMemo(() => {
    return users.map((user) => ({ label: user.username, value: user.username, id: user.id }))
  }, [users])

  const filteredOwnerOptions = useMemo(() => {
    const query = ownerQuery.trim().toLowerCase()
    if (!query || !isAdminLike) return ownerOptions
    return ownerOptions.filter((item) => item.label.toLowerCase().includes(query))
  }, [isAdminLike, ownerOptions, ownerQuery])

  useEffect(() => {
    if (!checkoutOpen || !isAdminLike || users.length) return

    let mounted = true
    setLoadingUsers(true)
    api
      .get('/admin/users')
      .then((response) => {
        if (!mounted) return
        setUsers(response.data || [])
      })
      .catch((error) => {
        if (!mounted) return
        pushToast('error', '用户列表加载失败', getApiErrorMessage(error))
      })
      .finally(() => {
        if (mounted) setLoadingUsers(false)
      })

    return () => {
      mounted = false
    }
  }, [checkoutOpen, isAdminLike, pushToast, users.length])

  useEffect(() => {
    if (!checkoutOpen || isAdminLike) return

    const query = ownerQuery.trim()
    if (!query) {
      setUsers([])
      setLoadingUsers(false)
      return undefined
    }

    let mounted = true
    setLoadingUsers(true)
    const timer = window.setTimeout(() => {
      api
        .get('/public/users/search', { params: { q: query } })
        .then((response) => {
          if (!mounted) return
          setUsers(response.data || [])
        })
        .catch((error) => {
          if (!mounted) return
          pushToast('error', 'owner 检索失败', getApiErrorMessage(error))
        })
        .finally(() => {
          if (mounted) setLoadingUsers(false)
        })
    }, 220)

    return () => {
      mounted = false
      window.clearTimeout(timer)
    }
  }, [checkoutOpen, isAdminLike, ownerQuery, pushToast])

  useEffect(() => {
    if (!checkoutOpen) return
    setOwnerDropdownOpen(false)
  }, [checkoutOpen])

  const openCheckout = () => {
    setCheckoutForm({
      ...EMPTY_CHECKOUT_FORM,
      owner_username: '',
    })
    setOwnerQuery('')
    setCheckoutOpen(true)
  }

  const commitQuantity = (productId, nextQuantity) => {
    updateCartQuantity(productId, nextQuantity)
  }

  const submitCheckout = async () => {
    const companyName = checkoutForm.company_name.trim()
    if (!companyName) {
      pushToast('error', '请输入公司名')
      return
    }

    if (!cartItems.length) {
      pushToast('error', '购物车是空的')
      return
    }

    const ownerUsername = checkoutForm.owner_username.trim()
    if (!ownerUsername) {
      pushToast('error', '请输入 owner username')
      return
    }
    const owner = ownerOptions.find((item) => item.value === ownerUsername)
    const ownerId = owner?.id || (session ? session?.user?.id || session?.id || '' : '')

    const customerEndpoint = isAdminLike ? '/admin/customers' : '/public/customers'
    const orderEndpoint = isAdminLike ? '/admin/orders' : '/public/orders'
    const items = cartItems.map((item) => ({
      product_id: item.id,
      product_name: item.name,
      product_category: item.category || '',
      variant_name: item.variantName || '',
      qty: item.quantity,
      price: item.price,
    }))
    const totalPrice = Number(cartTotal || 0)

    setSubmitting(true)
    try {
      const customerResponse = await api.post(customerEndpoint, {
        company_name: companyName,
        purchaser: checkoutForm.purchaser.trim(),
        phone: checkoutForm.phone.trim(),
        shipping_address: checkoutForm.shipping_address.trim(),
        owner_username: ownerUsername,
        owner_id: ownerId,
      })

      await api.post(orderEndpoint, {
        customer_name: companyName,
        customer_id: customerResponse.data?.id || '',
        customer_phone: checkoutForm.phone.trim(),
        shipping_address: checkoutForm.shipping_address.trim(),
        remarks: checkoutForm.remarks.trim(),
        total_price: totalPrice,
        owner_username: ownerUsername,
        owner_id: ownerId,
        items,
      })

      clearCart()
      setCheckoutOpen(false)
      setCheckoutForm(EMPTY_CHECKOUT_FORM)
      pushToast('success', '下单成功', `${companyName} 的订单已创建`)
    } catch (error) {
      pushToast('error', '下单失败', getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-700 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            返回上一页
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-gray-900">购物车是空的</h1>
          <p className="mt-2 text-sm text-gray-500">去选品页挑选一些商品吧。</p>
          <Button asChild className="mt-6 rounded-lg bg-blue-700 text-white hover:bg-blue-800">
            <Link to="/catalog">去选品</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-700 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          返回上一页
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex gap-4 p-4 sm:p-5">
                <img src={item.image_url} alt={item.name} className="h-28 w-28 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-semibold text-gray-900">{item.name}</div>
                  {item.variantName && (
                    <div className="mt-1 inline-flex items-center rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {item.variantName}
                    </div>
                  )}
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{item.description}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <CartQuantityControl
                      quantity={item.quantity}
                      onCommit={(nextQuantity) => commitQuantity(item.id, nextQuantity)}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className="text-right text-lg font-semibold text-gray-900">{formatCurrency(item.subtotal)}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingItem(item)
                      setRemoveOpen(true)
                    }}
                    className="inline-flex items-center gap-2 text-sm text-red-600 transition hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    移除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">订单汇总</div>
          <div className="mt-5 space-y-3">
            <SummaryRow label="商品种类" value={cartCount} />
            <SummaryRow label="采购总量" value={cartItems.reduce((sum, item) => sum + item.quantity, 0)} />
            <SummaryRow label="商品小计" value={formatCurrency(cartTotal)} />
          </div>
          <div className="mt-6 space-y-3">
            <Button onClick={openCheckout} className={SUMMARY_BUTTON_PRIMARY}>
              去下单
            </Button>
            <Button
              variant="secondary"
              className={SUMMARY_BUTTON_DANGER}
              onClick={() => setClearOpen(true)}
            >
              清空购物车
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={removeOpen}
        title="确认移除商品"
        description={`你正在从购物车移除「${pendingItem?.name || ''}」，确认后将立即生效。`}
        confirmLabel="确认移除"
        cancelLabel="取消"
        destructive
        onOpenChange={(open) => {
          setRemoveOpen(open)
          if (!open) {
            setPendingItem(null)
          }
        }}
        onConfirm={() => {
          if (!pendingItem) return
          updateCartQuantity(pendingItem.id, 0)
          setRemoveOpen(false)
          setPendingItem(null)
        }}
      />

      <ConfirmDialog
        open={clearOpen}
        title="确认清空购物车"
        description="清空后当前购物车里的所有商品都会被移除，此操作不可恢复。"
        confirmLabel="确认清空"
        cancelLabel="取消"
        destructive
        onOpenChange={setClearOpen}
        onConfirm={() => {
          clearCart()
          setClearOpen(false)
        }}
      />

      <Modal open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <ModalContent className="max-w-4xl border border-gray-200 bg-white text-gray-900 shadow-xl rounded-xl">
          <ModalHeader className="border-b border-gray-200 bg-gray-50 px-6 py-5">
            <div className="text-xs font-medium uppercase tracking-wider text-gray-500">聚合表单</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">创建客户和订单</div>
          </ModalHeader>

          <ModalBody className="max-h-[78vh] overflow-y-auto bg-white px-6 py-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <section className="space-y-4">
                <div className="text-sm font-semibold text-gray-900">客户信息</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={checkoutForm.company_name}
                    onChange={(event) => setCheckoutForm((current) => ({ ...current, company_name: event.target.value }))}
                    placeholder="公司名"
                  />
                  <Input
                    value={checkoutForm.purchaser}
                    onChange={(event) => setCheckoutForm((current) => ({ ...current, purchaser: event.target.value }))}
                    placeholder="采购员"
                  />
                  <Input
                    value={checkoutForm.phone}
                    onChange={(event) => setCheckoutForm((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="联系电话"
                  />
                  <div className="relative space-y-1">
                    <Input
                      value={ownerQuery}
                      onChange={(event) => {
                        const nextValue = event.target.value
                        setOwnerQuery(nextValue)
                        setCheckoutForm((current) => ({ ...current, owner_username: nextValue }))
                        setOwnerDropdownOpen(true)
                      }}
                      onFocus={() => setOwnerDropdownOpen(true)}
                      onBlur={() => {
                        window.setTimeout(() => setOwnerDropdownOpen(false), 120)
                      }}
                      placeholder="输入 username 搜索 owner"
                      disabled={loadingUsers && !ownerQuery.trim()}
                      className="pr-10"
                    />
                    <ChevronDown className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-gray-500" />
                    {ownerDropdownOpen && filteredOwnerOptions.length ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                        {filteredOwnerOptions.map((item) => (
                          <button
                            key={item.id || item.value}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault()
                              setCheckoutForm((current) => ({ ...current, owner_username: item.value }))
                              setOwnerQuery(item.value)
                              setOwnerDropdownOpen(false)
                            }}
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                          >
                            <span>{item.label}</span>
                            {checkoutForm.owner_username === item.value ? <Check className="h-4 w-4 text-blue-700" /> : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className="text-xs text-gray-500">
                      {session ? '输入 username 搜索并选择订单 owner。' : '未登录也可以下单，只需检索并选择 owner username。'}
                    </div>
                  </div>
                </div>
                <Textarea
                  value={checkoutForm.shipping_address}
                  onChange={(event) => setCheckoutForm((current) => ({ ...current, shipping_address: event.target.value }))}
                  placeholder="发货地址"
                />
                <Textarea
                  value={checkoutForm.remarks}
                  onChange={(event) => setCheckoutForm((current) => ({ ...current, remarks: event.target.value }))}
                  placeholder="备注"
                />
              </section>

              <section className="space-y-4">
                <div className="text-sm font-semibold text-gray-900">订单预览</div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-gray-900">{item.name}</div>
                          {item.variantName && (
                            <div className="text-xs text-blue-600">{item.variantName}</div>
                          )}
                          <div className="text-xs text-gray-500">x {item.quantity}</div>
                        </div>
                        <div className="font-medium text-gray-900">{formatCurrency(item.subtotal)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <SummaryRow label="总计" value={formatCurrency(cartTotal)} />
                  </div>
                </div>
              </section>
            </div>
          </ModalBody>

          <ModalFooter className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              className="h-10 rounded-lg border border-gray-300 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setCheckoutOpen(false)}
            >
              取消
            </Button>
            <Button
              className="h-10 rounded-lg bg-blue-700 px-5 text-sm font-medium text-white hover:bg-blue-800"
              onClick={submitCheckout}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '确认下单'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

function CartQuantityControl({ quantity, onCommit }) {
  const [draft, setDraft] = useState(String(quantity || 1))
  const [isEditing, setIsEditing] = useState(false)
  const [commitTimer, setCommitTimer] = useState(null)

  useEffect(() => {
    if (isEditing) return
    setDraft(String(quantity || 1))
  }, [isEditing, quantity])

  useEffect(() => {
    return () => {
      if (commitTimer) {
        window.clearTimeout(commitTimer)
      }
    }
  }, [commitTimer])

  const normalized = Math.min(99, Math.max(1, Number.parseInt(draft || '1', 10) || 1))

  const commit = (nextValue) => {
    if (commitTimer) {
      window.clearTimeout(commitTimer)
      setCommitTimer(null)
    }
    const nextQuantity = Math.min(99, Math.max(1, Number.parseInt(String(nextValue || '1'), 10) || 1))
    setDraft(String(nextQuantity))
    setIsEditing(false)
    onCommit(nextQuantity)
  }

  const scheduleCommit = (nextValue) => {
    if (commitTimer) {
      window.clearTimeout(commitTimer)
    }
    const timer = window.setTimeout(() => {
      const nextQuantity = Math.min(99, Math.max(1, Number.parseInt(String(nextValue || '1'), 10) || 1))
      setDraft(String(nextQuantity))
      setIsEditing(false)
      onCommit(nextQuantity)
    }, 260)
    setCommitTimer(timer)
  }

  return (
    <div className="inline-flex h-8 items-center rounded-lg border border-gray-300 bg-gray-50 p-1">
      <button
        type="button"
        onClick={() => {
          const nextQuantity = normalized - 1
          setDraft(String(Math.min(99, Math.max(1, nextQuantity))))
          setIsEditing(true)
          scheduleCommit(nextQuantity)
        }}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition hover:bg-white hover:text-gray-900 hover:shadow-sm"
        aria-label="减少数量"
      >
        <Minus className="h-3 w-3" />
      </button>
      <input
        value={draft}
        onChange={(event) => {
          const nextValue = event.target.value.replace(/[^\d]/g, '')
          setDraft(nextValue)
          setIsEditing(true)
          scheduleCommit(nextValue)
        }}
        onBlur={() => commit(normalized)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur()
          }
        }}
        inputMode="numeric"
        pattern="[0-9]*"
        className="h-6 w-11 border-0 bg-transparent px-1 text-center text-xs font-semibold text-gray-900 outline-none"
        aria-label="数量"
        title="可直接输入数量"
      />
      <button
        type="button"
        onClick={() => {
          const nextQuantity = normalized + 1
          setDraft(String(Math.min(99, Math.max(1, nextQuantity))))
          setIsEditing(true)
          scheduleCommit(nextQuantity)
        }}
        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition hover:bg-white hover:text-gray-900 hover:shadow-sm"
        aria-label="增加数量"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
