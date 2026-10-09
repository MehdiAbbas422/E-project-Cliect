import '../css/my-bookings.css'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useRealtime } from '../hooks/useRealtime'
import PageHero from '../components/PageHero'
import { pageImages } from '../images'

// Purpose: Attendee/exhibitor view of every session they have booked, with a
// cancel action and live refresh when bookings change elsewhere.
const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [waitlist, setWaitlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get('/sessions/bookings/me')
      .then(({ data }) => { setBookings(data); setError('') })
      .catch((err) => setError(err.response?.data?.message || 'Could not load your bookings'))
      .finally(() => setLoading(false))
    api.get('/sessions/waitlist/me')
      .then(({ data }) => setWaitlist(data))
      .catch(() => setWaitlist([]))
  }, [])

  useEffect(load, [load])
  useRealtime(useCallback((detail) => { if (detail.scope === 'bookings') load() }, [load]))

  const cancel = async (id) => {
    try {
      await api.delete(`/sessions/bookings/${id}`)
      setBookings((current) => current.filter((b) => b._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel the booking')
    }
  }

  const leaveWaitlist = async (id) => {
    try {
      await api.delete(`/sessions/waitlist/${id}`)
      setWaitlist((current) => current.filter((w) => w._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not leave the waitlist')
    }
  }

  return (
    <div className="container">
      <PageHero
        eyebrow="Your agenda"
        title="My Bookings"
        subtitle="All the sessions you have reserved across every expo."
        image={pageImages.myBookings}
      />

      {error && <p className="error">{error}</p>}
      {loading && <div className="empty"><span className="em">⏳</span>Loading your bookings…</div>}
      {!loading && bookings.length === 0 && (
        <div className="empty"><span className="em">🎟️</span>
          No bookings yet. <Link to="/expos">Browse expos</Link> to book a session.
        </div>
      )}

      <div className="grid">
        {bookings.map((b) => (
          <div className="card" key={b._id}>
            <div className="row between">
              <h3>{b.session?.title || 'Session removed'}</h3>
              <span className="badge info">{b.expo?.title || 'Expo'}</span>
            </div>
            {b.session && (
              <>
                <p className="muted">🎤 {b.session.speaker || 'Speaker TBA'} · 📍 {b.session.location || 'TBA'}</p>
                <p className="muted">🕐 {new Date(b.session.startTime).toLocaleString()} – {new Date(b.session.endTime).toLocaleTimeString()}</p>
              </>
            )}
            {b.expo?.location && <p className="muted">🗺️ {b.expo.location}</p>}
            <button type="button" className="danger mt full" onClick={() => cancel(b._id)}>Cancel booking</button>
          </div>
        ))}
      </div>

      {waitlist.length > 0 && (
        <>
          <div className="section-head"><h2>⏳ Waitlisted sessions</h2></div>
          <p className="sub">These sessions are full. You will be booked automatically and notified when a seat frees up.</p>
          <div className="grid">
            {waitlist.map((w) => (
              <div className="card" key={w._id}>
                <div className="row between">
                  <h3>{w.session?.title || 'Session removed'}</h3>
                  <span className="badge pending">Waitlisted</span>
                </div>
                {w.session && (
                  <>
                    <p className="muted">🎤 {w.session.speaker || 'Speaker TBA'} · 📍 {w.session.location || 'TBA'}</p>
                    <p className="muted">🕐 {new Date(w.session.startTime).toLocaleString()}</p>
                  </>
                )}
                {w.expo?.title && <p className="muted">🎪 {w.expo.title}</p>}
                <button type="button" className="ghost mt full" onClick={() => leaveWaitlist(w._id)}>Leave waitlist</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default MyBookings
