import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { MailCheck } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function toSlug(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: "",
    email: "",
    condoName: "",
    cnpj: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === "cnpj" ? formatCnpj(value) : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const cnpjDigits = form.cnpj.replace(/\D/g, "")
    if (cnpjDigits.length !== 14) {
      setError("CNPJ inválido. Digite os 14 dígitos.")
      return
    }
    if (form.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.")
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

    const { error: rpcError } = await supabase.rpc("register_tenant", {
      p_auth_id: authData.user.id,
      p_name: form.name,
      p_email: form.email,
      p_condo_name: form.condoName,
      p_cnpj: cnpjDigits,
      p_slug: toSlug(form.condoName),
    })

    if (rpcError) {
      setError("Este e-mail já possui uma conta ou ocorreu um erro. Tente novamente.")
      setLoading(false)
      return
    }

    if (authData.session) {
      navigate("/")
    } else {
      setRegisteredEmail(form.email)
      setShowConfirmModal(true)
      setLoading(false)
    }
  }

  if (showConfirmModal) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-8 w-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Confirme seu e-mail
          </h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de confirmação para
          </p>
          <p className="font-medium">{registeredEmail}</p>
        </div>

        <p className="text-sm text-muted-foreground max-w-xs">
          Acesse sua caixa de entrada e clique no link para ativar sua conta e acessar o sistema.
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
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Cadastrar condomínio
        </h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para criar sua conta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Seu nome</Label>
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
          <Label htmlFor="condoName">Nome do condomínio</Label>
          <Input
            id="condoName"
            name="condoName"
            placeholder="Residencial das Flores"
            value={form.condoName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cnpj">CNPJ do condomínio</Label>
          <Input
            id="cnpj"
            name="cnpj"
            placeholder="00.000.000/0001-00"
            value={form.cnpj}
            onChange={handleChange}
            required
            inputMode="numeric"
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/login" className="font-medium text-foreground hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
