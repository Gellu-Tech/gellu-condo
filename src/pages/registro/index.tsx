import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Building2, MailCheck } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d)/, "($1) $2-$3")
  }
  return digits.replace(/^(\d{2})(\d{5})(\d)/, "($1) $2-$3")
}

interface Tenant {
  id: string
  name: string
  slug: string
}

export function RegisterResidentPage() {
  const { slug } = useParams<{ slug: string }>()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loadingTenant, setLoadingTenant] = useState(true)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    phone: "",
    aptNumber: "",
    aptBlock: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  useEffect(() => {
    async function fetchTenant() {
      const { data } = await supabase.rpc("get_tenant_by_slug", { p_slug: slug })
      if (!data) {
        setNotFound(true)
      } else {
        setTenant(data as Tenant)
      }
      setLoadingTenant(false)
    }
    if (slug) fetchTenant()
  }, [slug])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "cpf" ? formatCpf(value)
        : name === "phone" ? formatPhone(value)
        : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const cpfDigits = form.cpf.replace(/\D/g, "")
    if (cpfDigits.length !== 11) {
      setError("CPF inválido. Digite os 11 dígitos.")
      return
    }
    if (form.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.")
      return
    }
    if (!form.aptNumber.trim()) {
      setError("Informe o número do apartamento.")
      return
    }

    setLoading(true)

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError || !authData.user) {
      setError(signUpError?.message ?? "Erro ao criar conta.")
      setLoading(false)
      return
    }

    const { error: rpcError } = await supabase.rpc("register_resident", {
      p_auth_id: authData.user.id,
      p_name: form.name,
      p_email: form.email,
      p_cpf: cpfDigits,
      p_phone: form.phone.replace(/\D/g, ""),
      p_apt_number: form.aptNumber,
      p_apt_block: form.aptBlock,
      p_slug: slug,
    })

    if (rpcError) {
      setError("Este e-mail já possui uma conta ou ocorreu um erro. Tente novamente.")
      setLoading(false)
      return
    }

    setRegisteredEmail(form.email)
    setShowConfirmModal(true)
    setLoading(false)
  }

  const leftPanel = (
    <div className="hidden w-[420px] shrink-0 flex-col justify-between bg-sidebar p-10 text-sidebar-foreground md:flex">
      <div className="flex items-center gap-2">
        <Building2 className="size-6" />
        <span className="text-lg font-semibold">Gellu Condo</span>
      </div>

      <div className="space-y-3">
        {tenant ? (
          <>
            <p className="text-2xl font-semibold leading-snug">
              Bem-vindo, morador do{" "}
              <span className="text-sidebar-foreground/80">{tenant.name}</span>
            </p>
            <p className="text-sm text-sidebar-foreground/70">
              Preencha seus dados para se cadastrar como morador e ter acesso ao sistema do condomínio.
            </p>
          </>
        ) : (
          <p className="text-2xl font-semibold leading-snug">
            Cadastro de Morador
          </p>
        )}
      </div>

      <p className="text-xs text-sidebar-foreground/40">
        © {new Date().getFullYear()} Gellu Condo
      </p>
    </div>
  )

  if (loadingTenant) {
    return (
      <div className="flex h-screen">
        {leftPanel}
        <div className="flex flex-1 items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex h-screen">
        {leftPanel}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-background p-8 text-center">
          <Building2 className="size-12 text-muted-foreground/40" />
          <h1 className="text-xl font-semibold">Condomínio não encontrado</h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            O link que você acessou não corresponde a nenhum condomínio cadastrado. Verifique o link com o síndico.
          </p>
        </div>
      </div>
    )
  }

  if (showConfirmModal) {
    return (
      <div className="flex h-screen">
        {leftPanel}
        <div className="flex flex-1 items-center justify-center bg-background p-8">
          <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Confirme seu e-mail</h1>
              <p className="text-sm text-muted-foreground">
                Enviamos um link de confirmação para
              </p>
              <p className="font-medium">{registeredEmail}</p>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              Após confirmar, seu cadastro ficará pendente de aprovação pelo síndico do condomínio.
            </p>
            <p className="text-xs text-muted-foreground">
              Não recebeu?{" "}
              <button
                type="button"
                className="font-medium text-foreground hover:underline"
                onClick={() => setShowConfirmModal(false)}
              >
                Tentar novamente
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {leftPanel}

      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-background p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <Building2 className="size-5 text-primary" />
            <span className="font-semibold">Gellu Condo</span>
          </div>

          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Cadastro de morador</h1>
            <p className="text-sm text-muted-foreground">
              {tenant?.name ?? "Preencha seus dados para se cadastrar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="João da Silva"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="voce@exemplo.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={handleChange}
                required
                inputMode="numeric"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={handleChange}
                inputMode="numeric"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="aptNumber">Apartamento</Label>
                <Input
                  id="aptNumber"
                  name="aptNumber"
                  placeholder="101"
                  value={form.aptNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-28 space-y-1.5">
                <Label htmlFor="aptBlock">Bloco</Label>
                <Input
                  id="aptBlock"
                  name="aptBlock"
                  placeholder="A"
                  value={form.aptBlock}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
