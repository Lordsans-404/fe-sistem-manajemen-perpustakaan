import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabaseClient'
import { showBrowserNotification } from '@/utils/notifications'
import { transactionKeys } from '@/hooks/useTransactions'
import { transactionService } from '@/services/transaction.service'
import type { BorrowSummary } from '@/types/transaction.types'

export function useBorrowNotifications(memberId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!memberId) return

    const channel = supabase
      .channel(`borrow-member-${memberId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'borrow_transactions',
          filter: `member_id=eq.${memberId}`,
        },
        (payload) => {
          const newStatus = payload.new.status
          const oldStatus = payload.old?.status

          if (newStatus === 'active' && oldStatus !== 'active') {
            showBrowserNotification('✅ Pinjaman Disetujui', 'Staff sudah menyetujui permintaan pinjam kamu. Silakan ambil bukunya!')
          }

          if (newStatus === 'failed' && oldStatus !== 'failed') {
            showBrowserNotification('❌ Pinjaman Ditolak', 'Permintaan pinjam kamu ditolak. Silakan hubungi pustakawan.')
          }

          queryClient.invalidateQueries({ queryKey: transactionKeys.borrowsAll })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [memberId, queryClient])
}

export function useFineNotifications(memberId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!memberId) return

    const channel = supabase
      .channel(`fine-member-${memberId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'fines',
        },
        async (payload) => {
          try {
            const borrowId = payload.new.borrow_transaction_id
            // Fetch borrow transaction to verify it belongs to this member
            // This acts as a fallback if RLS is not fully configured yet
            const res = await transactionService.getBorrowById(borrowId)
            const borrow = res.data.data
            
            if (borrow.member.id === memberId) {
              showBrowserNotification('⚠️ Ada Denda Baru', 'Kamu mendapat denda. Cek detail di halaman denda.')
              queryClient.invalidateQueries({ queryKey: transactionKeys.finesAll })
            }
          } catch (e) {
            console.error('Failed to verify fine ownership', e)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [memberId, queryClient])
}

export function useStaffNotifications(isStaff?: boolean) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isStaff) return

    const channel = supabase
      .channel('staff-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'borrow_transactions',
          filter: 'status=eq.pending',
        },
        () => {
          showBrowserNotification('📚 Permintaan Pinjam Baru', 'Ada member yang minta pinjam buku. Segera review di halaman kelola peminjaman!')
          queryClient.invalidateQueries({ queryKey: transactionKeys.borrowsAll })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isStaff, queryClient])
}

// Frontend-only H-3 and H-1 reminder check
export function useDueDateReminders(borrows: BorrowSummary[] = []) {
  useEffect(() => {
    if (!borrows || borrows.length === 0) return

    const storageKey = 'notified_due_dates'
    const notifiedTimes: Record<string, number> = JSON.parse(localStorage.getItem(storageKey) || '{}')
    const now = Date.now()
    const SIX_HOURS = 6 * 60 * 60 * 1000 // 6 hours in milliseconds

    let hasChanges = false

    borrows.forEach((borrow) => {
      if (borrow.status !== 'active') return

      const lastNotified = notifiedTimes[borrow.id] || 0
      
      // Jika sudah dinotifikasi dalam 6 jam terakhir, skip
      if (now - lastNotified < SIX_HOURS) return

      const due = new Date(borrow.due_date)
      due.setHours(0, 0, 0, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const diffTime = due.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 3 || diffDays === 1) {
        showBrowserNotification(
          "⏳ Pengingat Pengembalian Buku",
          `Buku "${borrow.book_title}" harus dikembalikan dalam ${diffDays} hari lagi.`,
          true // toastOnly: true, jangan ganggu user dengan OS notification berulang
        )
        notifiedTimes[borrow.id] = now
        hasChanges = true
      }
    })

    if (hasChanges) {
      localStorage.setItem(storageKey, JSON.stringify(notifiedTimes))
    }
  }, [borrows])
}
