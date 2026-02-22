'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRole } from '@/utils/supabase/roles'

const ClubSchema = z.object({
  name: z.string().min(2, "Az egyesület neve minimum 2 karakter hosszú legyen"),
})

export async function createClub(prevState: any, formData: FormData) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()
  
  const rawData = {
    name: formData.get('name') as string,
  }

  const validatedFields = ClubSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Hibás adatok.',
    }
  }

  const { name } = validatedFields.data

  const { error } = await supabase.from('clubs').insert({
    name: name.trim()
  })

  if (error) {
    if (error.code === '23505') {
      return {
        message: 'Ez az egyesület már létezik.',
        errors: { name: ['Már létező egyesület'] }
      }
    }
    return { message: 'Adatbázis hiba.' }
  }

  revalidatePath('/admin/clubs')
  redirect('/admin/clubs')
}

export async function updateClub(id: string, prevState: any, formData: FormData) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()
  
  const rawData = {
    name: formData.get('name') as string,
  }

  const validatedFields = ClubSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Hibás adatok.',
    }
  }

  const { name } = validatedFields.data

  const { error } = await supabase.from('clubs').update({
    name: name.trim()
  }).eq('id', id)

  if (error) {
     if (error.code === '23505') {
      return {
        message: 'Ez az egyesület név már foglalt.',
        errors: { name: ['Már létező egyesület'] }
      }
    }
    return { message: 'Adatbázis hiba.' }
  }

  revalidatePath('/admin/clubs')
  redirect('/admin/clubs')
}

export async function deleteClub(id: string) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()
  
  const { error } = await supabase.from('clubs').delete().eq('id', id)

  if (error) {
    // Foreign key constraint likely violated if players are assigned
    if (error.code === '23503') {
        throw new Error('Nem törölhető, mert játékosok vannak hozzárendelve.');
    }
    throw new Error('Hiba a törlés során.')
  }

  revalidatePath('/admin/clubs')
}

export async function checkClubPlayers(id: string) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', id)

  if (error) {
    console.error('Error checking club players:', error)
    return { count: 0 }
  }

  return { count: count || 0 }
}
