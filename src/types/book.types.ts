export interface Book {
  id: string
  title: string
  author: string
  category: string
  cover_image: string | null
  created_at: string
  updated_at: string
}

export interface CreateBookDto {
  title: string
  author: string
  category: string
}

export interface UpdateBookDto {
  title?: string
  author?: string
  category?: string
  cover_image?: File | null
}
