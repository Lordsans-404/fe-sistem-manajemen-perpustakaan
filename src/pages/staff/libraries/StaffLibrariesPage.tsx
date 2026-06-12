import { useState } from 'react'
import { useLibraries, useCreateLibrary, useUpdateLibrary, useDeleteLibrary } from '@/hooks/useMe'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Spinner } from '@/components/common/Spinner'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import type { Library } from '@/types/auth.types'
import { useAuthStore } from '@/store/authStore'

export function StaffLibrariesPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.staff_profile?.role
  const canAdd = role === 'admin'
  const canEditOrDelete = role === 'admin' || role === 'supervisor'
  const [page, setPage] = useState(1)

  const { data, isLoading } = useLibraries({
    page,
    page_size: 10,
  })

  const libraries = data?.results ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / 10)

  // Mutations
  const createMutation = useCreateLibrary()
  const updateMutation = useUpdateLibrary()
  const deleteMutation = useDeleteLibrary()

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingLibrary, setEditingLibrary] = useState<Library | null>(null)
  
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState('branch')

  const [deletingLibrary, setDeletingLibrary] = useState<Library | null>(null)

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleOpenCreateModal = () => {
    setEditingLibrary(null)
    setName('')
    setCode('')
    setType('branch')
    setErrorMsg('')
    setSuccessMsg('')
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (lib: Library) => {
    setEditingLibrary(lib)
    setName(lib.name)
    setCode(lib.code)
    setType(lib.type)
    setErrorMsg('')
    setSuccessMsg('')
    setIsFormModalOpen(true)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!name.trim() || !code.trim()) {
      setErrorMsg('Nama dan Kode Cabang harus diisi.')
      return
    }

    if (editingLibrary) {
      // Edit
      updateMutation.mutate(
        {
          id: editingLibrary.id,
          data: { name, code, type },
        },
        {
          onSuccess: () => {
            setSuccessMsg('Cabang perpustakaan berhasil diperbarui!')
            setTimeout(() => setIsFormModalOpen(false), 1500)
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } }
            setErrorMsg(
              error.response?.data?.message ||
                'Gagal memperbarui cabang perpustakaan.'
            )
          },
        }
      )
    } else {
      // Create
      createMutation.mutate(
        { name, code, type },
        {
          onSuccess: () => {
            setSuccessMsg('Cabang perpustakaan berhasil ditambahkan!')
            setTimeout(() => setIsFormModalOpen(false), 1500)
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } }
            setErrorMsg(
              error.response?.data?.message ||
                'Gagal menambahkan cabang perpustakaan.'
            )
          },
        }
      )
    }
  }

  const handleDeleteConfirm = () => {
    if (!deletingLibrary) return

    deleteMutation.mutate(deletingLibrary.id, {
      onSuccess: () => {
        setDeletingLibrary(null)
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        alert(error.response?.data?.message || 'Gagal menghapus cabang perpustakaan.')
        setDeletingLibrary(null)
      },
    })
  }

  const getLibraryTypeLabel = (t: string) => {
    const map: Record<string, string> = {
      main: 'Perpustakaan Pusat',
      branch: 'Perpustakaan Cabang',
      digital: 'Layanan Digital',
    }
    return map[t] || t
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cabang Perpustakaan (Libraries)</h1>
          <p className="text-sm text-neutral-400">
            Daftar, tambah, edit, dan kelola cabang perpustakaan terintegrasi.
          </p>
        </div>
        {canAdd && (
          <Button variant="primary" onClick={handleOpenCreateModal}>
            + Tambah Cabang
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : libraries.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
          <p className="text-neutral-500 text-sm">Tidak ada cabang perpustakaan terdaftar.</p>
        </div>
      ) : (
        <>
          <div className="border border-neutral-800 bg-neutral-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-950/40 border-b border-neutral-850 text-neutral-400 font-semibold">
                    <th className="px-6 py-4">Kode Cabang</th>
                    <th className="px-6 py-4">Nama Perpustakaan</th>
                    <th className="px-6 py-4">Tipe Perpustakaan</th>
                    {canEditOrDelete && <th className="px-6 py-4 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {libraries.map((lib) => (
                    <tr key={lib.id} className="hover:bg-neutral-850/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-white">
                        {lib.code}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{lib.name}</div>
                        <div className="text-xs text-neutral-500 font-mono mt-0.5">{lib.id}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">
                        {getLibraryTypeLabel(lib.type)}
                      </td>
                      {canEditOrDelete && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              className="py-1 px-3 text-xs"
                              onClick={() => handleOpenEditModal(lib)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="secondary"
                              className="py-1 px-3 text-xs text-red-400 hover:text-red-350 hover:bg-red-950/20"
                              onClick={() => setDeletingLibrary(lib)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      )}
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
        title={editingLibrary ? 'Edit Cabang Perpustakaan' : 'Tambah Cabang Perpustakaan'}
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
            id="library-code"
            label="Kode Cabang"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="Contoh: LIB-CENTRAL"
            disabled={!!editingLibrary}
          />

          <Input
            id="library-name"
            label="Nama Perpustakaan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Contoh: Perpustakaan Pusat Kampus A"
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Tipe Cabang</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-neutral-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-200 cursor-pointer"
            >
              <option value="main">Perpustakaan Pusat (Main)</option>
              <option value="branch">Perpustakaan Cabang (Branch)</option>
              <option value="digital">Layanan Digital (Digital)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingLibrary}
        onClose={() => setDeletingLibrary(null)}
        title="Hapus Cabang Perpustakaan"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingLibrary(null)} disabled={deleteMutation.isPending}>
              Batal
            </Button>
            <Button
              variant="primary"
              className="bg-red-650 hover:bg-red-750 text-white"
              onClick={handleDeleteConfirm}
              isLoading={deleteMutation.isPending}
            >
              Hapus Permanen
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-300 leading-relaxed">
          Apakah Anda yakin ingin menghapus cabang perpustakaan{' '}
          <span className="font-bold text-white">{deletingLibrary?.name} ({deletingLibrary?.code})</span>?
        </p>
        <p className="text-xs text-red-400 mt-3">
          * Tindakan ini akan menghapus cabang secara permanen dari sistem.
        </p>
      </Modal>
    </div>
  )
}
