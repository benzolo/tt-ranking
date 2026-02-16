import { createClient } from '@/utils/supabase/server'
import PointRuleForm from './point-rule-form'
import { deletePointRule } from './actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: rules } = await supabase
    .from('point_table')
    .select('*')
    .order('event_type')
    .order('category')
    .order('position', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Point Settings</h1>
      
      <PointRuleForm />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-medium text-slate-900">Existing Function Rules</h3>
        </div>
        
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-white">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Event Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Position</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Points</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Delete</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {rules?.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{rule.event_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{rule.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">#{rule.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-medium">{rule.points}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <form action={deletePointRule.bind(null, rule.id)}>
                    <button type="submit" className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {rules?.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        No point rules defined.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
