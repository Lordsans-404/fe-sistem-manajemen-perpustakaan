import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

export function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      queryClient.clear()
      setAuth(data.data.access_token, null)
      navigate('/app', { replace: true })
    },
    onError: (err: unknown) => {
      // safe narrowing for error type
      const error = err as { response?: { data?: { message?: string } } }
      setErrorMsg(
        error.response?.data?.message ||
          'Gagal masuk. Silakan periksa kembali email dan password Anda.'
      )
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!email || !password) {
      setErrorMsg('Semua field wajib diisi.')
      return
    }
    loginMutation.mutate({ email, password })
  }

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="text-h3 text-on-surface">Selamat Datang Kembali</h2>
        <p className="text-body-sm text-secondary mt-1">
          Silakan masuk untuk melanjutkan
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-error-container border border-error text-on-error-container text-body-sm rounded-md text-left">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-md text-left">
        <div>
          <label className="block text-label-sm text-outline uppercase tracking-wider mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-md px-md py-sm text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="nama@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-label-sm text-outline uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-md px-md py-sm text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className={cn(
            "w-full bg-primary hover:opacity-90 disabled:opacity-50 text-on-primary font-medium py-sm rounded-md transition-colors cursor-pointer text-label-md",
            loginMutation.isPending && "cursor-not-allowed"
          )}
        >
          {loginMutation.isPending ? 'Sedang Masuk...' : 'Masuk'}
        </button>
      </form>

      <div className="text-center text-body-sm text-secondary pt-sm">
        Belum punya akun?{' '}
        <Link to="/auth/register" className="text-primary font-medium hover:underline">
          Daftar Sekarang
        </Link>
      </div>
    </div>
  )
}
