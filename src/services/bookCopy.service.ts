import api from './api'
import type { BookCopy, CreateBookCopyDto } from '@/types/bookCopy.types'
import type { PaginatedResponse, BaseResponse } from '@/types/common.types'

export const bookCopyService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<BaseResponse<PaginatedResponse<BookCopy>>>('/api/v1/catalog/book-copies/', { params }),

  getById: (id: string) =>
    api.get<BaseResponse<BookCopy>>(`/api/v1/catalog/book-copies/${id}/`),

  create: (data: CreateBookCopyDto) =>
    api.post<BaseResponse<BookCopy>>('/api/v1/catalog/book-copies/', data),

  update: (id: string, data: Partial<CreateBookCopyDto>) =>
    api.patch<BaseResponse<BookCopy>>(`/api/v1/catalog/book-copies/${id}/`, data),

  delete: (id: string) =>
    api.delete<void>(`/api/v1/catalog/book-copies/${id}/`),
}
