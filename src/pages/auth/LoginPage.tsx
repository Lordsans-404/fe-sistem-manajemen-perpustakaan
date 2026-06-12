import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

export function LoginPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Selamat Datang Kembali</h2>
        <p className="text-neutral-400 text-sm mt-1">
          Silakan masuk untuk melanjutkan
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 text-sm rounded-xl text-left">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="nama@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className={cn(
            "w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors cursor-pointer text-sm",
            loginMutation.isPending && "cursor-not-allowed"
          )}
        >
          {loginMutation.isPending ? 'Sedang Masuk...' : 'Masuk'}
        </button>
      </form>

      <div className="text-center text-sm text-neutral-400">
        Belum punya akun?{' '}
        <Link to="/auth/register" className="text-indigo-400 hover:underline">
          Daftar Sekarang
        </Link>
      </div>
    </div>
  )
}
