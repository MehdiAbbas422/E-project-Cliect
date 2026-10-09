import '../../css/admin.css'
import { useCallback, useEffect, useState } from 'react'
import api from '../../api'
import AdminTabs from '../../components/AdminTabs'
import { useRealtime } from '../../hooks/useRealtime'
import PageHero from '../../components/PageHero'
import { pageImages } from '../../images'

// Purpose: Admin page listing exhibitor applications. Pending profiles can be
// approved or rejected (the applicant is notified live + by email); approved
// and rejected history can be reviewed with a status filter.
const AdminExhibitors = () => {
  const [exhibitors, setExhibitors] = useState([])
  const [filter, setFilter] = useState('pending')
  const [message, setMessage] = useState('')

  const load = useCallback(() => {
    api.get('/exhibitors/all').then(({ data }) => setExhibitors(data)).catch(() => setExhibitors([]))
  }, [])

  useEffect(load, [load])
  useRealtime(useCallback((detail) => { if (detail.scope === 'exhibitors') load() }, [load]))

  const setStatus = async (id, status) => {
    await api.patch(`/exhibitors/${id}/status`, { status })
    setMessage(`Application ${status}.`)
    load()
  }

  const counts = {
    pending: exhibitors.filter((e) => e.status === 'pending').length,
    approved: exhibitors.filter((e) => e.status === 'approved').length,
    rejected: exhibitors.filter((e) => e.status === 'rejected').length
  }
  const list = filter === 'all' ? exhibitors : exhibitors.filter((e) => e.status === filter)

  return (
    <div className="container">
      <PageHero
        eyebrow="Admin area"
        title="Exhibitor applications"
        subtitle="Review company profiles and approve or reject who gets to exhibit."
        image={pageImages.adminExhibitors}
      />
      <AdminTabs />

      {message && <p className="success">{message}</p>}

      <div className="row mt">
        {[
          ['pending', `Pending (${counts.pending})`],
          ['approved', `Approved (${counts.approved})`],
          ['rejected', `Rejected (${counts.rejected})`],
          ['all', `All (${exhibitors.length})`]
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={filter === value ? '' : 'ghost'}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card mt">
        {list.length === 0 && <div className="empty"><span className="em">📄</span>No {filter} applications.</div>}
        {list.map((ex) => (
          <div key={ex._id} className="list-item">
            <div className="thumb-row">
              {ex.logo
                ? <img src={ex.logo} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                : <span style={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', fontSize: 18 }}>🏢</span>}
              <div>
                <div className="who">{ex.company} — {ex.user?.name}</div>
                <div className="sub">{ex.expo?.title} · {ex.contact}</div>
              </div>
            </div>
            <div className="row">
              <span className={`badge ${ex.status}`}>{ex.status}</span>
              {ex.status !== 'approved' && (
                <button type="button" className="soft" onClick={() => setStatus(ex._id, 'approved')}>Approve</button>
              )}
              {ex.status !== 'rejected' && (
                <button type="button" className="danger" onClick={() => setStatus(ex._id, 'rejected')}>Reject</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminExhibitors
