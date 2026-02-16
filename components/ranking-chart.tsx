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
      <div className="h-64 flex flex-col items-center justify-center text-slate-600 gap-4 border-2 border-dashed border-slate-800 rounded-3xl">
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-slate-800 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
        </svg>
        <p className="font-bold uppercase tracking-widest text-[10px]">Nincs elérhető ranglista előzmény</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#475569"
          style={{ fontSize: '10px', fontWeight: 'bold' }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis 
          reversed
          stroke="#475569"
          style={{ fontSize: '10px', fontWeight: 'bold' }}
          axisLine={false}
          tickLine={false}
          dx={-10}
          allowDecimals={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#0f172a', 
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '12px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
          }}
          itemStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px' }}
          labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'black', marginBottom: '4px', textTransform: 'uppercase' }}
          formatter={(value, name) => {
            if (value === undefined || name === undefined) return ['-', '']
            if (name === 'rank') return [`#${value}`, 'Helyezés']
            if (name === 'points') return [value, 'Pont']
            return [value, name]
          }}
        />
        <Line 
          type="monotone" 
          dataKey="rank" 
          stroke="#10b981" 
          strokeWidth={4}
          dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#0f172a' }}
          activeDot={{ r: 8, strokeWidth: 0 }}
          animationDuration={1500}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
