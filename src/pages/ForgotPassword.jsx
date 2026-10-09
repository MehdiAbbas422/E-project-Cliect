import '../css/auth.css'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { pageImages } from '../images'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [step, setStep] = useState('email')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const requestOtp = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/auth/forgot-password', { email: form.email })
      setStep('reset')
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed')
    }
  }

  const reset = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/auth/reset-password', { ...form, code })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed')
    }
  }

  const resend = async () => {
    setError('')
    try {
      await api.post('/auth/resend-otp', { email: form.email, purpose: 'reset' })
      setError('A new OTP has been sent.')
    } catch (err) {
      setError(err.response?.data?.message || 'Resend failed')
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap card">
        <div className="auth-banner" style={{ backgroundImage: `url("${pageImages.forgot}")` }} />
        <span className="eyebrow" style={{ display: 'block', textAlign: 'center' }}>Account recovery</span>
        <h2>Reset password</h2>
        <p className="sub">We will email you a one-time code.</p>
        {error && <p className="error">{error}</p>}

        {step === 'email' ? (
          <form onSubmit={requestOtp}>
            <label>Email</label>
            <input type="email" required placeholder="you@company.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <button className="mt full">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={reset}>
            <p className="muted">Enter the code sent to <b>{form.email}</b> and your new password.</p>
            <label>OTP code</label>
            <input required maxLength={6} inputMode="numeric" placeholder="••••••" value={code}
              onChange={(e) => setCode(e.target.value)} style={{ textAlign: 'center', letterSpacing: '.5em', fontSize: 20, fontWeight: 700 }} />
            <label>New password</label>
            <input type="password" required minLength={6} placeholder="At least 6 characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button className="mt full">Reset password</button>
            <p className="auth-aside">
              <a onClick={resend} style={{ cursor: 'pointer' }}>Resend OTP</a>
            </p>
          </form>
        )}

        <p className="auth-aside"><Link to="/login">← Back to login</Link></p>
      </div>
    </div>
  )
}

export default ForgotPassword
