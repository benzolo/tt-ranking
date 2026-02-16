import { createClient } from '@/utils/supabase/server'
import { getPlayerRankingHistory } from '@/utils/ranking-snapshots'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import RankingChart from '@/components/ranking-chart'

export default async function PlayerProfile({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // Fetch player details
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('id', params.id)
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
    .eq('player_id', params.id)
    .order('event(date)', { ascending: false })

  // Fetch ranking history
  const rankingHistory = await getPlayerRankingHistory(params.id)

  // Transform ranking history for chart
  const chartData = rankingHistory.map(snapshot => ({
    date: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rank: snapshot.rank_position,
    points: snapshot.total_points,
  }))

  // Calculate current rank and total points from latest snapshot or results
  const latestSnapshot = rankingHistory[rankingHistory.length - 1]
  const currentRank = latestSnapshot?.rank_position
  const currentPoints = latestSnapshot?.total_points || 0

  // Separate active and expired events
  const today = new Date().toISOString()
  const activeResults = results?.filter(r => (r.event as any)?.validity_date >= today) || []
  const expiredResults = results?.filter(r => (r.event as any)?.validity_date < today) || []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-6">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/" className="text-sm text-slate-400 hover:text-white mb-2 inline-block">
            ← Back to Rankings
          </Link>
          <h1 className="text-3xl font-bold">{player.name}</h1>
          <div className="flex gap-4 mt-2 text-sm text-slate-400">
            <span>{player.gender}</span>
            {player.club && (
              <>
                <span>•</span>
                <span>{player.club}</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Current Rank</h3>
            <p className="text-4xl font-bold text-emerald-600 mt-2">
              {currentRank ? `#${currentRank}` : '−'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Points</h3>
            <p className="text-4xl font-bold text-slate-900 mt-2">{currentPoints}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Events</h3>
            <p className="text-4xl font-bold text-slate-900 mt-2">{activeResults.length}</p>
          </div>
        </div>

        {/* Ranking Progress Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Ranking Progress</h2>
          <RankingChart data={chartData} />
        </div>

        {/* Active Events */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">Active Events</h2>
            <p className="text-sm text-slate-500 mt-1">Events contributing to current ranking</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeResults.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No active events
                    </td>
                  </tr>
                ) : (
                  activeResults.map((result) => {
                    const event = result.event as any
                    const expiryDate = new Date(event.validity_date)
                    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    const isExpiringSoon = daysUntilExpiry <= 30

                    return (
                      <tr key={result.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{event.name}</div>
                          <div className="text-xs text-slate-500">{event.type} • {event.age_category}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">#{result.position}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-emerald-600">{result.points} pts</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={isExpiringSoon ? 'text-orange-600 font-medium' : 'text-slate-600'}>
                            {expiryDate.toLocaleDateString()}
                          </div>
                          {isExpiringSoon && (
                            <div className="text-xs text-orange-500">Expires in {daysUntilExpiry} days</div>
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Expired Events</h2>
              <p className="text-sm text-slate-500 mt-1">Past events no longer contributing to ranking</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Expired</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {expiredResults.map((result) => {
                    const event = result.event as any
                    return (
                      <tr key={result.id} className="opacity-60">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{event.name}</div>
                          <div className="text-xs text-slate-500">{event.type} • {event.age_category}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">#{result.position}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-400">{result.points} pts</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(event.validity_date).toLocaleDateString()}
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
