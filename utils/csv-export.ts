import { createClient } from './supabase/server'

export async function generateSnapshotCsv(snapshotMetadataId: string): Promise<string> {
  const supabase = await createClient()

  // Fetch metadata to get context
  const { data: meta } = await supabase
    .from('snapshot_metadata')
    .select('*')
    .eq('id', snapshotMetadataId)
    .single()

  if (!meta) {
    throw new Error('Snapshot metadata not found')
  }

  // Fetch ranking data
  const { data: rankings } = await supabase
    .from('ranking_snapshots')
    .select(`
      rank_position,
      total_points,
      events_count,
      player:players (license_id, name, club, gender, birth_date)
    `)
    .eq('metadata_id', snapshotMetadataId)
    .order('rank_position', { ascending: true })

  if (!rankings || rankings.length === 0) {
    return ''
  }

  // Define CSV Header
  const header = ['Helyezés', 'Engedélyszám', 'Név', 'Egyesület', 'Nem', 'Születési dátum', 'Pontszám', 'Versenyek száma']
  const rows = rankings.map((r: any) => [
    r.rank_position,
    r.player?.license_id || '',
    r.player?.name || '',
    r.player?.club || '',
    r.player?.gender === 'Male' ? 'Férfi' : 'Nő',
    r.player?.birth_date ? new Date(r.player.birth_date).toLocaleDateString('hu-HU') : '',
    r.total_points,
    r.events_count
  ])

  // Construct CSV String
  const csvContent = [
    header.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
  ].join('\n')

  return csvContent
}
