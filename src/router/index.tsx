import { createBrowserRouter, RouterProvider } from "react-router-dom"

import { AppLayout } from "@/layouts/AppLayout"
import { routes } from "./routes"

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: routes.map((route) => ({
      path: route.path,
      element: route.element,
    })),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
