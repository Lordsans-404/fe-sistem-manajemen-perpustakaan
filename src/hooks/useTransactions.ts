import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '@/services/transaction.service'
import type { CreateBorrowDto, ReturnBookDto, CreateFineDto, PayFineDto } from '@/types/transaction.types'

export const transactionKeys = {
  borrowsAll: ['borrows'] as const,
  borrowsList: (params?: Record<string, unknown>) => [...transactionKeys.borrowsAll, 'list', params] as const,
  borrowsDetail: (id: string) => [...transactionKeys.borrowsAll, 'detail', id] as const,
  finesAll: ['fines'] as const,
  finesList: (params?: Record<string, unknown>) => [...transactionKeys.finesAll, 'list', params] as const,
  finesDetail: (id: string) => [...transactionKeys.finesAll, 'detail', id] as const,
}

// Borrows
export function useBorrows(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: transactionKeys.borrowsList(params),
    queryFn: () => transactionService.getAllBorrows(params).then((res) => res.data.data),
  })
}

export function useBorrow(id: string) {
  return useQuery({
    queryKey: transactionKeys.borrowsDetail(id),
    queryFn: () => transactionService.getBorrowById(id).then((res) => res.data.data),
    enabled: !!id,
  })
}

export function useCreateBorrow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBorrowDto) => transactionService.createBorrow(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.borrowsAll })
    },
  })
}

export function useReturnBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnBookDto }) =>
      transactionService.returnBook(id, data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.borrowsAll })
      queryClient.invalidateQueries({ queryKey: transactionKeys.finesAll })
    },
  })
}

export function useApproveBorrow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transactionService.approveBorrow(id).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.borrowsAll })
    },
  })
}

export function useRejectBorrow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transactionService.rejectBorrow(id).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.borrowsAll })
    },
  })
}

// Fines
export function useFines(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: transactionKeys.finesList(params),
    queryFn: () => transactionService.getAllFines(params).then((res) => res.data.data),
  })
}

export function useFine(id: string) {
  return useQuery({
    queryKey: transactionKeys.finesDetail(id),
    queryFn: () => transactionService.getFineById(id).then((res) => res.data.data),
    enabled: !!id,
  })
}

export function useCreateFine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFineDto) => transactionService.createFine(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.finesAll })
    },
  })
}

export function usePayFine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PayFineDto }) =>
      transactionService.payFine(id, data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.finesAll })
    },
  })
}

export function useWaiveFine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => transactionService.waiveFine(id).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.finesAll })
    },
  })
}
