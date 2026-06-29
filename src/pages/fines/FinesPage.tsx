import { useState } from 'react'
import { useFines } from '@/hooks/useTransactions'
import { Badge } from '@/components/common/Badge'
import { Spinner } from '@/components/common/Spinner'
import { Pagination } from '@/components/common/Pagination'
import { cn } from '@/utils/cn'

export function FinesPage() {
  const [activeTab, setActiveTab] = useState<'unpaid' | 'history'>('unpaid')
  const [page, setPage] = useState(1)

  const paymentStatus = activeTab === 'unpaid' ? 'unpaid' : undefined

  const { data, isLoading } = useFines({
    payment_status: paymentStatus,
    page,
    page_size: 10,
  })

  const rawFines = data?.results ?? []
  const totalCount = data?.count ?? 0

  // If showing history, filter out unpaid manually because backend status parameter only supports single status filter.
  // Wait, let's verify if the backend supports filter. If we don't pass payment_status, it returns all.
  // If activeTab is 'history', we can filter out unpaid.
  const fines = activeTab === 'history' 
    ? rawFines.filter((f) => f.payment_status !== 'unpaid') 
    : rawFines

  const totalPages = Math.ceil(totalCount / 10)

  const handleTabChange = (tab: 'unpaid' | 'history') => {
    setActiveTab(tab)
    setPage(1)
  }

  const getFineTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      overdue: 'Terlambat Pengembalian',
      damage: 'Buku Rusak',
      loss: 'Buku Hilang',
      other: 'Lainnya',
    }
    return map[type] || type
  }

  const getStatusBadge = (status: 'unpaid' | 'paid' | 'waived') => {
    const map = {
      unpaid: <Badge variant="danger">Belum Lunas</Badge>,
      paid: <Badge variant="success">Lunas</Badge>,
      waived: <Badge variant="info">Dihapuskan</Badge>,
    }
    return map[status] || <Badge variant="neutral">{status}</Badge>
  }

  const formatRupiah = (amountStr: string) => {
    const amount = parseFloat(amountStr)
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Denda Saya</h1>
        <p className="text-sm text-neutral-400">
          Pantau denda keterlambatan atau kerusakan buku yang perlu dilunasi.
        </p>
      </div>

      {activeTab === 'unpaid' && fines.length > 0 && (
        <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-4 flex gap-3 text-red-200 text-sm">
          <span className="text-lg leading-none">⚠️</span>
          <div>
            <p className="font-semibold">Pemberitahuan Denda Aktif</p>
            <p className="text-xs text-red-300/80 mt-0.5">
              Harap kunjungi meja pustakawan di cabang perpustakaan terkait untuk melakukan pembayaran denda Anda.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 gap-6">
        <button
          onClick={() => handleTabChange('unpaid')}
          className={cn(
            'pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer',
            activeTab === 'unpaid'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-white'
          )}
        >
          Belum Lunas
        </button>
        <button
          onClick={() => handleTabChange('history')}
          className={cn(
            'pb-3 text-sm font-semibold transition-all border-b-2 cursor-pointer',
            activeTab === 'history'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-white'
          )}
        >
          Riwayat Pembayaran
        </button>
      </div>

      {isLoading ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : fines.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
          <p className="text-neutral-500 text-sm">
            {activeTab === 'unpaid'
              ? 'Anda tidak memiliki denda yang belum dilunasi.'
              : 'Belum ada riwayat pembayaran denda.'}
          </p>
        </div>
      ) : (
        <>
          <div className="border border-neutral-800 bg-neutral-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center border-collapse">
                <thead>
                  <tr className="bg-neutral-950/40 border-b border-neutral-800 text-neutral-400 font-semibold">
                    <th className="px-6 py-4">Buku & Transaksi</th>
                    <th className="px-6 py-4">Tipe Denda</th>
                    <th className="px-6 py-4">Keterangan</th>
                    <th className="px-6 py-4">Jumlah Denda</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {fines.map((fine) => (
                    <tr key={fine.id} className="hover:bg-neutral-850/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">
                          {fine.borrow_transaction.book_title}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Pinjam: {new Date(fine.borrow_transaction.borrow_date).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">
                        {getFineTypeLabel(fine.fine_type)}
                      </td>
                      <td className="px-6 py-4 text-xs text-neutral-400 max-w-[20rem] truncate">
                        {fine.description || '-'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {formatRupiah(fine.amount)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(fine.payment_status)}
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
