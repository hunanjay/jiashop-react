import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'

import { api } from '../lib/api'
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
  'h-11 w-full rounded-full px-4 text-sm font-semibold transition'
const SUMMARY_BUTTON_PRIMARY =
  `${SUMMARY_BUTTON_BASE} bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-dim)]`
const SUMMARY_BUTTON_DANGER =
  `${SUMMARY_BUTTON_BASE} border border-[var(--outline-variant)]/35 bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] hover:border-rose-300 hover:text-rose-600`

function resolveApiError(error, fallback = '请稍后重试') {
  const payload = error?.response?.data
  if (typeof payload === 'string' && payload.trim()) return payload.trim()
  if (payload && typeof payload === 'object') {
    const text = [payload.error, payload.message, payload.detail].find((item) => typeof item === 'string' && item.trim())
    if (text) return text.trim()
  }
  if (typeof error?.message === 'string' && error.message.trim()) return error.message.trim()
  return fallback
}

export default function CartPage() {
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
        pushToast('error', '用户列表加载失败', resolveApiError(error))
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
          pushToast('error', 'owner 检索失败', resolveApiError(error))
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
      pushToast('error', '下单失败', resolveApiError(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="rounded-3xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-container)] text-[var(--on-surface)]">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-[var(--on-surface)]">购物车是空的</h1>
          <p className="mt-2 text-sm text-[var(--on-surface-variant)]">去选品页挑选一些商品吧。</p>
          <Button asChild className="mt-6 rounded-full bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-dim)]">
            <Link to="/catalog">去选品</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-3xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] shadow-sm"
            >
              <div className="flex gap-4 p-4 sm:p-5">
                <img src={item.image_url} alt={item.name} className="h-28 w-28 rounded-[24px] object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-semibold text-[var(--on-surface)]">{item.name}</div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--on-surface-variant)]">{item.description}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <CartQuantityControl
                      quantity={item.quantity}
                      onCommit={(nextQuantity) => commitQuantity(item.id, nextQuantity)}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className="text-right text-lg font-semibold text-[var(--on-surface)]">{formatCurrency(item.subtotal)}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingItem(item)
                      setRemoveOpen(true)
                    }}
                    className="inline-flex items-center gap-2 text-sm text-rose-600 transition hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    移除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--on-surface-variant)]">订单汇总</div>
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
        <ModalContent className="max-w-4xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] text-[var(--on-surface)] shadow-[0_40px_120px_rgba(15,23,42,0.22)]">
          <ModalHeader className="border-b border-[var(--outline-variant)]/25 bg-[var(--surface-container-low)] px-6 py-5">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--on-surface-variant)]">聚合表单</div>
            <div className="mt-1 text-2xl font-semibold tracking-[-0.03em]">创建客户和订单</div>
          </ModalHeader>

          <ModalBody className="max-h-[78vh] overflow-y-auto bg-[var(--surface-container-lowest)] px-6 py-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <section className="space-y-4">
                <div className="text-sm font-semibold text-[var(--on-surface)]">客户信息</div>
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
                    <ChevronDown className="pointer-events-none absolute right-4 top-3.5 h-4 w-4 text-[var(--on-surface-variant)]" />
                    {ownerDropdownOpen && filteredOwnerOptions.length ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
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
                            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-[var(--on-surface)] transition hover:bg-[var(--surface-container-low)]"
                          >
                            <span>{item.label}</span>
                            {checkoutForm.owner_username === item.value ? <Check className="h-4 w-4 text-[var(--primary)]" /> : null}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className="text-xs text-[var(--on-surface-variant)]">
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
                <div className="text-sm font-semibold text-[var(--on-surface)]">订单预览</div>
                <div className="rounded-3xl border border-[var(--outline-variant)]/35 bg-[var(--surface-container-low)] p-4">
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-[var(--on-surface)]">{item.name}</div>
                          <div className="text-xs text-[var(--on-surface-variant)]">x {item.quantity}</div>
                        </div>
                        <div className="font-medium text-[var(--on-surface)]">{formatCurrency(item.subtotal)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-[var(--outline-variant)]/25 pt-4">
                    <SummaryRow label="总计" value={formatCurrency(cartTotal)} />
                  </div>
                </div>
              </section>
            </div>
          </ModalBody>

          <ModalFooter className="flex flex-col gap-3 border-t border-[var(--outline-variant)]/25 bg-[var(--surface-container-low)] px-6 py-5 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              className="h-11 rounded-full border border-[var(--outline-variant)]/35 bg-[var(--surface-container-lowest)] px-5 text-sm font-semibold text-[var(--on-surface)] hover:border-[var(--primary)]/35 hover:text-[var(--primary)]"
              onClick={() => setCheckoutOpen(false)}
            >
              取消
            </Button>
            <Button
              className="h-11 rounded-full bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--on-primary)] hover:bg-[var(--primary-dim)]"
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
    <div className="inline-flex h-7 items-center rounded-full border border-[var(--outline-variant)]/35 bg-[var(--surface-container-low)] p-0.5">
      <button
        type="button"
        onClick={() => {
          const nextQuantity = normalized - 1
          setDraft(String(Math.min(99, Math.max(1, nextQuantity))))
          setIsEditing(true)
          scheduleCommit(nextQuantity)
        }}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]"
        aria-label="减少数量"
      >
        <Minus className="h-2.5 w-2.5" />
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
        className="h-6 w-11 border-0 bg-transparent px-1 text-center text-xs font-semibold text-[var(--on-surface)] outline-none"
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
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]"
        aria-label="增加数量"
      >
        <Plus className="h-2.5 w-2.5" />
      </button>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--on-surface-variant)]">{label}</span>
      <span className="font-medium text-[var(--on-surface)]">{value}</span>
    </div>
  )
}
