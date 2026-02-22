'use client'

import { useFormStatus } from 'react-dom'
import { addResult, addQuickPlayer } from '../actions'
import { useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ALLOWED_POSITIONS } from '@/utils/constants'
import { useRouter } from 'next/navigation'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
    >
      {pending ? 'Mentés...' : 'Eredmény Hozzáadása'}
    </button>
  )
}

export default function ResultForm({ eventId, players, enabledCategories }: { 
  eventId: string, 
  players: any[],
  enabledCategories: string[]
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmittingPlayer, setIsSubmittingPlayer] = useState(false)
  const [playerError, setPlayerError] = useState('')
  
  return (
    <form 
      action={async (formData) => {
        await addResult(eventId, null, formData); 
        formRef.current?.reset();
      }} 
      ref={formRef}
      className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-200"
    >
      <div className="flex justify-between items-center">
         <h3 className="text-lg font-medium text-slate-900">Játékos Eredmény Rögzítése</h3>
         <button 
            type="button" 
            onClick={() => setIsModalOpen(true)}
            className="text-sm border border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
         >
            + Új Játékos Rögzítése
         </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="player_id" className="block text-sm font-medium text-slate-700">Játékos</label>
          <select 
            name="player_id" 
            id="player_id" 
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
          >
            <option value="">Válassz játékost...</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({player.license_id ? `${player.license_id}, ` : ''}{player.club || 'Nincs egyesület'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">Kategória</label>
          <select 
            name="category" 
            id="category" 
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
          >
            {enabledCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-slate-700">Helyezés</label>
          <select 
            name="position" 
            id="position" 
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
          >
             {ALLOWED_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        <div>
           <label htmlFor="points" className="block text-sm font-medium text-slate-700">Pont (Opcionális)</label>
          <input 
            type="number" 
            name="points" 
            id="points" 
            min="0"
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
            placeholder="Automatikusan számolva"
          />
        </div>
      </div>

      <div className="pt-2 text-right">
        <SubmitButton />
      </div>

      {/* Add Player Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-800">Új Játékos Hozzáadása</h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               </div>
               
               <div className="p-6">
                  {playerError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{playerError}</div>}
                  
                  <form 
                     onSubmit={async (e) => {
                        e.preventDefault()
                        setIsSubmittingPlayer(true)
                        setPlayerError('')
                        const formData = new FormData(e.currentTarget)
                        
                        try {
                           const res = await addQuickPlayer(formData)
                           if (res.error) {
                              setPlayerError(res.error)
                           } else {
                              setIsModalOpen(false)
                              router.refresh()
                              // Optionally logic to select the newly created player could go here
                           }
                        } catch (err) {
                           setPlayerError('Váratlan hiba történt.')
                        } finally {
                           setIsSubmittingPlayer(false)
                        }
                     }}
                     className="space-y-4"
                  >
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Név *</label>
                        <input type="text" name="name" required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Licensz ID *</label>
                        <input type="text" name="license_id" required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Nem *</label>
                           <select name="gender" required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border bg-white">
                              <option value="Male">Férfi</option>
                              <option value="Female">Női</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Születési Dátum</label>
                           <input type="date" name="birth_date" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Egyesület</label>
                        <input type="text" name="club" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border" />
                     </div>
                     
                     <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                           Mégsem
                        </button>
                        <button type="submit" disabled={isSubmittingPlayer} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                           {isSubmittingPlayer ? 'Mentés...' : 'Játékos Mentése'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      )}
    </form>
  )
}
