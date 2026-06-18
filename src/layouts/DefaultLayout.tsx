import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastContainer } from '@/components/common/ToastContainer'
import { useMe } from '@/hooks/useMe'
import { Spinner } from '@/components/common/Spinner'
import { useAuthStore } from '@/store/authStore'
import { useBorrows } from '@/hooks/useTransactions'
import {
  useBorrowNotifications,
  useFineNotifications,
  useStaffNotifications,
  useDueDateReminders,
} from '@/hooks/useRealtimeNotifications'

export function DefaultLayout() {
  const { isLoading, error } = useMe()
  const logout = useAuthStore((s) => s.logout)

  const user = useAuthStore((s) => s.user)
  const isMember = !!user?.member_profile
  const isStaff = !!user?.staff_profile

  // Realtime Notifications
  useBorrowNotifications(user?.member_profile?.id)
  useFineNotifications(user?.member_profile?.id)
  useStaffNotifications(isStaff)

  // Due Date Reminders (Only fetch if member)
  const { data: activeBorrows } = useBorrows({ status: 'active' }, isMember)
  useDueDateReminders(isMember ? activeBorrows?.results || [] : [])

  const hasAlertedRef = useRef(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (error) {
      const axiosError = error as { response?: { status?: number; data?: { detail?: string; message?: string } } }
      const status = axiosError.response?.status
      const detail = axiosError.response?.data?.detail || axiosError.response?.data?.message || 'Gagal memuat profil sesi Anda.'

      if (status === 403) {
        alert(
          `Akses Ditolak (403): ${detail}\n\nKemungkinan akun Anda belum terdaftar sebagai member/staff atau telah dinonaktifkan. Anda akan dikeluarkan dari sistem.`
        )
      } else {
        alert(`Gagal memuat data pengguna (Error ${status || 'Unknown'}): ${detail}`)
      }
      void logout()
    } else if (!isLoading && user) {
      // Check if user has no profile at all
      if (!user.member_profile && !user.staff_profile && !hasAlertedRef.current) {
        hasAlertedRef.current = true
        alert('Akun Anda belum memiliki profil keanggotaan. Silakan daftar terlebih dahulu di halaman Profil.')
      }
    }
  }, [error, isLoading, user, logout])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4">
        <Spinner size="lg" />
        <p className="text-sm text-neutral-400 font-medium">Memuat data sesi Anda...</p>
      </div>
    )
  }

  if (error) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <ToastContainer />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 md:ml-8 md:p-8 bg-neutral-950 overflow-y-auto w-full md:pl-64">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
