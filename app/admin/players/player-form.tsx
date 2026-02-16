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
      {pending ? 'Saving...' : 'Save Player'}
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
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
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
        <label htmlFor="gender" className="block text-sm font-medium text-slate-700">Gender</label>
        <select 
          name="gender" 
          id="gender" 
          defaultValue={player?.gender || 'Male'}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
         {state?.errors?.gender && <p className="text-red-500 text-xs mt-1">{state.errors.gender[0]}</p>}
      </div>

      <div>
        <label htmlFor="club" className="block text-sm font-medium text-slate-700">Club (Optional)</label>
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
        <label htmlFor="birth_date" className="block text-sm font-medium text-slate-700">Date of Birth (Optional)</label>
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
