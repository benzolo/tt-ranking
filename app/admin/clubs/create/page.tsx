import ClubForm from '../club-form'
import Link from 'next/link'
import { requireRole } from '@/utils/supabase/roles'

export default async function CreateClubPage() {
  await requireRole(['admin', 'superadmin'])

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/clubs" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-4 inline-block">
          ← Vissza az egyesületekhez
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Új Egyesület Létrehozása</h1>
      </div>
      <ClubForm />
    </div>
  )
}
