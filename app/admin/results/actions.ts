'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '@/utils/supabase/roles'

const ResultSchema = z.object({
  player_id: z.string().uuid("Invalid Player ID"),
  position: z.number().min(1, "Position must be at least 1"),
  points: z.number().min(0, "Points must be positive").optional(), // Optional because it can be calculated
})

export async function addResult(eventId: string, prevState: any, formData: FormData) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()
  
  const playerId = formData.get('player_id') as string
  const position = parseInt(formData.get('position') as string)
  const manualPoints = formData.get('points') ? parseInt(formData.get('points') as string) : undefined

  // 1. Validate Input
  const validatedFields = ResultSchema.safeParse({
    player_id: playerId,
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
  // We need event type and category
  let initialPoints = manualPoints ?? 0;

  if (manualPoints === undefined) {
      const { data: event } = await supabase.from('events').select('type, category').eq('id', eventId).single();
      
      if (event) {
          // 3. Lookup points from PointTable
          const { data: pointRule } = await supabase
            .from('point_table')
            .select('points')
            .eq('event_type', event.type)
            // .eq('category', event.category) // Assuming point table category matches event category? Or is it age category?
            // User request: "A point table for the event categories." 
            // In schema: point_table has (event_type, category, position). 
            // Event has (age_category, category). 
            // Usually point tables are like "Grand Slam - Winner = 2000", which implies Event Type + Position. 
            // But user might have "Senior" vs "U19" points. 
            // Let's assume for now we use 'age_category' from event for point_table 'category'?? 
            // Or 'Senior' as a default?
            // Re-reading user request: "A point table for the event categories." 
            // Let's assume we match Event.age_category to PointTable.category.
             .eq('category', 'Senior') // FIXME: Dynamic category lookup based on event.age_category or similar. 
             // For now, let's try to find a match on 'Senior' as seeded, or we need to pass event.age_category.
             // Let's actually fetch the event including age_category.
            .eq('position', position)
            .maybeSingle(); // Use maybeSingle to avoid error if no rule found
          
          // Re-fetch properly
           const { data: eventFull } = await supabase.from('events').select('*').eq('id', eventId).single();
           if(eventFull) {
                const { data: rule } = await supabase
                .from('point_table')
                .select('points')
                .eq('event_type', eventFull.type)
                .eq('category', eventFull.age_category) 
                .eq('position', position)
                .maybeSingle();
                
                if (rule) {
                    initialPoints = rule.points;
                }
           }
      }
  }

  // 4. Insert Result
  const { error } = await supabase.from('results').insert({
    event_id: eventId,
    player_id: playerId,
    position: position,
    points: initialPoints,
  })

  if (error) {
    console.error(error)
    return {
      message: 'Database Error: Failed to Add Result (Player might already be added).',
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
    const { data: rule } = await supabase
      .from('point_table')
      .select('points')
      .eq('event_type', event.type)
      .eq('category', event.age_category)
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
