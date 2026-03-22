export function matchesProductQuery(product, query) {
  const normalized = (query || '').trim().toLowerCase()
  if (!normalized) return true

  const text = `${product?.name || ''} ${product?.description || ''} ${product?.category || ''}`.toLowerCase()
  return text.includes(normalized)
}

export function searchProducts(products, query) {
  return (products || []).filter((product) => matchesProductQuery(product, query))
}
