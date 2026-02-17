import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { deleteEvent } from './actions'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false })

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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Név</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dátum</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Típus</th>
               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Korosztály</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kategória</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{event.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/events/${event.id}`} className="text-emerald-600 hover:text-emerald-900 mr-4">
                    Szerkesztés
                  </Link>
                  <form action={deleteEvent.bind(null, event.id)} className="inline">
                    <button type="submit" className="text-red-600 hover:text-red-900">
                      Törlés
                    </button>
                  </form>
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
