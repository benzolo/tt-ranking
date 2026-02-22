import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import ResultForm from './result-form'
import ResultsTable from './results-table'
import { recalculateEventPoints } from '../actions'

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

  // Parse max age constraint
  const isUCategory = event.age_category && event.age_category !== 'Senior' && event.age_category.startsWith('U');
  const maxAllowedAge = isUCategory ? parseInt(event.age_category.replace('U', ''), 10) : null;
  const currentYear = new Date().getFullYear();

  // Filter players for the dropdown based on event constraints
  const validPlayers = allPlayers?.filter(player => {
      // Filter by gender if the event is strictly Male or Female
      if (event.gender && event.gender !== 'Both' && player.gender !== event.gender) {
          return false;
      }
      
      // Filter by age category limit only if it is a U-category
      if (isUCategory && maxAllowedAge !== null && player.birth_date) {
          const birthYear = new Date(player.birth_date).getFullYear()
          const playerAge = currentYear - birthYear;
          if (playerAge > maxAllowedAge) {
              return false;
          }
      }
      
      // If none of the negative filters matched, include the player
      return true;
  }) || [];

  // Fetch existing results for this event
  const { data: results } = await supabase
    .from('results')
    .select('*, players(*)')
    .eq('event_id', id)
    
    .eq('event_id', id)
    
  // Sort by position by default for initial render
  const initialResults = results?.sort((a, b) => {
     return a.position.localeCompare(b.position, undefined, { numeric: true, sensitivity: 'base' })
  }) || []

  const enabledCategories = []
  if (event.has_egyes) enabledCategories.push('Egyes')
  if (event.has_paros) enabledCategories.push('Páros')
  if (event.has_vegyes) enabledCategories.push('Vegyes')
  if (event.has_csapat) enabledCategories.push('Csapat')

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
              {event.has_csapat && <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md text-xs font-medium">Csapat</span>}
            </div>
         </div>
      </div>

      <ResultForm eventId={event.id} players={validPlayers} enabledCategories={enabledCategories} />

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
        
        <ResultsTable initialResults={initialResults} eventId={id} />
      </div>
    </div>
  )
}
