import { getRankingsWithHistory, getLatestSnapshotDate, getPublicSnapshotDates } from '@/utils/ranking-snapshots'
import Link from 'next/link'
import Image from 'next/image'
import SnapshotSelector from '@/components/snapshot-selector'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; snapshot?: string }>
}) {
  const params = await searchParams
  const categoryValid = params.category || 'Felnőtt'
  const snapshotDate = params.snapshot
  
  // Map UI category to Database category
  const categoryDb = categoryValid === 'Felnőtt' ? 'Senior' : categoryValid

  // Fetch available snapshot dates for selectors
  const maleSnapshotDates = await getPublicSnapshotDates('Male', categoryDb)
  const femaleSnapshotDates = await getPublicSnapshotDates('Female', categoryDb)

  const rankingsMale = await getRankingsWithHistory('Male', categoryDb, snapshotDate)
  const rankingsFemale = await getRankingsWithHistory('Female', categoryDb, snapshotDate)

  const lastUpdated = await getLatestSnapshotDate()

  const RankingTable = ({ title, data }: { title: string, data: any[] }) => (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex-1 min-w-[300px] hover:border-emerald-500/30 transition-colors duration-500">
      <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-xl font-black text-white italic tracking-tight uppercase">{title}</h3>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{categoryValid}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
            <tr>
              <th className="px-4 py-4 text-center w-12">#</th>
              <th className="px-4 py-4 w-16">Változás</th>
              <th className="px-4 py-4">Játékos</th>
              <th className="px-4 py-4">Egyesület</th>
              <th className="px-4 py-4 text-center">Verseny</th>
              <th className="px-6 py-4 text-right">Pont</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-500 font-medium italic text-sm">
                        Nincs adat ebben a kategóriában.
                    </td>
                </tr>
            ) : (
                data.map((player) => (
                <tr key={player.playerId} className="group hover:bg-emerald-500/5 transition-all duration-300 border-l-2 border-transparent hover:border-emerald-500">
                    <td className="px-4 py-3 text-center">
                      <span className={`${
                        player.rankPosition === 1 ? 'text-yellow-400 text-lg drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 
                        player.rankPosition === 2 ? 'text-slate-300 text-base' :
                        player.rankPosition === 3 ? 'text-amber-600 text-base' :
                        'text-slate-500 font-bold text-sm'
                      }`}>
                        {player.rankPosition}.
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {player.rankChange === 'up' && (
                        <span className="flex items-center gap-1 text-emerald-400 font-black text-[10px]">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M12 17a1 1 0 01-1-1V5.414l-4.293 4.293a1 1 0 01-1.414-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L13 5.414V16a1 1 0 01-1 1z" clipRule="evenodd" />
                          </svg>
                          {player.rankDifference}
                        </span>
                      )}
                      {player.rankChange === 'down' && (
                        <span className="flex items-center gap-1 text-rose-500 font-black text-[10px]">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M8 3a1 1 0 011 1v10.586l4.293-4.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L7 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          {player.rankDifference}
                        </span>
                      )}
                      {player.rankChange === 'same' && (
                        <span className="text-slate-700 flex justify-center w-6 text-[10px]">−</span>
                      )}
                      {player.rankChange === 'new' && (
                        <span className="bg-blue-500/10 text-blue-400 text-[9px] px-1.5 py-0.5 rounded-full font-black border border-blue-500/20">ÚJ</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/player/${player.playerId}`} className="font-bold text-white group-hover:text-emerald-400 transition-colors text-sm">
                        {player.playerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-medium text-xs">
                      {player.club || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold text-[10px]">
                        {player.eventsCount}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-black text-emerald-400 text-sm tracking-tight">
                      {player.totalPoints}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 flex flex-col relative overflow-hidden">
      
      {/* Dynamic Background with Neon Curves */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),rgba(15,23,42,1))]"></div>
        <svg className="absolute w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'rgb(16,185,129)', stopOpacity:0.8}} />
                    <stop offset="100%" style={{stopColor:'rgb(59,130,246)', stopOpacity:0.8}} />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <path d="M0,1000 C300,900 400,700 200,500 S 600,100 1000,0" stroke="url(#grad1)" strokeWidth="2" fill="none" filter="url(#glow)" className="animate-[pulse_8s_ease-in-out_infinite]" />
            <path d="M-100,1000 C200,800 500,600 800,400 S 1100,200 1400,0" stroke="rgba(59,130,246,0.5)" strokeWidth="1" fill="none" filter="url(#glow)" className="animate-[pulse_12s_ease-in-out_infinite_reverse]" />
            <path d="M0,800 C400,800 600,600 800,200 S 1000,100 1200,0" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" fill="none" filter="url(#glow)" className="animate-[pulse_10s_ease-in-out_infinite]" />
        </svg>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen opacity-50"></div>
        
        {/* Racket Image Overlay - Positioned subtly */}
        <div className="absolute -top-20 -right-20 opacity-20 rotate-12 transform scale-125 pointer-events-none">
            <Image src="/hero-racket.png" alt="" width={800} height={800} className="object-contain drop-shadow-[0_0_50px_rgba(16,185,129,0.3)]" priority />
        </div>
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/30">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    <circle cx="12" cy="12" r="4" />
                </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-white via-slate-200 to-emerald-200 bg-clip-text text-transparent italic tracking-tighter uppercase leading-[0.85] drop-shadow-sm">
                Asztalitenisz<br/>
                <span className="text-emerald-400 text-lg not-italic tracking-widest font-bold">Ranglista</span>
              </h1>
            </div>
          </div>
          <Link href="/login" className="text-xs font-black text-emerald-400 hover:text-white transition-all border border-emerald-500/30 bg-emerald-500/10 px-6 py-2.5 rounded-xl hover:bg-emerald-500 hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] tracking-wider">
            ADMIN BELÉPÉS
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-12 flex-grow w-full z-10">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
             <div>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-lg">
                    Ranglisták
                </h2>
                <div className="flex items-center gap-3 text-sm text-emerald-100/80 bg-emerald-900/30 px-4 py-1.5 rounded-full border border-emerald-500/20 w-fit backdrop-blur-sm">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></span>
                    <span className="font-bold tracking-wide uppercase text-[10px]">Hivatalos élő állás</span>
                </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl p-2 rounded-2xl border border-slate-700/50 shadow-2xl flex items-center gap-2">
            <form className="flex gap-2">
                <div className="relative group">
                    <select 
                        name="category" 
                        defaultValue={categoryValid}
                        className="appearance-none bg-slate-800 border border-slate-600 text-slate-100 font-bold rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10 pl-5 py-3 outline-none cursor-pointer hover:bg-slate-700 transition-colors shadow-inner min-w-[160px]"
                    >
                        <option value="Felnőtt">Felnőtt (Senior)</option>
                        <option value="U19">U19</option>
                        <option value="U15">U15</option>
                        <option value="U13">U13</option>
                        <option value="U11">U11</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 group-hover:text-emerald-400 transition-colors">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>

                <button type="submit" className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-xl text-sm font-black hover:from-emerald-400 hover:to-emerald-500 transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.4)] uppercase tracking-wider hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] border border-emerald-400/20">
                    Keresés
                </button>
            </form>
            </div>
        </div>

        {lastUpdated && (
            <div className="mb-8 flex justify-end">
                <span className="px-4 py-1.5 text-[10px] font-bold text-emerald-300 uppercase tracking-[0.2em] bg-emerald-950/50 rounded-full border border-emerald-500/30 backdrop-blur-sm shadow-lg shadow-emerald-900/20">
                Utolsó frissítés: {new Date(lastUpdated).toLocaleDateString('hu-HU')}
                </span>
            </div>
        )}

        {/* Ranking Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Male Column */}
            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-end items-center flex-wrap gap-4">
                <SnapshotSelector dates={maleSnapshotDates} />
              </div>
              <RankingTable title="Férfi" data={rankingsMale} />
            </div>

            {/* Female Column */}
            <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-end items-center flex-wrap gap-4">
                <SnapshotSelector dates={femaleSnapshotDates} />
              </div>
              <RankingTable title="Női" data={rankingsFemale} />
            </div>
        </div>
        
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-md z-10 py-12 mt-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
                <div className="text-2xl font-black text-slate-700 italic tracking-tighter uppercase mb-1">ARL</div>
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} Asztalitenisz Ranglista</div>
            </div>
            <div className="flex flex-wrap justify-center gap-8 bg-slate-900/50 px-8 py-4 rounded-2xl border border-slate-800/50">
                <a href="#" className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 transition-colors uppercase tracking-widest hover:underline decoration-emerald-500/50 underline-offset-4">Adatvédelmi tájékoztató</a>
                <a href="https://moatsz.hu" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-slate-400 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-2 hover:underline decoration-blue-500/50 underline-offset-4">
                    Magyar Asztalitenisz Szövetség
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                </a>
            </div>
        </div>
      </footer>
    </div>
  )
}
