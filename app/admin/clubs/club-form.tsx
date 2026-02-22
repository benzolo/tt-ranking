'use client'

import { useActionState } from 'react'
import { createClub, updateClub } from './actions'

const initialState = {
  message: '',
  errors: {}
}

export default function ClubForm({ club }: { club?: { id: string, name: string } }) {
  const isEditing = !!club

  const formAction = isEditing 
    ? updateClub.bind(null, club.id) 
    : createClub

  // @ts-ignore
  const [state, action, isPending] = useActionState(formAction, initialState)

  return (
    <form action={action} className="space-y-6 max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Egyesület Neve</label>
        <input 
          type="text" 
          name="name" 
          id="name" 
          defaultValue={club?.name || ''}
          required
          placeholder="Pl. MOATSZ"
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
        />
        {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
      </div>

      {state?.message && !state?.errors?.name && (
        <p className="text-red-500 text-sm">{state.message}</p>
      )}

      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Mentés...' : (isEditing ? 'Egyesület Frissítése' : 'Egyesület Létrehozása')}
        </button>
      </div>
    </form>
  )
}
