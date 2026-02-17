import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function ResultsEventsPage() {
  const supabase = await createClient()
  
  // Fetch events with a count of results to show progress
  const { data: events, error } = await supabase
    .from('events')
    .select('*, results(count)')
    .order('date', { ascending: false })

  if (error) {
    return <div>Error loading events</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Eredmények Rögzítése</h1>
      <p className="text-slate-500 mb-8">Válassz egy versenyt az eredmények kezeléséhez.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <Link 
            key={event.id} 
            href={`/admin/results/${event.id}`}
            className="block bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start">
              <div>
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.type === 'Tournament' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                  {event.type}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 mt-2 group-hover:text-emerald-600 transition-colors">
                  {event.name}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <div className="mt-4 text-xs text-slate-400 uppercase tracking-wider font-medium">
                  {event.age_category} • {event.category}
                </div>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-bold text-slate-700">
                    {/* @ts-ignore - Supabase types join count is tricky */}
                   {event.results?.[0]?.count || 0}
                </span>
                <span className="text-xs text-slate-500">Eredmények</span>
              </div>
            </div>
          </Link>
        ))}
        {events?.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
                Nincsenek versenyek. Hozz létre egyet a kezdéshez.
            </div>
        )}
      </div>
    </div>
  )
}
