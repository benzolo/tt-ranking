import { getUserRole } from '@/utils/supabase/roles'
import Link from 'next/link'

// ...

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const role = await getUserRole()
  
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400">Asztalitenisz<br/>Ranglista</h1>
          <p className="text-xs text-slate-400 mt-1">Adminisztrációs Pult ({role})</p>
        </div>
        
        <nav className="mt-6 px-4 space-y-2 flex-1">
          <Link href="/admin" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            Vezérlőpult
          </Link>
          
          {(role === 'admin' || role === 'superadmin') && (
            <>
              <Link href="/admin/players" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                Játékosok
              </Link>
              <Link href="/admin/clubs" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                Egyesületek
              </Link>
              <Link href="/admin/results" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                Eredmények Rögzítése
              </Link>
            </>
          )}

          {role === 'superadmin' && (
            <>
              <Link href="/admin/events" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                Versenyek
              </Link>
              <Link href="/admin/settings" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                Pont Beállítások
              </Link>
              <Link href="/admin/settings/snapshots" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                Ranglista Mentések
              </Link>
            </>
          )}
        </nav>

        <div className="p-6">
           <Link href="/" className="block px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            &larr; Vissza a Publikus Oldalra
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
