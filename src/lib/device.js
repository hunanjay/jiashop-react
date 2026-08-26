const STORAGE_KEY = 'giftcraft-device-id'

// ponytail: 环境指纹 + localStorage，清缓存/换浏览器会算作新设备；要跨浏览器精度再上 FingerprintJS
function fingerprint() {
  const parts = [
    navigator.userAgent,
    navigator.language,
    navigator.platform || '',
    navigator.hardwareConcurrency || 0,
    window.screen?.width,
    window.screen?.height,
    window.screen?.colorDepth,
    new Date().getTimezoneOffset(),
  ].join('|')

  let hash = 0
  for (let index = 0; index < parts.length; index += 1) {
    hash = (Math.imul(hash, 31) + parts.charCodeAt(index)) | 0
  }
  return `fp${(hash >>> 0).toString(16)}`
}

export function getDeviceId() {
  if (typeof window === 'undefined') return ''

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing) return existing
    const next = `${fingerprint()}-${window.crypto?.randomUUID?.() || Math.random().toString(16).slice(2)}`
    window.localStorage.setItem(STORAGE_KEY, next)
    return next
  } catch {
    return fingerprint() // 无痕模式没有 localStorage，退化成纯指纹
  }
}
