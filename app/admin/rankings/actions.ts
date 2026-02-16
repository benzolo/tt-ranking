'use server'

import { requireRole } from '@/utils/supabase/roles'
import { generateRankingSnapshot } from '@/utils/ranking-snapshots'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createRankingSnapshot() {
  await requireRole(['superadmin'])
  
  await generateRankingSnapshot()
  
  revalidatePath('/')
  revalidatePath('/admin')
  
  redirect('/admin')
}
