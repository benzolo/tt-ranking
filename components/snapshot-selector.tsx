'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function SnapshotSelector({ dates }: { dates: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSnapshot = searchParams.get('snapshot') || ''

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set('snapshot', e.target.value)
    } else {
      params.delete('snapshot')
    }
    router.push(`/?${params.toString()}`)
  }

  if (dates.length === 0) return null

  return (
    <div className="mb-6 flex items-center justify-end gap-2">
      <label htmlFor="snapshot-select" className="text-slate-400 text-sm font-medium">
        Ranglista dátuma:
      </label>
      <div className="relative">
        <select
          id="snapshot-select"
          value={currentSnapshot}
          onChange={handleChange}
          className="appearance-none bg-slate-900/50 border border-slate-700 text-slate-200 text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none backdrop-blur-sm transition-all hover:bg-slate-800/50"
        >
          <option value="">Legfrissebb (Aktuális)</option>
          {dates.map((date) => (
            <option key={date} value={date}>
              {new Date(date).toLocaleString('hu-HU')}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
