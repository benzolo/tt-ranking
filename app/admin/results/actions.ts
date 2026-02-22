'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/utils/supabase/roles'

import { ALLOWED_POSITIONS } from '@/utils/constants'

const ResultSchema = z.object({
  player_id: z.string().uuid("Invalid Player ID"),
  category: z.enum(["Egyes", "Páros", "Vegyes", "Csapat"]),
  position: z.enum(ALLOWED_POSITIONS),
  points: z.number().min(0, "Points must be positive").optional(),
})

export async function addResult(eventId: string, prevState: any, formData: FormData) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()
  
  const playerId = formData.get('player_id') as string
  const category = formData.get('category') as "Egyes" | "Páros" | "Vegyes" | "Csapat"
  const position = formData.get('position') as string
  const manualPoints = formData.get('points') ? parseInt(formData.get('points') as string) : undefined

  // 1. Validate Input
  const validatedFields = ResultSchema.safeParse({
    player_id: playerId,
    category: category,
    position: position,
    points: manualPoints,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid Data. Failed to Add Result.',
    }
  }

  // 2. Fetch Event details to determine points if not manual
  let initialPoints = manualPoints ?? 0;

  if (manualPoints === undefined && category !== 'Csapat') {
      const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single();
      
      if (event) {
          // 3. Lookup points from PointTable
          // User request: "In the point table also fix the eventy type to OB, I. osztály, II. oyztály, TOP and Megye and the category to Egyes and Páros."
          // For Vegyes, we'll try to use Páros points if Vegyes points aren't defined.
          const lookupCategory = category === 'Vegyes' ? 'Páros' : category;

          const { data: rule } = await supabase
            .from('point_table')
            .select('points')
            .eq('event_type', event.type)
            .eq('category', lookupCategory)
            .eq('position', position)
            .maybeSingle();
          
          if (rule) {
              initialPoints = rule.points;
          }
      }
  }

  // 4. Insert Result
  const { error } = await supabase.from('results').insert({
    event_id: eventId,
    player_id: playerId,
    category: category,
    position: position,
    points: initialPoints,
  })

  if (error) {
    console.error(error)
    return {
      message: 'Database Error: Failed to Add Result (Player might already be added for this category).',
    }
  }

  revalidatePath(`/admin/results/${eventId}`)
  return { message: 'Result added successfully' }
}

export async function deleteResult(eventId: string, resultId: string) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()
  await supabase.from('results').delete().eq('id', resultId)
  revalidatePath(`/admin/results/${eventId}`)
}

export async function recalculateEventPoints(eventId: string) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  // 1. Fetch event details
  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
  if (!event) return { message: 'Event not found' }

  // 2. Fetch all results for this event
  const { data: results } = await supabase.from('results').select('*').eq('event_id', eventId)
  if (!results || results.length === 0) {
    return { message: 'No results to recalculate' }
  }

  // 3. For each result, lookup points from point table
  for (const result of results) {
    if (result.category === 'Csapat') {
        continue; // Skip manual points results
    }

    // For Vegyes, we'll try to use Páros points if Vegyes points aren't defined.
    const lookupCategory = result.category === 'Vegyes' ? 'Páros' : result.category;

    const { data: rule } = await supabase
      .from('point_table')
      .select('points')
      .eq('event_type', event.type)
      .eq('category', lookupCategory)
      .eq('position', result.position)
      .maybeSingle()

    const newPoints = rule?.points ?? 0

    // 4. Update the result with new points
    await supabase
      .from('results')
      .update({ points: newPoints })
      .eq('id', result.id)
  }

  revalidatePath(`/admin/results/${eventId}`)
  return { message: 'Points recalculated successfully' }
}

export async function addQuickPlayer(formData: FormData) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  const name = formData.get('name') as string
  const license_id = formData.get('license_id') as string | null
  const gender = formData.get('gender') as 'Male' | 'Female'
  const club = formData.get('club') as string | null
  const birth_dateParam = formData.get('birth_date') as string | null

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { error: 'A Név megadása kötelező.' }
  }

  if (!license_id || typeof license_id !== 'string' || license_id.trim() === '') {
    return { error: 'A Licensz ID megadása kötelező.' }
  }

  if (!gender || (gender !== 'Male' && gender !== 'Female')) {
    return { error: 'Érvénytelen nem.' }
  }
  
  const birth_date = birth_dateParam ? new Date(birth_dateParam).toISOString() : null

  const { error } = await supabase.from('players').insert({
    name: name.trim(),
    license_id: license_id ? license_id.trim() : null,
    gender,
    club: club ? club.trim() : null,
    birth_date
  })

  if (error) {
    console.error('Error inserting quick player:', error)
    if (error.code === '23505' && error.message.includes('license_id')) {
       return { error: 'Ez a Licensz ID már regisztrálva van.' }
    }
    return { error: 'Hiba történt az adatbázisba mentés során.' }
  }

  return { message: 'Játékos sikeresen hozzáadva!' }
}
