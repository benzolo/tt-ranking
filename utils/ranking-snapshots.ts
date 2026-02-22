import { createClient } from './supabase/server'

export interface RankingEntry {
  playerId: string
  playerName: string
  club: string | null
  clubId?: string | null
  gender: string
  totalPoints: number
  eventsCount: number
  rankPosition?: number
  previousRank?: number
  rankChange?: 'up' | 'down' | 'same' | 'new'
  rankDifference?: number
  birthDate?: string | null
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

export interface SnapshotMetadata {
  id: string
  snapshot_date: string
  gender: string
  age_category: string
  is_public: boolean
  description?: string
  player_count?: number // Computed in query
}

/**
 * Generate a new ranking snapshot
 */
export async function generateRankingSnapshot(genderRequest: string, categoryRequest: string, name?: string | null): Promise<{ success: boolean; message: string; count?: number }> {
  const supabase = await createClient()
  
  // Handle Batch Generation
  if (genderRequest === 'Both') {
    await generateRankingSnapshot('Male', categoryRequest, name)
    await generateRankingSnapshot('Female', categoryRequest, name)
    return { success: true, message: 'Snapshots generation triggered for both genders' }
  }

  if (categoryRequest === 'All') {
    const categories = ['Senior', 'U19', 'U15', 'U13', 'U11'] // TODO: Define these constants somewhere shared
    for (const cat of categories) {
      await generateRankingSnapshot(genderRequest, cat, name)
    }
    return { success: true, message: 'Snapshots generation triggered for all categories' }
  }

  // Generate specific snapshot
  const snapshotDate = new Date().toISOString()
  const rankings = await getRankingsForSnapshot(genderRequest, categoryRequest)

  if (rankings.length === 0) {
    // Even if empty, maybe we should record it? But for now let's skip.
    return { success: false, message: `No rankings to snapshot for ${genderRequest} ${categoryRequest}` }
  }

  // 1. Create Metadata (Default Private)
  const { data: metadata, error: metaError } = await supabase
    .from('snapshot_metadata')
    .insert({
      snapshot_date: snapshotDate,
      gender: genderRequest,
      age_category: categoryRequest,
      name: name && name.trim() !== '' ? name.trim() : null,
      is_public: false, // Default private
      description: `Auto-generated ${genderRequest} ${categoryRequest} ranking`
    })
    .select()
    .single()

  if (metaError || !metadata) {
    console.error('Error creating snapshot metadata:', metaError)
    return { success: false, message: 'Failed to create snapshot metadata' }
  }

  // 2. Prepare and Insert Snapshot Data
  const snapshotData = rankings.map((ranking, index) => ({
    player_id: ranking.playerId,
    rank_position: index + 1,
    total_points: ranking.totalPoints,
    events_count: ranking.eventsCount,
    snapshot_date: snapshotDate,
    metadata_id: metadata.id
  }))

  const { error } = await supabase.from('ranking_snapshots').insert(snapshotData)

  if (error) {
    console.error('Error creating snapshot:', error)
    // Should probably delete metadata if this fails, but skipping for simplicity
    return { success: false, message: 'Failed to create snapshot entries' }
  }

  return { 
    success: true, 
    message: `Snapshot created for ${genderRequest} ${categoryRequest} with ${rankings.length} players`,
    count: rankings.length 
  }
}

/**
 * Get the latest PUBLIC ranking snapshot date
 */
export async function getLatestSnapshotDate(gender?: string, ageCategory?: string): Promise<string | null> {
  const supabase = await createClient()

  let query = supabase
    .from('snapshot_metadata')
    .select('snapshot_date')
    .eq('is_public', true)
    
  if (gender) query = query.eq('gender', gender)
  if (ageCategory) query = query.eq('age_category', ageCategory)

  const { data } = await query
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()

  return data?.snapshot_date || null
}

/**
 * Get all available PUBLIC snapshot dates for selector
 */
export async function getPublicSnapshotDates(gender?: string, ageCategory?: string): Promise<{ date: string; name: string | null }[]> {
  const supabase = await createClient()

  let query = supabase
    .from('snapshot_metadata')
    .select('snapshot_date, name')
    .eq('is_public', true)
    
  if (gender) query = query.eq('gender', gender)
  if (ageCategory) query = query.eq('age_category', ageCategory)

  const { data } = await query
    .order('snapshot_date', { ascending: false })

  return data?.map(d => ({ date: d.snapshot_date, name: d.name })) || []
}

/**
 * Get rankings from a specific snapshot (or latest public if date not provided)
 */
export async function getRankingsWithHistory(gender?: string, ageCategory?: string, date?: string): Promise<RankingEntry[]> {
  const supabase = await createClient()
  let targetDate = date

  if (!targetDate) {
    targetDate = await getLatestSnapshotDate(gender, ageCategory) || undefined
  }

  if (!targetDate) {
    // If no snapshot exists at all, return empty or live as fallback?
    // Given the requirement to only show snapshots, returning empty is safer/more correct.
    return []
  }

  // 1. Get snapshot data
  // Logic: filtered by date, and if we have metadata, we can rely on that.
  // But ranking_snapshots also has snapshot_date.
  // We need to join players.
  
  // NOTE: If date is provided, we fetch items with that date. 
  // We assume the snapshots were generated for this category/gender if we found the date via metadata query.
  // However, snapshot_date alone might not be unique across categories if generated in batch efficiently 
  // (though current logic uses `new Date()` per specific call, so likely unique timestamps).
  // But safely, we should filter by metadata too? 
  // Actually, `ranking_snapshots` stores `metadata_id`. 
  // So getting data via `metadata_id` is safest if we knew it.
  // But we passed `date`.
  // Let's rely on date + metadata info from `snapshot_metadata` table.

  // First, find the metadata record to get the ID (and confirm it matches gender/cat)
  const { data: meta } = await supabase
    .from('snapshot_metadata')
    .select('id')
    .eq('snapshot_date', targetDate)
    .eq('gender', gender!) // Force filter by gender to ensure we get the right snapshot for this view
    .eq('age_category', ageCategory!)
    .single()

  if (!meta) return []

  const { data: latestData } = await supabase
    .from('ranking_snapshots')
    .select(`
      player_id,
      total_points,
      events_count,
      player:players!inner (id, name, gender, club_id, clubs(name), birth_date)
    `)
    .eq('metadata_id', meta.id)

  if (!latestData) return []

  let currentEntries = latestData.map((s: any) => ({
    playerId: s.player_id,
    playerName: s.player.name,
    clubId: s.player.club_id,
    club: s.player.clubs?.name,
    gender: s.player.gender,
    birthDate: s.player.birth_date,
    totalPoints: s.total_points,
    eventsCount: s.events_count,
  }))

  // Sort by points
  currentEntries.sort((a, b) => b.totalPoints - a.totalPoints)

  // 4. Get PREVIOUS snapshot for comparison (Specific to this gender/category)
  const { data: headerData } = await supabase
    .from('snapshot_metadata')
    .select('snapshot_date')
    .eq('gender', gender!)
    .eq('age_category', ageCategory!)
    .eq('is_public', true)
    .lt('snapshot_date', targetDate) // Older than current
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single()

  let previousEntries: RankingEntry[] = []

  if (headerData) {
    const previousDate = headerData.snapshot_date
    // Get previous metadata ID
    const { data: prevMeta } = await supabase
        .from('snapshot_metadata')
        .select('id')
        .eq('snapshot_date', previousDate)
        .eq('gender', gender!)
        .eq('age_category', ageCategory!)
        .single()
        
    if (prevMeta) {
        const { data: prevData } = await supabase
        .from('ranking_snapshots')
        .select(`player_id, rank_position`)
        .eq('metadata_id', prevMeta.id)

        if (prevData) {
            previousEntries = prevData.map((e: any) => ({
                playerId: e.player_id,
                rankPosition: e.rank_position
            })) as any
        }
    }
  }

  const previousRankMap = new Map(previousEntries.map(e => [e.playerId, e.rankPosition!]))

  return currentEntries.map((entry, index) => {
    const currentRank = index + 1
    const previousRank = previousRankMap.get(entry.playerId)

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
      ...entry,
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
export async function getPlayerRankingHistory(playerId: string): Promise<any[]> {
  const supabase = await createClient()

  // We need to fetch the snapshots and join with metadata to get the name and check if it's public
  const { data } = await supabase
    .from('ranking_snapshots')
    .select(`
      *,
      metadata:snapshot_metadata!inner(name, is_public)
    `)
    .eq('player_id', playerId)
    .eq('metadata.is_public', true)
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
      player:players!inner (id, name, gender, club_id, clubs(name), birth_date),
      event:events!inner (id, type, date, validity_date, age_category)
    `)
    .gte('event.validity_date', today)
  
  if (error || !data) {
    console.error('Error fetching rankings for snapshot:', error)
    return []
  }

  // 2. Parse max age from category (e.g., 'U15' -> 15)
  const isUCategory = ageCategory && ageCategory !== 'Senior' && ageCategory.startsWith('U');
  const maxAllowedAge = isUCategory ? parseInt(ageCategory.replace('U', ''), 10) : null;
  const currentYear = new Date().getFullYear();

  // 3. Group by player
  const playerGroups = new Map<string, any[]>()
  data.forEach((r: any) => {
    // Filter by gender if provided
    if (gender && r.player.gender !== gender) return
    // Filter by age category from the EVENT constraints
    if (ageCategory && r.event.age_category !== ageCategory) return

    // Apply ranking generation age limits
    if (isUCategory && maxAllowedAge !== null) {
        if (r.player.birth_date) {
            const birthYear = new Date(r.player.birth_date).getFullYear()
            const playerAge = currentYear - birthYear;
            // E.g. for U15, if age is 16, they should NOT be included in this specific list
            if (playerAge > maxAllowedAge) {
                return; // Skip this player's result for THIS ranking
            }
        }
        // If birth_date is missing, the user requested to INCUDE them by default
    }

    if (!playerGroups.has(r.player.id)) {
      playerGroups.set(r.player.id, [])
    }
    playerGroups.get(r.player.id)?.push(r)
  })

  // 4. Process each player's results
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
      clubId: player.club_id,
      club: player.clubs?.name,
      gender: player.gender,
      totalPoints,
      eventsCount
    })
  })

  return rankingEntries.sort((a, b) => b.totalPoints - a.totalPoints)
}
