import { createClient } from '@/utils/supabase/server'
import EventForm from '../event-form'
import { notFound } from 'next/navigation'

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: event } = await supabase.from('events').select('*').eq('id', params.id).single()

  if (!event) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Event</h1>
      <EventForm event={event} />
    </div>
  )
}
