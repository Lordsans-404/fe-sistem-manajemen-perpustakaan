import { Outlet, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export function AuthLayout() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-on-surface px-4 selection:bg-primary selection:text-on-primary relative overflow-hidden">
      {/* Creative Background Blobs */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Top Navbar for back button and dark mode toggle */}
      <div className="absolute top-0 left-0 w-full p-lg flex justify-between items-center z-20">
        <Link to="/" className="text-secondary hover:text-primary transition-colors flex items-center gap-xs text-label-md font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Beranda
        </Link>
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-full hover:bg-surface-variant/50 text-on-surface transition-colors flex items-center justify-center"
          aria-label="Toggle Dark Mode"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="w-full max-w-[28rem] bg-surface-container-lowest border border-outline-variant p-2xl rounded-2xl shadow-xl relative z-10 backdrop-blur-sm">
        <div className="text-center mb-xl">
          <h1 className="text-h2 text-primary mb-xs">
            Perpus Kampus
          </h1>
          <p className="text-body-sm text-secondary">
            Portal perpustakaan digital
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
