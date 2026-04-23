import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import type { ReactNode } from "react"

import { AppLayout } from "@/layouts/AppLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { ProtectedRoute } from "./ProtectedRoute"
import { LoginPage } from "@/pages/auth/login"
import { RegisterPage } from "@/pages/auth/register"
import { RegisterResidentPage } from "@/pages/registro"
import { useAuth } from "@/contexts/auth"
import { routes } from "./routes"
import type { Role } from "@/types/roles"

function RoleGuard({ allowedRoles, children }: { allowedRoles: Role[]; children: ReactNode }) {
  const { currentUser } = useAuth()
  if (currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

const router = createBrowserRouter([
  { path: "/registro/:slug", element: <RegisterResidentPage /> },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: routes.map((route) => ({
          path: route.path,
          element: route.allowedRoles ? (
            <RoleGuard allowedRoles={route.allowedRoles}>{route.element}</RoleGuard>
          ) : (
            route.element
          ),
        })),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
