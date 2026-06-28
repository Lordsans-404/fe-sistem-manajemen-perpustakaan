import api from './api'
import type { User, Library, Member, Staff } from '@/types/auth.types'
import type { PaginatedResponse, BaseResponse } from '@/types/common.types'

export const userService = {
  // Me
  getMe: () =>
    api.get<BaseResponse<User>>('/api/v1/users/me/'),

  updateMe: (data: { name?: string; phone_number?: string | null }) =>
    api.patch<BaseResponse<User>>('/api/v1/users/me/', data),

  deactivateUser: (id: string) =>
    api.patch<BaseResponse<User>>(`/api/v1/users/${id}/deactivate/`),

  activateUser: (id: string) =>
    api.patch<BaseResponse<User>>(`/api/v1/users/${id}/activate/`),

  // Libraries
  getAllLibraries: (params?: Record<string, unknown>) =>
    api.get<BaseResponse<PaginatedResponse<Library>>>('/api/v1/users/libraries/', { params }),

  createLibrary: (data: { name: string; type: string; code: string }) =>
    api.post<BaseResponse<Library>>('/api/v1/users/libraries/', data),

  updateLibrary: (id: string, data: { name?: string; type?: string; code?: string }) =>
    api.patch<BaseResponse<Library>>(`/api/v1/users/libraries/${id}/`, data),

  deleteLibrary: (id: string) =>
    api.delete<void>(`/api/v1/users/libraries/${id}/`),

  // Members
  getAllMembers: (params?: Record<string, unknown>) =>
    api.get<BaseResponse<PaginatedResponse<Member>>>('/api/v1/users/members/', { params }),

  getMemberById: (id: string) =>
    api.get<BaseResponse<Member>>(`/api/v1/users/members/${id}/`),

  createMember: (data: { user_id: string; member_type: string; identity_number: string }) =>
    api.post<BaseResponse<Member>>('/api/v1/users/members/', data),

  updateMember: (id: string, data: { member_type?: string; member_level?: string }) =>
    api.patch<BaseResponse<Member>>(`/api/v1/users/members/${id}/`, data),

  verifyMember: (id: string) =>
    api.post<BaseResponse<Member>>(`/api/v1/users/members/${id}/verify/`),

  // Staff
  getAllStaffs: (params?: Record<string, unknown>) =>
    api.get<BaseResponse<PaginatedResponse<Staff>>>('/api/v1/users/staff/', { params }),

  getStaffById: (id: string) =>
    api.get<BaseResponse<Staff>>(`/api/v1/users/staff/${id}/`),

  createStaff: (data: { user_id: string; library_id: string; role: string }) =>
    api.post<BaseResponse<Staff>>('/api/v1/users/staff/', data),

  updateStaff: (id: string, data: { library_id?: string; role?: string }) =>
    api.patch<BaseResponse<Staff>>(`/api/v1/users/staff/${id}/`, data),
}
