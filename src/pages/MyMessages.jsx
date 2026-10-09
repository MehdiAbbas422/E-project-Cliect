import '../css/my-messages.css'
import { useCallback, useEffect, useState } from 'react'
import api from '../api'
import { useRealtime } from '../hooks/useRealtime'
import PageHero from '../components/PageHero'
import { pageImages } from '../images'

// Purpose: Shows every enquiry the logged-in user has sent to exhibitors,
// including any reply, closing the communication loop.
const MyMessages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    api.get('/enquiries/mine')
      .then(({ data }) => setMessages(data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])
  useRealtime(useCallback((detail) => { if (detail.scope === 'enquiries') load() }, [load]))

  return (
    <div className="container">
      <PageHero
        eyebrow="Communication"
        title="My Messages"
        subtitle="Questions you sent to exhibitors and their replies."
        image={pageImages.myMessages}
      />

      {loading && <div className="empty"><span className="em">⏳</span>Loading your messages…</div>}
      {!loading && messages.length === 0 && (
        <div className="empty"><span className="em">💬</span>No messages yet. Contact an exhibitor from the directory.</div>
      )}

      <div className="grid">
        {messages.map((m) => (
          <div className="card" key={m._id}>
            <div className="row between">
              <h3>{m.exhibitor?.company || 'Exhibitor'}</h3>
              <span className={`badge ${m.status === 'replied' ? 'approved' : 'pending'}`}>{m.status}</span>
            </div>
            <p className="muted">You wrote:</p>
            <p>{m.message}</p>
            {m.reply && (
              <div className="reply-box">
                <span className="reply-label">Reply</span>
                <p>{m.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyMessages
