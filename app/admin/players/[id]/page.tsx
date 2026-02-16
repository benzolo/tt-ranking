import { createClient } from '@/utils/supabase/server'
import PlayerForm from '../player-form'
import { notFound } from 'next/navigation'

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: player } = await supabase.from('players').select('*').eq('id', id).single()

  if (!player) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Player</h1>
      <PlayerForm player={player} />
    </div>
  )
}
