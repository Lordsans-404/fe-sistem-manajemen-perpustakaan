import { useAuthStore } from '@/store/authStore'
import { StaffLibrariesPage } from './StaffLibrariesPage'
import { StaffProfilePage } from './StaffProfilePage'

export function StaffLibrariesRoute() {
  const role = useAuthStore((s) => s.user?.staff_profile?.role)
  return role === 'admin' ? <StaffLibrariesPage /> : <StaffProfilePage />
}
