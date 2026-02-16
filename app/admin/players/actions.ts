'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRole } from '@/utils/supabase/roles'

const PlayerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.enum(["Male", "Female"]),
  club: z.string().optional(),
  birth_date: z.string().optional().or(z.literal('')),
})

export async function createPlayer(prevState: any, formData: FormData) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()
  
  const rawData = {
    name: formData.get('name'),
    gender: formData.get('gender'),
    club: formData.get('club'),
    birth_date: formData.get('birth_date'),
  }

  const validatedFields = PlayerSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Player.',
    }
  }

  const { name, gender, club, birth_date } = validatedFields.data

  const { error } = await supabase.from('players').insert({
    name,
    gender,
    club: club || null,
    birth_date: birth_date || null,
  })

  if (error) {
    return {
      message: 'Database Error: Failed to Create Player.',
    }
  }

  revalidatePath('/admin/players')
  redirect('/admin/players')
}

export async function updatePlayer(id: string, prevState: any, formData: FormData) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()
  
  const rawData = {
    name: formData.get('name'),
    gender: formData.get('gender'),
    club: formData.get('club'),
    birth_date: formData.get('birth_date'),
  }

  const validatedFields = PlayerSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Player.',
    }
  }

  const { name, gender, club, birth_date } = validatedFields.data

  const { error } = await supabase.from('players').update({
    name,
    gender,
    club: club || null,
    birth_date: birth_date || null,
  }).eq('id', id)

  if (error) {
    return {
      message: 'Database Error: Failed to Update Player.',
    }
  }

  revalidatePath('/admin/players')
  redirect('/admin/players')
}

export async function deletePlayer(id: string) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()
  
  const { error } = await supabase.from('players').delete().eq('id', id)

  if (error) {
    throw new Error('Failed to delete player')
  }

  revalidatePath('/admin/players')
}
