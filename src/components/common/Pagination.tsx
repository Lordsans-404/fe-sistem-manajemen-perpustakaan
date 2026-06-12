import { cn } from '@/utils/cn'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8 select-none">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3.5 py-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 transition-all duration-200 text-sm font-medium cursor-pointer"
      >
        Sebelumnya
      </button>

      <div className="flex items-center gap-1.5">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border cursor-pointer',
              page === currentPage
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/10'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800 hover:text-white'
            )}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3.5 py-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-800 transition-all duration-200 text-sm font-medium cursor-pointer"
      >
        Selanjutnya
      </button>
    </div>
  )
}
