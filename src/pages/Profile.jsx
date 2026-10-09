import '../css/auth.css'
import '../css/profile.css'
import { useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import PageHero from '../components/PageHero'
import { pageImages } from '../images'

// Purpose: Lets a logged-in user update their display name and change their
// password (current password required).
const Profile = () => {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', currentPassword: '', newPassword: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    try {
      const { data } = await api.patch('/auth/profile', form)
      updateUser({ name: data.user.name })
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }))
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    }
  }

  return (
    <div className="container">
      <PageHero
        eyebrow="Account"
        title="My Profile"
        subtitle="Update your name or set a new password."
        image={pageImages.profile}
      />

      <div className="auth-wrap card">
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <form onSubmit={submit}>
          <label>Name</label>
          <input required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <label>Email</label>
          <input value={user?.email || ''} disabled />
          <span className="hint" style={{ display: 'block', marginBottom: 10 }}>Role: {user?.role}</span>

          <label>Current password <span className="hint">— only to change password</span></label>
          <input type="password" placeholder="••••••••" value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />

          <label>New password</label>
          <input type="password" minLength={6} placeholder="At least 6 characters" value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />

          <button className="mt full">Save changes</button>
        </form>
      </div>
    </div>
  )
}

export default Profile
