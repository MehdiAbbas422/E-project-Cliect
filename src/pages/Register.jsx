import '../css/auth.css'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { pageImages } from '../images'

const Register = () => {
  const { register, verifyOtp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'attendee'})
  const [step, setStep] = useState('form')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  const verify = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await verifyOtp(form.email, code)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed')
    }
  }

  const resend = async () => {
    setError('')
    try {
      await api.post('/auth/resend-otp', { email: form.email, purpose: 'verify' })
      setError('A new OTP has been sent.')
    } catch (err) {
      setError(err.response?.data?.message || 'Resend failed')
    }
  }

  if (step === 'otp') {
    return (
      <div className="container">
        <div className="auth-wrap card">
          <div className="auth-banner" style={{ backgroundImage: `url("${pageImages.register}")` }} />
          <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>Step 2 of 2</span>
          <h2>Verify your email</h2>
          <p className="sub">Enter the 6-digit code sent to <b>{form.email}</b></p>
          {error && <p className="error">{error}</p>}
          <form onSubmit={verify}>
            <label>OTP code</label>
            <input required maxLength={6} inputMode="numeric" placeholder="••••••" value={code}
              onChange={(e) => setCode(e.target.value)} style={{ textAlign: 'center', letterSpacing: '.5em', fontSize: 20, fontWeight: 700 }} />
            <button className="mt full">Verify &amp; finish</button>
          </form>
          <p className="auth-aside">
            Didn't get it? <a onClick={resend} style={{ cursor: 'pointer' }}>Resend OTP</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="auth-wrap card">
        <div className="auth-banner" style={{ backgroundImage: `url("${pageImages.register}")` }} />
        <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>Join EventSphere</span>
        <h2>Create your account</h2>
        <p className="sub">Organize, exhibit or attend — pick your role below.</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={submit}>
          <label>Name</label>
          <input required placeholder="Your full name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label>Email</label>
          <input type="email" required placeholder="you@company.com" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label>Password</label>
          <input type="password" required minLength={6} placeholder="At least 6 characters" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <label>Role</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="attendee">Attendee — visit expos &amp; book sessions</option>
            <option value="exhibitor">Exhibitor — showcase your company</option>
            <option value="admin">Admin / Organizer — run events</option>
          </select>
          <button className="mt full">Create account</button>
        </form>
        <p className="auth-aside">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}

export default Register
