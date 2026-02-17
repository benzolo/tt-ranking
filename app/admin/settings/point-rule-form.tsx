'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { createPointRule } from './actions'
import { useRef } from 'react'
import { ALLOWED_POSITIONS } from '@/utils/constants'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Add Rule'}
    </button>
  )
}

const initialState = {
  message: '',
  errors: undefined,
}

export default function PointRuleForm() {
  const formRef = useRef<HTMLFormElement>(null)
  // @ts-ignore
  const [state, formAction] = useActionState(createPointRule, initialState)

  useEffect(() => {
    // If successful (no errors) and we have a result that implies success (or just no errors), reset form.
    // However, our action returns void/redirect on success usually, BUT for this one I returned { message } on strict failure.
    // Wait, createPointRule returns `revalidatePath` but doesn't return an object on success? 
    // It implicitly returns `undefined`.
    if (!state?.errors && !state?.message) {
       formRef.current?.reset()
    }
  }, [state])

  return (
    <form 
      action={formAction}
      ref={formRef}
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8"
    >
      <h3 className="text-lg font-medium text-slate-900 mb-4">Add New Point Rule</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="event_type" className="block text-sm font-medium text-slate-700">Event Type</label>
          <select 
            name="event_type" 
            id="event_type" 
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
          >
            <option value="OB">OB</option>
            <option value="I. osztály">I. osztály</option>
            <option value="II. osztály">II. osztály</option>
            <option value="TOP">TOP</option>
            <option value="Megye">Megye</option>
          </select>
        </div>

        <div>
           <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category</label>
            <select 
            name="category" 
            id="category" 
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
            >
            <option value="Egyes">Egyes</option>
            <option value="Páros">Páros</option>
            </select>
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-slate-700">Position</label>
          <select 
            name="position" 
            id="position" 
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
          >
            {ALLOWED_POSITIONS.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        <div>
           <label htmlFor="points" className="block text-sm font-medium text-slate-700">Points</label>
          <input 
            type="number" 
            name="points" 
            id="points" 
            min="0"
            required
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2 border"
          />
        </div>
      </div>
      
      {state?.message && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {state.message}
          </div>
      )}

      <div className="pt-4 text-right">
        <SubmitButton />
      </div>
    </form>
  )
}
