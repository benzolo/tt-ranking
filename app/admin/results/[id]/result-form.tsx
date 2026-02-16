'use client'

import { useFormStatus } from 'react-dom'
import { addResult } from '../actions'
import { useRef } from 'react'
import { createClient } from '@/utils/supabase/client' // Use client-side client if needed for validtion, but actions use server.

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
    >
      {pending ? 'Adding...' : 'Add Result'}
    </button>
  )
}

export default function ResultForm({ eventId, players }: { eventId: string, players: any[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  
  return (
    <form 
      action={async (formData) => {
        await addResult(eventId, null, formData); // We ignore state for now
        formRef.current?.reset();
      }} 
      ref={formRef}
      className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200"
    >
      <h3 className="text-lg font-medium text-slate-900">Add Player Result</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="player_id" className="block text-sm font-medium text-slate-700">Player</label>
          <select 
            name="player_id" 
            id="player_id" 
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
          >
            <option value="">Select a player...</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.club || 'No Club'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-slate-700">Position</label>
          <input 
            type="number" 
            name="position" 
            id="position" 
            min="1"
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
          />
        </div>

        <div>
           <label htmlFor="points" className="block text-sm font-medium text-slate-700">Points (Optional Override)</label>
          <input 
            type="number" 
            name="points" 
            id="points" 
            min="0"
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
            placeholder="Auto-calculated if empty"
          />
        </div>
      </div>

      <div className="pt-2 text-right">
        <SubmitButton />
      </div>
    </form>
  )
}
