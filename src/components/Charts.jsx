// Purpose: Lightweight SVG/CSS charts (no chart library needed) used on the
// admin dashboard for occupancy and per-session booking breakdowns.

export const Donut = ({ value = 0, label = '', size = 132, color = 'var(--primary)' }) => {
  const safe = Math.max(0, Math.min(100, Math.round(value)))
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (safe / 100) * circumference
  return (
    <div className="donut">
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--surface-2)" strokeWidth="14" />
        <circle
          cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="14"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="58" textAnchor="middle" className="donut-value">{safe}%</text>
        <text x="60" y="76" textAnchor="middle" className="donut-label">{label}</text>
      </svg>
    </div>
  )
}

export const BarChart = ({ items = [], color = 'var(--primary)' }) => {
  if (!items.length) return <p className="muted">No booking data yet.</p>
  const max = Math.max(...items.map((i) => i.count), 1)
  return (
    <div className="bars">
      {items.map((item) => (
        <div className="bar-row" key={item.title}>
          <span className="bar-label" title={item.title}>{item.title}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(item.count / max) * 100}%`, background: color }} />
          </div>
          <span className="bar-value">{item.count}</span>
        </div>
      ))}
    </div>
  )
}

export default { Donut, BarChart }
