import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { useBooks } from '@/hooks/useBooks'
import type { Book } from '@/types/book.types'

export function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Fetch max 3 books
  const { data: booksData, isLoading } = useBooks({
    search: debouncedSearch || undefined,
    page_size: 3,
  })

  // The API returns paginated response, so we get results from booksData.results
  // But we want to ensure we only display 3, even if page_size somehow returns more
  const books: Book[] = booksData?.results?.slice(0, 3) || []

  return (
    <div className="min-h-screen bg-[#07070A] text-[#F8FAFC] font-sans selection:bg-[#5B3DF5] selection:text-white">
      {/* Floating Glass Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[1200px] h-[64px] rounded-full bg-[#111118]/80 backdrop-blur-[20px] border border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B3DF5] to-[#5EE6FF] flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(94,230,255,0.3)]">
            N
          </div>
          <span className="font-semibold text-lg tracking-tight">Nebula Read</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/auth/register"
            className="text-sm font-semibold bg-[#5B3DF5] hover:bg-[#7A5CFF] text-white px-5 py-2 rounded-full transition-all duration-300"
          >
            Register
          </Link>
        </div>
      </nav>

      <main className="pt-[160px] pb-24 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto flex flex-col items-center text-center space-y-[96px]">
        {/* Hero Section */}
        <section className="max-w-[800px] space-y-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5B3DF5]/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#5B3DF5]/15 text-[#7A5CFF] text-sm font-medium border border-[#5B3DF5]/20 mb-4">
            ✨ Platform Manajemen Perpustakaan Masa Depan
          </div>

          <h1 className="text-[48px] sm:text-[64px] font-light leading-[1.1] tracking-[-1.4px] sm:tracking-[-2px]">
            Eksplorasi literatur tanpa batas dengan{' '}
            <span className="font-semibold bg-gradient-to-r from-[#5B3DF5] to-[#5EE6FF] bg-clip-text text-transparent">
              Nebula Read
            </span>
          </h1>

          <p className="text-[#A1A1AA] text-lg sm:text-xl max-w-[600px] mx-auto font-light">
            Temukan ribuan referensi buku ilmiah, novel populer, dan jurnal riset dalam satu ekosistem digital yang premium.
          </p>

          <div className="pt-8 flex items-center justify-center gap-4">
            <Link
              to="/auth/register"
              className="bg-[#5B3DF5] hover:bg-[#7A5CFF] text-white rounded-full px-8 py-4 font-semibold transition-all duration-300 shadow-[0_10px_40px_rgba(91,61,245,0.2)] hover:shadow-[0_10px_40px_rgba(91,61,245,0.4)]"
            >
              Mulai Sekarang
            </Link>
            <a
              href="#search"
              className="bg-transparent border border-[#27272A] hover:bg-white/5 text-[#F8FAFC] rounded-full px-8 py-4 font-semibold transition-all duration-300"
            >
              Cari Buku
            </a>
          </div>
        </section>

        {/* Search Section */}
        <section id="search" className="w-full max-w-[1000px] space-y-12 relative z-10 scroll-mt-32">
          <div className="space-y-4 text-center">
            <h2 className="text-[32px] font-medium tracking-[-0.8px]">
              Cari Koleksi Kami
            </h2>
            <p className="text-[#A1A1AA]">
              Cari berdasarkan judul, penulis, kategori, atau penerbit.
            </p>
          </div>

          <div className="relative max-w-[600px] mx-auto">
            <input
              type="text"
              placeholder="Cari buku (contoh: Clean Code)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[64px] bg-[#111118] border border-[#27272A] focus:border-[#5B3DF5] focus:outline-none focus:ring-1 focus:ring-[#5B3DF5] rounded-[12px] px-6 text-lg text-[#F8FAFC] placeholder:text-[#A1A1AA] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#A1A1AA]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 14.0899 16.866 10.224 16.866C6.35812 16.866 3.448 13.866 3.448 10C3.448 6.13401 6.35812 3.13401 10.224 3.13401C14.0899 3.13401 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="bg-[#111118] border border-[#27272A] rounded-[32px] p-6 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 rounded-full border-2 border-[#5B3DF5] border-t-transparent animate-spin" />
              </div>
            ) : books.length > 0 ? (
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
                  {books.map((book) => (
                    <div
                      key={book.id}
                      className="group bg-[#171B2E] border border-white/5 hover:border-white/10 rounded-[24px] p-5 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(91,61,245,0.1)] flex flex-col h-full"
                    >
                      <div className="w-full aspect-[3/4] bg-[#07070A] rounded-[16px] overflow-hidden mb-4 relative border border-white/5">
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#A1A1AA] p-4 text-center">
                            <span className="text-3xl mb-2">📚</span>
                            <span className="text-[10px] font-medium uppercase tracking-widest opacity-50">{book.category}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#171B2E]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="inline-block px-2.5 py-1 rounded-full bg-[#5B3DF5]/10 text-[#7A5CFF] text-[10px] font-bold uppercase tracking-wider w-max mb-2">
                          {book.category}
                        </div>
                        <h3 className="text-[#F8FAFC] font-semibold text-lg leading-tight mb-1 line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-[#A1A1AA] text-sm line-clamp-1 mb-4">
                          {book.author}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center justify-center pt-8 border-t border-[#27272A] space-y-4">
                  <p className="text-[#A1A1AA] text-sm">
                    Menampilkan {books.length} dari {booksData?.count || 0} hasil. Ingin melihat lebih banyak koleksi?
                  </p>
                  <Link
                    to="/auth/register"
                    className="flex items-center gap-2 bg-[#5B3DF5]/10 hover:bg-[#5B3DF5]/20 text-[#7A5CFF] hover:text-[#5EE6FF] border border-[#5B3DF5]/30 rounded-full px-6 py-3 font-semibold transition-all duration-300"
                  >
                    Register untuk Lihat Semua Katalog
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <div className="text-4xl opacity-50">🔭</div>
                <p className="text-[#A1A1AA] text-lg">Buku tidak ditemukan.</p>
                <p className="text-sm text-[#A1A1AA]/60">Coba kata kunci lain untuk mencari di katalog kami.</p>
              </div>
            )}
          </div>
        </section>

        {/* Operational Hours Section */}
        <section className="w-full max-w-[800px] border-t border-[#27272A] pt-12 mt-12 flex flex-col items-center gap-4 text-center">
          <h3 className="text-[#F8FAFC] text-xl font-medium tracking-tight">Jam Operasional</h3>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#111118] border border-[#27272A]">
            <span className="text-xl">🕒</span>
            <div className="flex flex-col text-left">
              <span className="text-[#A1A1AA] text-sm font-medium">Senin - Jumat</span>
              <span className="text-[#5EE6FF] font-semibold">07:00 - 19:00</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
