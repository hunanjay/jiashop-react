import { useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'

import { api } from '../../lib/api'
import { useApp } from '../../lib/app-context'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../../components/ui/sheet'
import { formatCurrency } from '../../lib/format'

const EMPTY_FORM = {
  id: null,
  name: '',
  description: '',
  price: 0,
  stock: 10,
  image_url: '',
  category: 'Awards',
  customization: '{\n  "type": "Engraving",\n  "fields": ["Name"]\n}',
}

export default function ProductManagerPage() {
  const { products, reloadProducts, pushToast } = useApp()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('create')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const categories = useMemo(() => {
    return ['all', ...new Set(products.map((product) => product.category).filter(Boolean))]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = `${product.name} ${product.description || ''}`.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || product.category === category
      return matchesSearch && matchesCategory
    })
  }, [products, search, category])

  const openCreate = () => {
    setMode('create')
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  const openEdit = (product) => {
    setMode('edit')
    setForm({
      id: product.id,
      name: product.name || '',
      description: product.description || '',
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      image_url: product.image_url || '',
      category: product.category || 'Awards',
      customization: JSON.stringify(product.customization || {}, null, 2),
    })
    setOpen(true)
  }

  const parseCustomization = () => {
    const input = form.customization.trim()
    if (!input) return {}
    return JSON.parse(input)
  }

  const saveProduct = async () => {
    if (!form.name.trim()) {
      pushToast('error', '请输入商品名称')
      return
    }

    let customization
    try {
      customization = parseCustomization()
    } catch {
      pushToast('error', 'JSON 格式不正确')
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      image_url: form.image_url.trim(),
      category: form.category,
      customization,
    }

    setSaving(true)
    try {
      if (mode === 'create') {
        await api.post('/products', payload)
        pushToast('success', '商品已创建')
      } else {
        await api.put(`/products/${form.id}`, payload)
        pushToast('success', '商品已更新')
      }
      setOpen(false)
      reloadProducts()
    } catch {
      pushToast('error', '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (product) => {
    try {
      await api.delete(`/products/${product.id}`)
      pushToast('success', '商品已删除')
      reloadProducts()
    } catch {
      pushToast('error', '删除失败')
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索商品" className="pl-11" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? '全部分类' : item}
                </option>
              ))}
            </select>

            <Button variant="secondary" onClick={reloadProducts}>
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              新增商品
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>商品列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>库存</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={product.image_url} alt={product.name} className="h-14 w-14 rounded-2xl object-cover" />
                      <div>
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="line-clamp-1 text-sm text-slate-500">{product.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock <= 3 ? 'destructive' : 'secondary'}>
                      {product.stock <= 3 ? '库存紧张' : product.stock <= 10 ? '库存关注' : '库存充足'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(product)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteProduct(product)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{mode === 'create' ? '新增商品' : '编辑商品'}</SheetTitle>
            <SheetDescription>使用右侧抽屉编辑商品信息，保持上下文不丢失。</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">商品名称</span>
                <Input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">分类</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"
                >
                  {['Awards', 'Stationery', 'Corporate Gifts', 'Accessories', 'Other'].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">价格</span>
                  <Input type="number" value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))} />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">库存</span>
                  <Input type="number" value={form.stock} onChange={(e) => setForm((current) => ({ ...current, stock: e.target.value }))} />
                </label>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">图片地址</span>
                <Input value={form.image_url} onChange={(e) => setForm((current) => ({ ...current, image_url: e.target.value }))} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">商品描述</span>
                <Textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} rows={5} />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">自定义 JSON</span>
                <Textarea value={form.customization} onChange={(e) => setForm((current) => ({ ...current, customization: e.target.value }))} rows={8} />
              </label>
            </div>
          </SheetBody>
          <SheetFooter>
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button onClick={saveProduct} disabled={saving}>
                {saving ? '保存中...' : '保存商品'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
