'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/utils/supabase/roles'

const ResultSchema = z.object({
  player_id: z.string().uuid("Invalid Player ID"),
  category: z.enum(["Egyes", "Páros", "Vegyes"]),
  position: z.number().min(1, "Position must be at least 1"),
  points: z.number().min(0, "Points must be positive").optional(),
})

export async function addResult(eventId: string, prevState: any, formData: FormData) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()
  
  const playerId = formData.get('player_id') as string
  const category = formData.get('category') as "Egyes" | "Páros" | "Vegyes"
  const position = parseInt(formData.get('position') as string)
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

  if (manualPoints === undefined) {
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
