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

  // 1. Fetch all results from valid events join with players and events
  const { data, error } = await supabase
    .from('results')
    .select(`
      points,
      category,
      player:players!inner (id, name, gender, club, birth_date),
      event:events!inner (id, type, date, validity_date, age_category)
    `)
    .gte('event.validity_date', today)
  
  if (error) {
    console.error('Error fetching rankings:', error)
    return []
  }

  // 2. Group by player
  const playerGroups = new Map<string, any[]>()
  data.forEach((r: any) => {
    // Filter by gender if provided
    if (gender && r.player.gender !== gender) return
    // Filter by age category if provided
    if (ageCategory && r.event.age_category !== ageCategory) return

    if (!playerGroups.has(r.player.id)) {
      playerGroups.set(r.player.id, [])
    }
    playerGroups.get(r.player.id)?.push(r)
  })

  // 3. Process each player's results
  const rankingEntries: RankingEntry[] = []

  playerGroups.forEach((results, playerId) => {
    const player = results[0].player

    // Step A: Group by event to sum points across categories (Egyes + Páros + Vegyes)
    const eventGroups = new Map<string, { totalPoints: number, type: string, date: string }>()
    
    results.forEach(r => {
      const existing = eventGroups.get(r.event.id) || { totalPoints: 0, type: r.event.type, date: r.event.date }
      existing.totalPoints += r.points
      eventGroups.set(r.event.id, existing)
    })

    // Step B: Sort events by total points descending
    const sortedEvents = Array.from(eventGroups.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)

    // Step C: Apply ranking selection rules:
    // - Top 6 events count total
    // - Maximum 2 from "II. osztály" count
    let totalPoints = 0
    let eventsCount = 0
    let iiOsztalyCount = 0

    for (const event of sortedEvents) {
      if (eventsCount >= 6) break

      if (event.type === 'II. osztály') {
        if (iiOsztalyCount < 2) {
          totalPoints += event.totalPoints
          eventsCount++
          iiOsztalyCount++
        }
      } else {
        totalPoints += event.totalPoints
        eventsCount++
      }
    }

    rankingEntries.push({
      playerId: player.id,
      name: player.name,
      gender: player.gender,
      club: player.club,
      totalPoints,
      eventsCount
    })
  })

  // 4. Sort ranking by total points
  return rankingEntries.sort((a, b) => b.totalPoints - a.totalPoints)
}
