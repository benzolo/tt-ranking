import PlayerForm from '../player-form'
import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/supabase/roles'

export default async function CreatePlayerPage() {
  await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  const { data: clubs } = await supabase
    .from('clubs')
    .select('*')
    .order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Új Játékos Hozzáadása</h1>
      <PlayerForm clubs={clubs || []} />
    </div>
  )
}
