import { useState } from 'react'
import { useMembers, useUpdateMember, useVerifyMember } from '@/hooks/useMe'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Spinner } from '@/components/common/Spinner'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import type { Member } from '@/types/auth.types'

export function StaffMembersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading } = useMembers({
    page,
    page_size: 10,
    search: debouncedSearch || undefined,
  })

  const members = data?.results ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / 10)

  // Mutations
  const updateMutation = useUpdateMember()
  const verifyMutation = useVerifyMember()

  // Modal states
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [memberType, setMemberType] = useState('student')
  const [memberLevel, setMemberLevel] = useState('bronze')

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleOpenEditModal = (member: Member) => {
    setEditingMember(member)
    setMemberType(member.member_type)
    setMemberLevel(member.member_level)
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMember) return
    setErrorMsg('')
    setSuccessMsg('')

    updateMutation.mutate(
      {
        id: editingMember.id,
        data: {
          member_type: memberType,
          member_level: memberLevel,
        },
      },
      {
        onSuccess: () => {
          setSuccessMsg('Profil member berhasil diperbarui!')
          setTimeout(() => setEditingMember(null), 1500)
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } }
          setErrorMsg(
            error.response?.data?.message ||
              'Gagal memperbarui profil member.'
          )
        },
      }
    )
  }

  const handleVerifyClick = (memberId: string) => {
    if (!confirm('Apakah Anda yakin ingin memverifikasi member ini?')) return

    verifyMutation.mutate(memberId, {
      onSuccess: () => {
        alert('Member berhasil diverifikasi!')
      },
      onError: (err: unknown) => {
        const error = err as { response?: { data?: { message?: string } } }
        alert(error.response?.data?.message || 'Gagal memverifikasi member.')
      },
    })
  }

  const getMemberTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      student: 'Mahasiswa',
      lecturer: 'Dosen',
      staff: 'Karyawan',
      external: 'Eksternal',
    }
    return map[type] || type
  }

  const getMemberLevelVariant = (level: string) => {
    const map: Record<string, 'neutral' | 'success' | 'warning' | 'info'> = {
      bronze: 'neutral',
      silver: 'info',
      gold: 'warning',
      platinum: 'success',
    }
    return map[level] || 'neutral'
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manajemen Anggota (Member)</h1>
          <p className="text-sm text-neutral-400">
            Daftar, verifikasi akun, dan ubah level keanggotaan perpustakaan.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full sm:w-80">
        <Input
          type="text"
          placeholder="Cari nama atau nomor identitas..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="py-2"
        />
      </div>

      {isLoading ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : members.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
          <p className="text-neutral-500 text-sm">Tidak ada data anggota ditemukan.</p>
        </div>
      ) : (
        <>
          <div className="border border-neutral-800 bg-neutral-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-950/40 border-b border-neutral-800 text-neutral-400 font-semibold">
                    <th className="px-6 py-4">Nama & Email</th>
                    <th className="px-6 py-4">Nomor Identitas</th>
                    <th className="px-6 py-4">Tipe Member</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-neutral-850/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{member.user.name}</div>
                        <div className="text-xs text-neutral-500">{member.user.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-neutral-400">
                        {member.identity_number}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium">
                        {getMemberTypeLabel(member.member_type)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getMemberLevelVariant(member.member_level)}>
                          {member.member_level.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {member.is_verified ? (
                          <Badge variant="success">Verified</Badge>
                        ) : (
                          <Badge variant="danger">Unverified</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!member.is_verified && (
                            <Button
                              variant="primary"
                              className="py-1 px-3 text-xs bg-emerald-650 hover:bg-emerald-750"
                              onClick={() => handleVerifyClick(member.id)}
                            >
                              Verifikasi
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            className="py-1 px-3 text-xs"
                            onClick={() => handleOpenEditModal(member)}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Edit Member Modal */}
      <Modal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Edit Keanggotaan Member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingMember(null)} disabled={updateMutation.isPending}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleEditSubmit} isLoading={updateMutation.isPending}>
              Simpan
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
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

          <div className="bg-neutral-950 border border-neutral-850 rounded-2xl p-4 space-y-1 text-xs text-neutral-400">
            <div>
              <span className="text-neutral-500 block">Nama Lengkap</span>
              <span className="text-white font-semibold">{editingMember?.user.name}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Nomor Identitas</span>
              <span className="text-white font-semibold font-mono">{editingMember?.identity_number}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Tipe Member</label>
            <select
              value={memberType}
              onChange={(e) => setMemberType(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-neutral-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-200 cursor-pointer"
            >
              <option value="student">Mahasiswa (Student)</option>
              <option value="lecturer">Dosen (Lecturer)</option>
              <option value="staff">Karyawan (Staff)</option>
              <option value="external">Eksternal (External)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400">Level Member</label>
            <select
              value={memberLevel}
              onChange={(e) => setMemberLevel(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-850 hover:border-neutral-800 text-neutral-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors duration-200 cursor-pointer"
            >
              <option value="bronze">BRONZE</option>
              <option value="silver">SILVER</option>
              <option value="gold">GOLD</option>
              <option value="platinum">PLATINUM</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  )
}
