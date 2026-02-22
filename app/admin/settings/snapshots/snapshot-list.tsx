'use client'

import { toggleVisibilityAction, downloadCsvAction, renameSnapshotAction } from './actions'
import { useState } from 'react'
import Link from 'next/link'

export default function SnapshotList({ snapshots }: { snapshots: any[] }) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')

    const handleToggle = async (id: string, currentStatus: boolean) => {
        await toggleVisibilityAction(id, !currentStatus)
    }

    const handleDownload = async (id: string, filenameBase: string) => {
        const res = await downloadCsvAction(id)
        if (res.success && res.data) {
             const blob = new Blob([res.data], { type: 'text/csv' });
             const url = window.URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = res.filename || `${filenameBase}.csv`;
             a.click();
             window.URL.revokeObjectURL(url);
        } else {
            alert('Hiba a letöltés során')
        }
    }

    const startEditing = (id: string, currentName: string | null) => {
        setEditingId(id)
        setEditName(currentName || '')
    }

    const handleRename = async (id: string) => {
        if (editName.trim() === '') {
            await renameSnapshotAction(id, null)
        } else {
            await renameSnapshotAction(id, editName)
        }
        setEditingId(null)
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditName('')
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Megnevezés</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dátum</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nem</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Kategória</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Létszám</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Publikus</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Műveletek</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {snapshots.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold group">
                                {editingId === s.id ? (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRename(s.id)
                                                if (e.key === 'Escape') cancelEditing()
                                            }}
                                            className="border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-32"
                                            autoFocus
                                        />
                                        <button onClick={() => handleRename(s.id)} className="text-emerald-600 hover:text-emerald-800" title="Mentés">
                                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        </button>
                                        <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-600" title="Mégsem">
                                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-4">
                                        <span>{s.name || <span className="text-slate-400 font-normal italic">Nincs név</span>}</span>
                                        <button 
                                            onClick={() => startEditing(s.id, s.name)} 
                                            className="text-slate-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Átnevezés"
                                        >
                                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                                {new Date(s.snapshot_date).toLocaleString('hu-HU')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-slate-900">
                                {s.gender === 'Male' ? 'Férfi' : 'Nő'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-slate-900">
                                {s.age_category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">
                                {s.playerCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <button
                                    onClick={() => handleToggle(s.id, s.is_public)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                        s.is_public ? 'bg-emerald-600' : 'bg-slate-200'
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            s.is_public ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3 items-center">
                                <Link 
                                    href={`/admin/settings/snapshots/${s.id}/preview`}
                                    className="text-indigo-600 hover:text-indigo-900 font-bold"
                                >
                                    Előnézet
                                </Link>
                                <button 
                                    onClick={() => handleDownload(s.id, `${s.gender}_${s.age_category}_${s.snapshot_date}`)}
                                    className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
                                >
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    CSV
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
