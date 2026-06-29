import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useUpdateMe } from '@/hooks/useMe'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'

const ROLE_LABEL: Record<string, string> = {
  librarian: 'Pustakawan',
  admin: 'Administrator',
  supervisor: 'Supervisor',
}

const LIBRARY_TYPE_LABEL: Record<string, string> = {
  central: 'Perpustakaan Pusat (Central)',
  faculty: 'Perpustakaan Fakultas (Faculty)',
}

export function StaffProfilePage() {
  const user = useAuthStore((s) => s.user)
  const staff = user?.staff_profile ?? null

  const [name, setName] = useState(user?.name ?? '')
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? '')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const updateMeMutation = useUpdateMe()

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    updateMeMutation.mutate(
      { name, phone_number: phoneNumber || null },
      {
        onSuccess: () => {
          setSuccessMsg('Profil berhasil diperbarui!')
          setTimeout(() => setSuccessMsg(''), 3000)
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          setErrorMsg(error.response?.data?.message ?? 'Gagal memperbarui profil.')
        },
      }
    )
  }

  const roleLabel = staff ? (ROLE_LABEL[staff.role] ?? staff.role) : '-'
  const libraryTypeLabel = staff?.library ? (LIBRARY_TYPE_LABEL[staff.library.type] ?? staff.library.type) : '-'

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Profil Saya</h1>
        <p className="text-sm text-neutral-400">
          Informasi akun dan detail penempatan kerja Anda sebagai petugas perpustakaan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Avatar & Status Card */}
        <div className="md:col-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center flex flex-col justify-center gap-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-4xl font-extrabold select-none">
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <h3 className="text-4xl font-bold text-white leading-snug">{user?.name}</h3>
            <p className="text-xs text-neutral-500 mt-1">{user?.email}</p>
          </div>

          <div className="pt-6 border-t border-neutral-800 space-y-3">
            <span className="text-xs text-neutral-500 uppercase tracking-widest font-semibold block">
              Status Akun
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <Badge variant="info">Staff</Badge>
              <Badge variant="neutral" className="uppercase bg-neutral-850">
                {roleLabel}
              </Badge>
            </div>
          </div>

          {staff?.library && (
            <div className="pt-4 border-t border-neutral-800 space-y-1.5">
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-semibold block">
                Cabang
              </span>
              <p className="text-sm font-semibold text-white">{staff.library.name}</p>
              <p className="text-xs font-mono text-indigo-400">{staff.library.code}</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Personal Info */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-neutral-800 pb-3">
              Informasi Pribadi
            </h3>

            <form
              key={`${user?.id}_${user?.name}_${user?.phone_number}`}
              onSubmit={handleUpdate}
              className="space-y-4"
            >
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
                  id="staff-profile-name"
                  label="Nama Lengkap"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  id="staff-profile-phone"
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

          {/* Staff Placement Details */}
          {staff && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-neutral-800 pb-3">
                Detail Penempatan Kerja
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-neutral-500 block">Role</span>
                  <span className="text-neutral-200 font-semibold uppercase tracking-wider text-xs bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700/50 inline-block mt-1">
                    {roleLabel}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Cabang Perpustakaan</span>
                  <span className="text-neutral-200 font-semibold block mt-1">
                    {staff.library?.name || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Kode Cabang</span>
                  <span className="text-neutral-200 font-semibold font-mono block mt-1">
                    {staff.library?.code || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Tipe Cabang</span>
                  <span className="text-neutral-200 font-semibold block mt-1">
                    {libraryTypeLabel}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Tanggal Bergabung Staff</span>
                  <span className="text-neutral-200 font-semibold block mt-1">
                    {staff.created_at
                      ? new Date(staff.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Email</span>
                  <span className="text-neutral-200 font-semibold block mt-1 break-all">
                    {user?.email || '-'}
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
