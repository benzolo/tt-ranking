'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { createEvent, updateEvent } from './actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
    >
      {pending ? 'Mentés...' : 'Verseny Mentése'}
    </button>
  )
}

const initialState = {
  message: '',
  errors: undefined,
}

export default function EventForm({ event }: { event?: any }) {
  const updateEventWithId = event ? updateEvent.bind(null, event.id) : createEvent
  // @ts-ignore
  const [state, formAction] = useActionState(updateEventWithId, initialState)

  return (
    <form action={formAction} className="space-y-6 max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Verseny Neve</label>
        <input 
          type="text" 
          name="name" 
          id="name" 
          defaultValue={event?.name || ''}
          required
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
        />
        {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-700">Verseny Típusa</label>
        <select 
          name="type" 
          id="type" 
          defaultValue={event?.type || 'OB'}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
        >
          <option value="OB">OB</option>
          <option value="I. osztály">I. osztály</option>
          <option value="II. osztály">II. osztály</option>
          <option value="TOP">TOP</option>
          <option value="Megye">Megye</option>
        </select>
         {state?.errors?.type && <p className="text-red-500 text-xs mt-1">{state.errors.type[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700">Dátum</label>
          <input 
            type="date" 
            name="date" 
            id="date" 
            defaultValue={event?.date || ''}
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
          />
           {state?.errors?.date && <p className="text-red-500 text-xs mt-1">{state.errors.date[0]}</p>}
        </div>

        <div>
           <label htmlFor="validity_date" className="block text-sm font-medium text-slate-700">Érvényességi Dátum</label>
          <input 
            type="date" 
            name="validity_date" 
            id="validity_date" 
            defaultValue={event?.validity_date || ''}
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
          />
          <p className="text-xs text-slate-500 mt-1">Általában 52 héttel a verseny után.</p>
           {state?.errors?.validity_date && <p className="text-red-500 text-xs mt-1">{state.errors.validity_date[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
           <label htmlFor="age_category" className="block text-sm font-medium text-slate-700">Korosztály</label>
            <select 
            name="age_category" 
            id="age_category" 
            defaultValue={event?.age_category || 'Senior'}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
            >
            <option value="Senior">Senior</option>
            <option value="U19">U19</option>
            <option value="U15">U15</option>
            <option value="U13">U13</option>
            <option value="U11">U11</option>
            </select>
             {state?.errors?.age_category && <p className="text-red-500 text-xs mt-1">{state.errors.age_category[0]}</p>}
        </div>

        <div>
           <label htmlFor="gender" className="block text-sm font-medium text-slate-700">Nem</label>
            <select 
            name="gender" 
            id="gender" 
            defaultValue={event?.gender || 'Both'}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
            >
            <option value="Both">Mindkét Nem</option>
            <option value="Male">Férfi</option>
            <option value="Female">Női</option>
            </select>
             {state?.errors?.gender && <p className="text-red-500 text-xs mt-1">{state.errors.gender[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Kategóriák</label>
          <div className="flex flex-wrap gap-6 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="has_egyes" 
                value="true"
                defaultChecked={event?.has_egyes}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700 font-medium">Egyes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="has_paros" 
                value="true"
                defaultChecked={event?.has_paros}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700 font-medium">Páros</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="has_vegyes" 
                value="true"
                defaultChecked={event?.has_vegyes}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700 font-medium">Vegyes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="has_csapat" 
                value="true"
                defaultChecked={event?.has_csapat}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700 font-medium">Csapat</span>
            </label>
          </div>
          {(state?.errors?.has_egyes || state?.errors?.has_paros || state?.errors?.has_vegyes || state?.errors?.has_csapat) && (
            <p className="text-red-500 text-xs mt-1">Válassz legalább egy kategóriát.</p>
          )}
        </div>
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
