import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ClubProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch club details
  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .single()

  if (!club) {
    notFound()
  }

  // 2. Fetch the LATEST public snapshot metadata for EVERY available category combo
  const { data: allMeta } = await supabase
    .from('snapshot_metadata')
    .select('id, gender, age_category, snapshot_date')
    .eq('is_public', true)
    .order('snapshot_date', { ascending: false })

  if (!allMeta) {
     return <div className="p-8 text-white">Nincs adat.</div>;
  }

  // Deduplicate to only get the latest metadata ID for each gender + age_category
  const latestMetaMap = new Map<string, any>()
  allMeta.forEach(meta => {
     const key = `${meta.gender}-${meta.age_category}`
     if (!latestMetaMap.has(key)) {
         latestMetaMap.set(key, meta)
     }
  })

  const activeMetadataIds = Array.from(latestMetaMap.values()).map(m => m.id)

  // 3. Fetch all ranking snapshot entries for these metadatas where player belongs to this club
  const { data: snapshotEntries } = await supabase
    .from('ranking_snapshots')
    .select(`
        metadata_id,
        rank_position,
        total_points,
        events_count,
        player:players!inner (id, name, gender, club_id, birth_date)
    `)
    .in('metadata_id', activeMetadataIds)
    .eq('player.club_id', id)
    .order('rank_position', { ascending: true })

  // 4. Organize data into categories
  const categoryGroups: Record<string, any[]> = {}
  
  Array.from(latestMetaMap.values()).forEach(meta => {
      const groupName = `${meta.age_category} ${meta.gender === 'Male' ? 'Férfi' : 'Női'}`
      // Find players in this category
      const playersInGroup = (snapshotEntries || []).filter(entry => entry.metadata_id === meta.id)
      
      if (playersInGroup.length > 0) {
          categoryGroups[groupName] = playersInGroup
      }
  })

  // Sort categories (Felnőtt first, then U-categories by age descending)
  const sortedCategoryNames = Object.keys(categoryGroups).sort((a, b) => {
     if (a.startsWith('Felnőtt') && !b.startsWith('Felnőtt')) return -1;
     if (!a.startsWith('Felnőtt') && b.startsWith('Felnőtt')) return 1;
     return a.localeCompare(b)
  })

  const totalPlayersCount = (snapshotEntries || []).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),rgba(15,23,42,1))]"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen opacity-50"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link href="/" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 mb-4 inline-flex items-center gap-1 group transition-all">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            VISSZA A RANGLISTÁKHOZ
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-2">{club.name}</h1>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                <span className="bg-slate-800 px-2 py-0.5 rounded text-emerald-400 border border-emerald-500/20">Hivatalos Egyesület</span>
                <span className="text-slate-700">•</span>
                <span>{totalPlayersCount} aktív ranglistás szereplés</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 py-12 space-y-12">
        
        {sortedCategoryNames.length === 0 ? (
           <div className="bg-slate-900/40 backdrop-blur-md p-12 rounded-3xl border border-slate-800 shadow-2xl text-center">
              <h2 className="text-2xl font-black text-slate-500 mb-2">Nincsenek Játékosok</h2>
              <p className="text-slate-600">Ennek az egyesületnek jelenleg nincsenek aktív ranglistás játékosai.</p>
           </div>
        ) : (
           sortedCategoryNames.map(categoryName => {
              const players = categoryGroups[categoryName];
              return (
                 <div key={categoryName} className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                    <div className="px-8 py-6 border-b border-slate-800 bg-slate-800/20 flex items-center gap-4">
                      <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                      <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">{categoryName} Ranglista</h2>
                        <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest font-bold">{players.length} játékos</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                          <tr>
                            <th className="px-8 py-5 w-24 text-center">Rang</th>
                            <th className="px-6 py-5">Játékos Neve</th>
                            <th className="px-6 py-5 text-center">Versenyek</th>
                            <th className="px-8 py-5 text-right w-32">Pontszám</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                           {players.map(entry => (
                               <tr key={entry.player.id} className="hover:bg-emerald-500/5 transition-colors group">
                                  <td className="px-8 py-4 text-center">
                                      <span className="font-black text-slate-300 text-lg">#{entry.rank_position}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                      <Link href={`/player/${entry.player.id}`} className="font-bold text-white group-hover:text-emerald-400 transition-colors text-base block">
                                          {entry.player.name}
                                      </Link>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                      <span className="bg-slate-800 px-2.5 py-1 rounded text-slate-400 font-bold text-xs border border-slate-700">
                                          {entry.events_count}
                                      </span>
                                  </td>
                                  <td className="px-8 py-4 text-right">
                                      <span className="font-black text-emerald-400 text-lg tracking-tight">
                                          {entry.total_points}
                                      </span>
                                  </td>
                               </tr>
                           ))}
                        </tbody>
                      </table>
                    </div>
                 </div>
              )
           })
        )}
      </main>
    </div>
  )
}
