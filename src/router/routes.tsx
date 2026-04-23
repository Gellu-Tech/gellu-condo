import * as React from "react"
import { LayoutDashboard, Settings, Users } from "lucide-react"

import { DashboardPage } from "@/pages/dashboard"
import { SettingsPage } from "@/pages/settings"
import { MoradoresPage } from "@/pages/moradores"
import type { Role } from "@/types/roles"

export type { Role }

export interface RouteConfig {
  key: string
  path: string
  section?: "main" | "footer"
  label?: string
  icon?: React.ReactNode
  allowedRoles?: Role[]
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
    key: "moradores",
    path: "/moradores",
    section: "main",
    label: "Moradores",
    icon: <Users />,
    allowedRoles: ["admin", "sindico", "administradora", "porteiro"],
    element: <MoradoresPage />,
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
