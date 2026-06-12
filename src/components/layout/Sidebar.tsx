import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user)
  const isStaff = !!user?.staff_profile

  const memberMenu = [
    { to: '/app', label: 'Beranda' },
    { to: '/app/books', label: 'Katalog Buku' },
    { to: '/app/borrows', label: 'Peminjaman Saya' },
    { to: '/app/fines', label: 'Denda Saya' },
    { to: '/app/profile', label: 'Profil Saya' },
  ]

  const staffMenu = [
    { to: '/app', label: 'Beranda Staff' },
    { to: '/app/staff/books', label: 'Kelola Buku' },
    { to: '/app/staff/borrows', label: 'Peminjaman Member' },
    { to: '/app/staff/fines', label: 'Kasir Denda' },
    { to: '/app/staff/members', label: 'Verifikasi & Member' },
    { to: '/app/staff/libraries', label: 'Cabang Perpustakaan' },
  ]

  if (user?.staff_profile && ['admin', 'supervisor'].includes(user.staff_profile.role)) {
    staffMenu.push({ to: '/app/staff/management', label: 'Manajemen Staff' })
  }

  const menu = isStaff ? staffMenu : memberMenu

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800/80 p-6 flex flex-col text-left transition-transform duration-300 ease-in-out md:top-[69px] md:h-[calc(100vh-69px)] md:z-30 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between md:hidden mb-6">
        <span className="text-sm font-bold text-white tracking-tight">
          Menu Utama
        </span>
        <button onClick={onClose} className="p-2 -mr-2 text-neutral-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="overflow-y-auto flex-1 -mx-2 px-2">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4">
          Navigasi Utama
        </h3>
        <nav className="space-y-1.5">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none border',
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white border-transparent'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
