import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  useBooks,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
} from '@/hooks/useBooks'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Spinner } from '@/components/common/Spinner'
import { Modal } from '@/components/common/Modal'
import { Pagination } from '@/components/common/Pagination'
import type { Book } from '@/types/book.types'

export function StaffBooksPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading } = useBooks({
    page,
    page_size: 10,
    search: debouncedSearch || undefined,
  })

  const books = data?.results ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / 10)

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [isDeletingBook, setIsDeletingBook] = useState<Book | null>(null)

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mutations
  const createMutation = useCreateBook()
  const deleteMutation = useDeleteBook()

  // For updates, we instantiate hooks with temporary IDs or call service directly inside onSubmit, or we can use custom hook wrapper.
  // Wait, let's see. Our useUpdateBook hook is `useUpdateBook(id)`.
  // If we want to update, we can call it when editingBook is loaded, or we can instantiate update/cover hooks dynamically.
  // Wait! In React we cannot call hooks conditionally.
  // So we can write update mutation using bookService directly, or we can use a component level useMutation.
  // That's much cleaner! Let's use custom useMutation directly inside the page, or use bookService since services are allowed to make HTTP calls.
  // Wait, React Query allows using useMutation with custom mutationFn:
  // `useMutation({ mutationFn: ({ id, data }) => bookService.update(id, data) })`
  // This is a beautiful way to avoid dynamic hooks issues!
  const updateMutation = useUpdateBook()

  const handleOpenCreateModal = () => {
    setEditingBook(null)
    setTitle('')
    setAuthor('')
    setCategory('')
    setSelectedFile(null)
    setErrorMsg('')
    setSuccessMsg('')
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book)
    setTitle(book.title)
    setAuthor(book.author)
    setCategory(book.category)
    setSelectedFile(null)
    setErrorMsg('')
    setSuccessMsg('')
    setIsFormModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (editingBook) {
      // Edit mode
      updateMutation.mutate(
        {
          id: editingBook.id,
          data: { title, author, category, ...(selectedFile ? { cover_image: selectedFile } : {}) },
        },
        {
          onSuccess: () => {
            setSuccessMsg('Buku berhasil diperbarui!')
            setTimeout(() => setIsFormModalOpen(false), 1500)
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } }
            setErrorMsg(
              error.response?.data?.message ||
              'Gagal memperbarui buku.'
            )
          },
        }
      )
    } else {
      // Create mode
      createMutation.mutate(
        { title, author, category },
        {
          onSuccess: (newBook) => {
            if (selectedFile) {
              setSuccessMsg('Buku berhasil ditambahkan, mengunggah sampul...')
              updateMutation.mutate(
                { id: newBook.id, data: { cover_image: selectedFile } },
                {
                  onSuccess: () => {
                    setSuccessMsg('Buku dan sampul berhasil ditambahkan!')
                    setTimeout(() => setIsFormModalOpen(false), 1500)
                  },
                  onError: () => {
                    setErrorMsg('Buku ditambahkan tetapi gagal mengunggah sampul.')
                  },
                }
              )
            } else {
              setSuccessMsg('Buku berhasil ditambahkan!')
              setTimeout(() => setIsFormModalOpen(false), 1500)
            }
          },
          onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } } }
            setErrorMsg(
              error.response?.data?.message ||
              'Gagal menambahkan buku.'
            )
          },
        }
      )
    }
  }

  const handleDeleteConfirm = () => {
    if (!isDeletingBook) return
    setErrorMsg('')

    deleteMutation.mutate(isDeletingBook.id, {
      onSuccess: () => {
        setIsDeletingBook(null)
      },
      onError: (err: unknown) => {
        const error = err as { response?: { status?: number; data?: { message?: string } } }
        if (error.response?.status === 409) {
          alert(
            'Gagal menghapus buku: Masih terdapat salinan fisik (copies) yang terdaftar untuk buku ini. Silakan hapus salinan fisik terlebih dahulu.'
          )
        } else {
          alert(error.response?.data?.message || 'Gagal menghapus buku.')
        }
        setIsDeletingBook(null)
      },
    })
  }

  const isPending =
    createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kelola Katalog Buku</h1>
          <p className="text-sm text-neutral-400">
            Daftar judul referensi buku perpustakaan. Kelola metadata dan unggah sampul buku.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal}>
          + Tambah Buku
        </Button>
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-80">
          <Input
            type="text"
            placeholder="Cari judul, penulis, kategori, ISBN, atau penerbit..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="py-2.5"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : books.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
          <p className="text-neutral-500 text-sm">Tidak ada buku terdaftar dalam katalog.</p>
        </div>
      ) : (
        <>
          <div className="border border-neutral-800 bg-neutral-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-950/40 border-b border-neutral-800 text-neutral-400 font-semibold">
                    <th className="px-6 py-4 w-20">Sampul</th>
                    <th className="px-6 py-4">Judul Buku</th>
                    <th className="px-6 py-4">Penulis</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {books.map((book) => (
                    <tr key={book.id} className="hover:bg-neutral-850/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="h-12 w-9 bg-neutral-950 border border-neutral-850 rounded overflow-hidden flex items-center justify-center">
                          {book.cover_image ? (
                            <img src={book.cover_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">📖</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{book.title}</div>
                        <div className="text-xs text-neutral-500 font-mono mt-0.5">{book.id}</div>
                      </td>
                      <td className="px-6 py-4">{book.author}</td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral" className="bg-neutral-800 text-neutral-300 border-neutral-700/30">
                          {book.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/app/staff/books/${book.id}/copies`}>
                            <Button variant="secondary" className="py-1 px-2.5 text-xs">
                              Salinan
                            </Button>
                          </Link>
                          <Button
                            variant="secondary"
                            className="py-1 px-2.5 text-xs"
                            onClick={() => handleOpenEditModal(book)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            className="py-1 px-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20"
                            onClick={() => setIsDeletingBook(book)}
                          >
                            Hapus
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

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingBook ? 'Edit Detail Buku' : 'Tambah Buku Baru'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} disabled={isPending}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleFormSubmit} isLoading={isPending}>
              Simpan
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-xl text-left">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs rounded-xl text-left">
              {successMsg}
            </div>
          )}

          <Input
            id="book-title"
            label="Judul Buku"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Contoh: Clean Code"
          />

          <Input
            id="book-author"
            label="Penulis"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            placeholder="Contoh: Robert C. Martin"
          />

          <Input
            id="book-category"
            label="Kategori"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="Contoh: Software Engineering"
          />

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-neutral-400">Sampul Buku (Gambar)</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 file:cursor-pointer"
            />
            {editingBook?.cover_image && !selectedFile && (
              <p className="text-xs text-neutral-500 mt-1">
                * Biarkan kosong jika tidak ingin mengubah sampul saat ini.
              </p>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!isDeletingBook}
        onClose={() => setIsDeletingBook(null)}
        title="Konfirmasi Hapus Buku"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeletingBook(null)} disabled={deleteMutation.isPending}>
              Batal
            </Button>
            <Button
              variant="primary"
              className="bg-red-650 hover:bg-red-750 text-white"
              onClick={handleDeleteConfirm}
              isLoading={deleteMutation.isPending}
            >
              Hapus Permanen
            </Button>
          </>
        }
      >
        <p className="text-sm text-neutral-300 leading-relaxed text-left">
          Apakah Anda yakin ingin menghapus buku <span className="font-bold text-white">"{isDeletingBook?.title}"</span> dari katalog perpustakaan?
        </p>
        <p className="text-xs text-red-400 mt-3 text-left">
          * Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </div>
  )
}
