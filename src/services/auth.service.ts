import api from './api'
import type { LoginDto, RegisterDto, AuthResponse, User } from '@/types/auth.types'

export const authService = {
  login: (data: LoginDto) =>
    api.post<AuthResponse>('/api/v1/users/login/', data).then((res) => res.data),

  register: (data: RegisterDto) =>
    api.post<User>('/api/v1/users/register/', data).then((res) => res.data),
}
