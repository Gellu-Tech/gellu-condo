import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/contexts/auth"
import { AguardandoAprovacaoPage } from "@/pages/aguardando"

export function ProtectedRoute() {
  const { session, profile, residentProfile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (!profile && residentProfile) {
    if (residentProfile.status === "aprovado") return <Outlet />
    return <AguardandoAprovacaoPage />
  }

  return <Outlet />
}
