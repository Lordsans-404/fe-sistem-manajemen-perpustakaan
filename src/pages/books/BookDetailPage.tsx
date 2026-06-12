import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBook } from '@/hooks/useBooks'
import { useBookCopies } from '@/hooks/useBookCopies'
import { useCreateBorrow } from '@/hooks/useTransactions'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import type { BookCopy } from '@/types/bookCopy.types'

export function BookDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isStaff = !!user?.staff_profile

  const { data: book, isLoading: isBookLoading } = useBook(id)
  const { data: copiesData, isLoading: isCopiesLoading } = useBookCopies({
    book_id: id,
    available: true
  })

  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dueDate, setDueDate] = useState(() => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 7)
    return defaultDate.toISOString().split('T')[0]
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const borrowMutation = useCreateBorrow()

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
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/app/books')}>
          Kembali ke Katalog
        </Button>
      </div>
    )
  }

  const copies = copiesData?.results ?? []

  const handleOpenBorrowModal = (copy: BookCopy) => {
    setSelectedCopy(copy)
    setErrorMsg('')
    setSuccessMsg('')
    setIsModalOpen(true)
  }

  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!selectedCopy) return

    const memberId = user?.member_profile?.id
    if (!memberId) {
      setErrorMsg('Hanya member terverifikasi yang dapat meminjam buku.')
      return
    }

    borrowMutation.mutate(
      {
        member_id: memberId,
        book_copy_id: selectedCopy.id,
        library_id: selectedCopy.library.id,
        due_date: dueDate,
      },
      {
        onSuccess: () => {
          setSuccessMsg('Peminjaman buku berhasil diajukan!')
          setTimeout(() => {
            setIsModalOpen(false)
            setSelectedCopy(null)
          }, 2000)
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          setErrorMsg(
            error.response?.data?.message ||
            'Gagal memproses peminjaman buku.'
          )
        },
      }
    )
  }

  const getConditionLabel = (condition: string) => {
    const map: Record<string, string> = {
      new: 'Baru',
      good: 'Bagus',
      fair: 'Cukup',
      poor: 'Kurang',
      lost: 'Hilang',
    }
    return map[condition] || condition
  }

  const getConditionVariant = (condition: string) => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
      new: 'success',
      good: 'success',
      fair: 'warning',
      poor: 'danger',
      lost: 'danger',
    }
    return map[condition] || 'neutral'
  }

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/app/books')}
        className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-semibold cursor-pointer"
      >
        <span>←</span> Kembali ke Katalog
      </button>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 aspect-[3/4] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center flex-shrink-0">
          {book.cover_image ? (
            <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-6 select-none">
              <span className="text-5xl block mb-2">📖</span>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest block">
                No Cover Available
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
          <div className="space-y-4">
            <Badge variant="info">{book.category}</Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {book.title}
            </h1>
            <div className="text-sm text-neutral-400">
              Ditulis oleh <span className="text-neutral-200 font-semibold">{book.author}</span>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-800 space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Detail Bibliografi
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500 block">ID Buku</span>
                <span className="text-neutral-300 font-medium break-all">{book.id}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Terdaftar pada</span>
                <span className="text-neutral-300 font-medium">
                  {new Date(book.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Ketersediaan Salinan Fisik</h2>
        <p className="text-sm text-neutral-400">
          Setiap salinan fisik (copy) di bawah berlokasi di cabang perpustakaan tertentu.
        </p>

        {isCopiesLoading ? (
          <div className="py-12">
            <Spinner size="md" />
          </div>
        ) : copies.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
            <p className="text-neutral-500 text-sm">Belum ada salinan fisik yang tersedia untuk buku ini.</p>
          </div>
        ) : (
          <div className="border border-neutral-800 bg-neutral-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-950/40 border-b border-neutral-800 text-neutral-400 font-semibold">
                    <th className="px-6 py-4">Cabang & Lokasi</th>
                    <th className="px-6 py-4">ISBN</th>
                    <th className="px-6 py-4">Penerbit / Tahun</th>
                    <th className="px-6 py-4">Kondisi</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {copies.map((copy) => (
                    <tr key={copy.id} className="hover:bg-neutral-800/30 transition-colors">
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
                        {isStaff ? (
                          <span className="text-xs text-neutral-500 italic font-medium">Staff View Only</span>
                        ) : copy.condition === 'lost' ? (
                          <span className="text-xs text-red-500 font-medium">Tidak Tersedia</span>
                        ) : user?.member_profile?.is_verified ? (
                          <Button
                            variant="primary"
                            className="py-1.5 px-3 text-xs"
                            onClick={() => handleOpenBorrowModal(copy)}
                          >
                            Pinjam
                          </Button>
                        ) : (
                          <span className="text-xs text-neutral-500 italic">Butuh Verifikasi</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajukan Peminjaman Buku"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={borrowMutation.isPending}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleBorrowSubmit} isLoading={borrowMutation.isPending}>
              Konfirmasi Pinjam
            </Button>
          </>
        }
      >
        <form onSubmit={handleBorrowSubmit} className="space-y-4">
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
            <span className="text-xs text-neutral-500 uppercase tracking-widest font-semibold block">Buku</span>
            <span className="text-sm font-semibold text-white">{book.title}</span>
          </div>

          {selectedCopy && (
            <div className="space-y-1.5">
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-semibold block">
                Cabang Perpustakaan
              </span>
              <span className="text-sm font-semibold text-white">{selectedCopy.library.name}</span>
            </div>
          )}

          <Input
            id="due-date"
            label="Tanggal Pengembalian (Batas Waktu)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
          />

          <p className="text-xs text-neutral-500 leading-relaxed">
            * Peminjaman buku tunduk pada peraturan batas maksimal peminjaman dan keterlambatan pengembalian akan dikenakan denda otomatis sebesar Rp 1.000 / hari.
          </p>
        </form>
      </Modal>
    </div>
  )
}
