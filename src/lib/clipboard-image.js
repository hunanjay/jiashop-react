function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('读取剪贴板图片失败'))
    reader.readAsDataURL(file)
  })
}

export async function extractClipboardImage(event) {
  const clipboard = event?.clipboardData
  if (!clipboard) return null

  const items = Array.from(clipboard.items || [])
  for (const item of items) {
    if (item.kind !== 'file') continue
    if (!item.type || !item.type.startsWith('image/')) continue
    const file = item.getAsFile?.()
    if (!file) continue
    return readFileAsDataUrl(file)
  }

  const files = Array.from(clipboard.files || [])
  const file = files.find((item) => item.type && item.type.startsWith('image/'))
  if (file) {
    return readFileAsDataUrl(file)
  }

  const text = clipboard.getData?.('text/plain') || clipboard.getData?.('text') || ''
  if (typeof text === 'string' && text.startsWith('data:image/')) {
    return text
  }

  return null
}
