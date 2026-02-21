'use client'

import { useState, useMemo, useEffect } from 'react'
import { deleteResult } from '../actions'

type Player = {
    id: string
    name: string
    club?: string
}

type Result = {
    id: string
    position: string
    category: string
    points: number
    players?: Player
    [key: string]: any 
}

type SortConfig = {
    key: string
    direction: 'asc' | 'desc'
}

export default function ResultsTable({ 
    initialResults, 
    eventId 
}: { 
    initialResults: Result[], 
    eventId: string 
}) {
    const [results, setResults] = useState<Result[]>(initialResults)
    const [filterPlayer, setFilterPlayer] = useState('')

    useEffect(() => {
        setResults(initialResults)
    }, [initialResults])
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    }

    const filteredAndSortedResults = useMemo(() => {
        let items = [...results];

        // Filter
        if (filterPlayer) {
            const lowerFilter = filterPlayer.toLowerCase();
            items = items.filter(item => 
                item.players?.name.toLowerCase().includes(lowerFilter) ||
                item.players?.club?.toLowerCase().includes(lowerFilter)
            );
        }

        // Sort
        if (sortConfig) {
            items.sort((a, b) => {
                let aValue: any = a[sortConfig.key];
                let bValue: any = b[sortConfig.key];

                // Handle nested player properties
                if (sortConfig.key === 'player_name') {
                    aValue = a.players?.name || '';
                    bValue = b.players?.name || '';
                } else if (sortConfig.key === 'club') {
                    aValue = a.players?.club || '';
                    bValue = b.players?.club || '';
                }

                if (sortConfig.key === 'position') {
                     // Numeric comparison for position strings
                     return sortConfig.direction === 'asc' 
                        ? a.position.localeCompare(b.position, undefined, { numeric: true, sensitivity: 'base' })
                        : b.position.localeCompare(a.position, undefined, { numeric: true, sensitivity: 'base' });
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        } else {
             // Default sort by position asc
             items.sort((a, b) => {
                return a.position.localeCompare(b.position, undefined, { numeric: true, sensitivity: 'base' })
             })
        }

        return items;
    }, [results, filterPlayer, sortConfig]);

    const handleDelete = async (resultId: string) => {
        if (confirm('Biztosan törölni szeretnéd ezt az eredményt?')) {
            await deleteResult(eventId, resultId)
            // Ideally we should update state here, but since it's a server action with revalidatePath,
            // the parent page might just refresh. However, for a fully client component experience without 
            // refresh, we'd need to manage state locally or use router.refresh().
            // For now, let's assume the server action handles the revalidation/refresh.
             setResults(prev => prev.filter(r => r.id !== resultId))
        }
    }

    const SortIcon = ({ active, direction }: { active: boolean, direction: 'asc' | 'desc' }) => {
        if (!active) return <span className="text-slate-300 ml-1">↕</span>
        return <span className="text-emerald-600 ml-1">{direction === 'asc' ? '↑' : '↓'}</span>
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900">Jelenlegi Állás</h3>
                  <span className="text-xs text-slate-500">{filteredAndSortedResults.length} találat</span>
                </div>
                
                {/* Filter Input */}
                <input 
                    type="text" 
                    placeholder="Szűrés játékosra..." 
                    className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    value={filterPlayer}
                    onChange={(e) => setFilterPlayer(e.target.value)}
                />
            </div>
            
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24 cursor-pointer hover:bg-slate-50 select-none"
                    onClick={() => handleSort('position')}
                  >
                    Helyezés <SortIcon active={sortConfig?.key === 'position'} direction={sortConfig?.direction || 'asc'} />
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 select-none"
                    onClick={() => handleSort('player_name')}
                  >
                    Játékos <SortIcon active={sortConfig?.key === 'player_name'} direction={sortConfig?.direction || 'asc'} />
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 select-none"
                    onClick={() => handleSort('club')}
                  >
                    Egyesület <SortIcon active={sortConfig?.key === 'club'} direction={sortConfig?.direction || 'asc'} />
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 select-none"
                    onClick={() => handleSort('category')}
                  >
                    Kategória <SortIcon active={sortConfig?.key === 'category'} direction={sortConfig?.direction || 'asc'} />
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 select-none"
                    onClick={() => handleSort('points')}
                  >
                    Pont <SortIcon active={sortConfig?.key === 'points'} direction={sortConfig?.direction || 'asc'} />
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Műveletek</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredAndSortedResults.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">#{result.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {result.players?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {result.players?.club || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            result.category === 'Egyes' ? 'bg-emerald-100 text-emerald-800' : 
                            result.category === 'Páros' ? 'bg-blue-100 text-blue-800' : 
                            result.category === 'Vegyes' ? 'bg-purple-100 text-purple-800' :
                            'bg-orange-100 text-orange-800'
                        }`}>
                            {result.category}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">{result.points} pts</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                            onClick={() => handleDelete(result.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors" 
                            title="Eredmény Eltávolítása"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedResults.length === 0 && (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            {filterPlayer ? 'Nincs találat a szűrő alapján.' : 'Még nincsenek rögzített eredmények.'}
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
        </div>
    )
}
