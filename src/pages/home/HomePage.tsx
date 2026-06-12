import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import { useBorrows, useReturnBook, useApproveBorrow, useRejectBorrow } from '@/hooks/useTransactions'
import { Spinner } from '@/components/common/Spinner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import type { BorrowSummary } from '@/types/transaction.types'
import { useState } from 'react'

const getDaysUntilDue = (dueDate: string) => {
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function HomePage() {
  const user = useAuthStore((s) => s.user)
  const isStaff = !!user?.staff_profile

  // State for staff return book modal action
  const [returningBorrow, setReturningBorrow] = useState<BorrowSummary | null>(null)
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split('T')[0])
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

  // Fetch active borrows. Since member_id is not passed, it fetches all active borrows 
  // if user is staff, or just the user's active borrows if they are a member.
  const { data: borrowsData, isLoading: isBorrowsLoading } = useBorrows({
    status: 'active',
  })
  
  // Max 4 transactions as requested, filtering out pending and failed borrows
  const activeBorrows = (borrowsData?.results || [])
    .filter((b) => b.status !== 'pending' && b.status !== 'failed')
    .slice(0, 4)

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

  if (isStaff) {
    const roleMap = {
      librarian: 'Pustakawan',
      admin: 'Administrator',
      supervisor: 'Supervisor',
    }
    const roleName = user?.staff_profile ? roleMap[user.staff_profile.role] : 'Staff'

    return (
      <div className="space-y-8 text-left">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 to-indigo-950 p-8 md:p-12 border border-indigo-800/30 shadow-xl shadow-indigo-950/10">
          <div className="relative z-10 space-y-3">
            <Badge variant="info" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
              Staff Portal
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Halo, {user?.name}!
            </h1>
            <p className="text-indigo-200/80 max-w-xl text-sm md:text-base">
              Selamat bekerja. Anda login sebagai <span className="font-semibold text-white">{roleName}</span> di <span className="font-semibold text-white">{user?.staff_profile?.library.name}</span>.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/app/staff/books"
            className="group block p-6 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-indigo-500/30 rounded-2xl transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
              📚
            </div>
            <h3 className="text-base font-bold text-white mb-2">Kelola Katalog</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Tambah buku baru, edit detail bibliografi, dan kelola salinan fisik (copies).
            </p>
          </Link>

          <Link
            to="/app/staff/borrows"
            className="group block p-6 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-indigo-500/30 rounded-2xl transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
              🔄
            </div>
            <h3 className="text-base font-bold text-white mb-2">Peminjaman & Kembali</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Catat transaksi peminjaman baru, pemulangan buku, dan perpanjangan batas waktu.
            </p>
          </Link>

          <Link
            to="/app/staff/members"
            className="group block p-6 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-indigo-500/30 rounded-2xl transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
              👥
            </div>
            <h3 className="text-base font-bold text-white mb-2">Kelola Member</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Verifikasi pendaftaran anggota baru dan ubah level keanggotaan member.
            </p>
          </Link>
        </div>

        {isBorrowsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        ) : activeBorrows.length > 0 ? (
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Peminjaman Aktif Member</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBorrows.map((borrow) => {
                const daysUntil = getDaysUntilDue(borrow.due_date)
                const isUrgent = (daysUntil <= 1 || borrow.is_overdue) && borrow.status !== 'pending'

                return (
                  <div
                    key={borrow.id}
                    className={cn(
                      "flex flex-col h-full p-5 rounded-2xl border transition-all duration-300",
                      borrow.status === 'pending'
                        ? "bg-amber-950/20 border-amber-900/50 hover:border-amber-500/50"
                        : isUrgent
                          ? "bg-red-950/20 border-red-900/50 hover:border-red-500/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)]"
                          : "bg-neutral-900 border-neutral-800 hover:border-indigo-500/30"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-bold text-white line-clamp-1 pr-4">{borrow.book_title}</h3>
                        <p className="text-xs text-indigo-400 font-medium mt-1">Peminjam: {borrow.member_name}</p>
                      </div>
                      {borrow.status === 'pending' ? (
                        <Badge variant="warning">Pending</Badge>
                      ) : isUrgent ? (
                        <span className="flex h-3 w-3 relative flex-shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      ) : null}
                    </div>
                    <div className="space-y-1.5 text-sm mb-4">
                      <div className="flex justify-between text-neutral-400">
                        <span>Tgl Pinjam:</span>
                        <span className="text-neutral-300">{new Date(borrow.borrow_date).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>Batas Waktu:</span>
                        <span className={cn("font-semibold", isUrgent ? "text-red-400" : "text-white")}>
                          {new Date(borrow.due_date).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 mt-auto pt-3 border-t border-neutral-800">
                      <p className={cn("text-xs font-medium flex items-start gap-1.5", isUrgent ? "text-red-400" : borrow.status === 'pending' ? "text-amber-400" : "text-neutral-400")}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                          {isUrgent ? (
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span>
                          {borrow.status === 'pending'
                            ? 'Menunggu persetujuan staff.'
                            : borrow.is_overdue 
                              ? `Terlambat ${borrow.overdue_days} hari!` 
                              : daysUntil === 0 
                                ? 'Batas waktu hari ini!' 
                                : daysUntil === 1
                                  ? 'Besok batas waktu!'
                                  : `Sisa: ${daysUntil} hari lagi.`}
                        </span>
                      </p>
                      {borrow.status === 'pending' ? (
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="primary"
                            className="flex-1 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleApprove(borrow.id)}
                            isLoading={approveMutation.isPending}
                          >
                            Setujui
                          </Button>
                          <Button
                            variant="secondary"
                            className="flex-1 py-1.5 text-xs font-semibold bg-red-950/40 hover:bg-red-900/40 text-red-200 border-red-900/50"
                            onClick={() => handleReject(borrow.id)}
                            isLoading={rejectMutation.isPending}
                          >
                            Tolak
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          className="w-full py-1.5 text-xs font-semibold"
                          onClick={() => handleOpenReturnModal(borrow)}
                        >
                          Kembalikan Buku
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

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
              id="return-date-input-home"
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

  const isVerified = user?.member_profile?.is_verified ?? false
  const memberLevel = user?.member_profile?.member_level ?? 'bronze'

  // Fetch only active borrows for the logged-in member
  // (Queries are defined at the top of the component to comply with React Hooks rules)

  return (
    <div className="space-y-8 text-left">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950 p-8 md:p-12 border border-neutral-800 shadow-xl">
        <div className="relative z-10 space-y-4">
          <div className="flex gap-2">
            <Badge variant={isVerified ? 'success' : 'warning'}>
              {isVerified ? 'Akun Terverifikasi' : 'Belum Diverifikasi'}
            </Badge>
            <Badge variant="info" className="uppercase">
              Level {memberLevel}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Selamat Datang, {user?.name}!
          </h1>
          <p className="text-neutral-400 max-w-xl text-sm md:text-base leading-relaxed">
            Temukan ribuan referensi buku ilmiah, novel populer, dan jurnal riset dalam genggaman Anda.
          </p>
          <div className="pt-2">
            <Link
              to="/app/books"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              Cari Buku Sekarang
            </Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-indigo-500/5 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/app/books"
          className="group block p-6 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-indigo-500/30 rounded-2xl transition-all duration-300"
        >
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            📖
          </div>
          <h3 className="text-base font-bold text-white mb-2">Katalog Buku</h3>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Jelajahi dan cari buku berdasarkan judul, penulis, kategori, atau penerbit.
          </p>
        </Link>

        <Link
          to="/app/borrows"
          className="group block p-6 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-indigo-500/30 rounded-2xl transition-all duration-300"
        >
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            📦
          </div>
          <h3 className="text-base font-bold text-white mb-2">Pinjaman Saya</h3>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Pantau status peminjaman buku aktif, riwayat peminjaman, dan batas waktu pengembalian.
          </p>
        </Link>

        <Link
          to="/app/fines"
          className="group block p-6 bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 hover:border-indigo-500/30 rounded-2xl transition-all duration-300"
        >
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
            💵
          </div>
          <h3 className="text-base font-bold text-white mb-2">Denda Saya</h3>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Cek rincian denda keterlambatan atau kerusakan buku yang harus dilunasi.
          </p>
        </Link>
      </div>

      {isBorrowsLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : activeBorrows.length > 0 ? (
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Peminjaman Berjalan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBorrows.map((borrow) => {
              const daysUntil = getDaysUntilDue(borrow.due_date)
              const isUrgent = (daysUntil <= 1 || borrow.is_overdue) && borrow.status !== 'pending'

              return (
                <div
                  key={borrow.id}
                  className={cn(
                    "flex flex-col h-full p-5 rounded-2xl border transition-all duration-300",
                    borrow.status === 'pending'
                      ? "bg-amber-950/20 border-amber-900/50 hover:border-amber-500/50"
                      : isUrgent
                        ? "bg-red-950/20 border-red-900/50 hover:border-red-500/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)]"
                        : "bg-neutral-900 border-neutral-800 hover:border-indigo-500/30"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-bold text-white line-clamp-1 pr-4">{borrow.book_title}</h3>
                    {borrow.status === 'pending' ? (
                      <Badge variant="warning">Pending</Badge>
                    ) : isUrgent ? (
                      <span className="flex h-3 w-3 relative flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-1.5 text-sm mb-4">
                    <div className="flex justify-between text-neutral-400">
                      <span>Tgl Pinjam:</span>
                      <span className="text-neutral-300">{new Date(borrow.borrow_date).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Batas Waktu:</span>
                      <span className={cn("font-semibold", isUrgent ? "text-red-400" : "text-white")}>
                        {new Date(borrow.due_date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <div className={cn("mt-auto pt-3 border-t", borrow.status === 'pending' ? "border-amber-900/30" : isUrgent ? "border-red-900/30" : "border-neutral-800")}>
                    <p className={cn("text-xs font-medium flex items-start gap-1.5", isUrgent ? "text-red-400" : borrow.status === 'pending' ? "text-amber-400" : "text-neutral-400")}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                        {isUrgent ? (
                          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                        )}
                      </svg>
                      <span>
                        {borrow.status === 'pending'
                          ? 'Menunggu persetujuan staff.'
                          : borrow.is_overdue 
                            ? `Terlambat ${borrow.overdue_days} hari! Harap segera kembalikan.` 
                            : daysUntil === 0 
                              ? 'Batas waktu pengembalian hari ini!' 
                              : daysUntil === 1
                                ? 'Besok adalah batas waktu pengembalian!'
                                : `Sisa waktu pengembalian: ${daysUntil} hari lagi.`}
                      </span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
