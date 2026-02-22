import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { deleteEvent, checkEventResults } from './actions'
import DeleteWithConfirmation from '@/components/DeleteWithConfirmation'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const ageCategory = typeof params.ageCategory === 'string' ? params.ageCategory : ''

  let query = supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false })

  if (ageCategory) query = query.eq('age_category', ageCategory)

  const { data: events, error } = await query

  if (error) {
    return <div>Error loading events</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Versenyek</h1>
        <Link 
          href="/admin/events/create" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Verseny Hozzáadása
        </Link>
      </div>

      <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-end">
        <form className="flex gap-4 items-end w-full max-w-sm">
             <div className="flex-1">
                <label htmlFor="ageCategory" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Korosztály</label>
                <select 
                    name="ageCategory" 
                    id="ageCategory"
                    defaultValue={ageCategory}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                >
                    <option value="">Összes</option>
                    <option value="Senior">Senior (Felnőtt)</option>
                    <option value="U21">U21</option>
                    <option value="U19">U19</option>
                    <option value="U17">U17</option>
                    <option value="U15">U15</option>
                    <option value="U13">U13</option>
                    <option value="U11">U11</option>
                </select>
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Szűrés
            </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Név</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dátum</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Típus</th>
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Korosztály</th>
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nem</th>
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kategóriák</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Szerkesztés</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {events?.map((event) => (
              <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{event.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(event.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{event.type}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{event.age_category}</td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                   <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                     event.gender === 'Male' ? 'bg-blue-100 text-blue-800' :
                     event.gender === 'Female' ? 'bg-pink-100 text-pink-800' :
                     'bg-slate-100 text-slate-800'
                   }`}>
                     {event.gender === 'Male' ? 'Férfi' : event.gender === 'Female' ? 'Női' : 'Mindkét Nem'}
                   </span>
                 </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex gap-1.5 flex-wrap">
                      {event.has_egyes && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-medium uppercase tracking-wider">Egyes</span>}
                      {event.has_paros && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-medium uppercase tracking-wider">Páros</span>}
                      {event.has_vegyes && <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-[10px] font-medium uppercase tracking-wider">Vegyes</span>}
                      {event.has_csapat && <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md text-[10px] font-medium uppercase tracking-wider">Csapat</span>}
                    </div>
                 </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/events/${event.id}`} className="text-emerald-600 hover:text-emerald-900 mr-4">
                    Szerkesztés
                  </Link>
                  <DeleteWithConfirmation 
                    id={event.id} 
                    entityName="verseny" 
                    checkAction={checkEventResults} 
                    deleteAction={deleteEvent} 
                  />
                </td>
              </tr>
            ))}
             {events?.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        Nincsenek versenyek. Hozz létre egyet a kezdéshez.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
