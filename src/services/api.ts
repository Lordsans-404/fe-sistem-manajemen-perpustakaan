import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

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
      // Prevent spam alerts entirely on the profile page
      if (window.location.pathname === '/app/profile') {
        return Promise.reject(error)
      }

      const message = error.response.data?.message || 'Akses ditolak (403).'
      const user = useAuthStore.getState().user
      
      // If user state is loaded but missing a profile, or not loaded yet (fallback)
      const hasNoProfile = user ? (!user.member_profile && !user.staff_profile) : true

      if (hasNoProfile) {
        window.location.href = '/app/profile'
      } else {
        alert(`Akses Ditolak: ${message}\n\nPastikan Anda memiliki hak akses yang sesuai.`)
      }
    }
    return Promise.reject(error)
  },
)

export default api
export { api }
