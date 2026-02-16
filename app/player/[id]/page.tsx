import { createClient } from '@/utils/supabase/server'
import { getPlayerRankingHistory } from '@/utils/ranking-snapshots'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import RankingChart from '@/components/ranking-chart'

export default async function PlayerProfile({ params }: { params: { id: string } }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch player details
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single()

  if (!player) {
    notFound()
  }

  // Fetch player's event results with event details
  const { data: results } = await supabase
    .from('results')
    .select(`
      *,
      event:events (*)
    `)
    .eq('player_id', id)
    .order('event(date)', { ascending: false })

  // Fetch ranking history
  const rankingHistory = await getPlayerRankingHistory(id)

  // Transform ranking history for chart
  const chartData = rankingHistory.map(snapshot => ({
    date: new Date(snapshot.snapshot_date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }),
    rank: snapshot.rank_position,
    points: snapshot.total_points,
  }))

  const latestSnapshot = rankingHistory[rankingHistory.length - 1]
  const currentRank = latestSnapshot?.rank_position
  const currentPoints = latestSnapshot?.total_points || 0

  // Separate active and expired events
  const today = new Date().toISOString()
  const activeResults = results?.filter(r => (r.event as any)?.validity_date >= today) || []
  const expiredResults = results?.filter(r => (r.event as any)?.validity_date < today) || []

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link href="/" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 mb-4 inline-flex items-center gap-1 group transition-all">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            VISSZA A RANGLISTÁHOZ
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-2">{player.name}</h1>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400">{player.gender === 'Male' ? 'Férfi' : 'Nő'}</span>
                {player.club && (
                  <>
                    <span className="text-slate-700">•</span>
                    <span className="text-emerald-500/80">{player.club}</span>
                  </>
                )}
                {player.license_id && (
                  <>
                    <span className="text-slate-700">•</span>
                    <span className="text-slate-400">Licenc: {player.license_id}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 shadow-2xl group hover:border-emerald-500/30 transition-all">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Aktuális Helyezés</h3>
            <p className="text-6xl font-black text-white group-hover:text-emerald-400 transition-colors">
              {currentRank ? `#${currentRank}` : '−'}
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 shadow-2xl group hover:border-emerald-500/30 transition-all text-center">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Összpontszám</h3>
            <p className="text-6xl font-black text-white group-hover:text-emerald-400 transition-colors">{currentPoints}</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-800 shadow-2xl group hover:border-emerald-500/30 transition-all text-right">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Aktív Versenyek</h3>
            <p className="text-6xl font-black text-white group-hover:text-emerald-400 transition-colors">{activeResults.length}</p>
          </div>
        </div>

        {/* Ranking Progress Chart */}
        <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2 uppercase tracking-tight">
            <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
            Helyezés alakulása
          </h2>
          <div className="h-[300px] w-full">
            <RankingChart data={chartData} />
          </div>
        </div>

        {/* Active Events */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-slate-800 bg-slate-800/20">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Aktív Versenyek</h2>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">A ranglistába beszámító versenyek listája</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                <tr>
                  <th className="px-8 py-5">Verseny</th>
                  <th className="px-6 py-5">Dátum</th>
                  <th className="px-6 py-5 text-center">Helyezés</th>
                  <th className="px-6 py-5 text-center">Pont</th>
                  <th className="px-8 py-5 text-right">Lejárat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {activeResults.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-slate-500 italic">
                      Nincs aktív verseny.
                    </td>
                  </tr>
                ) : (
                  activeResults.map((result) => {
                    const event = result.event as any
                    const expiryDate = new Date(event.validity_date)
                    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    const isExpiringSoon = daysUntilExpiry <= 30

                    return (
                      <tr key={result.id} className="hover:bg-emerald-500/5 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{event.name}</div>
                          <div className="text-[10px] text-slate-600 font-black uppercase mt-0.5">{event.type} • {event.age_category} • {result.category}</div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-400 font-medium">
                          {new Date(event.date).toLocaleDateString('hu-HU')}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="bg-slate-800 px-3 py-1 rounded-full text-white font-black text-sm border border-slate-700">
                            #{result.position}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="font-black text-emerald-400 text-lg tracking-tight">{result.points} <span className="text-[10px] uppercase text-emerald-500/50">pt</span></span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className={`text-xs font-bold uppercase tracking-wider ${isExpiringSoon ? 'text-rose-500' : 'text-slate-500'}`}>
                            {expiryDate.toLocaleDateString('hu-HU')}
                          </div>
                          {isExpiringSoon && (
                            <div className="text-[9px] text-rose-500 font-black uppercase mt-1 animate-pulse">{daysUntilExpiry} nap maradt</div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expired Events */}
        {expiredResults.length > 0 && (
          <div className="bg-slate-900/20 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl opacity-60 hover:opacity-100 transition-opacity">
            <div className="px-8 py-6 border-b border-slate-800 bg-slate-800/20">
              <h2 className="text-xl font-black text-slate-400 uppercase tracking-tight">Lejárt Versenyek</h2>
              <p className="text-xs text-slate-600 mt-1 uppercase tracking-widest font-bold">Korábbi eredmények, melyek már nem számítanak a ranglistába</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left opacity-70">
                <thead className="bg-slate-800/30 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                  <tr>
                    <th className="px-8 py-5">Verseny</th>
                    <th className="px-6 py-5">Dátum</th>
                    <th className="px-6 py-5 text-center">Helyezés</th>
                    <th className="px-6 py-5 text-center">Pont</th>
                    <th className="px-8 py-5 text-right">Lejárt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {expiredResults.map((result) => {
                    const event = result.event as any
                    return (
                      <tr key={result.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="font-bold text-slate-400 uppercase tracking-tight">{event.name}</div>
                          <div className="text-[10px] text-slate-600 font-black uppercase mt-0.5">{event.type} • {event.age_category} • {result.category}</div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-500">
                          {new Date(event.date).toLocaleDateString('hu-HU')}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-slate-500 font-bold text-sm">
                            #{result.position}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="font-bold text-slate-600">{result.points} pt</span>
                        </td>
                        <td className="px-8 py-5 text-right text-xs text-slate-600 font-bold">
                          {new Date(event.validity_date).toLocaleDateString('hu-HU')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
