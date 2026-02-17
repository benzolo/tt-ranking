import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import ResultForm from './result-form'
import { deleteResult, recalculateEventPoints } from '../actions'

export default async function EventResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch event details
  const { data: event } = await supabase.from('events').select('*').eq('id', id).single()
  
  if (!event) {
    notFound()
  }

  // Fetch all players for the dropdown
  const { data: allPlayers } = await supabase.from('players').select('*').order('name')

  // Fetch existing results for this event
  const { data: results } = await supabase
    .from('results')
    .select('*, players(*)')
    .eq('event_id', id)
    .order('position', { ascending: true })

  const enabledCategories = []
  if (event.has_egyes) enabledCategories.push('Egyes')
  if (event.has_paros) enabledCategories.push('Páros')
  if (event.has_vegyes) enabledCategories.push('Vegyes')

  return (
    <div className="space-y-8">
      <div>
         <h1 className="text-2xl font-bold text-slate-900">{event.name} Eredmények</h1>
         <div className="text-slate-500 mt-1 flex gap-4 text-sm">
            <span>{new Date(event.date).toLocaleDateString()}</span>
            <span>•</span>
            <span>{event.type}</span>
            <span>•</span>
            <span>{event.age_category}</span>
            <span>•</span>
            <div className="flex gap-2">
              {event.has_egyes && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-xs font-medium">Egyes</span>}
              {event.has_paros && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">Páros</span>}
              {event.has_vegyes && <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-xs font-medium">Vegyes</span>}
            </div>
         </div>
      </div>

      <ResultForm eventId={event.id} players={allPlayers || []} enabledCategories={enabledCategories} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div>
              <h3 className="font-medium text-slate-900">Jelenlegi Állás</h3>
              <span className="text-xs text-slate-500">{results?.length} nevezés</span>
            </div>
            <form action={async () => {
              'use server';
              await recalculateEventPoints(id);
            }}>
              <button 
                type="submit" 
                className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                title="Recalculate all points based on current point table rules"
              >
                Pontok Újraszámítása
              </button>
            </form>
        </div>
        
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-white">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-20">Helyezés</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Játékos</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Egyesület</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kategória</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pont</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Műveletek</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {results?.map((result) => (
              <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">#{result.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {/* @ts-ignore */}
                    {result.players?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                     {/* @ts-ignore */}
                    {result.players?.club || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.category === 'Egyes' ? 'bg-emerald-100 text-emerald-800' : 
                        result.category === 'Páros' ? 'bg-blue-100 text-blue-800' : 
                        'bg-purple-100 text-purple-800'
                    }`}>
                        {result.category}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">{result.points} pts</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <form action={async () => {
                      'use server';
                      await deleteResult(id, result.id);
                  }}>
                    <button type="submit" className="text-slate-400 hover:text-red-600 transition-colors" title="Eredmény Eltávolítása">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {results?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        Még nincsenek rögzített eredmények. Használd a fenti űrlapot játékosok hozzáadásához.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
