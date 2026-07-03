import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const formatWeekLabel = (dateStr) => {
  const date = new Date(dateStr + 'T12:00:00')
  return `${date.getDate()}/${date.getMonth() + 1}`
}

const formatWeekRange = (dateStr) => {
  const monday = new Date(dateStr + 'T12:00:00')
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d) => `${d.getDate()}/${d.getMonth() + 1}`
  return `Semana del ${fmt(monday)} al ${fmt(sunday)}`
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { tooltip, tss } = payload[0].payload
  return (
    <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 8, padding: '8px 12px' }}>
      <div style={{ color: '#6b7280', fontSize: 11, fontFamily: 'Space Mono', marginBottom: 4 }}>{tooltip}</div>
      <div style={{ color: '#f97316', fontFamily: 'Space Mono', fontSize: 14 }}>TSS: {tss}</div>
    </div>
  )
}

export default function WeeklyChart({ data }) {
  if (!data?.length) return null

  const chartData = data.slice(0, 5).reverse().map((w) => ({
    week: w.weekLabel ? `Sem ${formatWeekLabel(w.weekLabel)}` : '',
    tooltip: w.weekLabel ? formatWeekRange(w.weekLabel) : '',
    tss: w.estimatedTss || 0,
  }))

  return (
    <div style={{ width: '100%', height: 180 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="week"
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
          <Bar dataKey="tss" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
