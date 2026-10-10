import { Link, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Backdrop from './components/Backdrop'
import Protected from './components/Protected'
import useScrollReveal from './hooks/useScrollReveal'
import useTilt from './hooks/useTilt'
import useParallax from './hooks/useParallax'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Expos from './pages/Expos'
import ExpoDetail from './pages/ExpoDetail'
import Exhibitors from './pages/Exhibitors'
import Dashboard from './pages/Dashboard'
import AdminExhibitors from './pages/admin/AdminExhibitors'
import AdminFeedback from './pages/admin/AdminFeedback'
import AdminUsers from './pages/admin/AdminUsers'
import ExhibitorPortal from './pages/ExhibitorPortal'
import Feedback from './pages/Feedback'
import MyBookings from './pages/MyBookings'
import MyMessages from './pages/MyMessages'
import Profile from './pages/Profile'

// Purpose: Friendly fallback shown for any unknown URL.
const NotFound = () => (
  <div className="container">
    <div className="empty" style={{ marginTop: 60 }}>
      <span className="em">🧭</span>
      <h2>Page not found</h2>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link to="/" className="nav-cta" style={{ display: 'inline-block', marginTop: 12 }}>Back home</Link>
    </div>
  </div>
)

const App = () => {
  // Global visual-runtime: one observer each for reveal / tilt / parallax,
  // mounted once for the whole app (not per page).
  useScrollReveal()
  useTilt()
  useParallax()

  return (
    <>
      <Backdrop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/expos" element={<Expos />} />
        <Route path="/expos/:id" element={<ExpoDetail />} />
        <Route path="/exhibitors" element={<Exhibitors />} />
        <Route path="/feedback" element={<Protected><Feedback /></Protected>} />
        <Route path="/my-bookings" element={<Protected><MyBookings /></Protected>} />
        <Route path="/my-messages" element={<Protected><MyMessages /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/dashboard" element={<Protected roles={['admin']}><Dashboard /></Protected>} />
        <Route path="/admin/exhibitors" element={<Protected roles={['admin']}><AdminExhibitors /></Protected>} />
        <Route path="/admin/feedback" element={<Protected roles={['admin']}><AdminFeedback /></Protected>} />
        <Route path="/admin/users" element={<Protected roles={['admin']}><AdminUsers /></Protected>} />
        <Route path="/exhibitor" element={<Protected roles={['exhibitor']}><ExhibitorPortal /></Protected>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer>
        <b>EventSphere</b> — premium expo &amp; trade-show management · Built with React, Node.js, MongoDB &amp; Leaflet maps
      </footer>
    </>
  )
}

export default App
