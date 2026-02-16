import { createClient } from './supabase/server'

export type RankingEntry = {
  playerId: string
  name: string
  gender: string
  club: string | null
  totalPoints: number
  eventsCount: number
}

export async function getRankings(gender?: string, ageCategory?: string): Promise<RankingEntry[]> {
  const supabase = await createClient()
  const today = new Date().toISOString()

  // Start building the query
  // We need players and their sum of points from valid events
  // This is complex in pure Supabase JS client without a view, but let's try.
  // Strategy: Fetch all valid results, then aggregate in JS. 
  // For scalability, a Database View or Function is better, but for now JS aggregation is fine for < 1000 players.

  let query = supabase
    .from('results')
    .select(`
      points,
      player:players (id, name, gender, club, birth_date),
      event:events (id, validity_date, age_category)
    `)
    .gte('event.validity_date', today) // Validity check
  
  // Note: Filtering on joined tables in Supabase (Postgrest) requires the spread operator usually or specific syntax.
  // simpler to fetch valid events first? Or just fetch all and filter in JS.
  // Let's rely on JS filtering for flexibility and simplicity first.
  
  const { data, error } = await supabase
    .from('results')
    .select(`
      points,
      player:players!inner (id, name, gender, club, birth_date),
      event:events!inner (id, validity_date, age_category)
    `)
    .gte('event.validity_date', today)
  
  if (error) {
    console.error('Error fetching rankings:', error)
    return []
  }

  // Aggregate
  const playerStats = new Map<string, RankingEntry>()

  data.forEach((r: any) => {
    // Filter by filters if provided
    if (gender && r.player.gender !== gender) return
    if (ageCategory && r.event.age_category !== ageCategory) return 
    // Wait, age category filtering usually means "Ranking for Age Category X". 
    // Does a U19 player show up in Senior ranking? usually yes if they play senior events.
    // If the ranking is strict "U19 Ranking", it should only include points from U19 events? 
    // Or points earned by U19 players? 
    // Requirement check: "Rankings need to be updated regularly... with events having a validity period."
    // Usually: Rankings are by category. "U19 Ranking" = Points earned in U19 events? Or just eligible players?
    // Let's assume Filter = Points earned in that category's events.
    
    // Actually, usually a player has one "Total Points" or points per list.
    // Let's assume the user wants to filter the *List* of rankings.
    // If I select "U19", I want to see the U19 Ranking List.
    // Standard TT: Points earned in a category contribute to that category's ranking.
    
    // Let's stick to: Valid Results matching the criteria.

    if (ageCategory && r.event.age_category !== ageCategory) return;
    
    const current = playerStats.get(r.player.id) || {
      playerId: r.player.id,
      name: r.player.name,
      gender: r.player.gender,
      club: r.player.club,
      totalPoints: 0,
      eventsCount: 0
    }

    current.totalPoints += r.points
    current.eventsCount += 1
    playerStats.set(r.player.id, current)
  })

  return Array.from(playerStats.values()).sort((a, b) => b.totalPoints - a.totalPoints)
}
