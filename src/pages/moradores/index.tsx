import { useEffect, useState } from "react"
import { Copy, Check, X } from "lucide-react"

import { toast } from "sonner"

import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth"
import { Button } from "@/components/ui/button"
import { AlertSuccess, AlertDestructive } from "@/components/ui/alert"
import { PageHeader } from "@/components/PageHeader"
import { cn } from "@/lib/utils"

interface Apartment {
  number: string
  block: string | null
}

interface Resident {
  id: string
  name: string
  email: string
  cpf: string | null
  phone: string | null
  status: string
  created_at: string
  apartments: Apartment | null
}

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
}

const STATUS_CLASS: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  aprovado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejeitado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export function MoradoresPage() {
  const { profile } = useAuth()
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState<string>("todos")
  const [updating, setUpdating] = useState<string | null>(null)


  useEffect(() => {
    if (!profile?.tenant_id) return
    fetchData()
  }, [profile?.tenant_id])

  async function fetchData() {
    setLoading(true)

    const [{ data: tenantData }, { data: residentsData }] = await Promise.all([
      supabase
        .from("tenants")
        .select("slug")
        .eq("id", profile!.tenant_id)
        .single(),
      supabase
        .from("residents")
        .select("id, name, email, cpf, phone, status, created_at, apartments(number, block)")
        .eq("tenant_id", profile!.tenant_id)
        .order("created_at", { ascending: false }),
    ])

    if (tenantData) setTenantSlug(tenantData.slug)
    if (residentsData) setResidents(residentsData as unknown as Resident[])
    setLoading(false)
  }

  async function updateStatus(id: string, status: "aprovado" | "rejeitado") {
    const resident = residents.find((r) => r.id === id)
    setUpdating(id)
    if (status === "aprovado") {
      await supabase.rpc("approve_resident", { p_resident_id: id })
    } else {
      await supabase.rpc("reject_resident", { p_resident_id: id })
    }
    setUpdating(null)
    setResidents((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    const name = resident?.name ?? ""
    if (status === "aprovado") {
      toast.custom(() => (
        <AlertSuccess title="Morador aprovado" description={`${name} foi aprovado com sucesso.`} className="w-89" />
      ), { duration: 5000 })
    } else {
      toast.custom(() => (
        <AlertDestructive title="Morador rejeitado" description={`${name} foi rejeitado.`} className="w-89" />
      ), { duration: 5000 })
    }
  }

  function copyLink() {
    if (!tenantSlug) return
    navigator.clipboard.writeText(`${window.location.origin}/registro/${tenantSlug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pendingCount = residents.filter((r) => r.status === "pendente").length

  const filtered =
    filter === "todos" ? residents : residents.filter((r) => r.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Moradores"
          description="Gerencie os moradores do condomínio"
        />
        <Button variant="outline" onClick={copyLink} className="shrink-0 gap-2">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copiado!" : "Copiar link de cadastro"}
        </Button>
      </div>

      <div className="flex gap-2">
        {["todos", "pendente", "aprovado", "rejeitado"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {s === "todos" ? "Todos" : STATUS_LABEL[s]}
            {s === "pendente" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-yellow-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === "todos"
              ? "Nenhum morador cadastrado ainda."
              : `Nenhum morador com status "${STATUS_LABEL[filter]}".`}
          </p>
          {filter === "todos" && tenantSlug && (
            <p className="mt-2 text-xs text-muted-foreground">
              Compartilhe o link de cadastro com os moradores.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Apartamento</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">CPF</th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Telefone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                {filter === "pendente" && (
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((resident) => (
                <tr key={resident.id} className="bg-background">
                  <td className="px-4 py-3">
                    <p className="font-medium">{resident.name}</p>
                    <p className="text-xs text-muted-foreground">{resident.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {resident.apartments ? (
                      <span>
                        {resident.apartments.number}
                        {resident.apartments.block ? ` — Bloco ${resident.apartments.block}` : ""}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {resident.cpf ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {resident.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        STATUS_CLASS[resident.status] ?? "bg-muted text-muted-foreground"
                      )}
                    >
                      {STATUS_LABEL[resident.status] ?? resident.status}
                    </span>
                  </td>
                  {filter === "pendente" && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => updateStatus(resident.id, "aprovado")}
                          disabled={!!updating}
                          className="rounded-md p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-50 dark:hover:bg-green-950/30"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          onClick={() => updateStatus(resident.id, "rejeitado")}
                          disabled={!!updating}
                          className="rounded-md p-1.5 text-destructive hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
