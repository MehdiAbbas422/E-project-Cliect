import '../css/expos.css'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useRealtime } from '../hooks/useRealtime'
import PageHero from '../components/PageHero'
import { pageImages } from '../images'

const monthShort = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short' })
const dayNum = (d) => new Date(d).getDate()

// Purpose: Labels an expo as upcoming / ongoing / past based on its date.
const statusOf = (date) => {
  const d = new Date(date)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return { label: 'Ongoing', cls: 'reserved' }
  return d > now ? { label: 'Upcoming', cls: 'approved' } : { label: 'Past', cls: 'rejected' }
}

// Purpose: Browse all expos with server-side search, upcoming/past filter,
// pagination and a "Saved" (favourites) view for logged-in users.
const Expos = () => {
  const { user } = useAuth()
  const [expos, setExpos] = useState([])
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('all')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [savedOnly, setSavedOnly] = useState(false)
  const [savedIds, setSavedIds] = useState([])
  const [loading, setLoading] = useState(true)

  const loadSavedIds = useCallback(() => {
    if (!user) { setSavedIds([]); return }
    api.get('/favourites/ids').then(({ data }) => setSavedIds(data)).catch(() => setSavedIds([]))
  }, [user])

  useEffect(loadSavedIds, [loadSavedIds])

  const loadExpos = useCallback(() => {
    setLoading(true)
    if (savedOnly) {
      api.get('/favourites')
        .then(({ data }) => { setExpos(data.map((f) => f.expo).filter(Boolean)); setPages(1); setPage(1) })
        .catch(() => setExpos([]))
        .finally(() => setLoading(false))
      return
    }
    const params = { search: search || undefined, period: period === 'all' ? undefined : period, page }
    api.get('/expos', { params })
      .then(({ data }) => {
        setExpos(data.items || [])
        setPages(data.pages || 1)
      })
      .catch(() => setExpos([]))
      .finally(() => setLoading(false))
  }, [search, period, page, savedOnly])

  useEffect(loadExpos, [loadExpos])

  useRealtime(useCallback((detail) => {
    if (detail.scope === 'expos') loadExpos()
  }, [loadExpos]))

  const changeFilter = (setter, value) => { setter(value); setPage(1) }

  const toggleFav = async (expoId) => {
    if (!user) return
    const saved = savedIds.includes(expoId)
    try {
      if (saved) {
        await api.delete(`/favourites/${expoId}`)
        setSavedIds((ids) => ids.filter((id) => id !== expoId))
        if (savedOnly) setExpos((list) => list.filter((e) => e._id !== expoId))
      } else {
        await api.post('/favourites', { expo: expoId })
        setSavedIds((ids) => [...ids, expoId])
      }
    } catch { /* ignore transient errors */ }
  }

  return (
    <div className="container">
      <PageHero
        eyebrow="Discover events"
        title="Expos & Trade Shows"
        subtitle="Browse upcoming expos, view their venue on the map and jump into the full schedule."
        image={pageImages.expos}
      />

      <div className="search">
        <span className="em">🔎</span>
        <input
          placeholder="Search by title, theme or city..."
          value={search}
          onChange={(e) => changeFilter(setSearch, e.target.value)}
        />
      </div>

      <div className="row mt">
        {['all', 'upcoming', 'past'].map((p) => (
          <button
            key={p}
            type="button"
            className={period === p && !savedOnly ? '' : 'ghost'}
            onClick={() => { setSavedOnly(false); changeFilter(setPeriod, p) }}
          >
            {p === 'all' ? 'All' : p === 'upcoming' ? 'Upcoming' : 'Past'}
          </button>
        ))}
        {user && (
          <button
            type="button"
            className={savedOnly ? '' : 'ghost'}
            onClick={() => { setSavedOnly((v) => !v); setPage(1) }}
          >
            ❤️ Saved{savedIds.length ? ` (${savedIds.length})` : ''}
          </button>
        )}
      </div>

      {loading && <div className="empty mt"><span className="em">⏳</span>Loading expos…</div>}
      {!loading && expos.length === 0 && (
        <div className="empty mt">
          <span className="em">🗓️</span>
          {savedOnly ? 'No saved expos yet — tap the heart on an expo.' : 'No expos match your search yet.'}
        </div>
      )}

      <div className="grid mt">
        {expos.map((expo) => {
          const status = statusOf(expo.date)
          const saved = savedIds.includes(expo._id)
          return (
            <div className="card expo-card" key={expo._id}>
              <div className="cover">
                {expo.image
                  ? <img src={expo.image} alt={expo.title} />
                  : <div className="fallback">🎪</div>}
                <div className="date-chip">
                  <b>{dayNum(expo.date)}</b>
                  <span>{monthShort(expo.date)}</span>
                </div>
                {user && (
                  <button
                    type="button"
                    className={`fav-btn ${saved ? 'on' : ''}`}
                    title={saved ? 'Remove from saved' : 'Save this expo'}
                    onClick={() => toggleFav(expo._id)}
                  >
                    {saved ? '❤️' : '🤍'}
                  </button>
                )}
              </div>
              <div className="body">
                <div className="tags">
                  {expo.theme && <span className="badge info">{expo.theme}</span>}
                  <span className={`badge ${status.cls}`}>{status.label}</span>
                </div>
                <h3>{expo.title}</h3>
                <p className="desc">{expo.description}</p>
                <div className="meta">
                  <span className="item"><span className="em">📅</span>{new Date(expo.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="item"><span className="em">📍</span>{expo.location}</span>
                </div>
                <Link to={`/expos/${expo._id}`} className="full" style={{ marginTop: 18 }}>
                  <button className="full">View details &amp; map</button>
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {!savedOnly && pages > 1 && (
        <div className="pager">
          <button type="button" className="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span className="muted">Page {page} of {pages}</span>
          <button type="button" className="ghost" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}

export default Expos
