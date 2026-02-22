import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { deleteClub, checkClubPlayers } from './actions'
import DeleteWithConfirmation from '@/components/DeleteWithConfirmation'

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : ''

  let query = supabase
    .from('clubs')
    .select('*')
    .order('name', { ascending: true })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: clubs, error } = await query

  if (error) {
    return <div>Hiba az egyesületek betöltésekor</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Egyesületek</h1>
        <Link 
          href="/admin/clubs/create" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          + Új Egyesület
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <form className="flex gap-2 w-full max-w-sm">
            <input 
              type="text" 
              name="search" 
              placeholder="Keresés név alapján..." 
              defaultValue={search}
              className="flex-1 rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
            />
            <button type="submit" className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Keresés
            </button>
            {search && (
               <Link href="/admin/clubs" className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium">Torlés</Link>
            )}
          </form>
          <div className="text-sm text-slate-500 font-medium">
            Összesen {clubs.length} egyesület
          </div>
        </div>

        {clubs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nincs megjeleníthető egyesület.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-2/3">Egyesület Neve</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Műveletek</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {clubs.map((club) => (
                  <tr key={club.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 border-l-2 border-transparent hover:border-emerald-500">
                      {club.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                            href={`/admin/clubs/${club.id}`} 
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors"
                        >
                            Szerkesztés
                        </Link>
                        <DeleteWithConfirmation 
                          id={club.id} 
                          entityName="Egyesület"
                          deleteAction={deleteClub} 
                          checkAction={checkClubPlayers}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
