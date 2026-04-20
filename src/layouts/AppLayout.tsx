import { Outlet } from "react-router-dom"
import { LogOut } from "lucide-react"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth"
import { routes } from "@/router/routes"

const mainRoutes = routes.filter((r) => r.section === "main")
const footerRoutes = routes.filter((r) => r.section === "footer")

export function AppLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="flex h-screen bg-background p-3">
      <Sidebar className="h-full rounded-xl">
        <SidebarHeader
          name={profile?.name ?? "Carregando..."}
          role={profile?.role}
        />

        <SidebarContent>
          <SidebarSection label="Home" collapsedLabelClassName="pl-1">
            {mainRoutes.map((route) => (
              <SidebarItem
                key={route.key}
                to={route.path}
                icon={route.icon}
                label={route.label!}
              />
            ))}
          </SidebarSection>
        </SidebarContent>

        <SidebarFooter>
          <SidebarSection label="Settings" collapsedLabelClassName="-ml-[8px]">
            {footerRoutes.map((route) => (
              <SidebarItem
                key={route.key}
                to={route.path}
                icon={route.icon}
                label={route.label!}
              />
            ))}
            <SidebarItem icon={<LogOut />} label="Sair" onClick={signOut} />
          </SidebarSection>
        </SidebarFooter>
      </Sidebar>

      <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-auto px-10 py-6">
        <Outlet />
      </main>
    </div>
  )
}
