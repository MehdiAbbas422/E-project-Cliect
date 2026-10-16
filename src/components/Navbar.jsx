import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
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
  const { pathname } = useLocation()

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

  const isActive = (path) => pathname === path

  return (
    <>
      {/* Mobile top bar */}
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

      {/* Icon Rail (far left floating pill) */}
      <div className="sidebar-rail">
        <div className="rail-brand">🎪</div>
        <div className="rail-links">
          <button className={`rail-btn ${isActive('/expos') ? 'active' : ''}`} title="Expos" onClick={() => navigate('/expos')}>🌐</button>
          <button className={`rail-btn ${isActive('/exhibitors') ? 'active' : ''}`} title="Exhibitors" onClick={() => navigate('/exhibitors')}>🏢</button>
          {user?.role === 'admin' && (
            <>
              <button className={`rail-btn ${isActive('/dashboard') ? 'active' : ''}`} title="Dashboard" onClick={() => navigate('/dashboard')}>📊</button>
              <button className={`rail-btn ${isActive('/admin/analytics') ? 'active' : ''}`} title="Analytics" onClick={() => navigate('/admin/analytics')}>📈</button>
            </>
          )}
          {user?.role === 'exhibitor' && (
            <button className={`rail-btn ${isActive('/exhibitor') ? 'active' : ''}`} title="My Portal" onClick={() => navigate('/exhibitor')}>🏪</button>
          )}
          {user && (
            <button className={`rail-btn ${isActive('/profile') ? 'active' : ''}`} title="Profile" onClick={() => navigate('/profile')}>👤</button>
          )}
        </div>
        <div className="rail-divider" />
        <div className="rail-links">
          {user ? (
            <button className="rail-btn" title="Logout" onClick={handleLogout}>🚪</button>
          ) : (
            <button className={`rail-btn ${isActive('/login') ? 'active' : ''}`} title="Login" onClick={() => navigate('/login')}>🔑</button>
          )}
        </div>
      </div>

      {/* Main Sidebar Panel */}
      <nav className={`sidebar ${menu ? 'open' : ''}`}>
        {/* User Profile Header */}
        {user && (
          <div className="sidebar-profile">
            <div className="profile-avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div className="profile-info">
              <div className="profile-name">{user.name}</div>
              <div className="profile-email">{user.email}</div>
            </div>
            <span className="profile-chevron">▾</span>
          </div>
        )}

        <div className={`links ${menu ? 'open' : ''}`} onClick={onLinksClick}>
          {/* Explore Section */}
          <span className="sidebar-section">Explore</span>
          <NavLink to="/expos" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="link-icon">🌐</span> Expos
          </NavLink>
          <NavLink to="/exhibitors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="link-icon">🏢</span> Exhibitors
          </NavLink>

          {/* Administration Section */}
          {user?.role === 'admin' && (
            <>
              <span className="sidebar-section">Administration</span>
              <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon">📊</span> Dashboard
                <span className="badge-count">{/* expo count badge */}</span>
              </NavLink>
              <NavLink to="/admin/exhibitors" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon">📄</span> Applications
                <span className="badge-count">{/* pending count badge */}</span>
              </NavLink>
              <NavLink to="/admin/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon">📈</span> Analytics
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon">👥</span> Users
              </NavLink>
              <NavLink to="/admin/feedback" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon">💬</span> Feedback
              </NavLink>
            </>
          )}

          {/* Exhibitor Section */}
          {user?.role === 'exhibitor' && (
            <>
              <span className="sidebar-section">My Workspace</span>
              <NavLink to="/exhibitor" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon">🏪</span> My Portal
              </NavLink>
            </>
          )}

          {/* Account Section */}
          {user && (
            <>
              <span className="sidebar-section">Your Account</span>
              <NavLink to="/my-bookings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon">🎟️</span> My Bookings
              </NavLink>
              <NavLink to="/my-messages" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon">✉️</span> Messages
              </NavLink>
              {user.role !== 'admin' && (
                <NavLink to="/feedback" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="link-icon">💬</span> Feedback
                </NavLink>
              )}
            </>
          )}

          {/* Guest Section */}
          {!user && (
            <>
              <span className="sidebar-section">Get Started</span>
              <NavLink to="/login" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon">🔑</span> Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="link-icon">✨</span> Get Started
              </NavLink>
            </>
          )}
        </div>

        {/* Bottom Section */}
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
                <span>🔔</span> Notifications
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
