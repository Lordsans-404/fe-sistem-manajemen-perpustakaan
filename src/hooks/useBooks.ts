import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookService } from '@/services/book.service'
import type { CreateBookDto, UpdateBookDto } from '@/types/book.types'

export const bookKeys = {
  all: ['books'] as const,
  list: (params?: Record<string, unknown>) => [...bookKeys.all, 'list', params] as const,
  detail: (id: string) => [...bookKeys.all, 'detail', id] as const,
}

export function useBooks(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: bookKeys.list(params),
    queryFn: () => bookService.getAll(params).then((res) => res.data.data),
  })
}

export function useBook(id: string) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => bookService.getById(id).then((res) => res.data.data),
    enabled: !!id,
  })
}

export function useCreateBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBookDto) => bookService.create(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all })
    },
  })
}

export function useUpdateBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookDto }) =>
      bookService.update(id, data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all })
    },
  })
}

export function useDeleteBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookService.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all })
    },
  })
}
