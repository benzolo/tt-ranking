import { createClient } from './supabase/server'

export interface RankingEntry {
  playerId: string
  playerName: string
  club: string | null
  gender: string
  totalPoints: number
  eventsCount: number
  rankPosition?: number
  previousRank?: number
  rankChange?: 'up' | 'down' | 'same' | 'new'
  rankDifference?: number
}

export interface RankingSnapshot {
  id: string
  player_id: string
  rank_position: number
  total_points: number
  events_count: number
  snapshot_date: string
  created_at: string
}

/**
 * Generate a new ranking snapshot
 * This captures the current state of rankings and stores them for historical comparison
 */
export async function generateRankingSnapshot(): Promise<{ success: boolean; message: string; count?: number }> {
  const supabase = await createClient()
  const snapshotDate = new Date().toISOString()

  // Get current rankings
  const rankings = await getRankingsForSnapshot()

  if (rankings.length === 0) {
    return { success: false, message: 'No rankings to snapshot' }
  }

  // Prepare snapshot data
  const snapshotData = rankings.map((ranking, index) => ({
    player_id: ranking.playerId,
    rank_position: index + 1,
    total_points: ranking.totalPoints,
    events_count: ranking.eventsCount,
    snapshot_date: snapshotDate,
  }))

  // Insert snapshots
  const { error } = await supabase.from('ranking_snapshots').insert(snapshotData)

  if (error) {
    console.error('Error creating snapshot:', error)
    return { success: false, message: 'Failed to create snapshot' }
  }

  return { 
    success: true, 
    message: `Snapshot created successfully with ${rankings.length} players`,
    count: rankings.length 
  }
}

/**
 * Get the latest ranking snapshot date
 */
export async function getLatestSnapshotDate(): Promise<string | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('ranking_snapshots')
    .select('snapshot_date')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()

  return data?.snapshot_date || null
}

/**
 * Get rankings with comparison to previous snapshot
 */
export async function getRankingsWithHistory(gender?: string, ageCategory?: string): Promise<RankingEntry[]> {
  const currentRankings = await getRankingsForSnapshot(gender, ageCategory)
  const latestSnapshotDate = await getLatestSnapshotDate()

  if (!latestSnapshotDate) {
    // No previous snapshot, mark all as new
    return currentRankings.map((r, index) => ({
      ...r,
      rankPosition: index + 1,
      rankChange: 'new' as const,
    }))
  }

  // Get previous snapshot
  const supabase = await createClient()
  const { data: previousSnapshots } = await supabase
    .from('ranking_snapshots')
    .select('*')
    .eq('snapshot_date', latestSnapshotDate)

  const previousRankMap = new Map(
    previousSnapshots?.map(s => [s.player_id, s.rank_position]) || []
  )

  // Compare and calculate changes
  return currentRankings.map((ranking, index) => {
    const currentRank = index + 1
    const previousRank = previousRankMap.get(ranking.playerId)

    let rankChange: 'up' | 'down' | 'same' | 'new' = 'new'
    let rankDifference = 0

    if (previousRank !== undefined) {
      if (currentRank < previousRank) {
        rankChange = 'up'
        rankDifference = previousRank - currentRank
      } else if (currentRank > previousRank) {
        rankChange = 'down'
        rankDifference = currentRank - previousRank
      } else {
        rankChange = 'same'
      }
    }

    return {
      ...ranking,
      rankPosition: currentRank,
      previousRank,
      rankChange,
      rankDifference,
    }
  })
}

/**
 * Get player ranking history for charts
 */
export async function getPlayerRankingHistory(playerId: string): Promise<RankingSnapshot[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('ranking_snapshots')
    .select('*')
    .eq('player_id', playerId)
    .order('snapshot_date', { ascending: true })

  return data || []
}

/**
 * Internal function to get current rankings (without history)
 */
async function getRankingsForSnapshot(gender?: string, ageCategory?: string): Promise<RankingEntry[]> {
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
  
  if (error || !data) {
    console.error('Error fetching rankings for snapshot:', error)
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

    // A. Group by event to sum points across categories
    const eventGroups = new Map<string, { totalPoints: number, type: string, date: string }>()
    
    results.forEach(r => {
      const existing = eventGroups.get(r.event.id) || { totalPoints: 0, type: r.event.type, date: r.event.date }
      existing.totalPoints += r.points
      eventGroups.set(r.event.id, existing)
    })

    // B. Sort events by points descending
    const sortedEvents = Array.from(eventGroups.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)

    // C. Apply Top 6 / II. osztály rules
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
      playerName: player.name,
      gender: player.gender,
      club: player.club,
      totalPoints,
      eventsCount
    })
  })

  return rankingEntries.sort((a, b) => b.totalPoints - a.totalPoints)
}
