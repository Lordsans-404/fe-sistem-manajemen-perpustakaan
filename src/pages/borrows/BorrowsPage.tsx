import { useState } from 'react'
import { useBorrows } from '@/hooks/useTransactions'
import { Badge } from '@/components/common/Badge'
import { Spinner } from '@/components/common/Spinner'
import { Pagination } from '@/components/common/Pagination'
import { cn } from '@/utils/cn'
import type { BorrowSummary } from '@/types/transaction.types'

export function BorrowsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'returned'>('active')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useBorrows({
    status: activeTab,
    page,
    page_size: 10,
  })

  const borrows = data?.results ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / 10)

  const handleTabChange = (tab: 'active' | 'returned') => {
    setActiveTab(tab)
    setPage(1)
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
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Peminjaman Saya</h1>
        <p className="text-sm text-neutral-400">
          Pantau buku yang sedang Anda pinjam dan riwayat pengembalian Anda.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 gap-6">
        <button
          onClick={() => handleTabChange('active')}
          className={cn(
            'pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer',
            activeTab === 'active'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-white'
          )}
        >
          Peminjaman Aktif
        </button>
        <button
          onClick={() => handleTabChange('returned')}
          className={cn(
            'pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer',
            activeTab === 'returned'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-white'
          )}
        >
          Riwayat Pengembalian
        </button>
      </div>

      {isLoading ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : borrows.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
          <p className="text-neutral-500 text-sm">
            {activeTab === 'active'
              ? 'Tidak ada peminjaman buku yang aktif saat ini.'
              : 'Belum ada riwayat peminjaman buku.'}
          </p>
        </div>
      ) : (
        <>
          <div className="border border-neutral-800 bg-neutral-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-950/40 border-b border-neutral-800 text-neutral-400 font-semibold">
                    <th className="px-6 py-4">Judul Buku</th>
                    <th className="px-6 py-4">Cabang</th>
                    <th className="px-6 py-4">Tanggal Pinjam</th>
                    <th className="px-6 py-4">Batas Kembali</th>
                    {activeTab === 'returned' && <th className="px-6 py-4">Tanggal Kembali</th>}
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {borrows.map((borrow) => (
                    <tr key={borrow.id} className="hover:bg-neutral-850/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {borrow.book_title}
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
                      {activeTab === 'returned' && (
                        <td className="px-6 py-4">
                          {borrow.return_date ? (
                            new Date(borrow.return_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          ) : (
                            '-'
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        {getStatusBadge(borrow)}
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
    </div>
  )
}
