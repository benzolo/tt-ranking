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
  category: z.enum(["Singles", "Doubles", "Mixed"]),
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
    category: formData.get('category'),
  }

  const validatedFields = EventSchema.safeParse(rawData)

  if (!validatedFields.success) {
      console.error(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Event.',
    }
  }

  const { name, type, date, validity_date, age_category, category } = validatedFields.data

  const { error } = await supabase.from('events').insert({
    name,
    type,
    date,
    validity_date,
    age_category,
    category,
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
    category: formData.get('category'),
  }

  const validatedFields = EventSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Event.',
    }
  }

  const { name, type, date, validity_date, age_category, category } = validatedFields.data

  const { error } = await supabase.from('events').update({
    name,
    type,
    date,
    validity_date,
    age_category,
    category,
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
