import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (stored && token) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const persist = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    persist(data)
  }

  const register = async (payload) => api.post('/auth/register', payload)

  const verifyOtp = async (email, code) => {
    const { data } = await api.post('/auth/verify-otp', { email, code })
    persist(data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Purpose: Applies a profile update (e.g. new name) to state + localStorage
  // so the navbar and pages re-render immediately.
  const updateUser = (patch) => {
    setUser((current) => {
      const next = { ...current, ...patch }
      localStorage.setItem('user', JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
