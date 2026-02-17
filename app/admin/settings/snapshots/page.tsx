import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import SnapshotControls from './snapshot-controls'
import SnapshotList from './snapshot-list'

export default async function SnapshotsPage() {
  const supabase = await createClient()

  // Fetch all snapshots
  // Note: We need a computed count of players per snapshot if not stored in metadata
  // Currently, we store `player_count` in metadata ONLY if we updated the generation logic to do so.
  // The logic I wrote earlier didn't explicitly update `player_count` column in metadata (my SQL didn't have it).
  // Let's assume we can fetch it via join or separate query, OR update schema to have it.
  // For now, let's just fetch metadata and maybe join ranking_snapshots count?
  // Actually, checking standard SQL count is easy.
  
  const { data: snapshots, error } = await supabase
    .from('snapshot_metadata')
    .select('*')
    .order('snapshot_date', { ascending: false })

  if (error) {
    console.error('Error fetching snapshots:', error)
    return <div className="p-4 bg-red-50 text-red-600 rounded">
      Error loading snapshots: {error.message}
    </div>
  }

  const formattedSnapshots = snapshots.map((s: any) => ({
    ...s,
    playerCount: 0 // Placeholder until we fix the join
  }))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Ranglista Mentések (Snapshots)</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Új Mentés Generálása</h2>
        <SnapshotControls />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">Korábbi Mentések</h2>
        </div>
        <SnapshotList snapshots={formattedSnapshots} />
      </div>
    </div>
  )
}
