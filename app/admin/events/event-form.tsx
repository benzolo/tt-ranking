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
      {pending ? 'Saving...' : 'Save Event'}
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
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Event Name</label>
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
        <label htmlFor="type" className="block text-sm font-medium text-slate-700">Event Type</label>
        <select 
          name="type" 
          id="type" 
          defaultValue={event?.type || 'Tournament'}
          className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
        >
          <option value="Tournament">Tournament</option>
          <option value="League">League</option>
        </select>
         {state?.errors?.type && <p className="text-red-500 text-xs mt-1">{state.errors.type[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700">Date</label>
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
           <label htmlFor="validity_date" className="block text-sm font-medium text-slate-700">Validity Date</label>
          <input 
            type="date" 
            name="validity_date" 
            id="validity_date" 
            defaultValue={event?.validity_date || ''}
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
          />
          <p className="text-xs text-slate-500 mt-1">Usually 52 weeks after event date.</p>
           {state?.errors?.validity_date && <p className="text-red-500 text-xs mt-1">{state.errors.validity_date[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
           <label htmlFor="age_category" className="block text-sm font-medium text-slate-700">Age Category</label>
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
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category</label>
            <select 
            name="category" 
            id="category" 
            defaultValue={event?.category || 'Singles'}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
            >
            <option value="Singles">Singles</option>
            <option value="Doubles">Doubles</option>
            <option value="Mixed">Mixed Doubles</option>
            </select>
             {state?.errors?.category && <p className="text-red-500 text-xs mt-1">{state.errors.category[0]}</p>}
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
