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

const highlights = [
  {
    ico: '🗺️',
    title: 'Searchable venue maps',
    text: 'Drop a pin or search any location — attendees explore every hall, booth and session on an interactive map.'
  },
  {
    ico: '🖼️',
    title: 'Logo & banner uploads',
    text: 'Add a JPG or PNG logo and cover straight from your device. No external hosting, no broken images.'
  },
  {
    ico: '🔐',
    title: 'Secure, role-based access',
    text: 'Verified email, JWT sessions and clear organizer / exhibitor / attendee roles keep every action controlled.'
  }
]

const Home = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({ expos: 0, exhibitors: 0 })

  useEffect(() => {
    api.get('/expos').then(({ data }) => setStats((s) => ({ ...s, expos: data.length }))).catch(() => {})
    api.get('/exhibitors').then(({ data }) => setStats((s) => ({ ...s, exhibitors: data.length }))).catch(() => {})
  }, [])

  const bars = [42, 68, 54, 88, 62]

  return (
    <div className="container">
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-inner">
          <span className="pill" data-reveal>✨ Premium expo &amp; trade-show platform</span>
          <h1 data-reveal>
            Run expos that feel<br />
            <span className="accent">effortlessly organized.</span>
          </h1>
          <p data-reveal>
            EventSphere unifies events, booths, schedules, exhibitors and attendees —
            with searchable venue maps, live analytics and a dashboard that keeps
            every moving part in view.
          </p>
          <div className="hero-actions" data-reveal>
            <Link to="/expos"><button>Explore expos</button></Link>
            <Link to={user ? '/dashboard' : '/register'}>
              <button className="ghost">{user ? 'Go to dashboard' : 'Create free account'}</button>
            </Link>
          </div>
        </div>

        {/* Dimensional product visual — decorative, hidden on smaller screens */}
        <div className="hero-visual" data-parallax="0.06" aria-hidden="true">
          <div className="hv-panel" />
          <div className="hv-card" data-tilt="6">
            <div className="hv-cover">
              <span className="hv-chip"><i className="hv-dot" />Live now</span>
              <span className="hv-date"><b>20</b><span>SEP</span></span>
            </div>
            <div className="hv-body">
              <span className="hv-line hv-line--lg" />
              <span className="hv-line" />
              <span className="hv-line hv-line--sm" />
              <div className="hv-bars">
                {bars.map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
          <div className="hv-float hv-float--badge" data-float="fast">
            <span className="hv-float__in">✓ Verified</span>
          </div>
          <div className="hv-float hv-float--pin" data-float>
            <span className="hv-float__in">📍</span>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat" data-reveal>
            <b>{stats.expos}</b>
            <span>Expos hosted</span>
          </div>
          <div className="stat" data-reveal>
            <b>{stats.exhibitors}</b>
            <span>Exhibitors onboard</span>
          </div>
          <div className="stat" data-reveal>
            <b>3</b>
            <span>Roles: organizer, exhibitor, attendee</span>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="band band--grid">
        <div className="section-head">
          <h2>Built for everyone at the event</h2>
          <Link to="/expos" className="map-link">Explore all expos →</Link>
        </div>
        <div className="grid">
          {features.map((f) => (
            <div className="card feature" key={f.title} data-glare>
              <img className="top-img" src={f.img} alt="" loading="lazy" />
              <div className="ico" aria-hidden="true">{f.ico}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Highlights ---------- */}
      <section className="band band--glow">
        <div className="section-head">
          <h2>Why teams choose EventSphere</h2>
        </div>
        <div className="grid">
          {highlights.map((h) => (
            <div className="card" key={h.title}>
              <div className="ico" aria-hidden="true">{h.ico}</div>
              <h3>{h.title}</h3>
              <p>{h.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Call to action ---------- */}
      <section className="band band--dots">
        <div className="cta-panel card pad-lg" data-glare>
          <h2>Ready to launch your next expo?</h2>
          <p>
            Join organizers and exhibitors already running their events on EventSphere.
          </p>
          <div className="row center">
            <Link to={user ? '/expos' : '/register'}>
              <button className="cta-btn">{user ? 'Go to Expos' : 'Get started free'}</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
