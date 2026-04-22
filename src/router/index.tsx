import { createBrowserRouter, RouterProvider } from "react-router-dom"

import { AppLayout } from "@/layouts/AppLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { ProtectedRoute } from "./ProtectedRoute"
import { LoginPage } from "@/pages/auth/login"
import { RegisterPage } from "@/pages/auth/register"
import { RegisterResidentPage } from "@/pages/registro"
import { routes } from "./routes"

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
          element: route.element,
        })),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
