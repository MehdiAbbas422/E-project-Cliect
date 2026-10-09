import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import api from '../api'
import { useAuth } from './AuthContext'
import { connectSocket, disconnectSocket } from '../socket'

const NotificationContext = createContext()

export const useNotifications = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // Purpose: Reloads the notification list + unread count from the API.
  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnread(0)
      return
    }
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications)
      setUnread(data.unread)
    } catch {
      /* keep the previous list on a transient error */
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  // Purpose: On login, opens the real-time channel; incoming notifications are
  // prepended and shown as a toast, and server "data changed" events are
  // re-broadcast as a window event so pages can refresh themselves live.
  useEffect(() => {
    if (!user) {
      disconnectSocket()
      return undefined
    }
    const token = localStorage.getItem('token')
    const socket = connectSocket(token)

    const onNotification = (notification) => {
      setNotifications((current) => [notification, ...current])
      setUnread((current) => current + 1)
      setToast(notification)
      window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => setToast(null), 5000)
    }
    const onChanged = (payload) => {
      window.dispatchEvent(new CustomEvent('eventsphere:changed', { detail: payload }))
    }

    socket.on('notification', onNotification)
    socket.on('data:changed', onChanged)

    return () => {
      socket.off('notification', onNotification)
      socket.off('data:changed', onChanged)
    }
  }, [user])

  const markRead = async (id) => {
    setNotifications((current) => current.map((n) => (n._id === id ? { ...n, read: true } : n)))
    setUnread((current) => Math.max(0, current - 1))
    try { await api.patch(`/notifications/${id}/read`) } catch { refresh() }
  }

  const markAllRead = async () => {
    setNotifications((current) => current.map((n) => ({ ...n, read: true })))
    setUnread(0)
    try { await api.patch('/notifications/read-all') } catch { refresh() }
  }

  const clearAll = async () => {
    setNotifications([])
    setUnread(0)
    try { await api.delete('/notifications') } catch { refresh() }
  }

  return (
    <NotificationContext.Provider value={{ notifications, unread, refresh, markRead, markAllRead, clearAll }}>
      {children}
      {toast && (
        <div className={`toast ${toast.type === 'announcement' ? 'info' : 'success'}`} role="status">
          <strong>{toast.title}</strong>
          {toast.message && <div className="toast-body">{toast.message}</div>}
        </div>
      )}
    </NotificationContext.Provider>
  )
}
