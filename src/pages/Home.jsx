import '../css/home.css'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const features = [
  {
    ico: '🎪',
    title: 'Organizers',
    text: 'Create expos, allocate booths, schedule sessions and track live analytics from one dashboard.',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80'
  },
  {
    ico: '🏢',
    title: 'Exhibitors',
    text: 'Publish your company profile with a JPG/PNG logo, reserve booths and manage bookings.',
    img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80'
  },
  {
    ico: '🎟️',
    title: 'Attendees',
    text: 'Browse expos, explore the interactive venue map, book sessions and connect with exhibitors.',
    img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80'
  }
]

const Home = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ expos: 0, exhibitors: 0 })

  useEffect(() => {
    api.get('/expos').then(({ data }) => setStats((s) => ({ ...s, expos: data.length }))).catch(() => {})
    api.get('/exhibitors').then(({ data }) => setStats((s) => ({ ...s, exhibitors: data.length }))).catch(() => {})
  }, [])

  return (
    <div className="container">
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-inner">
          <span className="pill">✨ Premium expo &amp; trade-show platform</span>
          <h1>
            Run expos that feel<br />
            <span className="accent">effortlessly organized.</span>
          </h1>
          <p>
            EventSphere unifies events, booths, schedules, exhibitors and attendees —
            with searchable venue maps, instant image uploads and real-time analytics.
          </p>
          <div className="hero-actions">
            <Link to="/expos"><button>Browse Expos</button></Link>
            {!user && <Link to="/register"><button className="ghost">Create free account</button></Link>}
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat"><b>{stats.expos}</b><span>Expos &amp; trade shows</span></div>
          <div className="stat"><b>{stats.exhibitors}</b><span>Approved exhibitors</span></div>
          <div className="stat"><b>3 roles</b><span>Organizer · Exhibitor · Attendee</span></div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <div className="section-head">
        <h2>Built for everyone at the event</h2>
        <Link to="/expos" className="map-link">Explore all expos →</Link>
      </div>
      <div className="grid">
        {features.map((f) => (
          <div className="card feature" key={f.title}>
            <img className="top-img" src={f.img} alt={f.title} loading="lazy" />
            <div className="ico">{f.ico}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>

      {/* ---------- Highlights ---------- */}
      <div className="section-head">
        <h2>Why teams choose EventSphere</h2>
      </div>
      <div className="grid">
        <div className="card">
          <div className="ico" style={icoStyle}>🗺️</div>
          <h3>Searchable venue maps</h3>
          <p className="muted">Drop a pin or search any address when creating an expo — visitors see the exact location on an interactive map.</p>
        </div>
        <div className="card">
          <div className="ico" style={icoStyle}>🖼️</div>
          <h3>Direct image uploads</h3>
          <p className="muted">Upload JPG and PNG logos and cover photos straight from your device — no external image hosting required.</p>
        </div>
        <div className="card">
          <div className="ico" style={icoStyle}>🔐</div>
          <h3>Verified accounts</h3>
          <p className="muted">Email OTP verification, role-based access and secure JWT sessions protect every organizer, exhibitor and visitor.</p>
        </div>
      </div>

      {/* ---------- CTA ---------- */}
      <div className="card pad-lg mt" style={{ background: 'var(--primary-grad)', border: 'none', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ color: '#fff' }}>Ready to launch your next expo?</h2>
        <p style={{ color: '#dfe2ff', maxWidth: 560, margin: '0 auto 22px' }}>
          Join organizers and exhibitors managing their events on EventSphere today.
        </p>
        <div className="row center">
          <Link to={user ? '/expos' : '/register'}>
            <button style={{ background: '#fff', color: 'var(--primary)', boxShadow: 'none' }}>
              {user ? 'Go to Expos' : 'Get started free'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

const icoStyle = {
  width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center',
  fontSize: 22, background: 'var(--primary-soft)', border: '1px solid var(--primary-line)', marginBottom: 16
}

export default Home
