const currencyFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
})

function normalizeDateValue(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(trimmed)
  return new Date(hasTimezone ? trimmed : `${trimmed}Z`)
}

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0))
}

export function parseApiDateTime(value) {
  return normalizeDateValue(value)
}

export function formatDateTime(value) {
  const date = normalizeDateValue(value)
  if (!date || Number.isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
