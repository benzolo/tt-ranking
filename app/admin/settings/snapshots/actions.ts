'use server'

import { createClient } from '@/utils/supabase/server'
import { generateRankingSnapshot, SnapshotMetadata } from '@/utils/ranking-snapshots'
import { revalidatePath } from 'next/cache'
import { generateSnapshotCsv } from '@/utils/csv-export'

export async function generateSnapshotAction(formData: FormData) {
  const gender = formData.get('gender') as string
  const category = formData.get('category') as string
  const snapshotName = formData.get('snapshotName') as string | null

  if (!gender || !category) {
    return { success: false, message: 'Gender and Category are required' }
  }

  try {
    const result = await generateRankingSnapshot(gender, category, snapshotName)
    revalidatePath('/admin/settings/snapshots')
    return result
  } catch (error) {
    console.error('Error in generateSnapshotAction:', error)
    return { success: false, message: 'Failed to generate snapshot' }
  }
}

export async function toggleVisibilityAction(id: string, isPublic: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('snapshot_metadata')
    .update({ is_public: isPublic })
    .eq('id', id)

  if (error) {
    console.error('Error toggling visibility:', error)
    return { success: false, message: 'Failed to update visibility' }
  }

  revalidatePath('/admin/settings/snapshots')
  return { success: true, message: `Snapshot is now ${isPublic ? 'Public' : 'Private'}` }
}

export async function downloadCsvAction(id: string) {
    // Note: Server Actions can return simple data, but for file download 
    // it's often better to use a Route Handler. 
    // However, we can return the string content here and let the client handle download blob.
    try {
        const csvContent = await generateSnapshotCsv(id)
        return { success: true, data: csvContent, filename: `ranking_snapshot_${id}.csv` }
    } catch (e) {
        console.error(e)
        return { success: false, message: 'Failed to generate CSV' }
    }
}

export async function renameSnapshotAction(id: string, newName: string | null) {
  const supabase = await createClient()

  // Empty string becomes null mapping
  const cleanedName = newName && newName.trim() !== '' ? newName.trim() : null

  const { error } = await supabase
    .from('snapshot_metadata')
    .update({ name: cleanedName })
    .eq('id', id)

  if (error) {
    console.error('Error renaming snapshot:', error)
    return { success: false, message: 'Failed to rename snapshot' }
  }

  revalidatePath('/admin/settings/snapshots')
  return { success: true, message: 'Snapshot renamed successfully' }
}
