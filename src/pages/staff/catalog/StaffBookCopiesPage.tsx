import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBook } from '@/hooks/useBooks'
import {
  useBookCopies,
  useCreateBookCopy,
  useUpdateBookCopy,
  useDeleteBookCopy,
} from '@/hooks/useBookCopies'
import { useLibraries } from '@/hooks/useMe'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Spinner } from '@/components/common/Spinner'
import { Modal } from '@/components/common/Modal'
import type { BookCopy, BookCopyCondition } from '@/types/bookCopy.types'

export function StaffBookCopiesPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: book, isLoading: isBookLoading } = useBook(id)
  const { data: copiesData, isLoading: isCopiesLoading } = useBookCopies({ book_id: id })
  const { data: librariesData } = useLibraries({ page_size: 50 })

  const copies = copiesData?.results ?? []
  const libraries = librariesData?.results ?? []

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingCopy, setEditingCopy] = useState<BookCopy | null>(null)
  
  const [libraryId, setLibraryId] = useState('')
  const [condition, setCondition] = useState<BookCopyCondition>('good')
  const [isbn, setIsbn] = useState('')
  const [publisher, setPublisher] = useState('')
  const [publicationYear, setPublicationYear] = useState('')
  
  const [isDeletingCopy, setIsDeletingCopy] = useState<BookCopy | null>(null)

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Mutations
  const createMutation = useCreateBookCopy()
  const deleteMutation = useDeleteBookCopy()

  // For updates, React Query useUpdateBookCopy uses target ID in mutation hook or custom hook.
  // Wait, our useUpdateBookCopy hook: `useUpdateBookCopy(id)`.
  // We can call it at component level with editingCopy?.id:
  const updateMutation = useUpdateBookCopy()

  if (isBookLoading) {
    return (
      <div className="py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-bold text-white">Buku tidak ditemukan</h2>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/app/staff/books')}>
          Kembali ke Katalog Staff
        </Button>
      </div>
    )
  }

  const handleOpenCreateModal = () => {
    setEditingCopy(null)
    setLibraryId(libraries[0]?.id ?? '')
    setCondition('good')
    setIsbn('')
    setPublisher('')
    setPublicationYear('')
    setErrorMsg('')
    setSuccessMsg('')
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (copy: BookCopy) => {
    setEditingCopy(copy)
    setLibraryId(copy.library.id)
    setCondition(copy.condition)
    setIsbn(copy.isbn ?? '')
    setPublisher(copy.publisher ?? '')
    setPublicationYear(copy.publication_year ? String(copy.publication_year) : '')
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

    const yearVal = publicationYear ? parseInt(publicationYear) : null
    if (yearVal !== null && (yearVal < 1000 || yearVal > 9999)) {
      setErrorMsg('Tahun terbit harus dalam rentang 1000 - 9999.')
      return
    }

    if (editingCopy) {
      // Edit mode
      updateMutation.mutate(
        {
          id: editingCopy.id,
          data: {
            library_id: libraryId,
            condition,
            isbn: isbn || null,
            publisher: publisher || null,
            publication_year: yearVal,
          },
        },
        {
          onSuccess: () => {
            setSuccessMsg('Salinan fisik berhasil diperbarui!')
            setTimeout(() => setIsFormModalOpen(false), 1500)
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } }
            setErrorMsg(
              error.response?.data?.message ||
                'Gagal memperbarui salinan fisik.'
            )
          },
        }
      )
    } else {
      // Create mode
      createMutation.mutate(
        {
          book_id: id,
          library_id: libraryId,
          condition,
          isbn: isbn || null,
          publisher: publisher || null,
          publication_year: yearVal,
        },
        {
          onSuccess: () => {
            setSuccessMsg('Salinan fisik berhasil ditambahkan!')
            setTimeout(() => setIsFormModalOpen(false), 1500)
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } }
            setErrorMsg(
              error.response?.data?.message ||
                'Gagal menambahkan salinan fisik.'
            )
          },
        }
      )
    }
  }

  const handleDeleteConfirm = () => {
    if (!isDeletingCopy) return

    deleteMutation.mutate(isDeletingCopy.id, {
      onSuccess: () => {
        setIsDeletingCopy(null)
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        alert(error.response?.data?.message || 'Gagal menghapus salinan fisik.')
        setIsDeletingCopy(null)
      },
    })
  }

  const getConditionLabel = (cond: string) => {
    const map: Record<string, string> = {
      new: 'Baru',
      good: 'Bagus',
      fair: 'Cukup',
      poor: 'Kurang',
      lost: 'Hilang',
    }
    return map[cond] || cond
  }

  const getConditionVariant = (cond: string) => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
      new: 'success',
      good: 'success',
      fair: 'warning',
      poor: 'danger',
      lost: 'danger',
    }
    return map[cond] || 'neutral'
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate('/app/staff/books')}
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-semibold cursor-pointer"
      >
        <span>←</span> Kembali ke Katalog Utama
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Kelola Salinan</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">{book.title}</h1>
          <p className="text-xs text-neutral-400 mt-1">Ditulis oleh {book.author}</p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal}>
          + Tambah Salinan Fisik
        </Button>
      </div>

      {isCopiesLoading ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : copies.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
          <p className="text-neutral-500 text-sm">Belum ada salinan fisik (copies) terdaftar untuk buku ini.</p>
        </div>
      ) : (
        <div className="border border-neutral-800 bg-neutral-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950/40 border-b border-neutral-800 text-neutral-400 font-semibold">
                  <th className="px-6 py-4">ID Salinan</th>
                  <th className="px-6 py-4">Cabang Perpustakaan</th>
                  <th className="px-6 py-4">ISBN</th>
                  <th className="px-6 py-4">Penerbit & Tahun</th>
                  <th className="px-6 py-4">Kondisi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                {copies.map((copy) => (
                  <tr key={copy.id} className="hover:bg-neutral-850/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-neutral-400 break-all w-36">
                      {copy.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{copy.library.name}</div>
                      <div className="text-xs text-neutral-500">{copy.library.code}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-400">
                      {copy.isbn || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div>{copy.publisher || '-'}</div>
                      <div className="text-xs text-neutral-500">{copy.publication_year || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getConditionVariant(copy.condition)}>
                        {getConditionLabel(copy.condition)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          className="py-1 px-2.5 text-xs"
                          onClick={() => handleOpenEditModal(copy)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          className="py-1 px-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20"
                          onClick={() => setIsDeletingCopy(copy)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingCopy ? 'Edit Salinan Fisik' : 'Tambah Salinan Fisik'}
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Cabang Perpustakaan</label>
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
            <label className="text-xs font-semibold text-neutral-400">Kondisi Buku</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as BookCopyCondition)}
              className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-neutral-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-200 cursor-pointer"
            >
              <option value="new">Baru (New)</option>
              <option value="good">Bagus (Good)</option>
              <option value="fair">Cukup (Fair)</option>
              <option value="poor">Kurang (Poor)</option>
              <option value="lost">Hilang (Lost)</option>
            </select>
          </div>

          <Input
            id="copy-isbn"
            label="ISBN (Opsional)"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="Contoh: 9780132350884"
          />

          <Input
            id="copy-publisher"
            label="Penerbit (Opsional)"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="Contoh: Prentice Hall"
          />

          <Input
            id="copy-year"
            label="Tahun Terbit (Opsional)"
            type="number"
            value={publicationYear}
            onChange={(e) => setPublicationYear(e.target.value)}
            placeholder="Contoh: 2008"
            min={1000}
            max={9999}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!isDeletingCopy}
        onClose={() => setIsDeletingCopy(null)}
        title="Hapus Salinan Fisik"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeletingCopy(null)} disabled={deleteMutation.isPending}>
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
        <p className="text-sm text-neutral-300 leading-relaxed text-left">
          Apakah Anda yakin ingin menghapus salinan fisik dengan ID <span className="font-mono font-bold text-white break-all">{isDeletingCopy?.id}</span> dari katalog perpustakaan?
        </p>
        <p className="text-xs text-red-400 mt-3 text-left">
          * Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  )
}
