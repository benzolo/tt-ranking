'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createPlayer, updatePlayer } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
    >
      {pending ? 'Mentés...' : 'Játékos Mentése'}
    </button>
  )
}

const initialState = {
  message: '',
  errors: undefined,
}

export default function PlayerForm({ player }: { player?: any }) {
  const updatePlayerWithId = player ? updatePlayer.bind(null, player.id) : createPlayer
  // @ts-ignore - Types compatibility with Server Actions in React 19 RC can be tricky
  const [state, formAction] = useActionState(updatePlayerWithId, initialState)

  return (
    <form action={formAction} className="space-y-6 max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Teljes Név</label>
        <input 
          type="text" 
          name="name" 
          id="name" 
          defaultValue={player?.name || ''}
          required
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
        />
        {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="license_id" className="block text-sm font-medium text-slate-700">Engedélyszám</label>
        <input 
          type="text" 
          name="license_id" 
          id="license_id" 
          defaultValue={player?.license_id || ''}
          placeholder="pl., 12345"
          required
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
        />
        {state?.errors?.license_id && <p className="text-red-500 text-xs mt-1">{state.errors.license_id[0]}</p>}
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-slate-700">Nem</label>
        <select 
          name="gender" 
          id="gender" 
          defaultValue={player?.gender || 'Male'}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
        >
          <option value="Male">Férfi</option>
          <option value="Female">Nő</option>
        </select>
         {state?.errors?.gender && <p className="text-red-500 text-xs mt-1">{state.errors.gender[0]}</p>}
      </div>

      <div>
        <label htmlFor="club" className="block text-sm font-medium text-slate-700">Egyesület (Opcionális)</label>
        <input 
          type="text" 
          name="club" 
          id="club" 
          defaultValue={player?.club || ''}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
        />
         {state?.errors?.club && <p className="text-red-500 text-xs mt-1">{state.errors.club[0]}</p>}
      </div>

      <div>
        <label htmlFor="birth_date" className="block text-sm font-medium text-slate-700">Születési Dátum (Opcionális)</label>
        <input 
          type="date" 
          name="birth_date" 
          id="birth_date" 
          defaultValue={player?.birth_date || ''}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
        />
         {state?.errors?.birth_date && <p className="text-red-500 text-xs mt-1">{state.errors.birth_date[0]}</p>}
      </div>
      
      {state?.message && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {state.message}
          </div>
      )}

      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  )
}
