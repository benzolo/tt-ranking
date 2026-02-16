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
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400">TT Ranking</h1>
          <p className="text-xs text-slate-400 mt-1">Admin Dashboard ({role})</p>
        </div>
        
        <nav className="mt-6 px-4 space-y-2 flex-1">
          <Link href="/admin" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
            Dashboard
          </Link>
          
          {(role === 'admin' || role === 'superadmin') && (
            <>
              <Link href="/admin/players" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                Players
              </Link>
              <Link href="/admin/results" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                Results Entry
              </Link>
            </>
          )}

          {role === 'superadmin' && (
            <>
              <Link href="/admin/events" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                Events
              </Link>
              <Link href="/admin/settings" className="block px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                Point Settings
              </Link>
            </>
          )}
        </nav>

        <div className="p-6">
           <Link href="/" className="block px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            &larr; Back to Public Site
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
