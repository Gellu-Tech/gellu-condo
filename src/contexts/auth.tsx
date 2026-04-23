import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { Role } from "@/types/roles"

export interface UserProfile {
  id: string
  name: string
  email: string
  role: Role
  tenant_id: string
}

export interface ResidentProfile {
  id: string
  name: string
  status: "pendente" | "aprovado" | "rejeitado"
  tenant_id: string
}

export interface CurrentUser {
  name: string
  role: Role
  tenant_id: string
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  residentProfile: ResidentProfile | null
  currentUser: CurrentUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [residentProfile, setResidentProfile] = useState<ResidentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else {
        setProfile(null)
        setResidentProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(authId: string) {
    const { data: userData } = await supabase
      .from("users")
      .select("id, name, email, role, tenant_id")
      .eq("auth_id", authId)
      .maybeSingle()

    if (userData) {
      setProfile(userData as UserProfile)
      setResidentProfile(null)
    } else {
      const { data: residentData } = await supabase
        .from("residents")
        .select("id, name, status, tenant_id")
        .eq("auth_id", authId)
        .maybeSingle()

      setProfile(null)
      setResidentProfile(residentData as ResidentProfile | null)
    }

    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const currentUser: CurrentUser | null = profile
    ? { name: profile.name, role: profile.role, tenant_id: profile.tenant_id }
    : residentProfile
      ? { name: residentProfile.name, role: "morador", tenant_id: residentProfile.tenant_id }
      : null

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        residentProfile,
        currentUser,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
