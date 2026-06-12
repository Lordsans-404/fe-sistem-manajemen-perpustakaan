import type { Book } from './book.types'
import type { Library } from './auth.types'

export type BookCopyCondition = 'new' | 'good' | 'fair' | 'poor' | 'lost'

export interface BookCopy {
  id: string
  book: Book
  library: Library
  condition: BookCopyCondition
  isbn: string | null
  publisher: string | null
  publication_year: number | null
  created_at: string
  updated_at: string
}

export interface CreateBookCopyDto {
  book_id: string
  library_id: string
  condition: BookCopyCondition
  isbn?: string | null
  publisher?: string | null
  publication_year?: number | null
}
