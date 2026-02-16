'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RankingChartProps {
  data: Array<{
    date: string
    rank: number
    points: number
  }>
}

export default function RankingChart({ data }: RankingChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No ranking history available yet. Generate a snapshot to start tracking progress.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="date" 
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          reversed
          stroke="#64748b"
          style={{ fontSize: '12px' }}
          label={{ value: 'Rank Position', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
          formatter={(value, name) => {
            if (value === undefined || name === undefined) return ['-', '']
            if (name === 'rank') return [`#${value}`, 'Rank']
            if (name === 'points') return [value, 'Points']
            return [value, name]
          }}
        />
        <Line 
          type="monotone" 
          dataKey="rank" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
