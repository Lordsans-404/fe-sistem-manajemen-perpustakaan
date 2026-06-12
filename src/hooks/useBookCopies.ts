import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookCopyService } from '@/services/bookCopy.service'
import type { CreateBookCopyDto } from '@/types/bookCopy.types'

export const bookCopyKeys = {
  all: ['book-copies'] as const,
  list: (params?: Record<string, unknown>) => [...bookCopyKeys.all, 'list', params] as const,
  detail: (id: string) => [...bookCopyKeys.all, 'detail', id] as const,
}

export function useBookCopies(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: bookCopyKeys.list(params),
    queryFn: () => bookCopyService.getAll(params).then((res) => res.data.data),
  })
}

export function useBookCopy(id: string) {
  return useQuery({
    queryKey: bookCopyKeys.detail(id),
    queryFn: () => bookCopyService.getById(id).then((res) => res.data.data),
    enabled: !!id,
  })
}

export function useCreateBookCopy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBookCopyDto) => bookCopyService.create(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookCopyKeys.all })
    },
  })
}

export function useUpdateBookCopy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBookCopyDto> }) =>
      bookCopyService.update(id, data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookCopyKeys.all })
    },
  })
}

export function useDeleteBookCopy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookCopyService.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookCopyKeys.all })
    },
  })
}
