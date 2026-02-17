'use client'

import { useState } from 'react'

type DeleteWithConfirmationProps = {
  id: string
  entityName: string
  // Returns result count or null/undefined
  checkAction: (id: string) => Promise<number | { count: number } | undefined | null>
  deleteAction: (id: string) => Promise<void | { message?: string }>
}

export default function DeleteWithConfirmation({ 
  id, 
  entityName, 
  checkAction, 
  deleteAction 
}: DeleteWithConfirmationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [resultCount, setResultCount] = useState<number>(0)

  const initiateDelete = async () => {
    setIsChecking(true)
    try {
      const result = await checkAction(id)
      // Handle different possible return types from server actions
      let count = 0
      if (typeof result === 'number') {
        count = result
      } else if (result && typeof result === 'object' && 'count' in result) {
        count = result.count
      }
      setResultCount(count)
      setIsOpen(true)
    } catch (error) {
      console.error('Failed to check results', error)
      // Fallback: just show modal with 0 results or handle error? 
      // Let's show modal assuming 0 so user can still try to delete or cancel
      setResultCount(0)
      setIsOpen(true)
    } finally {
      setIsChecking(false)
    }
  }

  const performDelete = async () => {
    setIsDeleting(true)
    try {
        await deleteAction(id)
        setIsOpen(false) 
        // We don't need to do anything else as the action should revalidate path/redirect
    } catch (error) {
        console.error('Delete failed', error)
        alert('Failed to delete. Please try again.')
    } finally {
        setIsDeleting(false)
    }
  }

  return (
    <>
      <button 
        onClick={initiateDelete} 
        disabled={isChecking}
        className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
        title="Törlés"
      >
        {isChecking ? '...' : 'Törlés'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {entityName} Törlése
            </h3>
            
            <div className="text-slate-600 mb-6">
              <p>Biztosan törölni szeretnéd ezt a(z) {entityName}-t?</p>
              
              {resultCount > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  <p className="font-medium flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Figyelem!
                  </p>
                  <p className="mt-1">
                    Ehhez a(z) {entityName}-hez <strong>{resultCount}</strong> rögzített eredmény tartozik.
                    A törlés véglegesen eltávolítja az összes kapcsolódó eredményt is.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Mégse
              </button>
              <button 
                onClick={performDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-70 flex items-center gap-2"
              >
                {isDeleting && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                Törlés
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
