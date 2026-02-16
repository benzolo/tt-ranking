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

  let query = supabase
    .from('results')
    .select(`
      points,
      player:players!inner (id, name, gender, club, birth_date),
      event:events!inner (id, validity_date, age_category)
    `)
    .gte('event.validity_date', today)

  if (gender) {
    query = query.eq('player.gender', gender)
  }

  if (ageCategory) {
    query = query.eq('event.age_category', ageCategory)
  }

  const { data: results, error } = await query

  if (error || !results) {
    console.error('Error fetching results:', error)
    return []
  }

  // Aggregate points by player
  const playerStats = new Map<string, RankingEntry>()

  for (const result of results) {
    const player = result.player as any
    const playerId = player.id

    if (!playerStats.has(playerId)) {
      playerStats.set(playerId, {
        playerId,
        playerName: player.name,
        club: player.club,
        gender: player.gender,
        totalPoints: 0,
        eventsCount: 0,
      })
    }

    const stats = playerStats.get(playerId)!
    stats.totalPoints += result.points || 0
    stats.eventsCount += 1
  }

  return Array.from(playerStats.values()).sort((a, b) => b.totalPoints - a.totalPoints)
}
