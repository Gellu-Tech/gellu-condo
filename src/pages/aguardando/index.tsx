import { useEffect, useState } from "react"
import { Building2, Clock, XCircle } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WaitingInfo {
  condoName: string | null
  aptNumber: string | null
  aptBlock: string | null
}

export function AguardandoAprovacaoPage() {
  const { residentProfile, user, signOut } = useAuth()
  const [info, setInfo] = useState<WaitingInfo>({
    condoName: null,
    aptNumber: null,
    aptBlock: null,
  })

  const isRejected = residentProfile?.status === "rejeitado"

  useEffect(() => {
    if (!residentProfile || !user) return

    async function fetchInfo() {
      const [{ data: tenantData }, { data: residentData }] = await Promise.all([
        supabase
          .from("tenants")
          .select("name")
          .eq("id", residentProfile!.tenant_id)
          .maybeSingle(),
        supabase
          .from("residents")
          .select("apartments(number, block)")
          .eq("auth_id", user!.id)
          .maybeSingle(),
      ])

      const apt = residentData?.apartments as unknown as {
        number: string
        block: string | null
      } | null

      setInfo({
        condoName: tenantData?.name ?? null,
        aptNumber: apt?.number ?? null,
        aptBlock: apt?.block ?? null,
      })
    }

    fetchInfo()
  }, [residentProfile, user])

  async function handleSignOut() {
    if (isRejected) {
      await supabase.rpc("cleanup_rejected_resident")
    }
    signOut()
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Building2 className="size-5" />
        <span className="font-semibold">
          {info.condoName ?? "Gellu Condo"}
        </span>
      </div>

      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full",
          isRejected ? "bg-destructive/10" : "bg-primary/10",
        )}
      >
        {isRejected ? (
          <XCircle className="h-8 w-8 text-destructive" />
        ) : (
          <Clock className="h-8 w-8 text-primary" />
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isRejected ? "Cadastro não aprovado" : "Aguardando aprovação"}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {isRejected
            ? "Seu cadastro foi recusado pelo síndico do condomínio. Entre em contato para mais informações."
            : "Seu cadastro está sendo analisado pelo síndico. Você receberá acesso assim que for aprovado."}
        </p>
      </div>

      <div className="space-y-1 text-sm">
        {residentProfile?.name && (
          <p className="text-muted-foreground">
            Olá,{" "}
            <span className="font-medium text-foreground">
              {residentProfile.name}
            </span>
          </p>
        )}
        {info.aptNumber && (
          <p className="text-muted-foreground">
            Apartamento{" "}
            <span className="font-medium text-foreground">
              {info.aptNumber}
              {info.aptBlock ? ` — Bloco ${info.aptBlock}` : ""}
            </span>
          </p>
        )}
      </div>

      <Button variant="outline" onClick={handleSignOut}>
        Sair da conta
      </Button>
    </div>
  )
}
