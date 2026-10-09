import '../css/auth.css'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { pageImages } from '../images'

const Login = () => {
  const { login, verifyOtp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [step, setStep] = useState('form')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      if (err.response?.data?.needsVerify) return setStep('otp')
      setError(err.response?.data?.message || 'Login failed')
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
          <div className="auth-banner" style={{ backgroundImage: `url("${pageImages.login}")` }} />
          <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>Step 2 of 2</span>
          <h2>Verify your email</h2>
          <p className="sub">Enter the 6-digit code sent to <b>{form.email}</b></p>
          {error && <p className="error">{error}</p>}
          <form onSubmit={verify}>
            <label>OTP code</label>
            <input required maxLength={6} inputMode="numeric" placeholder="••••••" value={code}
              onChange={(e) => setCode(e.target.value)} style={{ textAlign: 'center', letterSpacing: '.5em', fontSize: 20, fontWeight: 700 }} />
            <button className="mt full">Verify &amp; continue</button>
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
        <div className="auth-banner" style={{ backgroundImage: `url("${pageImages.login}")` }} />
        <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>Welcome back</span>
        <h2>Login to EventSphere</h2>
        <p className="sub">Access your expos, booths and sessions.</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={submit}>
          <label>Email</label>
          <input type="email" required placeholder="you@company.com" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <label>Password</label>
          <input type="password" required placeholder="••••••••" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="mt full">Login</button>
        </form>
        <p className="auth-aside">
          <Link to="/forgot-password">Forgot password?</Link> · <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
