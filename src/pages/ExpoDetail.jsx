import '../css/expo-detail.css'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useRealtime } from '../hooks/useRealtime'
import { getSocket } from '../socket'
import MapView from '../components/MapView'

// Purpose: Public expo page — hero, venue map, live announcement board,
// schedule (with booking) and the booth floor plan.
const ExpoDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [expo, setExpo] = useState(null)
  const [booths, setBooths] = useState([])
  const [sessions, setSessions] = useState([])
  const [exhibitors, setExhibitors] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [toast, setToast] = useState({ type: '', message: '' })
  const [bookingSessionId, setBookingSessionId] = useState(null)
  const [saved, setSaved] = useState(false)
  const [favBusy, setFavBusy] = useState(false)
  const [waitlisted, setWaitlisted] = useState([])

  const load = useCallback(() => {
    api.get(`/expos/${id}`).then(({ data }) => setExpo(data)).catch(() => setExpo(null))
    api.get(`/booths/expo/${id}`).then(({ data }) => setBooths(data))
    api.get(`/sessions/expo/${id}`).then(({ data }) => setSessions(data))
    api.get(`/exhibitors?expo=${id}`).then(({ data }) => setExhibitors(data))
    api.get(`/announcements?expo=${id}`).then(({ data }) => setAnnouncements(data)).catch(() => setAnnouncements([]))
  }, [id])

  useEffect(load, [load])

  // Track whether this expo is saved and which sessions the user is waitlisted for.
  useEffect(() => {
    if (!user) { setSaved(false); setWaitlisted([]); return }
    api.get('/favourites/ids').then(({ data }) => setSaved(data.includes(id))).catch(() => setSaved(false))
    api.get('/sessions/waitlist/me')
      .then(({ data }) => setWaitlisted(data.map((w) => w.session?._id).filter(Boolean)))
      .catch(() => setWaitlisted([]))
  }, [user, id])

  // Join this expo's live room so booth/booking changes appear instantly.
  // Also re-joins once the socket finishes connecting (e.g. after a refresh).
  useEffect(() => {
    const join = () => getSocket()?.emit('joinExpo', id)
    join()
    window.addEventListener('eventsphere:socket-ready', join)
    return () => {
      window.removeEventListener('eventsphere:socket-ready', join)
      getSocket()?.emit('leaveExpo', id)
    }
  }, [id])

  useRealtime(useCallback((detail) => {
    if (detail.expoId === id || detail.scope === 'announcements') load()
  }, [id, load]))

  const showToast = (type, message) => setToast({ type, message })

  const reserve = async (boothId) => {
    try {
      await api.post(`/booths/${boothId}/reserve`)
      showToast('success', 'Booth reserved successfully!')
      load()
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Reservation failed')
    }
  }

  const removeReservation = async (boothId) => {
    try {
      await api.delete(`/booths/${boothId}/reserve`)
      showToast('success', 'Reservation removed successfully!')
      load()
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Reservation removal failed')
    }
  }

  const book = async (sessionId) => {
    if (!user) {
      showToast('error', 'Please log in to book a session.')
      return
    }
    setBookingSessionId(sessionId)
    showToast('', '')
    try {
      await api.post(`/sessions/${sessionId}/book`)
      showToast('success', 'Session booked successfully!')
      load()
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Booking failed. Please check your connection and try again.')
    } finally {
      setBookingSessionId(null)
    }
  }

  // Save / unsave this expo to the user's favourites.
  const toggleFav = async () => {
    if (!user) { showToast('error', 'Please log in to save this expo.'); return }
    setFavBusy(true)
    try {
      if (saved) {
        await api.delete(`/favourites/${id}`)
        setSaved(false)
        showToast('success', 'Removed from your saved expos.')
      } else {
        await api.post('/favourites', { expo: id })
        setSaved(true)
        showToast('success', 'Saved! Find it under the Saved filter.')
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not update your saved list.')
    } finally {
      setFavBusy(false)
    }
  }

  // Join the waitlist for a full session; auto-booked when a seat frees up.
  const joinWaitlist = async (sessionId) => {
    if (!user) { showToast('error', 'Please log in to join the waitlist.'); return }
    try {
      await api.post(`/sessions/${sessionId}/waitlist`)
      setWaitlisted((ids) => [...ids, sessionId])
      showToast('success', 'Added to the waitlist — we will notify you if a seat opens up.')
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Could not join the waitlist.')
    }
  }

  useEffect(() => {
    if (!toast.message) return undefined
    const timer = window.setTimeout(() => setToast({ type: '', message: '' }), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  if (!expo) return <div className="container"><div className="empty"><span className="em">⏳</span>Loading expo…</div></div>

  return (
    <div className="container">
      {/* ---------- Hero ---------- */}
      <div className="detail-hero">
        {expo.image
          ? <img src={expo.image} alt={expo.title} />
          : <div className="fallback">🎪</div>}
        {user && (
          <button
            type="button"
            className={`fav-btn detail ${saved ? 'on' : ''}`}
            disabled={favBusy}
            onClick={toggleFav}
            title={saved ? 'Remove from saved' : 'Save this expo'}
          >
            {saved ? '❤️' : '🤍'}
          </button>
        )}
        <div className="overlay">
          <span className="badge info" style={{ marginBottom: 8 }}>{expo.theme || 'Expo'}</span>
          <h1>{expo.title}</h1>
          <div className="sub">
            <span>📅 {new Date(expo.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>📍 {expo.location}</span>
          </div>
        </div>
      </div>

      <p>{expo.description}</p>
      {toast.message && (
        <p className={`toast ${toast.type}`} role="alert">{toast.type === 'error' ? '⚠️ ' : '✅ '}{toast.message}</p>
      )}

      {/* ---------- Announcements ---------- */}
      {announcements.length > 0 && (
        <>
          <div className="section-head"><h2>📣 Announcements</h2></div>
          <div className="grid">
            {announcements.map((a) => (
              <div className="card" key={a._id}>
                <div className="row between">
                  <h3>{a.title}</h3>
                  <span className="sub">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt">{a.message}</p>
                {a.author?.name && <span className="sub">— {a.author.name}</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- Location map ---------- */}
      <div className="section-head">
        <h2>Venue location</h2>
        {(expo.lat && expo.lng) && (
          <a
            className="map-link"
            target="_blank"
            rel="noreferrer"
            href={`https://www.google.com/maps?q=${expo.lat},${expo.lng}`}
          >
            Open in Google Maps ↗
          </a>
        )}
      </div>
      {expo.lat && expo.lng ? (
        <MapView lat={expo.lat} lng={expo.lng} location={expo.location} />
      ) : (
        <div className="empty"><span className="em">📍</span>{expo.location}</div>
      )}

      {/* ---------- Schedule ---------- */}
      <div className="section-head"><h2>Schedule</h2></div>
      {sessions.length === 0 && <div className="empty"><span className="em">🕒</span>No sessions scheduled.</div>}
      <div className="grid">
        {sessions.map((s) => {
          const full = s.seats > 0 && s.booked >= s.seats
          return (
            <div className="card" key={s._id}>
              <div className="row between">
                <h3>{s.title}</h3>
                <span className="badge info">Session</span>
              </div>
              <p className="muted">🎤 {s.speaker || 'Speaker TBA'} · 📍 {s.location || 'TBA'}</p>
              <p className="mt">{s.topic}</p>
              <p className="muted">
                🕐 {new Date(s.startTime).toLocaleString()} – {new Date(s.endTime).toLocaleTimeString()}
              </p>
              {s.seats > 0 && (
                <p className="muted">🪑 {s.booked}/{s.seats} seats booked</p>
              )}
              {user && (full ? (
                waitlisted.includes(s._id) ? (
                  <button type="button" className="mt full" disabled>⏳ On the waitlist</button>
                ) : (
                  <button type="button" className="mt full soft" onClick={() => joinWaitlist(s._id)}>
                    Join waitlist
                  </button>
                )
              ) : (
                <button
                  type="button"
                  className="mt full"
                  onClick={() => book(s._id)}
                  disabled={bookingSessionId === s._id}
                >
                  {bookingSessionId === s._id ? 'Booking…' : 'Book session'}
                </button>
              ))}
            </div>
          )
        })}
      </div>

      {/* ---------- Floor plan ---------- */}
      <div className="section-head"><h2>Floor plan &amp; booths</h2></div>
      {booths.length === 0 && <div className="empty"><span className="em">🧱</span>No booths allocated.</div>}
      <div className="grid">
        {booths.map((b) => (
          <div className="card" key={b._id}>
            <div className="row between">
              <h3>Booth {b.number}</h3>
              <span className={`badge ${b.status}`}>{b.status}</span>
            </div>
            <p className="muted">Size: {b.size}</p>
            {b.exhibitor?.name && <p className="muted">Held by: {b.exhibitor.name}</p>}
            {user?.role === 'exhibitor' && b.exhibitor?._id === user.id && b.status === 'reserved' && (
              <button className="mt full" onClick={() => removeReservation(b._id)}>Remove Reservation</button>
            )}
            {user?.role === 'exhibitor' && b.status === 'available' && (
              <button className="mt full" onClick={() => reserve(b._id)}>Reserve this booth</button>
            )}
          </div>
        ))}
      </div>

      {/* ---------- Exhibitors ---------- */}
      <div className="section-head"><h2>Exhibitors at this expo</h2></div>
      {exhibitors.length === 0 && <div className="empty"><span className="em">🏢</span>No approved exhibitors yet.</div>}
      <div className="grid">
        {exhibitors.map((ex) => (
          <div className="card" key={ex._id}>
            <div className="thumb-row">
              {ex.logo
                ? <img className="media round" src={ex.logo} alt={ex.company} />
                : <div className="media round" style={{ display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', border: '1px solid var(--primary-line)', fontSize: 26 }}>🏢</div>}
              <div>
                <h3 style={{ marginBottom: 2 }}>{ex.company}</h3>
                <span className="badge approved">Approved</span>
              </div>
            </div>
            <p className="mt">{ex.description}</p>
            <p className="muted">🛍️ {ex.products}</p>
            <p className="muted">✉️ {ex.contact}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExpoDetail
