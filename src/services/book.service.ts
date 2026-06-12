import api from './api'
import type { Book, CreateBookDto, UpdateBookDto } from '@/types/book.types'
import type { PaginatedResponse, BaseResponse } from '@/types/common.types'

export const bookService = {
  // Books
  getAll: (params?: Record<string, unknown>) =>
    api.get<BaseResponse<PaginatedResponse<Book>>>('/api/v1/catalog/books/', { params }),

  getById: (id: string) =>
    api.get<BaseResponse<Book>>(`/api/v1/catalog/books/${id}/`),

  create: (data: CreateBookDto) =>
    api.post<BaseResponse<Book>>('/api/v1/catalog/books/', data),

  update: (id: string, data: UpdateBookDto) => {
    if (data.cover_image !== undefined) {
      const formData = new FormData()
      if (data.title) formData.append('title', data.title)
      if (data.author) formData.append('author', data.author)
      if (data.category) formData.append('category', data.category)
      if (data.cover_image) {
        formData.append('cover_image', data.cover_image)
      } else if (data.cover_image === null) {
        formData.append('cover_image', '')
      }
      return api.patch<BaseResponse<Book>>(`/api/v1/catalog/books/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    }
    return api.patch<BaseResponse<Book>>(`/api/v1/catalog/books/${id}/`, data)
  },

  delete: (id: string) =>
    api.delete<void>(`/api/v1/catalog/books/${id}/`),
}
