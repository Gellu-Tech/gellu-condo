export type Role = 'admin' | 'sindico' | 'administradora' | 'porteiro' | 'morador'

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  sindico: 'Síndico',
  administradora: 'Administradora',
  porteiro: 'Porteiro',
  morador: 'Morador',
}
