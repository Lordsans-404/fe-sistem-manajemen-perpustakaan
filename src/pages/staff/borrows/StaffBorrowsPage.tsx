import { useState } from 'react'
import { useBorrows, useReturnBook, useApproveBorrow, useRejectBorrow } from '@/hooks/useTransactions'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Spinner } from '@/components/common/Spinner'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { cn } from '@/utils/cn'
import type { BorrowSummary } from '@/types/transaction.types'

const STATUSES = [
  { key: 'pending', label: 'Pending', color: 'bg-amber-500', shadow: 'shadow-amber-500/50' },
  { key: 'active', label: 'Aktif', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50' },
  { key: 'returned', label: 'Selesai', color: 'bg-blue-500', shadow: 'shadow-blue-500/50' },
  { key: 'failed', label: 'Ditolak', color: 'bg-orange-600', shadow: 'shadow-orange-600/50' },
] as const

export function StaffBorrowsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'active' | 'returned' | 'pending' | 'failed' | 'all'>('all')
  const debouncedSearch = useDebounce(search, 500)

  const isUUID = (str: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str)
  
  const searchParam = debouncedSearch
    ? isUUID(debouncedSearch)
      ? { member_id: debouncedSearch }
      : { member_name: debouncedSearch }
    : {}

  const { data, isLoading } = useBorrows({
    page,
    page_size: 10,
    status: statusFilter === 'all' ? undefined : statusFilter,
    ...searchParam,
  })

  const borrows = data?.results ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / 10)

  // Return modal state
  const [returningBorrow, setReturningBorrow] = useState<BorrowSummary | null>(null)
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0])
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const returnMutation = useReturnBook()
  const approveMutation = useApproveBorrow()
  const rejectMutation = useRejectBorrow()

  const handleApprove = (id: string) => {
    if (window.confirm('Setujui request peminjaman buku ini?')) {
      approveMutation.mutate(id)
    }
  }

  const handleReject = (id: string) => {
    if (window.confirm('Tolak request peminjaman buku ini?')) {
      rejectMutation.mutate(id)
    }
  }

  const handleOpenReturnModal = (borrow: BorrowSummary) => {
    setReturningBorrow(borrow)
    setReturnDate(new Date().toISOString().split('T')[0])
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!returningBorrow) return
    setErrorMsg('')
    setSuccessMsg('')

    returnMutation.mutate(
      {
        id: returningBorrow.id,
        data: { return_date: returnDate },
      },
      {
        onSuccess: () => {
          setSuccessMsg('Buku berhasil dikembalikan!')
          setTimeout(() => setReturningBorrow(null), 1500)
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          setErrorMsg(
            error.response?.data?.message ||
              'Gagal memproses pengembalian buku.'
          )
        },
      }
    )
  }

  const getStatusBadge = (borrow: BorrowSummary) => {
    if (borrow.status === 'pending') {
      return <Badge variant="warning">Pending</Badge>
    }
    if (borrow.status === 'failed') {
      return <Badge variant="danger">Ditolak</Badge>
    }
    if (borrow.return_date) {
      return <Badge variant="success">Dikembalikan</Badge>
    }
    if (borrow.is_overdue) {
      return (
        <Badge variant="danger">
          Terlambat {borrow.overdue_days} Hari
        </Badge>
      )
    }
    return <Badge variant="info">Aktif</Badge>
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Peminjaman & Pengembalian</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Kelola transaksi sirkulasi buku. Proses pengembalian dan pantau buku overdue.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full md:w-80">
          <Input
            type="text"
            placeholder="Cari nama member atau ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="py-2.5 bg-neutral-900 border-neutral-800 focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Stepper Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Status Transaksi</span>
          <button
            onClick={() => {
              setStatusFilter('all')
              setSearch('')
              setPage(1)
            }}
            className={cn(
              'px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 border cursor-pointer',
              statusFilter === 'all'
                ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            )}
          >
            Semua Transaksi
          </button>
        </div>

        <div className="p-8 bg-neutral-900 rounded-3xl border border-neutral-800/80">
          <div className="relative flex items-center justify-between w-full z-10">
            {/* Inactive connecting line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-800 -z-10" />
            
            {/* Active connecting line */}
            <div 
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-700 -z-10 transition-all duration-500",
                statusFilter === 'all' ? "right-0 opacity-100" : "right-full opacity-0"
              )}
            />

            {STATUSES.map((status) => {
              const isSelected = statusFilter === status.key || statusFilter === 'all'
              
              return (
                <button
                  key={status.key}
                  onClick={() => {
                    setStatusFilter(status.key)
                    setPage(1)
                  }}
                  className="relative flex flex-col items-center group cursor-pointer outline-none"
                >
                  <div 
                    className={cn(
                      "w-4 h-4 rounded-full transition-all duration-300 ring-8 ring-neutral-900",
                      isSelected 
                        ? `${status.color} shadow-lg ${status.shadow}`
                        : "bg-neutral-700 group-hover:bg-neutral-500"
                    )}
                  />
                  <div className="absolute top-8">
                    <span 
                      className={cn(
                        "text-xs font-semibold tracking-wide transition-colors duration-200 whitespace-nowrap",
                        isSelected ? "text-white" : "text-neutral-500 group-hover:text-neutral-400"
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
          {/* Spacer for absolute label */}
          <div className="h-4" />
        </div>
      </div>

      {isLoading ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : borrows.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
          <p className="text-neutral-500 text-sm">Tidak ada transaksi peminjaman yang ditemukan.</p>
        </div>
      ) : (
        <>
          <div className="border border-neutral-800 bg-neutral-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-950/40 border-b border-neutral-800 text-neutral-400 font-semibold">
                    <th className="px-6 py-4">Buku</th>
                    <th className="px-6 py-4">Peminjam</th>
                    <th className="px-6 py-4">Cabang</th>
                    <th className="px-6 py-4">Tgl Pinjam</th>
                    <th className="px-6 py-4">Batas Kembali</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {borrows.map((borrow) => (
                    <tr key={borrow.id} className="hover:bg-neutral-850/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{borrow.book_title}</div>
                        <div className="text-xs text-neutral-500 font-mono mt-0.5" title={borrow.id}>#{borrow.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {borrow.member_name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-neutral-400">
                        {borrow.library_code}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(borrow.borrow_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(borrow.due_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(borrow)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {borrow.status === 'pending' && (
                            <>
                              <Button
                                variant="primary"
                                className="py-1 px-3 text-xs bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApprove(borrow.id)}
                                isLoading={approveMutation.isPending}
                              >
                                Setujui
                              </Button>
                              <Button
                                variant="secondary"
                                className="py-1 px-3 text-xs bg-red-950/40 hover:bg-red-900/40 text-red-200 border-red-900/50"
                                onClick={() => handleReject(borrow.id)}
                                isLoading={rejectMutation.isPending}
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                          {borrow.status === 'active' && !borrow.return_date && (
                            <Button
                              variant="primary"
                              className="py-1 px-3 text-xs"
                              onClick={() => handleOpenReturnModal(borrow)}
                            >
                              Kembalikan
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

      {/* Return Modal */}
      <Modal
        isOpen={!!returningBorrow}
        onClose={() => setReturningBorrow(null)}
        title="Proses Pengembalian Buku"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReturningBorrow(null)} disabled={returnMutation.isPending}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleReturnSubmit} isLoading={returnMutation.isPending}>
              Konfirmasi Kembali
            </Button>
          </>
        }
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4 text-left">
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

          <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-4 space-y-2 text-xs text-neutral-400">
            <div>
              <span className="text-neutral-500 block">Buku</span>
              <span className="text-white font-semibold">{returningBorrow?.book_title}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Peminjam</span>
              <span className="text-white font-semibold">{returningBorrow?.member_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-850">
              <div>
                <span className="text-neutral-500 block">Tanggal Pinjam</span>
                <span className="text-neutral-200">{returningBorrow ? new Date(returningBorrow.borrow_date).toLocaleDateString('id-ID') : ''}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Batas Kembali</span>
                <span className="text-neutral-200">{returningBorrow ? new Date(returningBorrow.due_date).toLocaleDateString('id-ID') : ''}</span>
              </div>
            </div>
          </div>

          <Input
            id="return-date-input"
            label="Tanggal Pengembalian"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </form>
      </Modal>
    </div>
  )
}
