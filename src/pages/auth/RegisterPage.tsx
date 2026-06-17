import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

export function RegisterPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      setSuccessMsg('Registrasi berhasil! Mengalihkan ke halaman login...')
      setTimeout(() => {
        navigate('/auth/login')
      }, 2000)
    },
    onError: (err: unknown) => {
      const error = err as {
        response?: {
          data?: {
            message?: string
            errors?: Record<string, string[] | string>
          }
        }
      }
      const data = error.response?.data
      if (data?.errors && typeof data.errors === 'object') {
        const fieldErrors = Object.entries(data.errors)
          .map(([field, msgs]) => {
            const fieldName =
              field === 'phone_number'
                ? 'Nomor Telepon'
                : field === 'email'
                ? 'Email'
                : field === 'password'
                ? 'Password'
                : field === 'name'
                ? 'Nama'
                : field
            const msgList = Array.isArray(msgs) ? msgs.join(', ') : String(msgs)
            return `${fieldName}: ${msgList}`
          })
          .join('\n')
        setErrorMsg(fieldErrors || data.message || 'Gagal mendaftar.')
      } else {
        setErrorMsg(data?.message || 'Gagal mendaftar. Silakan coba lagi.')
      }
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!name || !email || !password) {
      setErrorMsg('Nama, Email, dan Password wajib diisi.')
      return
    }

    if (password.length < 8) {
      setErrorMsg('Password minimal 8 karakter.')
      return
    }

    registerMutation.mutate({
      name,
      email,
      password,
      phone_number: phone || null,
    })
  }

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="text-h3 text-on-surface">Daftar Akun Baru</h2>
        <p className="text-body-sm text-secondary mt-1">
          Lengkapi data di bawah untuk bergabung
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-error-container border border-error text-on-error-container text-body-sm rounded-md text-left whitespace-pre-line">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-950/20 border border-green-600 text-green-600 text-body-sm rounded-md text-left dark:text-green-400">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-md text-left">
        <div>
          <label className="block text-label-sm text-outline uppercase tracking-wider mb-2">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-md px-md py-sm text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="John Doe"
            required
          />
        </div>

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
            placeholder="Min. 8 karakter"
            required
          />
        </div>

        <div>
          <label className="block text-label-sm text-outline uppercase tracking-wider mb-2">
            Nomor Telepon (Opsional)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-md px-md py-sm text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="08123456789"
          />
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className={cn(
            "w-full bg-primary hover:opacity-90 disabled:opacity-50 text-on-primary font-medium py-sm rounded-md transition-colors cursor-pointer text-label-md",
            registerMutation.isPending && "cursor-not-allowed"
          )}
        >
          {registerMutation.isPending ? 'Sedang Mendaftar...' : 'Daftar'}
        </button>
      </form>

      <div className="text-center text-body-sm text-secondary pt-sm">
        Sudah punya akun?{' '}
        <Link to="/auth/login" className="text-primary font-medium hover:underline">
          Masuk di sini
        </Link>
      </div>
    </div>
  )
}
