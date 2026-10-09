import '../css/auth.css'
import '../css/feedback.css'
import { useEffect, useState } from 'react'
import api from '../api'
import { pageImages } from '../images'

// Purpose: Feedback & support page — lets a logged-in user submit feedback and
// see their previous submissions together with any admin reply.
const Feedback = () => {
  const [form, setForm] = useState({ message: '', type: 'suggestion' })
  const [message, setMessage] = useState('')
  const [mine, setMine] = useState([])

  const loadMine = () => api.get('/feedback/mine').then(({ data }) => setMine(data))

  useEffect(() => { loadMine() }, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/feedback', form)
    setForm({ message: '', type: 'suggestion' })
    setMessage('Thank you! Your feedback has been submitted.')
    loadMine()
  }

  return (
    <div className="container">
      <div className="auth-wrap card">
        <div className="auth-banner" style={{ backgroundImage: `url("${pageImages.feedback}")` }} />
        <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>We listen</span>
        <h1>Feedback &amp; Support</h1>
        <p className="sub">Tell us what works, what does not, or report an issue.</p>
        {message && <p className="success">{message}</p>}
        <form onSubmit={submit}>
          <label>Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="suggestion">Suggestion</option>
            <option value="issue">Report an issue</option>
          </select>
          <label>Message</label>
          <textarea rows="5" required placeholder="Write your feedback here…"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button className="mt full">Submit feedback</button>
        </form>
      </div>

      <div className="section-head"><h2>My previous feedback</h2></div>
      {mine.length === 0 && <div className="empty"><span className="em">💬</span>You have not sent any feedback yet.</div>}
      <div className="grid">
        {mine.map((f) => (
          <div className="card" key={f._id}>
            <div className="row between">
              <span className="badge pending">{f.type}</span>
              <span className={`badge ${f.status === 'resolved' ? 'approved' : 'info'}`}>{f.status}</span>
            </div>
            <p className="mt">{f.message}</p>
            <span className="sub">{new Date(f.createdAt).toLocaleString()}</span>
            {f.reply && (
              <div className="reply-box">
                <span className="reply-label">Support reply</span>
                <p>{f.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Feedback
