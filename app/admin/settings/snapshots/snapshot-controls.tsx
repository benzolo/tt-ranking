'use client'

import { useState } from 'react'
import { generateSnapshotAction, toggleVisibilityAction, downloadCsvAction } from './actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SnapshotControls() {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setMessage('')
        const res = await generateSnapshotAction(formData)
        setIsLoading(false)
        setMessage(res.message)
    }

    return (
        <form action={handleSubmit} className="flex flex-wrap gap-4 items-end">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Megnevezés (opcionális)</label>
                <input 
                    type="text" 
                    name="snapshotName" 
                    placeholder="Pl. 1. Hét"
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-48"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nem</label>
                <select name="gender" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="Both">Mindkettő (Batch)</option>
                    <option value="Male">Férfi</option>
                    <option value="Female">Nő</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Korosztály</label>
                <select name="category" className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="All">Összes (Batch)</option>
                    <option value="Senior">Felnőtt (Senior)</option>
                    <option value="U19">U19</option>
                    <option value="U15">U15</option>
                    <option value="U13">U13</option>
                    <option value="U11">U11</option>
                </select>
            </div>
            <button 
                type="submit" 
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
                {isLoading ? 'Generálás...' : 'Mentés Generálása'}
            </button>
            {message && <span className="text-sm text-slate-600 ml-2 animate-pulse">{message}</span>}
        </form>
    )
}
