import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-100">
      <h1 className="text-6xl font-extrabold text-white mb-4">404</h1>
      <p className="text-neutral-400 mb-8">Halaman yang Anda cari tidak ditemukan.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}
