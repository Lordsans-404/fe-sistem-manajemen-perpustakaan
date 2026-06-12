import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('login')
    
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('access_token')
      window.location.href = '/auth/login'
    } else if (error.response?.status === 403) {
      const message = error.response.data?.message || 'Akses ditolak (403).'
      alert(`Akses Ditolak: ${message}\n\nPastikan Anda memiliki hak akses yang sesuai.`)
    }
    return Promise.reject(error)
  },
)

export default api
export { api }
