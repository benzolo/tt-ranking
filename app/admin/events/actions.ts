'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { requireRole } from '@/utils/supabase/roles'

const EventSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.string().min(1, "Type is required"),
  date: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Invalid Date" }),
  validity_date: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', { message: "Invalid Date" }),
  age_category: z.string().min(1, "Age Category is required"),
  has_egyes: z.boolean().default(false),
  has_paros: z.boolean().default(false),
  has_vegyes: z.boolean().default(false),
  has_csapat: z.boolean().default(false),
}).refine(data => data.has_egyes || data.has_paros || data.has_vegyes || data.has_csapat, {
  message: "At least one category must be selected",
  path: ["has_egyes"] // Hooking it to one of them for error display
})

export async function createEvent(prevState: any, formData: FormData) {
  await requireRole(['superadmin'])
  const supabase = await createClient()
  
  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    date: formData.get('date'),
    validity_date: formData.get('validity_date'),
    age_category: formData.get('age_category'),
    has_egyes: formData.get('has_egyes') === 'true',
    has_paros: formData.get('has_paros') === 'true',
    has_vegyes: formData.get('has_vegyes') === 'true',
    has_csapat: formData.get('has_csapat') === 'true',
  }

  const validatedFields = EventSchema.safeParse(rawData)

  if (!validatedFields.success) {
      console.error(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Event.',
    }
  }

  const { name, type, date, validity_date, age_category, has_egyes, has_paros, has_vegyes } = validatedFields.data

  const { error } = await supabase.from('events').insert({
    name,
    type,
    date,
    validity_date,
    age_category,
    has_egyes,
    has_paros,
    has_vegyes,
    has_csapat: validatedFields.data.has_csapat,
  })

  if (error) {
    console.error(error);
    return {
      message: 'Database Error: Failed to Create Event.',
    }
  }

  revalidatePath('/admin/events')
  redirect('/admin/events')
}

export async function updateEvent(id: string, prevState: any, formData: FormData) {
  await requireRole(['superadmin'])
  const supabase = await createClient()
  
  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    date: formData.get('date'),
    validity_date: formData.get('validity_date'),
    age_category: formData.get('age_category'),
    has_egyes: formData.get('has_egyes') === 'true',
    has_paros: formData.get('has_paros') === 'true',
    has_vegyes: formData.get('has_vegyes') === 'true',
    has_csapat: formData.get('has_csapat') === 'true',
  }

  const validatedFields = EventSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Event.',
    }
  }

  const { name, type, date, validity_date, age_category, has_egyes, has_paros, has_vegyes } = validatedFields.data

  const { error } = await supabase.from('events').update({
    name,
    type,
    date,
    validity_date,
    age_category,
    has_egyes,
    has_paros,
    has_vegyes,
    has_csapat: validatedFields.data.has_csapat,
  }).eq('id', id)

  if (error) {
    return {
      message: 'Database Error: Failed to Update Event.',
    }
  }

  revalidatePath('/admin/events')
  redirect('/admin/events')
}

export async function deleteEvent(id: string) {
  await requireRole(['superadmin'])
  const supabase = await createClient()
  
  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) {
    throw new Error('Failed to delete event')
  }

  revalidatePath('/admin/events')
}

export async function checkEventResults(id: string) {
  await requireRole(['superadmin'])
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from('results')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)

  if (error) {
    console.error('Error checking event results:', error)
    return { count: 0 }
  }

  return { count: count || 0 }
}
