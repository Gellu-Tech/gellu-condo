# CLAUDE.md — gellu-condo

SaaS de gestão de condomínios (visão da portaria). Este arquivo define as regras que Claude deve seguir em todas as sessões.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 7 |
| Estilo | Tailwind CSS v4 + shadcn/ui (tema radix-luma, cores OKLCH) |
| Roteamento | React Router DOM v7 (`createBrowserRouter`) |
| Backend/Auth | Supabase (PostgreSQL + Auth email/password) |
| Ícones | lucide-react |
| Utilitários CSS | clsx + tailwind-merge via `cn()` · class-variance-authority (`cva`) |
| Fonte | Inter Variable (`@fontsource-variable/inter`) |
| Linting/Format | ESLint + Prettier (com `prettier-plugin-tailwindcss`) |

---

## Estrutura de Pastas

```
src/
  assets/
  components/
    ui/              ← componentes shadcn/ui
    PageHeader.tsx
    theme-provider.tsx
  contexts/
    auth.tsx         ← AuthContext + AuthProvider + useAuth
  layouts/
    AppLayout.tsx    ← layout com sidebar (rotas protegidas)
    AuthLayout.tsx   ← layout split-screen (login/register)
  lib/
    supabase.ts      ← cliente Supabase
    utils.ts         ← cn() helper
  pages/
    auth/
      login.tsx
      register.tsx
    dashboard/
      index.tsx
    settings/
      index.tsx
  router/
    index.tsx        ← createBrowserRouter
    routes.tsx       ← RouteConfig[] com seções main/footer
    ProtectedRoute.tsx
  types/
    roles.ts         ← Role union type + ROLE_LABELS
  main.tsx
  index.css
```

---

## Convenções de Código

### Nomenclatura
- **Arquivos**: `kebab-case` — `app-layout.tsx`, `register.tsx`, `auth.tsx`
- **Componentes React**: `PascalCase` — `export function AppLayout()`
- **Funções/variáveis**: `camelCase`
- **Tipos/Interfaces**: `PascalCase`
- **Idioma**: código em inglês; textos exibidos na UI em português

### Formatação (Prettier)
- 2 espaços de indentação
- Sem ponto-e-vírgula (`semi: false`)
- Aspas duplas
- Trailing comma onde aplicável
- Tailwind classes ordenadas automaticamente pelo plugin

### Imports
- Aliases via `@/` (mapeado para `src/`)
- Ordem: libs externas → `@/lib` → `@/components` → `@/contexts` → `@/types` → relativos

### Componentes
- Novos componentes de UI: usar **`npx shadcn@latest add <component>`** sempre que disponível no catálogo shadcn
- Se não existir no catálogo, criar manualmente em `src/components/ui/` seguindo o padrão de `button.tsx` (export nomeado, `cva` para variantes, `cn()` para classnames)
- Sem comentários descritivos no código — nomes de identificadores devem ser auto-explicativos
- Comentários apenas para invariantes não óbvias

### Utilitário `cn()`
```ts
import { cn } from "@/lib/utils"
// Usar sempre que combinar classes Tailwind condicionalmente
```

---

## Roteamento

```
Router
├── AuthLayout  (/login, /register)   ← sem sidebar, split-screen
└── ProtectedRoute
    └── AppLayout (/, /settings, ...)  ← com sidebar
```

- Novas rotas são adicionadas no array `routes` em `src/router/routes.tsx` como `RouteConfig`
- `ProtectedRoute` verifica sessão via `useAuth()`; sem sessão redireciona para `/login`
- Seções da sidebar: `section: "main"` (menu principal) e `section: "footer"` (rodapé da sidebar)

---

## Autenticação

- Supabase Auth com email/password + confirmação de email obrigatória
- `AuthProvider` em `src/contexts/auth.tsx` expõe: `session`, `user`, `profile`, `loading`, `signOut`
- `profile` carregado da tabela `public.users` via `auth_id = auth.uid()`
- Registro: `signUp()` → `register_tenant()` RPC → se `!session`, exibe tela de confirmação de email

---

## Banco de Dados (Supabase)

### Tabelas principais
| Tabela | Descrição |
|---|---|
| `tenants` | Condomínios (id, name, document, slug, created_at) |
| `users` | Usuários do sistema (id, auth_id, tenant_id, name, email, role, created_at) |
| `apartments` | Unidades do condomínio |
| `residents` | Moradores |
| `vehicles` | Veículos |
| `packages` | Encomendas |

### Roles válidos (`users.role`)
```
admin · sindico · administradora · porteiro · morador
```
Definidos em `src/types/roles.ts` como union type `Role` e exibidos via `ROLE_LABELS`.

### Regras de DB
- **RLS habilitado** em todas as tabelas
- Inserções multi-step que precisam bypassar RLS usam funções **`SECURITY DEFINER`**
- Todas as colunas `NOT NULL` sem valor default devem ter `DEFAULT now()` (datas) ou default explícito
- **Migrations** aplicadas via MCP `mcp__supabase__apply_migration` — nunca alterar schema diretamente pelo dashboard em produção
- Nomes de migration em `snake_case` descritivo (ex: `add_auth_id_to_users`, `add_role_constraint`)

### Padrão de função SECURITY DEFINER
```sql
create or replace function public.<nome>(...)
returns json language plpgsql
security definer set search_path = public
as $$
begin
  -- operações que precisam bypassar RLS
end; $$;
```

---

## CI/CD

| Branch | Finalidade |
|---|---|
| `stage` | Desenvolvimento ativo |
| `main` | Dispara o workflow de build |
| `build` | Recebe o `dist/` gerado (deploy target) |

### Workflow (`.github/workflows/build.yml`)
- Trigger: push em `main`
- Node 20, `npm ci`, `npm run build` (`tsc -b && vite build`)
- Faz push force do `dist/` para a branch `build` via `GITHUB_TOKEN`

### Comandos úteis
```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção (tsc + vite)
npm run typecheck  # verificação de tipos sem emitir arquivos
npm run lint       # ESLint
npm run format     # Prettier em todos os .ts/.tsx
```

---

## Variáveis de Ambiente

```env
# .env.local (nunca commitar)
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<jwt-anon-key>   # formato eyJ... (legacy JWT, não sb_publishable_)
```
