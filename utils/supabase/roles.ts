import { createClient } from './server'
import { redirect } from 'next/navigation'

export type UserRole = 'superadmin' | 'admin' | 'user'

export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return (profile?.role as UserRole) || 'user'
}

export async function requireRole(allowedRoles: UserRole[]) {
  const role = await getUserRole()
  
  if (!role || !allowedRoles.includes(role)) {
    redirect('/unauthorized')
  }
  
  return role
}
