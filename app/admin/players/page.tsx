import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { deletePlayer, checkPlayerResults } from './actions'
import DeleteWithConfirmation from '@/components/DeleteWithConfirmation'

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const supabase = await createClient()
  const search = searchParams.search || ''
  
  let query = supabase
    .from('players')
    .select('*')
    .order('name', { ascending: true })
  
  // Apply search filter if provided
  if (search) {
    query = query.or(`name.ilike.%${search}%,license_id.ilike.%${search}%`)
  }
  
  const { data: players, error } = await query

  if (error) {
    return <div>Error loading players</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Játékosok</h1>
        <Link 
          href="/admin/players/create" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Játékos Hozzáadása
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <form action="/admin/players" method="get">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Keresés név vagy engedélyszám alapján..."
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Név</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Engedélyszám</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nem</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Egyesület</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Születési Dátum</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Szerkesztés</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {players?.map((player) => (
              <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{player.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{player.license_id || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{player.gender}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{player.club || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{player.birth_date ? new Date(player.birth_date).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/players/${player.id}`} className="text-emerald-600 hover:text-emerald-900 mr-4">
                    Szerkesztés
                  </Link>
                  <DeleteWithConfirmation 
                    id={player.id} 
                    entityName="játékos" 
                    checkAction={checkPlayerResults} 
                    deleteAction={deletePlayer} 
                  />
                </td>
              </tr>
            ))}
            {players?.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        {search ? `Nincs találat erre: "${search}"` : 'Nincsenek játékosok. Hozz létre egyet a kezdéshez.'}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
