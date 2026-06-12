import { Link } from 'react-router-dom'
import { Badge } from '@/components/common/Badge'
import type { Book } from '@/types/book.types'

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link
      to={`/app/books/${book.id}`}
      className="group flex flex-col bg-neutral-900 border border-neutral-800 hover:border-indigo-500/30 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-indigo-950/5"
    >
      <div className="aspect-[3/4] relative bg-neutral-950 flex items-center justify-center overflow-hidden border-b border-neutral-800/50">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-indigo-950/40 flex flex-col items-center justify-center p-6 text-center select-none">
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📖</span>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block line-clamp-2">
              {book.title}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Badge variant="neutral" className="bg-neutral-800 text-neutral-300 border-neutral-700/30">
            {book.category}
          </Badge>
          <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">
            {book.title}
          </h3>
        </div>
        <div className="text-xs text-neutral-400 font-medium mt-3 pt-3 border-t border-neutral-800/60">
          Oleh <span className="text-neutral-300 font-semibold">{book.author}</span>
        </div>
      </div>
    </Link>
  )
}
