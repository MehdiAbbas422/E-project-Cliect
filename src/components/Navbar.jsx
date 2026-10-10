import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import logo from '../assets/logo.png'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { notifications, unread, markRead, markAllRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false) // notifications panel
  const [menu, setMenu] = useState(false) // mobile navigation drawer
  const panelRef = useRef(null)
  const navigate = useNavigate()

  // Purpose: Closes the notification panel when the user clicks outside it.
  useEffect(() => {
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Purpose: Auto-closes the mobile drawer when the viewport grows back to desktop.
  useEffect(() => {
    const close = () => setMenu(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  // Purpose: Closes the mobile drawer whenever a navigation link is tapped
  // (but not when the notification bell is tapped).
  const onLinksClick = (e) => {
    if (e.target.closest('a')) setMenu(false)
  }

  const openNotification = (n) => {
    if (!n.read) markRead(n._id)
    setOpen(false)
    setMenu(false)
    if (n.link) navigate(n.link)
  }

  const handleLogout = () => {
    setMenu(false)
    logout()
    navigate('/')
  }

  return (
    <nav>
      <Link to="/" className="brand" onClick={() => setMenu(false)}>
        <img className="brand-logo" src={logo} alt="" aria-hidden="true" />
        <span className="brand-name">Event<b>Sphere</b></span>
      </Link>

      <button
        type="button"
        className={`nav-toggle ${menu ? 'open' : ''}`}
        aria-label="Toggle navigation menu"
        aria-expanded={menu}
        onClick={() => setMenu((v) => !v)}
      >
        <span /><span /><span />
      </button>

      <div className={`links ${menu ? 'open' : ''}`} onClick={onLinksClick}>
        <Link to="/expos">Expos</Link>
        <Link to="/exhibitors">Exhibitors</Link>
        {user?.role === 'admin' && <Link to="/dashboard">Dashboard</Link>}
        {user?.role === 'exhibitor' && <Link to="/exhibitor">My Portal</Link>}
        {user && <Link to="/my-bookings">My Bookings</Link>}
        {user && <Link to="/my-messages">Messages</Link>}
        {user && <Link to="/feedback">Feedback</Link>}

        {user && (
          <div className="bell-wrap" ref={panelRef}>
            <button
              type="button"
              className="bell"
              aria-label="Notifications"
              onClick={() => setOpen((v) => !v)}
            >
              🔔
              {unread > 0 && <span className="bell-count">{unread > 9 ? '9+' : unread}</span>}
            </button>
            {open && (
              <div className="notif-panel">
                <div className="notif-head">
                  <strong>Notifications</strong>
                  <div className="row">
                    <button type="button" className="link-btn" onClick={markAllRead}>Mark all read</button>
                    <button type="button" className="link-btn" onClick={clearAll}>Clear</button>
                  </div>
                </div>
                <div className="notif-list">
                  {notifications.length === 0 && (
                    <div className="empty" style={{ padding: '22px 12px' }}>
                      <span className="em">🔔</span>You're all caught up.
                    </div>
                  )}
                  {notifications.map((n) => (
                    <button
                      type="button"
                      key={n._id}
                      className={`notif-item ${n.read ? '' : 'unread'}`}
                      onClick={() => openNotification(n)}
                    >
                      <span className="notif-title">{n.title}</span>
                      {n.message && <span className="notif-msg">{n.message}</span>}
                      <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {user ? (
          <>
            <Link to="/profile" className="user-chip" title="Edit profile">
              <span className="dot" />
              {user.name} · {user.role}
            </Link>
            <button className="ghost" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="nav-cta">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
