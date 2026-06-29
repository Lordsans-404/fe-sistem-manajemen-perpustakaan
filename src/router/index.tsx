import { createBrowserRouter } from 'react-router-dom'
import { DefaultLayout } from '@/layouts/DefaultLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { LandingPage } = await import('@/pages/landing/LandingPage')
      return { Component: LandingPage }
    },
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <DefaultLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { HomePage } = await import('@/pages/home/HomePage')
              return { Component: HomePage }
            },
          },
          {
            path: 'books',
            children: [
              {
                index: true,
                lazy: async () => {
                  const { BooksPage } = await import('@/pages/books/BooksPage')
                  return { Component: BooksPage }
                },
              },
              {
                path: ':id',
                lazy: async () => {
                  const { BookDetailPage } = await import('@/pages/books/BookDetailPage')
                  return { Component: BookDetailPage }
                },
              },
            ],
          },
          {
            path: 'borrows',
            lazy: async () => {
              const { BorrowsPage } = await import('@/pages/borrows/BorrowsPage')
              return { Component: BorrowsPage }
            },
          },
          {
            path: 'fines',
            lazy: async () => {
              const { FinesPage } = await import('@/pages/fines/FinesPage')
              return { Component: FinesPage }
            },
          },
          {
            path: 'profile',
            lazy: async () => {
              const { ProfilePage } = await import('@/pages/profile/ProfilePage')
              return { Component: ProfilePage }
            },
          },
          {
            path: 'staff',
            element: <ProtectedRoute requireStaff />,
            children: [
              {
                path: 'books',
                children: [
                  {
                    index: true,
                    lazy: async () => {
                      const { StaffBooksPage } = await import('@/pages/staff/catalog/StaffBooksPage')
                      return { Component: StaffBooksPage }
                    },
                  },
                  {
                    path: ':id/copies',
                    lazy: async () => {
                      const { StaffBookCopiesPage } = await import('@/pages/staff/catalog/StaffBookCopiesPage')
                      return { Component: StaffBookCopiesPage }
                    },
                  },
                ],
              },
              {
                path: 'borrows',
                lazy: async () => {
                  const { StaffBorrowsPage } = await import('@/pages/staff/borrows/StaffBorrowsPage')
                  return { Component: StaffBorrowsPage }
                },
              },
              {
                path: 'fines',
                lazy: async () => {
                  const { StaffFinesPage } = await import('@/pages/staff/fines/StaffFinesPage')
                  return { Component: StaffFinesPage }
                },
              },
              {
                path: 'members',
                lazy: async () => {
                  const { StaffMembersPage } = await import('@/pages/staff/members/StaffMembersPage')
                  return { Component: StaffMembersPage }
                },
              },
              {
                path: 'libraries',
                lazy: async () => {
                  const { StaffLibrariesRoute } = await import('@/pages/staff/libraries/StaffLibrariesRoute')
                  return { Component: StaffLibrariesRoute }
                },
              },
              {
                path: 'management',
                lazy: async () => {
                  const { StaffManagementPage } = await import('@/pages/staff/StaffManagementPage')
                  return { Component: StaffManagementPage }
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        lazy: async () => {
          const { LoginPage } = await import('@/pages/auth/LoginPage')
          return { Component: LoginPage }
        },
      },
      {
        path: 'register',
        lazy: async () => {
          const { RegisterPage } = await import('@/pages/auth/RegisterPage')
          return { Component: RegisterPage }
        },
      },
    ],
  },
  {
    path: '*',
    lazy: async () => {
      const { NotFoundPage } = await import('@/pages/NotFoundPage')
      return { Component: NotFoundPage }
    },
  },
])
