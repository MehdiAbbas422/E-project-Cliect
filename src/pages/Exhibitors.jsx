import '../css/exhibitors.css'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import PageHero from '../components/PageHero'
import { pageImages } from '../images'

// Purpose: Public exhibitor directory with keyword search, pagination and a
// direct enquiry/contact form that lets visitors message an exhibitor.
const Exhibitors = () => {
  const { user } = useAuth()
  const [exhibitors, setExhibitors] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState({ id: null, text: '', error: false })

  const load = useCallback((value = search, p = page) => {
    setLoading(true)
    api.get('/exhibitors', { params: { search: value || undefined, page: p, limit: 9 } })
      .then(({ data }) => {
        setExhibitors(data.items || [])
        setPages(data.pages || 1)
      })
      .catch(() => setExhibitors([]))
      .finally(() => setLoading(false))
  }, [search, page])

  useEffect(() => { load(search, page) }, [load, search, page])

  const onSearch = (value) => { setSearch(value); setPage(1) }

  const send = async (exhibitorId) => {
    if (!message.trim()) return
    try {
      await api.post('/enquiries', { exhibitor: exhibitorId, message })
      setMessage('')
      setOpenId(null)
      setNotice({ id: exhibitorId, text: 'Message sent! The exhibitor will reply soon.', error: false })
    } catch (err) {
      setNotice({ id: exhibitorId, text: err.response?.data?.message || 'Could not send the message', error: true })
    }
  }

  return (
    <div className="container">
      <PageHero
        eyebrow="Connect"
        title="Exhibitor Directory"
        subtitle="Find approved exhibitors by company, product or keyword, then message them directly."
        image={pageImages.exhibitors}
      />

      <div className="search">
        <span className="em">🔎</span>
        <input
          placeholder="Search by company, product or keyword..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {loading && <div className="empty mt"><span className="em">⏳</span>Loading exhibitors…</div>}
      {!loading && exhibitors.length === 0 && (
        <div className="empty mt"><span className="em">🏢</span>No exhibitors found.</div>
      )}

      <div className="grid mt">
        {exhibitors.map((ex) => (
          <div className="card" key={ex._id}>
            <div className="thumb-row">
              {ex.logo
                ? <img className="media round" src={ex.logo} alt={ex.company} />
                : <div className="media round" style={{ display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', border: '1px solid var(--primary-line)', fontSize: 26 }}>🏢</div>}
              <div>
                <h3 style={{ marginBottom: 2 }}>{ex.company}</h3>
                <span className="muted" style={{ fontSize: 13 }}>{ex.expo?.title || 'Expo exhibitor'}</span>
              </div>
            </div>
            <p className="mt">{ex.description}</p>
            <p className="muted">🛍️ {ex.products}</p>
            <p className="muted">✉️ {ex.contact}</p>

            {user ? (
              openId === ex._id ? (
                <div className="mt">
                  <textarea rows="3" placeholder="Write your message to this exhibitor…"
                    value={message} onChange={(e) => setMessage(e.target.value)} />
                  <div className="row mt">
                    <button type="button" onClick={() => send(ex._id)}>Send</button>
                    <button type="button" className="ghost" onClick={() => { setOpenId(null); setMessage('') }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="soft mt full" onClick={() => { setOpenId(ex._id); setNotice({ id: null, text: '', error: false }) }}>
                  💬 Contact exhibitor
                </button>
              )
            ) : (
              <Link to="/login" className="nav-cta mt full" style={{ display: 'block', textAlign: 'center' }}>
                Login to contact
              </Link>
            )}

            {notice.id === ex._id && notice.text && (
              <p className={notice.error ? 'error' : 'success'} style={{ marginTop: 8 }}>{notice.text}</p>
            )}
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="pager">
          <button type="button" className="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span className="muted">Page {page} of {pages}</span>
          <button type="button" className="ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

export default Exhibitors
