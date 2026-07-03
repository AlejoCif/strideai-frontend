import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { weekLabel, estimatedTss, isEmpty } = payload[0].payload
  return (
    <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ color: '#6b7280', fontSize: 11, fontFamily: 'Space Mono', marginBottom: 4 }}>{weekLabel}</div>
      {isEmpty
        ? <div style={{ color: '#4b5563', fontFamily: 'Space Mono', fontSize: 13 }}>Sin actividad esta semana</div>
        : <div style={{ color: '#f97316', fontFamily: 'Space Mono', fontSize: 14 }}>TSS: {estimatedTss}</div>
      }
    </div>
  )
}

export default function WeeklyChart({ data }) {
  const chartData = (data || []).map((w) => ({
    ...w,
    isEmpty: w.activityCount === 0,
  }))

  return (
    <div style={{ width: '100%', height: 180 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="weekLabel"
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Space Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Space Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1f293780' }} />
          <Bar dataKey="estimatedTss" radius={[4, 4, 0, 0]} minPointSize={3}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.isEmpty ? '#1f2937' : '#f97316'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
