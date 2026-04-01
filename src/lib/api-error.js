function stripHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractHtmlTitle(value) {
  const titleMatch = value.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (titleMatch?.[1]) {
    const title = titleMatch[1].replace(/\s+/g, ' ').trim()
    if (title) return title
  }

  const h1Match = value.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1Match?.[1]) {
    const title = h1Match[1].replace(/\s+/g, ' ').trim()
    if (title) return title
  }

  return stripHtml(value)
}

export function getApiErrorMessage(error, fallback = '请稍后重试') {
  const payload = error?.response?.data

  if (typeof payload === 'string' && payload.trim()) {
    const text = payload.trim()
    if (/<\/?[a-z][\s\S]*>/i.test(text)) {
      const htmlTitle = extractHtmlTitle(text)
      return htmlTitle || fallback
    }
    return text
  }

  if (payload && typeof payload === 'object') {
    const explicit = [payload.error, payload.message, payload.detail].find((item) => typeof item === 'string' && item.trim())
    if (explicit) return explicit.trim()
  }

  const status = error?.response?.status
  const statusText = error?.response?.statusText
  if (status && statusText) {
    return `${status} ${statusText}`.trim()
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim()
  }

  return fallback
}

