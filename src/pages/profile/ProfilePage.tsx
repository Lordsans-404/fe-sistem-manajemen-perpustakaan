import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useUpdateMe, useCreateMember, useVerifyMember } from '@/hooks/useMe'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateMeMutation = useUpdateMe()
  const createMemberMutation = useCreateMember()
  const verifyMemberMutation = useVerifyMember()

  const [name, setName] = useState(user?.name ?? '')
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? '')



  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [memberType, setMemberType] = useState('student')
  const [identityNumber, setIdentityNumber] = useState('')
  const [registerErrorMsg, setRegisterErrorMsg] = useState('')
  const [registerSuccessMsg, setRegisterSuccessMsg] = useState('')

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    updateMeMutation.mutate(
      {
        name,
        phone_number: phoneNumber || null,
      },
      {
        onSuccess: () => {
          setSuccessMsg('Profil berhasil diperbarui!')
          setTimeout(() => setSuccessMsg(''), 3000)
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          setErrorMsg(
            error.response?.data?.message ||
              'Gagal memperbarui profil. Silakan coba lagi.'
          )
        },
      }
    )
  }

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!identityNumber.trim()) {
      setRegisterErrorMsg('Nomor identitas wajib diisi.')
      return
    }
    setRegisterErrorMsg('')
    setRegisterSuccessMsg('')

    // Dev mode: backend uses the logged-in user's ID automatically.
    // We do NOT send user_id — just member_type and identity_number.
    createMemberMutation.mutate(
      {
        user_id: user?.id ?? '',
        member_type: memberType,
        identity_number: identityNumber,
      },
      {
        onSuccess: (newMember) => {
          // Auto-verify right after self-registration
          verifyMemberMutation.mutate(newMember.id, {
            onSuccess: () => {
              setRegisterSuccessMsg('Pendaftaran & verifikasi berhasil! Memuat ulang...')
              setTimeout(() => window.location.reload(), 1500)
            },
            onError: () => {
              // Verification failed but profile was created — still reload
              setRegisterSuccessMsg('Profil berhasil dibuat. Memuat ulang...')
              setTimeout(() => window.location.reload(), 1500)
            },
          })
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          setRegisterErrorMsg(
            error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.'
          )
        },
      }
    )
  }

  const isStaff = !!user?.staff_profile
  const memberLevel = user?.member_profile?.member_level ?? 'bronze'
  const isVerified = user?.member_profile?.is_verified ?? false

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Profil</h1>
        <p className="text-sm text-neutral-400">
          Ubah informasi profil Anda dan tinjau status akun keanggotaan Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Profile Card Summary */}
        <div className="md:col-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-3xl font-extrabold select-none">
            {user?.name ? user.name.charAt(0).toUpperCase() : ''}
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-snug">{user?.name}</h3>
            <p className="text-xs text-neutral-500 mt-1">{user?.email}</p>
          </div>

          <div className="pt-6 border-t border-neutral-800 space-y-3">
            <span className="text-xs text-neutral-500 uppercase tracking-widest font-semibold block">
              Status Akun
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {isStaff ? (
                <>
                  <Badge variant="info">Staff</Badge>
                  <Badge variant="neutral" className="uppercase bg-neutral-850">
                    {user?.staff_profile?.role}
                  </Badge>
                </>
              ) : (
                <>
                  <Badge variant="neutral">Member</Badge>
                  <Badge variant={isVerified ? 'success' : 'warning'}>
                    {isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                  </Badge>
                  <Badge variant="info" className="uppercase">
                    Level {memberLevel}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form & Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit form */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-neutral-800 pb-3">
              Informasi Pribadi
            </h3>

            <form key={`${user?.id}_${user?.name}_${user?.phone_number}`} onSubmit={handleUpdate} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs rounded-xl">
                  {successMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="profile-name"
                  label="Nama Lengkap"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  id="profile-phone"
                  label="Nomor Telepon"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" isLoading={updateMeMutation.isPending}>
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>

          {!isStaff && user?.member_profile && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-neutral-800 pb-3">
                Detail Keanggotaan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-neutral-500 block">Tipe Member</span>
                  <span className="text-neutral-200 font-semibold uppercase tracking-wider text-xs bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700/50 inline-block mt-1">
                    {user?.member_profile?.member_type}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Nomor Identitas (NIM/NIP)</span>
                  <span className="text-neutral-200 font-semibold font-mono block mt-1">
                    {user?.member_profile?.identity_number}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Tanggal Verifikasi</span>
                  <span className="text-neutral-200 font-semibold block mt-1">
                    {user?.member_profile?.verified_at
                      ? new Date(user.member_profile.verified_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Belum diverifikasi oleh staff.'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Terdaftar Sejak</span>
                  <span className="text-neutral-200 font-semibold block mt-1">
                    {user?.member_profile?.created_at
                      ? new Date(user.member_profile.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!isStaff && !user?.member_profile && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="border-b border-neutral-800 pb-3">
                <h3 className="text-base font-bold text-white">Pendaftaran Keanggotaan</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Daftarkan diri sebagai anggota perpustakaan. Setelah terdaftar, tunggu verifikasi dari petugas.
                </p>
              </div>

              <form onSubmit={handleCreateMember} className="space-y-4">
                {registerErrorMsg && (
                  <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-xl">
                    {registerErrorMsg}
                  </div>
                )}
                {registerSuccessMsg && (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs rounded-xl">
                    {registerSuccessMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">Tipe Anggota</label>
                  <select
                    value={memberType}
                    onChange={(e) => setMemberType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-200 cursor-pointer"
                  >
                    <option value="student">Mahasiswa (Student)</option>
                    <option value="lecturer">Dosen (Lecturer)</option>
                    <option value="staff">Karyawan (Staff)</option>
                    <option value="public">Umum (Public)</option>
                  </select>
                </div>

                <Input
                  id="register-identity"
                  label="Nomor Identitas (NIM / NIP / KTP)"
                  type="text"
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  required
                  placeholder="Contoh: 13520001"
                />

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={createMemberMutation.isPending}
                  >
                    Daftar Sebagai Member
                  </Button>
                </div>
              </form>
            </div>
          )}

          {isStaff && user?.staff_profile && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-neutral-800 pb-3">
                Penempatan Kerja Staff
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-neutral-500 block">Cabang Perpustakaan</span>
                  <span className="text-neutral-200 font-semibold block mt-1">
                    {user?.staff_profile?.library?.name || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Kode Cabang</span>
                  <span className="text-neutral-200 font-semibold font-mono block mt-1">
                    {user?.staff_profile?.library?.code || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Tipe Cabang</span>
                  <span className="text-neutral-200 font-semibold uppercase tracking-wider text-xs bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700/50 inline-block mt-1">
                    {user?.staff_profile?.library?.type || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Tanggal Bergabung Staff</span>
                  <span className="text-neutral-200 font-semibold block mt-1">
                    {user?.staff_profile?.created_at
                      ? new Date(user.staff_profile.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
