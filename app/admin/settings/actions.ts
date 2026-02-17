'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/utils/supabase/roles'

import { ALLOWED_POSITIONS } from '@/utils/constants'

const PointRuleSchema = z.object({
  event_type: z.string().min(1, "Event Type is required"),
  category: z.string().min(1, "Category is required"),
  position: z.enum(ALLOWED_POSITIONS),
  points: z.number().min(0, "Points must be positive"),
})

export async function createPointRule(prevState: any, formData: FormData) {
  await requireRole(['superadmin'])
  const supabase = await createClient()
  
  const rawData = {
    event_type: formData.get('event_type'),
    category: formData.get('category'),
    position: formData.get('position'),
    points: parseInt(formData.get('points') as string),
  }

  const validatedFields = PointRuleSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Rule.',
    }
  }

  const { event_type, category, position, points } = validatedFields.data

  const { error } = await supabase.from('point_table').insert({
    event_type,
    category,
    position,
    points,
  })

  if (error) {
     if (error.code === '23505') { // Unique violation
        return { message: 'A rule for this Type, Category and Position already exists.' }
     }
    return {
      message: 'Database Error: Failed to Create Rule.',
    }
  }

  revalidatePath('/admin/settings')
}

export async function deletePointRule(id: string) {
  await requireRole(['superadmin'])
  const supabase = await createClient()
  await supabase.from('point_table').delete().eq('id', id)
  revalidatePath('/admin/settings')
}
