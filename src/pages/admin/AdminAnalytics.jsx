import { useEffect, useState } from 'react'
import api from '../../api'
import { BarChart } from '../../components/Charts'
import PageHero from '../../components/PageHero'
import { pageImages } from '../../images'
import '../../css/admin-analytics.css'

const AdminAnalytics = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/monthly')
      .then(({ data }) => setData(data))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  const totalEarnings = data.reduce((sum, m) => sum + m.earnings, 0)
  const totalExpos = data.reduce((sum, m) => sum + m.expos, 0)
  const totalBooths = data.reduce((sum, m) => sum + m.booths, 0)
  const totalSold = data.reduce((sum, m) => sum + m.boothsSold, 0)
  const totalUnsold = data.reduce((sum, m) => sum + m.boothsUnsold, 0)
  const descendingMonths = [...data].sort((a, b) => b.monthKey.localeCompare(a.monthKey))

  if (loading) {
    return (
      <div className="container">
        <div className="empty"><span className="em">⏳</span>Loading analytics…</div>
      </div>
    )
  }

  return (
    <div className="container">
      <PageHero
        eyebrow="Admin area"
        title="Monthly Analytics"
        subtitle="Track expos, booths, exhibitors and earnings month by month."
        image={pageImages.dashboard}
      />

      <div className="grid">
        <div className="card stat-card"><b>PKR {totalEarnings.toLocaleString()}</b><span>Total Earnings</span></div>
        <div className="card stat-card"><b>{totalExpos}</b><span>Total Expos</span></div>
        <div className="card stat-card"><b>{totalBooths}</b><span>Total Booths</span></div>
        <div className="card stat-card"><b>{totalSold}</b><span>Booths Sold</span></div>
        <div className="card stat-card"><b>{totalUnsold}</b><span>Booths Unsold</span></div>
      </div>

      <div className="section-head"><h2>Earnings by Month</h2></div>
      <div className="card">
        <BarChart items={descendingMonths.map((m) => ({ title: m.month, count: m.earnings }))} />
      </div>

      <div className="section-head"><h2>Booths Sold vs Unsold</h2></div>
      <div className="card">
        <BarChart items={descendingMonths.map((m) => ({ title: m.month, count: m.boothsSold }))} />
      </div>

      <div className="section-head"><h2>Monthly Breakdown</h2></div>
      <div className="card flat">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Expos</th>
              <th>Booths</th>
              <th>Exhibitors</th>
              <th>Sold</th>
              <th>Unsold</th>
              <th>Earnings</th>
            </tr>
          </thead>
          <tbody>
            {descendingMonths.map((m) => (
              <tr key={m.monthKey}>
                <td>{m.month}</td>
                <td>{m.expos}</td>
                <td>{m.booths}</td>
                <td>{m.exhibitors}</td>
                <td>{m.boothsSold}</td>
                <td>{m.boothsUnsold}</td>
                <td>PKR {m.earnings.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminAnalytics
