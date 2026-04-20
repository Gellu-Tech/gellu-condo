import { Outlet } from "react-router-dom"
import { Building2 } from "lucide-react"

export function AuthLayout() {
  return (
    <div className="flex h-screen">
      {/* Left branding panel */}
      <div className="hidden w-[420px] shrink-0 flex-col justify-between bg-sidebar p-10 text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2">
          <Building2 className="size-6" />
          <span className="text-lg font-semibold">Gellu Condo</span>
        </div>

        <div className="space-y-3">
          <p className="text-2xl font-semibold leading-snug">
            Gestão de Condomínios
          </p>
          <p className="text-sm text-sidebar-foreground/70">
            Gerencie sua portaria com eficiência. Controle de moradores,
            veículos, encomendas e muito mais.
          </p>
        </div>

        <p className="text-xs text-sidebar-foreground/40">
          © {new Date().getFullYear()} Gellu Condo
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <Building2 className="size-5 text-primary" />
            <span className="font-semibold">Gellu Condo</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
