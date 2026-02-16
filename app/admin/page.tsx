import { createClient } from '@/utils/supabase/server'
import { getLatestSnapshotDate } from '@/utils/ranking-snapshots'
import { createRankingSnapshot } from './rankings/actions'
import { getUserRole } from '@/utils/supabase/roles'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const role = await getUserRole()

  const [players, events, results] = await Promise.all([
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('results').select('*', { count: 'exact', head: true })
  ])

  const latestSnapshotDate = await getLatestSnapshotDate()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Overview of the ranking system status.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Players</h3>
          <p className="text-4xl font-bold text-slate-900 mt-2">{players.count ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Events</h3>
          <p className="text-4xl font-bold text-slate-900 mt-2">{events.count ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Results Recorded</h3>
          <p className="text-4xl font-bold text-slate-900 mt-2">{results.count ?? 0}</p>
        </div>
      </div>

      {role === 'superadmin' && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800">Ranking Snapshots</h3>
          <p className="text-sm text-blue-600 mt-1">
            Generate a snapshot to capture current rankings for historical tracking
          </p>
          {latestSnapshotDate && (
            <p className="text-xs text-blue-500 mt-2">
              Last snapshot: {new Date(latestSnapshotDate).toLocaleString()}
            </p>
          )}
          <form action={createRankingSnapshot} className="mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Generate Ranking Snapshot
            </button>
          </form>
        </div>
      )}

      <div className="mt-12 bg-emerald-50 border border-emerald-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-emerald-800">Quick Actions</h3>
        <div className="mt-4 flex gap-4">
            <a href="/admin/players" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200">
                Manage Players
            </a>
            <a href="/admin/events" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200">
                Create Event
            </a>
        </div>
      </div>
    </div>
  )
}
