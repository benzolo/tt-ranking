import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { deletePlayer } from './actions'

export default async function PlayersPage() {
  const supabase = await createClient()
  const { data: players, error } = await supabase
    .from('players')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return <div>Error loading players</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Players</h1>
        <Link 
          href="/admin/players/create" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add Player
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Gender</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Club</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Birth Date</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {players?.map((player) => (
              <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{player.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{player.gender}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{player.club || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{player.birth_date ? new Date(player.birth_date).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/players/${player.id}`} className="text-emerald-600 hover:text-emerald-900 mr-4">
                    Edit
                  </Link>
                  <form action={deletePlayer.bind(null, player.id)} className="inline">
                    <button type="submit" className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {players?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No players found. Create one to get started.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
