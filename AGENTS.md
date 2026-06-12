# AGENTS.md

## Rules

- **Never run terminal commands.** Provide commands for the user to run instead.
- **Always read `./api/<resource>.md`** before touching any service file. Do not guess endpoints or field names.
- **All code must pass** `bun run lint` with zero errors.
- No `any` type. No unused variables. No leftover `console.log`.

---

## Tech Stack

| | |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| HTTP | Axios 1.17 |
| Router | React Router DOM 7 |
| Server State | TanStack Query 5 |
| Client State | Zustand 5 |
| Linter | ESLint 10 + typescript-eslint |

**Tailwind not installed yet. Run:**
```bash
bun add -d @tailwindcss/vite tailwindcss
```

---

## Project Structure

```
src/
├── assets/
├── components/
│   ├── common/          # Reusable UI atoms (Button, Input, Modal, etc.)
│   └── layout/          # Partials (Navbar, Sidebar, Footer)
├── hooks/               # Custom hooks (useXxx.ts)
├── layouts/             # Full-page layout templates
├── pages/               # Route-level components
│   └── [feature]/
├── router/
│   └── index.tsx
├── services/
│   ├── api.ts           # Axios base instance — do not duplicate
│   └── [resource].service.ts
├── store/               # Zustand stores
│   └── [resource].store.ts
├── types/
│   └── [resource].types.ts
├── utils/               # Pure functions only, no React imports
├── App.tsx
└── main.tsx
```

**Rules:**
- `components/` → used in more than one place
- `pages/` → called directly by router only
- `services/` → the only layer allowed to make HTTP calls
- `utils/` → no hooks, no React imports

---

## Naming

| Type | Format | Example |
|------|--------|---------|
| Component file | PascalCase | `BookCard.tsx` |
| Page file | PascalCase + `Page` | `BooksPage.tsx` |
| Layout file | PascalCase + `Layout` | `DefaultLayout.tsx` |
| Hook | `use` prefix, camelCase | `useBooks.ts` |
| Store | camelCase + `Store` | `authStore.ts` |
| Service | camelCase + `.service.ts` | `book.service.ts` |
| Types file | camelCase + `.types.ts` | `book.types.ts` |
| Interface | PascalCase | `interface Book` |
| Type alias | PascalCase | `type BookStatus` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_BORROW_DAYS` |
| Route path | kebab-case | `/book-detail/:id` |

---

## React Components

- **Functional components only.** No class components.
- **Named exports only.** No default exports for components.
- File extension: `.tsx` for components, `.ts` for everything else.

```tsx
// ✅ Correct
interface BookCardProps {
  book: Book
  isSelected?: boolean
  onSelect: (book: Book) => void
}

export function BookCard({ book, isSelected = false, onSelect }: BookCardProps) {
  return (
    <div
      className={['rounded-lg border p-4', isSelected ? 'border-blue-500' : 'border-gray-200'].join(' ')}
      onClick={() => onSelect(book)}
    >
      <h3 className="font-semibold">{book.title}</h3>
    </div>
  )
}
```

```tsx
// ❌ Wrong
export default function BookCard(props: any) { ... }
```

**Component structure order:**
1. Imports
2. Types / Interfaces
3. Component function
4. Helper functions used only by this component (below the component)

**JSX rules:**
- Conditional class via array join or a `cn()` util — no inline `style={{}}`
- Extract complex conditionals to a variable before the return
- Keep JSX readable — if a block exceeds ~15 lines, consider extracting a sub-component

---

## TypeScript

- **No `any`** — use `unknown` + narrowing if type is unclear
- All non-trivial functions must have explicit return types
- Use `interface` for object shapes, `type` for unions and aliases
- Use optional chaining `?.` and nullish coalescing `??`

---

## Tailwind CSS

- Use utility classes directly in JSX `className`
- Never hardcode colors, spacing, or sizes — use Tailwind tokens
- Conditional classes via array + `.join(' ')` or a `cn()` helper
- No inline `style={{}}` except for truly dynamic values (e.g. calculated widths)

---

## Service Layer

One file per Django resource. Read `./api/<resource>.md` before writing.

**`src/services/api.ts` — base instance (do not create other instances):**
```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  },
)

export default api
```

**`src/services/[resource].service.ts`:**
```typescript
import api from './api'
import type { Book, CreateBookDto } from '@/types/book.types'
import type { PaginatedResponse } from '@/types/common.types'

export const bookService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<PaginatedResponse<Book>>('/books/', { params }),
  getById: (id: number) => api.get<Book>(`/books/${id}/`),
  create: (data: CreateBookDto) => api.post<Book>('/books/', data),
  update: (id: number, data: Partial<CreateBookDto>) => api.put<Book>(`/books/${id}/`, data),
  delete: (id: number) => api.delete<void>(`/books/${id}/`),
}
```

**Rules:**
- Services only make HTTP calls — no business logic
- Always provide a generic type to `api.get<T>()`, `api.post<T>()`, etc.
- Trailing slashes on all Django endpoints

---

## TanStack Query (Server State)

Use TanStack Query for **all** data fetching. Do not use `useEffect` + `useState` to fetch data.

**Query keys — define per resource:**
```typescript
// src/hooks/useBooks.ts
export const bookKeys = {
  all: ['books'] as const,
  list: (params?: Record<string, unknown>) => [...bookKeys.all, 'list', params] as const,
  detail: (id: number) => [...bookKeys.all, 'detail', id] as const,
}
```

**useQuery for GET:**
```typescript
import { useQuery } from '@tanstack/react-query'
import { bookService } from '@/services/book.service'

export function useBooks(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: bookKeys.list(params),
    queryFn: () => bookService.getAll(params).then((res) => res.data),
  })
}

export function useBook(id: number) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => bookService.getById(id).then((res) => res.data),
    enabled: !!id,
  })
}
```

**useMutation for POST/PUT/DELETE:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBookDto) => bookService.create(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.all })
    },
  })
}
```

**Rules:**
- Query key arrays must be `as const`
- Always invalidate relevant query keys after mutations
- Use `enabled` to prevent queries from firing before required data is available
- Destructure `{ data, isLoading, error }` directly from query hooks

---

## Zustand (Client State)

Use Zustand for **client-only** state that must persist across components (auth, UI preferences).
Do not use Zustand for server data — that belongs to TanStack Query.

```typescript
// src/store/authStore.ts
import { create } from 'zustand'
import type { User } from '@/types/auth.types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),

  setAuth: (token, user) => {
    localStorage.setItem('access_token', token)
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
```

---

## React Router DOM 7

```tsx
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import { DefaultLayout } from '@/layouts/DefaultLayout'
import { AuthLayout } from '@/layouts/AuthLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      { index: true, lazy: () => import('@/pages/home/HomePage') },
      {
        path: 'books',
        children: [
          { index: true, lazy: () => import('@/pages/books/BooksPage') },
          { path: ':id', lazy: () => import('@/pages/books/BookDetailPage') },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', lazy: () => import('@/pages/auth/LoginPage') },
    ],
  },
  {
    path: '*',
    lazy: () => import('@/pages/NotFoundPage'),
  },
])
```

```tsx
// src/main.tsx
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
// ...
<RouterProvider router={router} />
```

**Auth guard — create a `ProtectedRoute` component:**
```tsx
// src/components/common/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />
}
```

Wrap protected routes with `element: <ProtectedRoute />` in the router.

**Rules:**
- Always use `lazy()` for page-level components
- Use `<Navigate>` for redirects, never `window.location.href` inside components
- Use `useNavigate` hook for programmatic navigation

---

## Custom Hooks

For logic that doesn't involve data fetching, extract into custom hooks in `src/hooks/`.
Data-fetching hooks (wrapping TanStack Query) also live here.

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

---

## API Docs

All Django API documentation is in `./api/`. Before writing any service or type:
1. Find the relevant `.md` file in `./api/`
2. Use the exact endpoints, fields, and response shapes documented there

---

## Environment Variables

`.env.local` (never commit):
```
VITE_API_BASE_URL=http://localhost:8000/api
```

Access in code: `import.meta.env.VITE_API_BASE_URL`
All client-side env vars must be prefixed with `VITE_`.

---

## Commands

```bash
bun run dev          # start dev server
bun run build        # type-check + build
bun run type-check   # type-check only
bun run lint         # lint + auto-fix
bun add <package>    # add a dependency
```