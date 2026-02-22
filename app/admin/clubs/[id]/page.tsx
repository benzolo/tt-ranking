import ClubForm from '../club-form'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireRole } from '@/utils/supabase/roles'

export default async function EditClubPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()
  const { id } = await params
  
  const { data: club } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .single()

  if (!club) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/clubs" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mb-4 inline-block">
          ← Vissza az egyesületekhez
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Egyesület Szerkesztése</h1>
      </div>
      <ClubForm club={club} />
    </div>
  )
}
