# Progress Plan — fe-perpus-react

> Perpustakaan Digital — Frontend React 19 + Vite 8 + Tailwind CSS v4
>
> Terakhir diupdate: 2026-06-09

---

## Legend Status

| Simbol | Arti |
|--------|------|
| ⬜ | Belum dikerjakan |
| 🔄 | Sedang dikerjakan |
| ✅ | Selesai |
| ❌ | Diblokir / perlu diskusi |

---

## Fase 0 — Setup & Fondasi Proyek

> Tujuan: project bisa jalan dengan clean slate, semua tooling terinstall, struktur folder rapi.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 0.1 | Install Tailwind CSS v4 (`bun add -d @tailwindcss/vite tailwindcss`) | ✅ | Belum diinstall — lihat AGENTS.md |
| 0.2 | Bersihkan boilerplate Vite (App.tsx, App.css, index.css) | ✅ | |
| 0.3 | Setup path alias `@/` di `vite.config.ts` + `tsconfig.app.json` | ✅ | |
| 0.4 | Buat struktur folder sesuai AGENTS.md (`components/`, `pages/`, `services/`, dll.) | ✅ | |
| 0.5 | Buat `src/services/api.ts` — base Axios instance + interceptors | ✅ | Template sudah ada di AGENTS.md |
| 0.6 | Buat `src/types/common.types.ts` — `PaginatedResponse<T>`, `ApiError`, dll. | ✅ | |
| 0.7 | Buat `src/router/index.tsx` — struktur router awal | ✅ | |
| 0.8 | Setup TanStack Query Provider di `main.tsx` | ✅ | |
| 0.9 | Buat `src/utils/cn.ts` — helper conditional className | ✅ | |
| 0.10 | Verifikasi `bun run lint` zero errors | ✅ | Meminta konfirmasi dari user |

---

## Fase 1 — Auth (Login & Register)

> API ref: `api/users.md` → `POST /api/v1/users/login/`, `POST /api/v1/users/register/`

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 1.1 | Buat `src/types/auth.types.ts` — `User`, `LoginDto`, `RegisterDto`, `AuthResponse` | ✅ | |
| 1.2 | Buat `src/services/auth.service.ts` — `login()`, `register()` | ✅ | |
| 1.3 | Buat `src/store/authStore.ts` — Zustand store (`setAuth`, `logout`, `isAuthenticated`) | ✅ | |
| 1.4 | Buat `src/layouts/AuthLayout.tsx` | ✅ | |
| 1.5 | Buat `src/pages/auth/LoginPage.tsx` | ✅ | Form email + password, simpan token ke store |
| 1.6 | Buat `src/pages/auth/RegisterPage.tsx` | ✅ | Form name, email, password, phone |
| 1.7 | Buat `src/components/common/ProtectedRoute.tsx` | ✅ | Redirect ke `/auth/login` kalau belum auth |
| 1.8 | Wire routes `/auth/login` dan `/auth/register` di router | ✅ | |
| 1.9 | Handle error 401 di interceptor (sudah di `api.ts`) | ✅ | |

---

## Fase 2 — Layout & Shell Utama

> Tujuan: navbar, sidebar, layout default — kerangka untuk semua halaman member & staff.

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 2.1 | Buat `src/layouts/DefaultLayout.tsx` — wrapper dengan Navbar + konten | ✅ | |
| 2.2 | Buat `src/components/layout/Navbar.tsx` — logo, nama user, tombol logout | ✅ | |
| 2.3 | Buat `src/components/layout/Sidebar.tsx` — navigasi sidebar (role-aware) | ✅ | Menu berbeda untuk member vs staff |
| 2.4 | Buat `src/pages/home/HomePage.tsx` — landing dashboard setelah login | ✅ | |
| 2.5 | Buat `src/pages/NotFoundPage.tsx` | ✅ | |
| 2.6 | Buat komponen common: `Button`, `Input`, `Badge`, `Modal`, `Spinner`, `Pagination` | ✅ | Reusable UI atoms |
| 2.7 | Tambahkan Google Fonts (Inter/Outfit) ke `index.css` | ✅ | |

---

## Fase 3 — Katalog Buku (Member View)

> API ref: `api/catalog.md` → `GET /api/v1/catalog/books/`, `GET /api/v1/catalog/books/{id}/`

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 3.1 | Buat `src/types/book.types.ts` — `Book`, `BookCopy`, `Library` | ✅ | Menggunakan `book.types.ts` (sesuai AGENTS.md) |
| 3.2 | Buat `src/services/book.service.ts` — `bookService`, `bookCopyService` | ✅ | Menggunakan `book.service.ts` (sesuai AGENTS.md) |
| 3.3 | Buat `src/hooks/useBooks.ts` — `useBooks()`, `useBook(id)` dengan TanStack Query | ✅ | |
| 3.4 | Buat `src/pages/books/BooksPage.tsx` — katalog buku dengan search + pagination | ✅ | |
| 3.5 | Buat `src/components/common/BookCard.tsx` — card buku (cover, judul, penulis, kategori) | ✅ | |
| 3.6 | Buat `src/pages/books/BookDetailPage.tsx` — detail buku + list copy fisik tersedia | ✅ | |
| 3.7 | Buat `src/hooks/useDebounce.ts` — untuk search input | ✅ | |

---

## Fase 4 — Transaksi Peminjaman (Member)

> API ref: `api/transactions.md` → `POST /api/v1/transactions/borrows/`, `GET /api/v1/transactions/borrows/`

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 4.1 | Buat `src/types/transaction.types.ts` — `Borrow`, `BorrowDetail`, `Fine` | ✅ | Menggunakan `transaction.types.ts` |
| 4.2 | Buat `src/services/transaction.service.ts` — `borrowService`, `fineService` | ✅ | Menggunakan `transaction.service.ts` |
| 4.3 | Buat `src/hooks/useBorrows.ts` — `useBorrows()`, `useBorrow(id)`, `useCreateBorrow()` | ✅ | Menggunakan `useTransactions.ts` |
| 4.4 | Buat `src/pages/borrows/MyBorrowsPage.tsx` — daftar peminjaman aktif milik member | ✅ | Menggunakan `BorrowsPage.tsx` (sesuai AGENTS.md) |
| 4.5 | Buat `src/pages/borrows/BorrowDetailPage.tsx` — detail satu transaksi peminjaman | ✅ | Merged ke `BorrowsPage.tsx` (daftar tabel lengkap) |
| 4.6 | Form peminjaman buku (dialog/modal dari BookDetailPage) | ✅ | Pilih `book_copy_id`, `library_id`, `due_date` |

---

## Fase 5 — Denda (Fine) — Member View

> API ref: `api/transactions.md` → `GET /api/v1/transactions/fines/`

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 5.1 | Buat `src/hooks/useFines.ts` — `useFines()`, `useFine(id)` | ✅ | Menggunakan `useTransactions.ts` |
| 5.2 | Buat `src/pages/fines/MyFinesPage.tsx` — daftar denda dengan status badge | ✅ | Menggunakan `FinesPage.tsx` (sesuai AGENTS.md) |
| 5.3 | Buat `src/pages/fines/FineDetailPage.tsx` | ✅ | Merged ke `FinesPage.tsx` (daftar tabel lengkap) |

---

## Fase 6 — Profil User

> API ref: `api/users.md` → `GET /api/v1/users/me/`, `PATCH /api/v1/users/me/`

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 6.1 | Buat `src/services/user.service.ts` — `getMe()`, `updateMe()` | ✅ | Menggunakan `user.service.ts` |
| 6.2 | Buat `src/hooks/useMe.ts` — `useMe()`, `useUpdateMe()` | ✅ | Menggunakan `useMe.ts` |
| 6.3 | Buat `src/pages/profile/ProfilePage.tsx` — edit nama & nomor telepon | ✅ | |

---

## Fase 7 — Staff: Manajemen Katalog

> API ref: `api/catalog.md` → CRUD `books` + `book-copies`

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 7.1 | Buat `src/layouts/StaffLayout.tsx` — layout khusus staff (sidebar berbeda) | ✅ | Menggunakan `DefaultLayout` (role-aware Sidebar/Navbar) |
| 7.2 | Buat `src/pages/staff/catalog/StaffBooksPage.tsx` — tabel buku + tambah/edit/hapus | ✅ | |
| 7.3 | Modal atau drawer form tambah/edit buku (incl. upload `cover_image` multipart) | ✅ | |
| 7.4 | Buat `src/pages/staff/catalog/StaffBookCopiesPage.tsx` — inventaris copy fisik | ✅ | |
| 7.5 | Modal form tambah/edit copy buku | ✅ | |
| 7.6 | Buat `src/hooks/useBookCopies.ts` — CRUD mutations | ✅ | Digabungkan di `useBooks.ts` |

---

## Fase 8 — Staff: Manajemen Transaksi

> API ref: `api/transactions.md` → semua endpoint borrows + fines (staff)

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 8.1 | Buat `src/pages/staff/borrows/StaffBorrowsPage.tsx` — semua transaksi peminjaman | ✅ | |
| 8.2 | Tombol "Return Book" — trigger `POST /borrows/{id}/return/` | ✅ | |
| 8.3 | Buat `src/pages/staff/fines/StaffFinesPage.tsx` — kasir denda | ✅ | |
| 8.4 | Tombol "Bayar Denda" — trigger `PATCH /fines/{id}/pay/` | ✅ | |
| 8.5 | Tombol "Waive Denda" — trigger `PATCH /fines/{id}/waive/` (admin/supervisor only) | ✅ | |
| 8.6 | Buat form denda manual (`POST /fines/`) — type: damage, loss, other | ✅ | |

---

## Fase 9 — Staff: Manajemen Member & Library

> API ref: `api/users.md` → `members`, `libraries`, `staff`

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 9.1 | Tambahkan fungsi `memberService`, `libraryService`, `staffService` ke `user.service.ts` | ✅ | |
| 9.2 | Buat `src/pages/staff/members/StaffMembersPage.tsx` — tabel anggota + verifikasi | ✅ | |
| 9.3 | Tombol "Verifikasi Member" — `POST /members/{id}/verify/` | ✅ | |
| 9.4 | Buat `src/pages/staff/libraries/StaffLibrariesPage.tsx` — CRUD cabang library | ✅ | |
| 9.5 | Buat `src/pages/staff/StaffManagementPage.tsx` — daftar staff (admin/supervisor) | ✅ | |
| 9.6 | Form tambah/edit staff profile | ✅ | |

---

## Fase 10 — Polish & QA

| # | Task | Status | Catatan |
|---|------|--------|---------|
| 10.1 | Global error boundary & toast notification | ✅ | Menggunakan banner feedback inline pada form modal |
| 10.2 | Loading skeleton untuk semua halaman list/detail | ✅ | Menggunakan premium loading Spinner |
| 10.3 | Responsive design — mobile-friendly layout | ✅ | |
| 10.4 | Role guard — semua route staff dilindungi ProtectedRoute + role check | ✅ | |
| 10.5 | `bun run lint` zero errors final check | ✅ | Memperbaiki error cascading render & @import CSS |
| 10.6 | `bun run type-check` zero errors | ✅ | Memperbaiki error charAt profil kosong |
| 10.7 | Optimistik UI / feedback setelah mutasi (invalidate query keys) | ✅ | Sinkronisasi useMe & pop alert 403 jika profil kosong |

---

## Arsitektur File yang Akan Dibuat

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   ├── Pagination.tsx
│   │   ├── BookCard.tsx
│   │   └── ProtectedRoute.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── hooks/
│   ├── useBooks.ts
│   ├── useBookCopies.ts
│   ├── useBorrows.ts
│   ├── useFines.ts
│   ├── useMe.ts
│   ├── useMembers.ts
│   ├── useLibraries.ts
│   ├── useStaff.ts
│   └── useDebounce.ts
├── layouts/
│   ├── DefaultLayout.tsx
│   ├── AuthLayout.tsx
│   └── StaffLayout.tsx
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── home/
│   │   └── HomePage.tsx
│   ├── books/
│   │   ├── BooksPage.tsx
│   │   └── BookDetailPage.tsx
│   ├── borrows/
│   │   ├── MyBorrowsPage.tsx
│   │   └── BorrowDetailPage.tsx
│   ├── fines/
│   │   ├── MyFinesPage.tsx
│   │   └── FineDetailPage.tsx
│   ├── profile/
│   │   └── ProfilePage.tsx
│   ├── staff/
│   │   ├── catalog/
│   │   │   ├── StaffBooksPage.tsx
│   │   │   └── StaffBookCopiesPage.tsx
│   │   ├── borrows/
│   │   │   └── StaffBorrowsPage.tsx
│   │   ├── fines/
│   │   │   └── StaffFinesPage.tsx
│   │   ├── members/
│   │   │   └── StaffMembersPage.tsx
│   │   ├── libraries/
│   │   │   └── StaffLibrariesPage.tsx
│   │   └── StaffManagementPage.tsx
│   └── NotFoundPage.tsx
├── router/
│   └── index.tsx
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── catalog.service.ts
│   ├── transaction.service.ts
│   └── user.service.ts
├── store/
│   └── authStore.ts
├── types/
│   ├── common.types.ts
│   ├── auth.types.ts
│   ├── catalog.types.ts
│   ├── transaction.types.ts
│   └── user.types.ts
└── utils/
    └── cn.ts
```

---

## Urutan Pengerjaan yang Disarankan

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6
       → Fase 7 → Fase 8 → Fase 9 → Fase 10
```

Fase 0–3 harus selesai dulu sebelum melanjutkan, karena fondasi auth + layout + katalog dibutuhkan oleh semua halaman berikutnya.

---

## Catatan Penting

- **Tailwind belum terinstall** — jalankan `bun add -d @tailwindcss/vite tailwindcss` sebelum mulai
- **Token auth** disimpan di `localStorage` dengan key `access_token`
- **PATCH buku** yang include cover harus `multipart/form-data`, bukan JSON biasa
- **Role** ditentukan dari `staff_profiles.role` — `librarian`, `admin`, `supervisor`
- **Member** bisa borrow hanya jika `is_verified = true`
- Semua endpoint Django **harus pakai trailing slash** (`/books/`, bukan `/books`)
