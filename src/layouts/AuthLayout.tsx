import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Perpustakaan
          </h1>
          <p className="text-neutral-400 text-sm">
            Silakan masuk untuk mengakses katalog buku
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
