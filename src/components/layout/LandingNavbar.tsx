import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface LandingNavbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export function LandingNavbar({ searchTerm, onSearchChange }: LandingNavbarProps) {
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
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
      <div className="flex justify-between items-center px-gutter h-16 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-xl">
          <span className="text-h3 font-bold text-primary">Campus Library</span>
        </div>
        <div className="flex items-center gap-md">
          <div className="hidden lg:flex items-center bg-surface-container-low px-sm py-xs rounded-md border border-outline-variant">
            <SearchIcon className="w-5 h-5 text-outline" />
            <input
              className="bg-transparent border-none outline-none text-body-sm w-48 px-sm"
              placeholder="Quick search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-surface-variant/50 text-on-surface transition-colors flex items-center justify-center"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <Link
            to="/auth/login"
            className="bg-primary text-on-primary px-lg py-sm rounded-md text-label-md font-medium hover:opacity-90 transition-opacity"
          >
            Masuk
          </Link>
        </div>
      </div>
    </header>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 21L15 15M17 10C17 13.87 13.87 17 10 17C6.13 17 3 13.87 3 10C3 6.13 6.13 3 10 3C13.87 3 17 6.13 17 10Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}
