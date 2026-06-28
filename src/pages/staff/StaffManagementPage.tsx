import { useState } from 'react'
import { useStaffs, useCreateStaff, useUpdateStaff, useLibraries, useDeactivateUser, useActivateUser } from '@/hooks/useMe'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Spinner } from '@/components/common/Spinner'
import { Modal } from '@/components/common/Modal'
import { Badge } from '@/components/common/Badge'
import { Pagination } from '@/components/common/Pagination'
import type { Staff } from '@/types/auth.types'

export function StaffManagementPage() {
  const user = useAuthStore((s) => s.user)
  const isAuthorized =
    user?.staff_profile?.role === 'admin' || user?.staff_profile?.role === 'supervisor'

  const [page, setPage] = useState(1)

  const { data, isLoading } = useStaffs({
    page,
    page_size: 10,
  })

  const { data: librariesData } = useLibraries({ page_size: 50 })
  const libraries = librariesData?.results ?? []

  const staffs = data?.results ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / 10)

  // Mutations
  const createMutation = useCreateStaff()
  const updateMutation = useUpdateStaff()
  const deactivateMutation = useDeactivateUser()
  const activateMutation = useActivateUser()

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  
  const [userId, setUserId] = useState('')
  const [libraryId, setLibraryId] = useState('')
  const [role, setRole] = useState('librarian')

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isAuthorized) {
    return (
      <div className="py-20 text-center max-w-xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-white">Akses Ditolak</h2>
        <p className="text-sm text-neutral-400">
          Halaman ini hanya dapat diakses oleh Admin atau Supervisor perpustakaan.
        </p>
      </div>
    )
  }

  const handleOpenCreateModal = () => {
    setEditingStaff(null)
    setUserId('')
    setLibraryId(libraries[0]?.id ?? '')
    setRole('librarian')
    setErrorMsg('')
    setSuccessMsg('')
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (staff: Staff) => {
    setEditingStaff(staff)
    setUserId(staff.user.id)
    setLibraryId(staff.library.id)
    setRole(staff.role)
    setErrorMsg('')
    setSuccessMsg('')
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!libraryId) {
      setErrorMsg('Pilih cabang perpustakaan terlebih dahulu.')
      return
    }

    if (editingStaff) {
      // Edit
      updateMutation.mutate(
        {
          id: editingStaff.id,
          data: { library_id: libraryId, role },
        },
        {
          onSuccess: () => {
            setSuccessMsg('Profil staff berhasil diperbarui!')
            setTimeout(() => setIsFormModalOpen(false), 1500)
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } }
            setErrorMsg(
              error.response?.data?.message ||
                'Gagal memperbarui profil staff.'
            )
          },
        }
      )
    } else {
      // Create
      if (!userId.trim()) {
        setErrorMsg('User ID harus diisi.')
        return
      }

      createMutation.mutate(
        { user_id: userId, library_id: libraryId, role },
        {
          onSuccess: () => {
            setSuccessMsg('Staff baru berhasil ditambahkan!')
            setTimeout(() => setIsFormModalOpen(false), 1500)
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } }
            setErrorMsg(
              error.response?.data?.message ||
                'Gagal mendaftarkan akun staff.'
            )
          },
        }
      )
    }
  }

  const getRoleLabel = (r: string) => {
    const map: Record<string, string> = {
      admin: 'Administrator',
      supervisor: 'Supervisor',
      librarian: 'Pustakawan',
    }
    return map[r] || r
  }

  const handleDeactivate = (staff: Staff) => {
    if (window.confirm(`Yakin ingin menonaktifkan akun staff ${staff.user.name}?`)) {
      deactivateMutation.mutate(staff.user.id)
    }
  }

  const handleActivate = (staff: Staff) => {
    if (window.confirm(`Yakin ingin mengaktifkan akun staff ${staff.user.name}?`)) {
      activateMutation.mutate(staff.user.id)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manajemen Staff</h1>
          <p className="text-sm text-neutral-400">
            Daftar staff, kelola wewenang role, dan cabang perpustakaan tempat bertugas.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal}>
          + Tambah Staff Baru
        </Button>
      </div>

      {isLoading ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : staffs.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
          <p className="text-neutral-500 text-sm">Tidak ada data staff terdaftar.</p>
        </div>
      ) : (
        <>
          <div className="border border-neutral-800 bg-neutral-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-950/40 border-b border-neutral-850 text-neutral-400 font-semibold">
                    <th className="px-6 py-4">Nama & Email</th>
                    <th className="px-6 py-4">Cabang Bertugas</th>
                    <th className="px-6 py-4">Role / Jabatan</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {staffs.map((st) => (
                    <tr key={st.id} className={`transition-colors ${!st.user.is_active ? 'bg-red-950/10 opacity-75' : 'hover:bg-neutral-850/30'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="font-semibold text-white">{st.user.name}</div>
                          {!st.user.is_active && <Badge variant="danger">Nonaktif</Badge>}
                        </div>
                        <div className="text-xs text-neutral-500">{st.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{st.library.name}</div>
                        <div className="text-xs text-neutral-500 font-mono">{st.library.code}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                        {getRoleLabel(st.role)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            className="py-1 px-3 text-xs"
                            onClick={() => handleOpenEditModal(st)}
                          >
                            Edit
                          </Button>
                          {st.user.is_active ? (
                            <Button
                              variant="secondary"
                              className="py-1 px-3 text-xs text-orange-400 hover:text-orange-300 border-orange-900/50"
                              onClick={() => handleDeactivate(st)}
                              isLoading={deactivateMutation.isPending}
                            >
                              Nonaktifkan
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              className="py-1 px-3 text-xs text-emerald-400 hover:text-emerald-300 border-emerald-900/50"
                              onClick={() => handleActivate(st)}
                              isLoading={activateMutation.isPending}
                            >
                              Aktifkan
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingStaff ? 'Edit Informasi Staff' : 'Tambah Staff Baru'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleFormSubmit} isLoading={isPending}>
              Simpan
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs rounded-xl">
              {successMsg}
            </div>
          )}

          <Input
            id="staff-user-id"
            label="User ID (UUID)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            placeholder="Contoh: a81b90c0-1234-5678..."
            disabled={!!editingStaff}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Cabang Tugas</label>
            <select
              value={libraryId}
              onChange={(e) => setLibraryId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-neutral-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-200 cursor-pointer"
            >
              <option value="" disabled>-- Pilih Cabang --</option>
              {libraries.map((lib) => (
                <option key={lib.id} value={lib.id}>
                  {lib.name} ({lib.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Role / Jabatan</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-neutral-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-200 cursor-pointer"
            >
              <option value="librarian">Pustakawan (Librarian)</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  )
}
