import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/common/Button'

import { useQueryClient } from '@tanstack/react-query'

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogout = () => {
    queryClient.clear()
    logout()
    navigate('/auth/login')
  }

  const getRoleBadge = () => {
    if (user?.staff_profile) {
      const roleMap = {
        librarian: 'Pustakawan',
        admin: 'Admin',
        supervisor: 'Supervisor',
      }
      return roleMap[user.staff_profile.role] || 'Staff'
    }
    if (user?.member_profile) {
      return user.member_profile.is_verified ? 'Member Terverifikasi' : 'Member'
    }
    return 'User'
  }

  return (
    <nav className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800/80 py-4 px-4 md:px-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
            aria-label="Toggle Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
          P
        </div>
        <span className="text-base md:text-lg font-bold text-white tracking-tight hidden sm:block">
          Perpustakaan Digital
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold text-white">{user.name}</div>
            <div className="text-xs text-neutral-400 font-medium">
              {getRoleBadge()}
            </div>
          </div>
          <div className="h-8 w-px bg-neutral-800" />
          <Button variant="ghost" className="py-2 px-3 text-xs" onClick={handleLogout}>
            Keluar
          </Button>
        </div>
      )}
    </nav>
  )
}
