import type { Library, MemberProfile, User } from './auth.types'
import type { BookCopy } from './bookCopy.types'

export interface BorrowSummary {
  id: string
  member_name: string
  book_title: string
  library_code: string
  borrow_date: string
  due_date: string
  return_date: string | null
  is_overdue: boolean
  overdue_days: number
  status: 'pending' | 'active' | 'failed' | string
}

export interface BorrowDetail {
  id: string
  member: MemberProfile & { user: User }
  book_copy: BookCopy
  library: Library
  borrow_date: string
  due_date: string
  return_date: string | null
  is_overdue: boolean
  overdue_days: number
  status: 'pending' | 'active' | 'failed' | string
  created_at: string
  updated_at: string
}

export interface CreateBorrowDto {
  member_id: string
  book_copy_id: string
  library_id: string
  due_date: string
}

export interface ReturnBookDto {
  return_date: string
}

export type FineType = 'overdue' | 'damage' | 'loss' | 'other'
export type FinePaymentStatus = 'unpaid' | 'paid' | 'waived'

export interface Fine {
  id: string
  borrow_transaction: BorrowSummary
  fine_type: FineType
  description: string | null
  amount: string
  paid_date: string | null
  payment_status: FinePaymentStatus
  created_at: string
  updated_at: string
}

export interface CreateFineDto {
  borrow_transaction_id: string
  fine_type: 'damage' | 'loss' | 'other'
  amount: string
  description: string
}

export interface PayFineDto {
  paid_date: string
}
