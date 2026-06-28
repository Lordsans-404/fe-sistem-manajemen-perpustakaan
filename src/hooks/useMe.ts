import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store/authStore'

export const userKeys = {
  me: ['users', 'me'] as const,
  librariesAll: ['libraries'] as const,
  librariesList: (params?: Record<string, unknown>) => [...userKeys.librariesAll, 'list', params] as const,
  membersAll: ['members'] as const,
  membersList: (params?: Record<string, unknown>) => [...userKeys.membersAll, 'list', params] as const,
  membersDetail: (id: string) => [...userKeys.membersAll, 'detail', id] as const,
  staffsAll: ['staffs'] as const,
  staffsList: (params?: Record<string, unknown>) => [...userKeys.staffsAll, 'list', params] as const,
}

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser)

  return useQuery({
    queryKey: userKeys.me,
    queryFn: async () => {
      const userRes = await userService.getMe()
      const user = userRes.data.data

      if (user) {
        setUser(user)
      }
      return user
    },
    retry: false,
  })
}

export function useUpdateMe() {
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((s) => s.setAuth)
  const token = useAuthStore((s) => s.token)

  return useMutation({
    mutationFn: (data: { name?: string; phone_number?: string | null }) =>
      userService.updateMe(data).then((res) => res.data.data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userKeys.me, updatedUser)
      // Update store state as well
      if (token) {
        setAuth(token, updatedUser)
      }
    },
  })
}

// Libraries
export function useLibraries(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: userKeys.librariesList(params),
    queryFn: () => userService.getAllLibraries(params).then((res) => res.data.data),
  })
}

// Members
export function useMembers(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: userKeys.membersList(params),
    queryFn: () => userService.getAllMembers(params).then((res) => res.data.data),
  })
}

export function useMember(id: string) {
  return useQuery({
    queryKey: userKeys.membersDetail(id),
    queryFn: () => userService.getMemberById(id).then((res) => res.data.data),
    enabled: !!id,
  })
}

export function useCreateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { user_id: string; member_type: string; identity_number: string }) =>
      userService.createMember(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.membersAll })
    },
  })
}

export function useUpdateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { member_type?: string; member_level?: string } }) =>
      userService.updateMember(id, data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.membersAll })
    },
  })
}

export function useVerifyMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.verifyMember(id).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.membersAll })
    },
  })
}

// Staff
export function useStaffs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: userKeys.staffsList(params),
    queryFn: () => userService.getAllStaffs(params).then((res) => res.data.data),
  })
}

export function useCreateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { user_id: string; library_id: string; role: string }) =>
      userService.createStaff(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.staffsAll })
    },
  })
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { library_id?: string; role?: string } }) =>
      userService.updateStaff(id, data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.staffsAll })
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.deactivateUser(id).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.staffsAll })
      queryClient.invalidateQueries({ queryKey: userKeys.membersAll })
    },
  })
}

export function useActivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.activateUser(id).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.staffsAll })
      queryClient.invalidateQueries({ queryKey: userKeys.membersAll })
    },
  })
}

// Library CRUD Mutations
export function useCreateLibrary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; type: string; code: string }) =>
      userService.createLibrary(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.librariesAll })
    },
  })
}

export function useUpdateLibrary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; type?: string; code?: string } }) =>
      userService.updateLibrary(id, data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.librariesAll })
    },
  })
}

export function useDeleteLibrary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userService.deleteLibrary(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.librariesAll })
    },
  })
}
