export interface Library {
  id: string
  name: string
  type: 'central' | 'faculty'
  code: string
  created_at: string
  updated_at: string
}

export interface StaffProfile {
  id: string
  role: 'librarian' | 'admin' | 'supervisor'
  library: Library
  created_at: string
  updated_at: string
}

export interface MemberProfile {
  id: string
  member_type: 'student' | 'lecturer' | 'staff' | 'public'
  identity_number: string
  member_level: 'bronze' | 'silver' | 'gold' | 'platinum'
  is_verified: boolean
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface Member extends MemberProfile {
  user: User
}

export interface Staff extends StaffProfile {
  user: User
}


export interface User {
  id: string
  name: string
  email: string
  phone_number: string | null
  is_active: boolean
  date_joined: string
  created_at: string
  updated_at: string
  staff_profile?: StaffProfile | null
  member_profile?: MemberProfile | null
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  phone_number?: string | null
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: AuthTokens
}
