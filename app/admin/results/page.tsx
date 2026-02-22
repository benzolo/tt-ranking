import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function ResultsEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const ageCategory = typeof params.ageCategory === 'string' ? params.ageCategory : ''
  const typeFilter = typeof params.type === 'string' ? params.type : ''
  
  // Fetch events with a count of results to show progress
  let query = supabase
    .from('events')
    .select('*, results(count)')
    .order('date', { ascending: false })

  if (ageCategory) query = query.eq('age_category', ageCategory)
  if (typeFilter) query = query.eq('type', typeFilter)

  const { data: events, error } = await query

  if (error) {
    return <div>Error loading events</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Eredmények Rögzítése</h1>
      <FilterForm defaultAge={ageCategory} defaultType={typeFilter} />
      <p className="text-slate-500 mb-8 mt-4">Válassz egy versenyt az eredmények kezeléséhez.</p>

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

function FilterForm({ defaultAge, defaultType }: { defaultAge: string, defaultType: string }) {
    return (
        <form className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-end">
             <div>
                <label htmlFor="ageCategory" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Korosztály</label>
                <select 
                    name="ageCategory" 
                    id="ageCategory"
                    defaultValue={defaultAge}
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
            <div>
                 <label htmlFor="type" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Típus</label>
                 <select 
                    name="type" 
                    id="type"
                    defaultValue={defaultType}
                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 py-2 border"
                >
                    <option value="">Összes</option>
                    <option value="Kiemelt">Kiemelt</option>
                    <option value="Országos">Országos</option>
                    <option value="II. osztály">II. osztály</option>
                    <option value="Regionális">Regionális</option>
                </select>
            </div>
            <div className="flex gap-2">
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Szűrés
                </button>
            </div>
        </form>
    )
}
