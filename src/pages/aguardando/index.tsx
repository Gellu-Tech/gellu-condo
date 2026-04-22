import { Building2, Clock, XCircle } from "lucide-react"

import { useAuth } from "@/contexts/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AguardandoAprovacaoPage() {
  const { residentProfile, signOut } = useAuth()

  const isRejected = residentProfile?.status === "rejeitado"

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Building2 className="size-5" />
        <span className="font-semibold">Gellu Condo</span>
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

      {residentProfile?.name && (
        <p className="text-sm text-muted-foreground">
          Olá,{" "}
          <span className="font-medium text-foreground">
            {residentProfile.name}
          </span>
        </p>
      )}

      <Button variant="outline" onClick={signOut}>
        Sair da conta
      </Button>
    </div>
  )
}
