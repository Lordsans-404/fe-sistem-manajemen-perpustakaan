import api from './api'
import type {
  BorrowSummary,
  BorrowDetail,
  CreateBorrowDto,
  ReturnBookDto,
  Fine,
  CreateFineDto,
  PayFineDto,
} from '@/types/transaction.types'
import type { PaginatedResponse, BaseResponse } from '@/types/common.types'

export const transactionService = {
  // Borrows
  getAllBorrows: (params?: Record<string, unknown>) =>
    api.get<BaseResponse<PaginatedResponse<BorrowSummary>>>('/api/v1/transactions/borrows/', { params }),

  getBorrowById: (id: string) =>
    api.get<BaseResponse<BorrowDetail>>(`/api/v1/transactions/borrows/${id}/`),

  createBorrow: (data: CreateBorrowDto) =>
    api.post<BaseResponse<BorrowDetail>>('/api/v1/transactions/borrows/', data),

  returnBook: (id: string, data: ReturnBookDto) =>
    api.post<BaseResponse<BorrowDetail>>(`/api/v1/transactions/borrows/${id}/return/`, data),

  approveBorrow: (id: string) =>
    api.post<BaseResponse<BorrowDetail>>(`/api/v1/transactions/borrows/${id}/approve/`),

  rejectBorrow: (id: string) =>
    api.post<BaseResponse<BorrowDetail>>(`/api/v1/transactions/borrows/${id}/reject/`),

  // Fines
  getAllFines: (params?: Record<string, unknown>) =>
    api.get<BaseResponse<PaginatedResponse<Fine>>>('/api/v1/transactions/fines/', { params }),

  getFineById: (id: string) =>
    api.get<BaseResponse<Fine>>(`/api/v1/transactions/fines/${id}/`),

  createFine: (data: CreateFineDto) =>
    api.post<BaseResponse<Fine>>('/api/v1/transactions/fines/', data),

  payFine: (id: string, data: PayFineDto) =>
    api.patch<BaseResponse<Fine>>(`/api/v1/transactions/fines/${id}/pay/`, data),

  waiveFine: (id: string) =>
    api.patch<BaseResponse<Fine>>(`/api/v1/transactions/fines/${id}/waive/`),
}
