import * as React from "react"
import { LayoutDashboard, Settings } from "lucide-react"

import { DashboardPage } from "@/pages/dashboard"
import { SettingsPage } from "@/pages/settings"
import type { Role } from "@/types/roles"

export type Permission = string
export type { Role }

export interface RouteConfig {
  key: string
  path: string
  section?: "main" | "footer"
  label?: string
  icon?: React.ReactNode
  permission?: Permission
  requiredRole?: Role
  element: React.ReactNode
}

export const routes: RouteConfig[] = [
  {
    key: "dashboard",
    path: "/",
    section: "main",
    label: "Dashboard",
    icon: <LayoutDashboard />,
    element: <DashboardPage />,
  },
  {
    key: "settings",
    path: "/settings",
    section: "footer",
    label: "Configurações",
    icon: <Settings />,
    element: <SettingsPage />,
  },
]
