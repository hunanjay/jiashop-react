import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api'
let refreshPromise = null

function emitSessionExpired(reason = 'session-expired') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('giftcraft:session-expired', { detail: { reason } }))
}

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const session = typeof window !== 'undefined' ? window.localStorage.getItem('giftcraft-session') : null

  if (!config.headers.Authorization && session) {
    try {
      const parsed = JSON.parse(session)
      if (parsed?.access_token) {
        config.headers.Authorization = `Bearer ${parsed.access_token}`
      }
    } catch {
      // Ignore malformed localStorage session state.
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      const sessionRaw = typeof window !== 'undefined' ? window.localStorage.getItem('giftcraft-session') : null
      let refreshToken = null

      if (sessionRaw) {
        try {
          const parsed = JSON.parse(sessionRaw)
          refreshToken = parsed?.refresh_token || null
        } catch {
          refreshToken = null
        }
      }

      if (!refreshToken) {
        if (sessionRaw) {
          emitSessionExpired('missing-refresh-token')
        }
        return Promise.reject(error)
      }

      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      try {
        const refreshResponse = await refreshPromise
        const nextAccessToken = refreshResponse.data?.access_token
        if (!nextAccessToken) {
          if (sessionRaw) {
            emitSessionExpired('missing-access-token')
          }
          return Promise.reject(error)
        }

        if (typeof window !== 'undefined' && sessionRaw) {
          const parsed = JSON.parse(sessionRaw)
          const nextSession = {
            ...parsed,
            access_token: nextAccessToken,
            session_id: refreshResponse.data?.session_id || parsed?.session_id,
          }
          window.localStorage.setItem('giftcraft-session', JSON.stringify(nextSession))
        }

        api.defaults.headers.common.Authorization = `Bearer ${nextAccessToken}`
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`
        return api(originalRequest)
      } catch {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('giftcraft-session')
        }
        delete api.defaults.headers.common.Authorization
        if (sessionRaw) {
          emitSessionExpired('refresh-failed')
        }
      }
    }

    return Promise.reject(error)
  },
)

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}
