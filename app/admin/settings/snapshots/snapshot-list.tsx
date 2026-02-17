'use client'

import { toggleVisibilityAction, downloadCsvAction } from './actions'
import { useState } from 'react'
import Link from 'next/link'

export default function SnapshotList({ snapshots }: { snapshots: any[] }) {
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

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
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
