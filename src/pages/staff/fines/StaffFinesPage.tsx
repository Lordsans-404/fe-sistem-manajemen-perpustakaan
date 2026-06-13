import { useState } from 'react'
import { useFines, usePayFine, useWaiveFine, useCreateFine, useBorrows } from '@/hooks/useTransactions'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Spinner } from '@/components/common/Spinner'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import { cn } from '@/utils/cn'
import type { Fine, FineType } from '@/types/transaction.types'

export function StaffFinesPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin =
    user?.staff_profile?.role === 'admin' || user?.staff_profile?.role === 'supervisor'

  const [activeTab, setActiveTab] = useState<'unpaid' | 'history'>('unpaid')
  const [page, setPage] = useState(1)

  const paymentStatus = activeTab === 'unpaid' ? 'unpaid' : undefined

  const { data, isLoading } = useFines({
    payment_status: paymentStatus,
    page,
    page_size: 10,
  })

  // Since backend status parameter only supports single status filter,
  // we filter out unpaid manually if displaying history tab.
  const rawFines = data?.results ?? []
  const fines = activeTab === 'history'
    ? rawFines.filter((f) => f.payment_status !== 'unpaid')
    : rawFines

  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / 10)

  // Sub mutations
  const payMutation = usePayFine()
  const waiveMutation = useWaiveFine()
  const createFineMutation = useCreateFine()

  // Fetch borrows for manual fine dropdown
  const { data: borrowsData } = useBorrows({ page_size: 200 })
  const borrowsList = borrowsData?.results ?? []

  const activeBorrows = borrowsList.filter((b) => b.status === 'active')
  const returnedBorrows = borrowsList.filter((b) => b.status === 'returned')
  const validBorrowsForFine = [...activeBorrows, ...returnedBorrows]

  // Modals state
  const [payingFine, setPayingFine] = useState<Fine | null>(null)
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0])

  const [waivingFine, setWaivingFine] = useState<Fine | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [borrowTransactionId, setBorrowTransactionId] = useState('')
  const [fineType, setFineType] = useState<Exclude<FineType, 'overdue'>>('damage')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleOpenPayModal = (fine: Fine) => {
    setPayingFine(fine)
    setPaidDate(new Date().toISOString().split('T')[0])
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!payingFine) return
    setErrorMsg('')
    setSuccessMsg('')

    payMutation.mutate(
      {
        id: payingFine.id,
        data: { paid_date: paidDate },
      },
      {
        onSuccess: () => {
          setSuccessMsg('Pembayaran denda berhasil dicatat!')
          setTimeout(() => setPayingFine(null), 1500)
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          setErrorMsg(
            error.response?.data?.message ||
              'Gagal mencatat pembayaran denda.'
          )
        },
      }
    )
  }

  const handleWaiveClick = (fine: Fine) => {
    setWaivingFine(fine)
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleWaiveConfirm = () => {
    if (!waivingFine) return
    setErrorMsg('')
    setSuccessMsg('')

    waiveMutation.mutate(waivingFine.id, {
      onSuccess: () => {
        setSuccessMsg('Denda berhasil dihapuskan!')
        setTimeout(() => setWaivingFine(null), 1500)
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        alert(error.response?.data?.message || 'Gagal menghapuskan denda.')
        setWaivingFine(null)
      },
    })
  }

  const handleOpenCreateModal = () => {
    setBorrowTransactionId(validBorrowsForFine[0]?.id ?? '')
    setFineType('damage')
    setAmount('')
    setDescription('')
    setErrorMsg('')
    setSuccessMsg('')
    setIsCreateModalOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!borrowTransactionId) {
      setErrorMsg('Pilih transaksi peminjaman terlebih dahulu.')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Jumlah denda harus lebih besar dari 0.')
      return
    }

    if (!description.trim()) {
      setErrorMsg('Keterangan denda manual harus diisi.')
      return
    }

    createFineMutation.mutate(
      {
        borrow_transaction_id: borrowTransactionId,
        fine_type: fineType,
        amount: parseFloat(amount).toFixed(2),
        description,
      },
      {
        onSuccess: () => {
          setSuccessMsg('Denda manual berhasil dibuat!')
          setTimeout(() => setIsCreateModalOpen(false), 1500)
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          setErrorMsg(
            error.response?.data?.message ||
              'Gagal membuat denda manual.'
          )
        },
      }
    )
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
    const amountNum = parseFloat(amountStr)
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amountNum)
  }

  const isCreatePending = createFineMutation.isPending

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kasir Denda</h1>
          <p className="text-sm text-neutral-400">
            Kelola denda keterlambatan, buku rusak, atau hilang. Terima pembayaran denda member.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal}>
          + Buat Denda Manual
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 gap-6">
        <button
          onClick={() => {
            setActiveTab('unpaid')
            setPage(1)
          }}
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
          onClick={() => {
            setActiveTab('history')
            setPage(1)
          }}
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
              ? 'Tidak ada denda aktif yang belum dilunasi.'
              : 'Belum ada riwayat pembayaran denda.'}
          </p>
        </div>
      ) : (
        <>
          <div className="border border-neutral-800 bg-neutral-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-950/40 border-b border-neutral-800 text-neutral-400 font-semibold">
                    <th className="px-6 py-4">Buku & Peminjam</th>
                    <th className="px-6 py-4">Tipe Denda</th>
                    <th className="px-6 py-4">Keterangan</th>
                    <th className="px-6 py-4">Jumlah Denda</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {fines.map((fine) => (
                    <tr key={fine.id} className="hover:bg-neutral-850/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">
                          {fine.borrow_transaction.book_title}
                        </div>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          Oleh: <span className="font-medium text-neutral-300">{fine.borrow_transaction.member_name}</span>
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-1.5 flex gap-2">
                          <span>📅 {new Date(fine.borrow_transaction.borrow_date).toLocaleDateString('id-ID')}</span>
                          <span className="text-neutral-600">|</span>
                          <span className="font-mono" title={`Trx: ${fine.borrow_transaction.id}`}>Trx: {fine.borrow_transaction.id.substring(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">
                        {getFineTypeLabel(fine.fine_type)}
                      </td>
                      <td className="px-6 py-4 text-xs text-neutral-400 max-w-xs truncate">
                        {fine.description || '-'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {formatRupiah(fine.amount)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(fine.payment_status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {fine.payment_status === 'unpaid' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="primary"
                              className="py-1 px-3 text-xs"
                              onClick={() => handleOpenPayModal(fine)}
                            >
                              Bayar
                            </Button>
                            <Button
                              variant="secondary"
                              className={['py-1 px-3 text-xs', isAdmin ? 'text-red-400 hover:text-red-300' : 'text-orange-400 hover:text-orange-300'].join(' ')}
                              onClick={() => handleWaiveClick(fine)}
                            >
                              Waive
                            </Button>
                          </div>
                        )}
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

      {/* Pay Fine Modal */}
      <Modal
        isOpen={!!payingFine}
        onClose={() => setPayingFine(null)}
        title="Konfirmasi Pembayaran Denda"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayingFine(null)} disabled={payMutation.isPending}>
              Batal
            </Button>
            <Button variant="primary" onClick={handlePaySubmit} isLoading={payMutation.isPending}>
              Konfirmasi Lunas
            </Button>
          </>
        }
      >
        <form onSubmit={handlePaySubmit} className="space-y-4 text-left">
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
              <span className="text-neutral-500 block">Member</span>
              <span className="text-white font-semibold">{payingFine?.borrow_transaction.member_name}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Buku</span>
              <span className="text-white font-semibold">{payingFine?.borrow_transaction.book_title}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-850">
              <div>
                <span className="text-neutral-500 block">Jumlah Denda</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {payingFine ? formatRupiah(payingFine.amount) : ''}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Tipe Denda</span>
                <span className="text-white font-semibold uppercase tracking-wider text-[10px]">
                  {payingFine ? getFineTypeLabel(payingFine.fine_type) : ''}
                </span>
              </div>
            </div>
          </div>

          <Input
            id="pay-date-input"
            label="Tanggal Pembayaran"
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </form>
      </Modal>

      {/* Waive Fine Modal */}
      <Modal
        isOpen={!!waivingFine}
        onClose={() => setWaivingFine(null)}
        title="Bebaskan Denda (Waive)"
        footer={
          <>
            <Button variant="secondary" onClick={() => setWaivingFine(null)} disabled={waiveMutation.isPending}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleWaiveConfirm} isLoading={waiveMutation.isPending}>
              Bebaskan Denda
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-left">
          <p className="text-sm text-neutral-300 leading-relaxed">
            Apakah Anda yakin ingin menghapuskan/membebaskan denda sebesar{' '}
            <span className="text-white font-bold">{waivingFine ? formatRupiah(waivingFine.amount) : ''}</span> untuk member{' '}
            <span className="text-white font-bold">{waivingFine?.borrow_transaction.member_name}</span>?
          </p>
          <p className="text-xs text-red-400">
            * Tindakan ini hanya dapat dilakukan oleh Admin/Supervisor dan tidak dapat dibatalkan.
          </p>
        </div>
      </Modal>

      {/* Create Manual Fine Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Denda Manual"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)} disabled={isCreatePending}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit} isLoading={isCreatePending}>
              Buat Denda
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
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
            <label className="text-xs font-semibold text-neutral-400">Transaksi Peminjaman</label>
            <select
              value={borrowTransactionId}
              onChange={(e) => setBorrowTransactionId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-neutral-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-200 cursor-pointer"
            >
              <option value="" disabled>-- Pilih Transaksi --</option>
              {activeBorrows.length > 0 && (
                <optgroup label="Peminjaman Aktif">
                  {activeBorrows.map((borrow) => (
                    <option key={borrow.id} value={borrow.id}>
                      {borrow.book_title} - {borrow.member_name} (Pinjam: {borrow.borrow_date})
                    </option>
                  ))}
                </optgroup>
              )}
              {returnedBorrows.length > 0 && (
                <optgroup label="Selesai (Dikembalikan)">
                  {returnedBorrows.map((borrow) => (
                    <option key={borrow.id} value={borrow.id}>
                      {borrow.book_title} - {borrow.member_name} (Pinjam: {borrow.borrow_date})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Tipe Denda</label>
            <select
              value={fineType}
              onChange={(e) => setFineType(e.target.value as Exclude<FineType, 'overdue'>)}
              className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-neutral-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-200 cursor-pointer"
            >
              <option value="damage">Buku Rusak (Damage)</option>
              <option value="loss">Buku Hilang (Loss)</option>
              <option value="other">Lainnya (Other)</option>
            </select>
          </div>

          <Input
            id="fine-amount-input"
            label="Jumlah Denda (Rp)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="Contoh: 50000"
            min={1}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Keterangan / Alasan</label>
            <textarea
              id="fine-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Contoh: Halaman 45-50 robek dan hilang"
              className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-neutral-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-200"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
