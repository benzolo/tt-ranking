import { getRankingsWithHistory, getLatestSnapshotDate } from '@/utils/ranking-snapshots'
import Link from 'next/link'

export default async function Home({
  searchParams,
}: {
  searchParams: { gender?: string; category?: string }
}) {
  const gender = searchParams.gender === 'All' ? undefined : searchParams.gender
  const category = searchParams.category === 'All' ? undefined : searchParams.category

  const rankings = await getRankingsWithHistory(gender, category)
  const lastUpdated = await getLatestSnapshotDate()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-6">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-400">TT Ranking</h1>
            <p className="text-slate-400 text-sm mt-1">Official Leaderboard</p>
          </div>
          <Link href="/admin" className="text-sm font-medium hover:text-emerald-400 transition-colors">
            Admin Login
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 flex flex-wrap gap-4 items-center justify-between">
          <form className="flex gap-4">
            <select 
                name="category" 
                defaultValue={category || 'All'}
                // We'll use client-side navigation or simple form submission for now since this is a server component
                // For a proper UX, this should be a client component that pushes router state.
                // But native form GET works for searchParams too!
                className="rounded-lg border-slate-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
            >
                <option value="All">All Categories</option>
                <option value="Senior">Senior</option>
                <option value="U19">U19</option>
                <option value="U15">U15</option>
                <option value="U13">U13</option>
                <option value="U11">U11</option>
            </select>

            <select 
                name="gender" 
                defaultValue={gender || 'All'}
                className="rounded-lg border-slate-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
            >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </select>

            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
                Filter
            </button>
            
             {/* Reset Link */}
             {(gender || category) && (
                <Link href="/" className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-slate-700">
                    Reset
                </Link>
             )}
          </form>
          {lastUpdated && (
            <div className="text-xs text-slate-500">
              Last updated: {new Date(lastUpdated).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Ranking List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 w-16">#</th>
                  <th className="px-6 py-4 w-20">Change</th>
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4">Club</th>
                  <th className="px-6 py-4 text-center">Events</th>
                  <th className="px-6 py-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankings.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                            No rankings found for the selected criteria.
                        </td>
                    </tr>
                ) : (
                    rankings.map((player) => (
                    <tr key={player.playerId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-400">
                          {player.rankPosition}
                        </td>
                        <td className="px-6 py-4">
                          {player.rankChange === 'up' && (
                            <span className="inline-flex items-center text-green-600 font-medium text-sm">
                              ↑ {player.rankDifference}
                            </span>
                          )}
                          {player.rankChange === 'down' && (
                            <span className="inline-flex items-center text-red-600 font-medium text-sm">
                              ↓ {player.rankDifference}
                            </span>
                          )}
                          {player.rankChange === 'same' && (
                            <span className="text-slate-400">−</span>
                          )}
                          {player.rankChange === 'new' && (
                            <span className="text-blue-600 text-xs font-medium">NEW</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/player/${player.playerId}`} className="font-medium text-emerald-600 hover:text-emerald-700">
                            {player.playerName}
                          </Link>
                          <div className="text-xs text-slate-400">{player.gender}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {player.club || '-'}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600">
                          {player.eventsCount}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600 text-base">
                          {player.totalPoints}
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
