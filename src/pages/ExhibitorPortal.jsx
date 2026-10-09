import '../css/exhibitor-portal.css'
import { useCallback, useEffect, useState } from 'react'
import api from '../api'
import ImageUpload from '../components/ImageUpload'
import { useRealtime } from '../hooks/useRealtime'
import PageHero from '../components/PageHero'
import { pageImages } from '../images'

const empty = { company: '', description: '', products: '', contact: '', logo: '', expo: '' }

// Purpose: Exhibitor workspace — manage company profiles per expo, track
// booked sessions and reply to attendee enquiries.
const ExhibitorPortal = () => {
  const [expos, setExpos] = useState([])
  const [profiles, setProfiles] = useState([])
  const [form, setForm] = useState(empty)
  const [bookings, setBookings] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [replies, setReplies] = useState({})
  const [message, setMessage] = useState('')

  const profile = profiles.find((item) => (item.expo?._id || item.expo) === form.expo)

  const loadBookings = useCallback(() => {
    api.get('/sessions/bookings/me').then(({ data }) => setBookings(data))
  }, [])

  const loadEnquiries = useCallback(() => {
    api.get('/enquiries/received').then(({ data }) => setEnquiries(data))
  }, [])

  useEffect(() => {
    api.get('/expos').then(({ data }) => setExpos(data))
    api.get('/exhibitors/me').then(({ data }) => {
      setProfiles(data)
      if (data.length) {
        const first = data[0]
        setForm({ ...empty, ...first, expo: first.expo?._id || first.expo })
      }
    })
    loadBookings()
    loadEnquiries()
  }, [loadBookings, loadEnquiries])

  useRealtime(useCallback((detail) => {
    if (detail.scope === 'bookings') loadBookings()
  }, [loadBookings]))

  const selectExpo = (expoId) => {
    const existing = profiles.find((item) => (item.expo?._id || item.expo) === expoId)
    setForm(existing ? { ...empty, ...existing, expo: expoId } : { ...empty, expo: expoId })
    setMessage('')
  }

  const save = async (e) => {
    e.preventDefault()
    try {
      const { data } = profile
        ? await api.put(`/exhibitors/${profile._id}`, form)
        : await api.post('/exhibitors', form)
      setProfiles((current) => profile
        ? current.map((item) => item._id === data._id ? data : item)
        : [...current, data])
      setMessage(profile ? 'Profile updated.' : 'Application submitted for approval.')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed')
    }
  }

  const cancelBooking = async (id) => {
    await api.delete(`/sessions/bookings/${id}`)
    setBookings((current) => current.filter((b) => b._id !== id))
  }

  const sendReply = async (id) => {
    const reply = replies[id]
    if (!reply?.trim()) return
    try {
      const { data } = await api.post(`/enquiries/${id}/reply`, { reply })
      setEnquiries((current) => current.map((e) => (e._id === id ? data : e)))
      setReplies((current) => ({ ...current, [id]: '' }))
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not send the reply')
    }
  }

  return (
    <div className="container">
      <PageHero
        eyebrow="Exhibitor"
        title="Exhibitor Portal"
        subtitle="Manage your company profile, upload your logo, answer enquiries and track booked sessions."
        image={pageImages.exhibitorPortal}
      />
      {message && <p className="success">{message}</p>}

      <div className="card">
        <div className="row between">
          <h2 style={{ margin: 0 }}>Company profile</h2>
          {profile && <span className={`badge ${profile.status}`}>{profile.status}</span>}
        </div>
        <form onSubmit={save}>
          <label>Expo</label>
          <select required value={form.expo} onChange={(e) => selectExpo(e.target.value)}>
            <option value="">Select an expo</option>
            {expos.map((ex) => <option key={ex._id} value={ex._id}>{ex.title}</option>)}
          </select>

          <label>Company</label>
          <input required value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })} />

          <label>Description</label>
          <textarea rows="3" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <label>Products / services</label>
          <input value={form.products}
            onChange={(e) => setForm({ ...form, products: e.target.value })} />

          <label>Contact</label>
          <input placeholder="email@company.com · +1 555 000 1234" value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })} />

          <ImageUpload
            label="Company logo"
            hint="JPG or PNG, up to 5 MB"
            value={form.logo}
            onChange={(url) => setForm({ ...form, logo: url })}
          />

          <button className="mt full">Save profile</button>
        </form>
      </div>

      <div className="section-head"><h2>Attendee enquiries</h2></div>
      <div className="card flat">
        {enquiries.length === 0 && <div className="empty"><span className="em">💬</span>No enquiries yet.</div>}
        {enquiries.map((en) => (
          <div key={en._id} className="list-item column">
            <div className="row between" style={{ width: '100%' }}>
              <span className="who">{en.from?.name || 'Visitor'}</span>
              <span className={`badge ${en.status === 'replied' ? 'approved' : 'pending'}`}>{en.status}</span>
            </div>
            <p className="mt" style={{ width: '100%' }}>{en.message}</p>
            {en.reply ? (
              <div className="reply-box" style={{ width: '100%' }}>
                <span className="reply-label">Your reply</span>
                <p>{en.reply}</p>
              </div>
            ) : (
              <div className="mt" style={{ width: '100%' }}>
                <textarea rows="2" placeholder="Type your reply…"
                  value={replies[en._id] || ''}
                  onChange={(e) => setReplies({ ...replies, [en._id]: e.target.value })} />
                <button type="button" className="mt" onClick={() => sendReply(en._id)}>Send reply</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="section-head"><h2>My booked sessions</h2></div>
      <div className="card flat">
        {bookings.length === 0 && <div className="empty"><span className="em">🎟️</span>No booked sessions yet.</div>}
        {bookings.map((b) => (
          <div key={b._id} className="list-item">
            <div>
              <div className="who">{b.session?.title}</div>
              <div className="sub">📅 {b.session ? new Date(b.session.startTime).toLocaleString() : ''}</div>
            </div>
            <div className="row">
              <span className="badge info">{b.expo?.title}</span>
              <button type="button" className="danger" onClick={() => cancelBooking(b._id)}>Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExhibitorPortal
