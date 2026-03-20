import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api'

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

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  delete api.defaults.headers.common.Authorization
}
