import { useState } from 'react'
import { useBooks } from '@/hooks/useBooks'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/common/Input'
import { Spinner } from '@/components/common/Spinner'
import { Pagination } from '@/components/common/Pagination'
import { BookCard } from '@/components/common/BookCard'

export function BooksPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading } = useBooks({
    page,
    page_size: 12,
    search: debouncedSearch || undefined,
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const books = data?.results ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / 12)

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Katalog Buku</h1>
          <p className="text-sm text-neutral-400">
            Jelajahi dan pinjam buku berkualitas untuk studi dan riset Anda.
          </p>
        </div>
        <div className="w-full md:w-80">
          <Input
            type="text"
            placeholder="Cari judul, penulis, kategori, ISBN, atau penerbit..."
            value={search}
            onChange={handleSearchChange}
            className="py-2.5"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-24">
          <Spinner size="lg" />
        </div>
      ) : books.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20">
          <div className="text-center py-12">
          <p className="text-neutral-400">Tidak ada buku yang sesuai dengan pencarian atau filter.</p>
          <p className="text-xs text-neutral-500 mt-1 max-w-[20rem] mx-auto">
            Coba gunakan kata kunci lain atau ubah kategori filter Anda.
          </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
