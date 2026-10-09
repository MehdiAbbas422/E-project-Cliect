import '../css/dashboard.css'
import '../css/admin.css'
import { useCallback, useEffect, useState } from 'react'
import api from '../api'
import MapPicker from '../components/MapPicker'
import ImageUpload from '../components/ImageUpload'
import { Donut, BarChart } from '../components/Charts'
import AdminTabs from '../components/AdminTabs'
import { useRealtime } from '../hooks/useRealtime'
import PageHero from '../components/PageHero'
import { pageImages } from '../images'

const emptyExpo = { title: '', date: '', location: '', lat: null, lng: null, description: '', theme: '', image: '' }
const emptyBooth = { number: '', size: 'Small', status: 'available' }
const emptySession = {
  title: '', speaker: '', topic: '', location: '', lat: null, lng: null, capacity: '',
  startHour: '', startMinute: '', startPeriod: 'AM',
  endHour: '', endMinute: '', endPeriod: 'AM'
}

const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

// Purpose: Returns today's date as yyyy-mm-dd for the date input's min value.
const getTodayDate = () => {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}

// Purpose: Converts a Date into 12-hour { hour, minute, period } parts so an
// existing session can be pre-filled into the time selects for editing.
const to12Hour = (value) => {
  const date = new Date(value)
  let hour = date.getHours()
  const period = hour >= 12 ? 'PM' : 'AM'
  hour %= 12
  if (hour === 0) hour = 12
  return {
    hour: String(hour).padStart(2, '0'),
    minute: String(date.getMinutes()).padStart(2, '0'),
    period
  }
}

// Purpose: Organizer dashboard — create/edit/delete expos, booths and sessions,
// post announcements and view analytics. Applications, feedback and user
// management live on their own pages (see the admin tabs).
const Dashboard = () => {
  const [expos, setExpos] = useState([])
  const [selected, setSelected] = useState(null)
  const [booths, setBooths] = useState([])
  const [sessions, setSessions] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [announcements, setAnnouncements] = useState([])

  const [expoForm, setExpoForm] = useState(emptyExpo)
  const [editingExpoId, setEditingExpoId] = useState(null)
  const [boothForm, setBoothForm] = useState(emptyBooth)
  const [editingBoothId, setEditingBoothId] = useState(null)
  const [sessionForm, setSessionForm] = useState(emptySession)
  const [editingSessionId, setEditingSessionId] = useState(null)
  const [annForm, setAnnForm] = useState({ title: '', message: '' })

  const loadExpos = useCallback(() => api.get('/expos').then(({ data }) => setExpos(data)), [])

  useEffect(() => {
    loadExpos()
  }, [loadExpos])

  const loadExpoData = useCallback((expo) => {
    setSelected(expo)
    api.get(`/booths/expo/${expo._id}`).then(({ data }) => setBooths(data))
    api.get(`/sessions/expo/${expo._id}`).then(({ data }) => setSessions(data))
    api.get(`/expos/${expo._id}/analytics`).then(({ data }) => setAnalytics(data))
    api.get(`/announcements?expo=${expo._id}`).then(({ data }) => setAnnouncements(data)).catch(() => setAnnouncements([]))
  }, [])

  // Live refresh when anything changes on the server.
  useRealtime(useCallback((detail) => {
    if (detail.scope === 'expos') loadExpos()
    if (selected && detail.expoId === selected._id && detail.scope !== 'expos') loadExpoData(selected)
  }, [loadExpos, loadExpoData, selected]))

  // ------------------------- Expo create / edit -------------------------
  const saveExpo = async (e) => {
    e.preventDefault()
    if (e.nativeEvent.submitter && e.nativeEvent.submitter.id !== 'expo-submit-btn') return
    if (editingExpoId) await api.put(`/expos/${editingExpoId}`, expoForm)
    else await api.post('/expos', expoForm)
    setExpoForm(emptyExpo)
    setEditingExpoId(null)
    loadExpos()
  }

  const startEditExpo = (expo) => {
    setEditingExpoId(expo._id)
    setExpoForm({
      title: expo.title || '', date: expo.date ? expo.date.slice(0, 10) : '',
      location: expo.location || '', lat: expo.lat ?? null, lng: expo.lng ?? null,
      description: expo.description || '', theme: expo.theme || '', image: expo.image || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteExpo = async (id) => {
    await api.delete(`/expos/${id}`)
    if (selected?._id === id) setSelected(null)
    loadExpos()
  }

  // ------------------------- Booth create / edit -------------------------
  const saveBooth = async (e) => {
    e.preventDefault()
    if (e.nativeEvent.submitter && e.nativeEvent.submitter.id !== 'booth-submit-btn') return
    if (editingBoothId) await api.put(`/booths/${editingBoothId}`, boothForm)
    else await api.post('/booths', { ...boothForm, expo: selected._id })
    setBoothForm(emptyBooth)
    setEditingBoothId(null)
    loadExpoData(selected)
  }

  const startEditBooth = (booth) => {
    setEditingBoothId(booth._id)
    setBoothForm({ number: booth.number, size: booth.size, status: booth.status })
  }

  const deleteBooth = async (id) => {
    await api.delete(`/booths/${id}`)
    loadExpoData(selected)
  }

  // ------------------------- Session create / edit -------------------------
  const buildTime = (hour, minute, period) => {
    if (!hour || !minute || !period) return null
    let normalizedHour = Number(hour)
    if (period === 'AM' && normalizedHour === 12) normalizedHour = 0
    if (period === 'PM' && normalizedHour < 12) normalizedHour += 12
    const date = new Date(selected.date)
    date.setHours(normalizedHour, Number(minute), 0, 0)
    return date
  }

  const saveSession = async (e) => {
    e.preventDefault()
    if (!selected?.date) return
    const startDate = buildTime(sessionForm.startHour, sessionForm.startMinute, sessionForm.startPeriod)
    const endDate = buildTime(sessionForm.endHour, sessionForm.endMinute, sessionForm.endPeriod)
    if (!startDate || !endDate || startDate >= endDate) return

    const payload = {
      title: sessionForm.title, speaker: sessionForm.speaker, topic: sessionForm.topic,
      location: sessionForm.location, capacity: Number(sessionForm.capacity) || 0,
      expo: selected._id, startTime: startDate.toISOString(), endTime: endDate.toISOString()
    }
    if (editingSessionId) await api.put(`/sessions/${editingSessionId}`, payload)
    else await api.post('/sessions', payload)
    setSessionForm(emptySession)
    setEditingSessionId(null)
    loadExpoData(selected)
  }

  const startEditSession = (session) => {
    const start = to12Hour(session.startTime)
    const end = to12Hour(session.endTime)
    setEditingSessionId(session._id)
    setSessionForm({
      title: session.title || '', speaker: session.speaker || '', topic: session.topic || '',
      location: session.location || '', lat: null, lng: null, capacity: session.capacity || '',
      startHour: start.hour, startMinute: start.minute, startPeriod: start.period,
      endHour: end.hour, endMinute: end.minute, endPeriod: end.period
    })
  }

  const deleteSession = async (id) => {
    await api.delete(`/sessions/${id}`)
    loadExpoData(selected)
  }

  // ------------------------- Announcements -------------------------
  const postAnnouncement = async (e) => {
    e.preventDefault()
    await api.post('/announcements', { ...annForm, expo: selected._id })
    setAnnForm({ title: '', message: '' })
    api.get(`/announcements?expo=${selected._id}`).then(({ data }) => setAnnouncements(data))
  }

  const deleteAnnouncement = async (id) => {
    await api.delete(`/announcements/${id}`)
    setAnnouncements((current) => current.filter((a) => a._id !== id))
  }

  // ------------------------- Reports (CSV / print) -------------------------
  // Purpose: Turns rows into a CSV file and triggers a browser download.
  const downloadCsv = (filename, rows) => {
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportBookingsCsv = async () => {
    if (!selected) return
    const { data } = await api.get(`/expos/${selected._id}/bookings`)
    downloadCsv(`bookings-${selected.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`, [
      ['Attendee', 'Email', 'Session', 'Hall', 'Session start', 'Booked on'],
      ...data.map((b) => [
        b.user?.name, b.user?.email, b.session?.title, b.session?.location,
        b.session?.startTime ? new Date(b.session.startTime).toLocaleString() : '',
        new Date(b.createdAt).toLocaleString()
      ])
    ])
  }

  return (
    <div className="container">
      <PageHero
        eyebrow="Admin area"
        title="Organizer Dashboard"
        subtitle="Create and edit expos, manage the floor plan and agenda, post announcements and view analytics."
        image={pageImages.dashboard}
      />
      <AdminTabs />

      <div className="dash-top">
        <div className="card">
          <h2>{editingExpoId ? 'Edit Expo' : 'Create Expo'}</h2>
          <form onSubmit={saveExpo}>
            <label>Title</label>
            <input required value={expoForm.title}
              onChange={(e) => setExpoForm({ ...expoForm, title: e.target.value })} />
            <label>Date</label>
            <input type="date" required min={getTodayDate()} value={expoForm.date}
              onChange={(e) => setExpoForm({ ...expoForm, date: e.target.value })} />
            <label>Theme</label>
            <input placeholder="e.g. FinTech, Green Energy" value={expoForm.theme}
              onChange={(e) => setExpoForm({ ...expoForm, theme: e.target.value })} />
            <label>Location <span className="hint">— search a place or click the map</span></label>
            <MapPicker
              value={{ location: expoForm.location, lat: expoForm.lat, lng: expoForm.lng }}
              onChange={(v) => setExpoForm((f) => ({ ...f, ...v }))}
            />
            <ImageUpload
              label="Cover image"
              value={expoForm.image}
              onChange={(url) => setExpoForm({ ...expoForm, image: url })}
            />
            <label>Description</label>
            <textarea rows="3" value={expoForm.description}
              onChange={(e) => setExpoForm({ ...expoForm, description: e.target.value })} />
            <div className="row mt">
              <button type="submit" id="expo-submit-btn" className="full">
                {editingExpoId ? 'Update Expo' : 'Add Expo'}
              </button>
              {editingExpoId && (
                <button type="button" className="ghost" onClick={() => { setEditingExpoId(null); setExpoForm(emptyExpo) }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h2>Expos</h2>
          {expos.length === 0 && <div className="empty"><span className="em">🎪</span>No expos yet — create your first one.</div>}
          {expos.map((expo) => (
            <div key={expo._id} className="list-item">
              <div className="thumb-row">
                {expo.image
                  ? <img src={expo.image} alt="" style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover' }} />
                  : <span style={{ width: 46, height: 46, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--primary-soft)', fontSize: 20 }}>🎪</span>}
                <div>
                  <div className="who">{expo.title}</div>
                  <div className="sub">📍 {expo.location || 'No location set'}</div>
                </div>
              </div>
              <div className="row">
                <button type="button" className="soft" onClick={() => loadExpoData(expo)}>Manage</button>
                <button type="button" className="ghost" onClick={() => startEditExpo(expo)}>Edit</button>
                <button type="button" className="danger" onClick={() => deleteExpo(expo._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <>
          <div className="section-head">
            <h2>Managing: {selected.title}</h2>
            <div className="row">
              <button type="button" className="soft" onClick={exportBookingsCsv}>⬇️ Bookings CSV</button>
              <button type="button" className="ghost" onClick={() => window.print()}>🖨️ Print / PDF</button>
              <button type="button" className="ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>

          {analytics && (
            <div className="grid">
              <div className="card stat-card"><b>{analytics.exhibitors}</b><span>Exhibitors</span></div>
              <div className="card stat-card"><b>{analytics.approvedExhibitors}</b><span>Approved</span></div>
              <div className="card stat-card"><b>{analytics.totalBooths}</b><span>Total booths</span></div>
              <div className="card stat-card"><b>{analytics.occupiedBooths}</b><span>Occupied</span></div>
              <div className="card stat-card"><b>{analytics.occupancyRate}%</b><span>Occupancy</span></div>
              <div className="card stat-card"><b>{analytics.sessions}</b><span>Sessions</span></div>
              <div className="card stat-card"><b>{analytics.bookings}</b><span>Bookings</span></div>
            </div>
          )}

          {analytics && (
            <div className="grid mt">
              <div className="card">
                <h2>Booth occupancy</h2>
                <Donut value={analytics.occupancyRate} label="occupied" />
                <p className="muted center">{analytics.occupiedBooths} occupied · {analytics.availableBooths} available · {analytics.totalBooths} total</p>
              </div>
              <div className="card">
                <h2>Bookings per session</h2>
                <BarChart items={analytics.bookingsBySession} />
                {analytics.bookingsBySession?.length > 0 && (
                  <p className="muted center mt">{analytics.bookings} total bookings across {analytics.sessions} session(s)</p>
                )}
              </div>
            </div>
          )}

          <div className="grid mt">
            <div className="card">
              <h2>{editingBoothId ? 'Edit Booth' : 'Add Booth'}</h2>
              <form onSubmit={saveBooth}>
                <label>Booth number</label>
                <input required value={boothForm.number}
                  onChange={(e) => setBoothForm({ ...boothForm, number: e.target.value })} />
                <label>Size</label>
                <select value={boothForm.size}
                  onChange={(e) => setBoothForm({ ...boothForm, size: e.target.value })}>
                  <option>Small</option><option>Medium</option><option>Large</option>
                </select>
                {editingBoothId && (
                  <>
                    <label>Status</label>
                    <select value={boothForm.status}
                      onChange={(e) => setBoothForm({ ...boothForm, status: e.target.value })}>
                      <option value="available">available</option>
                      <option value="reserved">reserved</option>
                      <option value="occupied">occupied</option>
                    </select>
                  </>
                )}
                <div className="row mt">
                  <button type="submit" id="booth-submit-btn" className="full">
                    {editingBoothId ? 'Update booth' : 'Add booth'}
                  </button>
                  {editingBoothId && (
                    <button type="button" className="ghost" onClick={() => { setEditingBoothId(null); setBoothForm(emptyBooth) }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <div className="mt">
                {booths.length === 0 && <p className="muted">No booths yet.</p>}
                {booths.map((b) => (
                  <div key={b._id} className="list-item">
                    <span className="who">Booth {b.number} · {b.size}</span>
                    <div className="row">
                      <span className={`badge ${b.status}`}>{b.status}</span>
                      <button type="button" className="ghost" onClick={() => startEditBooth(b)}>Edit</button>
                      <button type="button" className="danger" onClick={() => deleteBooth(b._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2>{editingSessionId ? 'Edit Session' : 'Add Session'}</h2>
              <form onSubmit={saveSession}>
                <label>Title</label>
                <input required value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} />
                <label>Speaker</label>
                <input value={sessionForm.speaker}
                  onChange={(e) => setSessionForm({ ...sessionForm, speaker: e.target.value })} />
                <label>Topic</label>
                <input value={sessionForm.topic}
                  onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })} />
                <label>Hall / Room <span className="hint">— e.g. Hall A or Room 101</span></label>
                <input
                  value={sessionForm.location}
                  onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                  placeholder="Hall A, Room 101…"
                />
                <label>Seat capacity <span className="hint">— 0 or blank = unlimited</span></label>
                <input type="number" min="0" value={sessionForm.capacity}
                  onChange={(e) => setSessionForm({ ...sessionForm, capacity: e.target.value })} />
                <label>Start time</label>
                <div className="row">
                  <select value={sessionForm.startHour}
                    onChange={(e) => setSessionForm({ ...sessionForm, startHour: e.target.value })}>
                    <option value="">Hour</option>
                    {hourOptions.map((hour) => <option key={`start-hour-${hour}`} value={hour}>{hour}</option>)}
                  </select>
                  <select value={sessionForm.startMinute}
                    onChange={(e) => setSessionForm({ ...sessionForm, startMinute: e.target.value })}>
                    <option value="">Minute</option>
                    {minuteOptions.map((minute) => <option key={`start-minute-${minute}`} value={minute}>{minute}</option>)}
                  </select>
                  <select value={sessionForm.startPeriod}
                    onChange={(e) => setSessionForm({ ...sessionForm, startPeriod: e.target.value })}>
                    <option>AM</option><option>PM</option>
                  </select>
                </div>
                <label>End time</label>
                <div className="row">
                  <select value={sessionForm.endHour}
                    onChange={(e) => setSessionForm({ ...sessionForm, endHour: e.target.value })}>
                    <option value="">Hour</option>
                    {hourOptions.map((hour) => <option key={`end-hour-${hour}`} value={hour}>{hour}</option>)}
                  </select>
                  <select value={sessionForm.endMinute}
                    onChange={(e) => setSessionForm({ ...sessionForm, endMinute: e.target.value })}>
                    <option value="">Minute</option>
                    {minuteOptions.map((minute) => <option key={`end-minute-${minute}`} value={minute}>{minute}</option>)}
                  </select>
                  <select value={sessionForm.endPeriod}
                    onChange={(e) => setSessionForm({ ...sessionForm, endPeriod: e.target.value })}>
                    <option>AM</option><option>PM</option>
                  </select>
                </div>
                <div className="row mt">
                  <button type="submit" id="session-submit-btn" className="full">
                    {editingSessionId ? 'Update session' : 'Add session'}
                  </button>
                  {editingSessionId && (
                    <button type="button" className="ghost" onClick={() => { setEditingSessionId(null); setSessionForm(emptySession) }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              <div className="mt">
                {sessions.length === 0 && <p className="muted">No sessions yet.</p>}
                {sessions.map((s) => (
                  <div key={s._id} className="list-item">
                    <div>
                      <div className="who">{s.title}</div>
                      <div className="sub">{s.speaker} · 📍 {s.location || 'TBA'} · 🕐 {new Date(s.startTime).toLocaleTimeString()}</div>
                    </div>
                    <div className="row">
                      <button type="button" className="ghost" onClick={() => startEditSession(s)}>Edit</button>
                      <button type="button" className="danger" onClick={() => deleteSession(s._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section-head"><h2>Announcements</h2></div>
          <div className="grid">
            <div className="card">
              <h2>Post announcement</h2>
              <form onSubmit={postAnnouncement}>
                <label>Title</label>
                <input required value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} />
                <label>Message</label>
                <textarea rows="3" required value={annForm.message}
                  onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })} />
                <button type="submit" className="mt full">Publish</button>
              </form>
            </div>
            <div className="card">
              <h2>Published</h2>
              {announcements.length === 0 && <p className="muted">No announcements yet.</p>}
              {announcements.map((a) => (
                <div key={a._id} className="list-item">
                  <div>
                    <div className="who">{a.title}</div>
                    <div className="sub">{a.message}</div>
                  </div>
                  <button type="button" className="danger" onClick={() => deleteAnnouncement(a._id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
