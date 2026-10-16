import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import logo from '../assets/logo.png'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { notifications, unread, markRead, markAllRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const panelRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    const close = () => setMenu(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

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
    <>
      <div className="mobile-topbar">
        <button
          type="button"
          className={`sidebar-toggle ${menu ? 'open' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menu}
          onClick={() => setMenu((v) => !v)}
        >
          <span /><span /><span />
        </button>
        <Link to="/" className="brand" onClick={() => setMenu(false)}>
          <img className="brand-logo" src={logo} alt="" aria-hidden="true" />
          <span className="brand-name">Event<b>Sphere</b></span>
        </Link>
      </div>
      {menu && <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenu(false)} />}

      <nav className={`sidebar ${menu ? 'open' : ''}`}>
        <Link to="/" className="brand sidebar-brand" onClick={() => setMenu(false)}>
          <img className="brand-logo" src={logo} alt="" aria-hidden="true" />
          <span className="brand-name">Event<b>Sphere</b></span>
        </Link>

        <div className={`links ${menu ? 'open' : ''}`} onClick={onLinksClick}>
          <span className="sidebar-section">Explore</span>
          <NavLink to="/expos" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Expos</NavLink>
          <NavLink to="/exhibitors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Exhibitors</NavLink>
          {user?.role === 'admin' && (
            <>
              <span className="sidebar-section">Administration</span>
              <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
              <NavLink to="/admin/exhibitors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Applications</NavLink>
              <NavLink to="/admin/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Analytics</NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Users</NavLink>
              <NavLink to="/admin/feedback" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Feedback</NavLink>
            </>
          )}
          {user?.role === 'exhibitor' && <NavLink to="/exhibitor" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>My Portal</NavLink>}
          {user && (
            <>
              <span className="sidebar-section">Your account</span>
              <NavLink to="/my-bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>My Bookings</NavLink>
              <NavLink to="/my-messages" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Messages</NavLink>
              {user.role !== 'admin' && <NavLink to="/feedback" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Feedback</NavLink>}
            </>
          )}
          {!user && (
            <>
              <span className="sidebar-section">Your account</span>
              <NavLink to="/login" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Login</NavLink>
              <NavLink to="/register" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>Get Started</NavLink>
            </>
          )}
        </div>

        {user && (
          <div className="sidebar-bottom">
            <div className="bell-wrap" ref={panelRef}>
              <button
                type="button"
                className="bell"
                aria-label="Notifications"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <span>🔔 Notifications</span>
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
            <Link to="/profile" className="user-chip" title="Edit profile" onClick={() => setMenu(false)}>
              <span className="dot" />
              {user.name} · {user.role}
            </Link>
            <button type="button" className="ghost sidebar-logout" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar
