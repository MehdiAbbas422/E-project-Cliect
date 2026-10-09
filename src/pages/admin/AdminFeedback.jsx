import '../../css/admin.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../../api'
import AdminTabs from '../../components/AdminTabs'
import { useRealtime } from '../../hooks/useRealtime'
import PageHero from '../../components/PageHero'
import { pageImages } from '../../images'

// Purpose: Admin feedback & support inbox — paginated list of user feedback
// where organizers can reply (marking it resolved), delete items and export a
// CSV report.
const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [replies, setReplies] = useState({})
  const pageRef = useRef(1)

  const load = useCallback((p) => {
    const target = p ?? pageRef.current
    return api.get('/feedback', { params: { page: target, limit: 10 } }).then(({ data }) => {
      setFeedback(data.items || [])
      setPages(data.pages || 1)
      setPage(data.page || 1)
      pageRef.current = data.page || 1
    })
  }, [])

  useEffect(() => { load(1) }, [load])
  useRealtime(useCallback((detail) => { if (detail.scope === 'feedback') load() }, [load]))

  const reply = async (id) => {
    const text = replies[id]
    if (!text?.trim()) return
    const { data } = await api.patch(`/feedback/${id}/reply`, { reply: text })
    setFeedback((current) => current.map((item) => (item._id === id ? data : item)))
    setReplies((current) => ({ ...current, [id]: '' }))
  }

  const remove = async (id) => {
    await api.delete(`/feedback/${id}`)
    setFeedback((current) => current.filter((item) => item._id !== id))
  }

  // Purpose: Builds a CSV of the feedback on the current page and downloads it.
  const exportCsv = () => {
    if (!feedback.length) return
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const rows = [
      ['Type', 'Message', 'User', 'Email', 'Reply', 'Status', 'Date'],
      ...feedback.map((f) => [
        f.type, f.message, f.user?.name, f.user?.email, f.reply || '',
        f.status, new Date(f.createdAt).toLocaleString()
      ])
    ]
    const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'feedback-report.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container">
      <PageHero
        eyebrow="Admin area"
        title="Feedback & Support"
        subtitle="Read what users are saying and reply to suggestions and reported issues."
        image={pageImages.adminFeedback}
      />
      <AdminTabs />

      <div className="section-head">
        <h2>Inbox</h2>
        {feedback.length > 0 && (
          <button type="button" className="soft" onClick={exportCsv}>⬇️ Export CSV</button>
        )}
      </div>

      <div className="card">
        {feedback.length === 0 && <div className="empty"><span className="em">💬</span>No feedback yet.</div>}
        {feedback.map((f) => (
          <div key={f._id} className="list-item column">
            <div style={{ width: '100%' }}>
              <span className={`badge ${f.status === 'resolved' ? 'approved' : 'pending'}`}>{f.type}</span>
              <p style={{ marginTop: 6 }}>{f.message}</p>
            </div>
            {f.reply ? (
              <div className="reply-box" style={{ width: '100%' }}>
                <span className="reply-label">Your reply</span>
                <p>{f.reply}</p>
              </div>
            ) : (
              <div className="mt" style={{ width: '100%' }}>
                <textarea rows="2" placeholder="Write a reply…"
                  value={replies[f._id] || ''}
                  onChange={(e) => setReplies({ ...replies, [f._id]: e.target.value })} />
              </div>
            )}
            <div className="row between" style={{ width: '100%', marginTop: 8 }}>
              <span className="sub">{f.user?.name} · {new Date(f.createdAt).toLocaleDateString()}</span>
              <div className="row">
                {!f.reply && (
                  <button type="button" className="soft" onClick={() => reply(f._id)}>Reply</button>
                )}
                <button type="button" className="danger" onClick={() => remove(f._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="pager">
          <button type="button" className="ghost" disabled={page <= 1} onClick={() => load(page - 1)}>Prev</button>
          <span className="muted">Page {page} of {pages}</span>
          <button type="button" className="ghost" disabled={page >= pages} onClick={() => load(page + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

export default AdminFeedback
