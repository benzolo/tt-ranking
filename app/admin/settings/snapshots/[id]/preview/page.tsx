import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { toggleVisibilityAction } from '../../actions'

export default async function SnapshotPreviewPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch Metadata
  const { data: metadata, error: metaError } = await supabase
    .from('snapshot_metadata')
    .select('*')
    .eq('id', id)
    .single()

  if (metaError || !metadata) {
    notFound()
  }

  // Fetch Rankings for this snapshot
  const { data: rankings, error: rankError } = await supabase
    .from('ranking_snapshots')
    .select(`
      rank_position,
      total_points,
      events_count,
      player:players (name, clubs(name), gender)
    `)
    .eq('metadata_id', id)
    .order('rank_position', { ascending: true })

  if (rankError) {
    console.error(rankError)
    return <div>Hiba a betöltéskor</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
             {new Date(metadata.snapshot_date).toLocaleString('hu-HU')} - {metadata.gender === 'Male' ? 'Férfi' : 'Nő'} {metadata.age_category}
          </h1>
          <p className="text-slate-500">
            {metadata.is_public ? 'Publikus' : 'Privát (Nem látható a főoldalon)'}
          </p>
        </div>
        <div className="flex gap-4">
             <Link 
                href="/admin/settings/snapshots"
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
             >
                Vissza
             </Link>
             
             <form action={async () => {
                 'use server'
                 await toggleVisibilityAction(id, !metadata.is_public)
             }}>
                 <button 
                    type="submit"
                    className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                        metadata.is_public 
                        ? 'bg-amber-600 hover:bg-amber-700' 
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                 >
                    {metadata.is_public ? 'Rejtés (Privát)' : 'Publikálás'}
                 </button>
             </form>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Helyezés</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Név</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Egyesület</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Pontszám</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Versenyek</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {rankings && rankings.length > 0 ? (
                    rankings.map((r: any) => (
                        <tr key={r.rank_position}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{r.rank_position}.</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{r.player?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{r.player?.clubs?.name || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-bold">{r.total_points}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">{r.events_count}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-slate-500">Nincs adat ebben a mentésben.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  )
}
