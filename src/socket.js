import { io } from 'socket.io-client'
import api from './api'

// ---------------------------------------------------------------------------
// Real-time layer.
//
// The app was written around Socket.IO. Locally — and on hosts that keep a
// long-running process (Render, Koyeb) — we still use it. Serverless hosts such
// as Vercel have no persistent WebSocket server, so there we transparently fall
// back to short polling against GET /api/events + GET /api/notifications.
//
// Both modes expose the same tiny API used across the app: on / off / emit.
// ---------------------------------------------------------------------------

const POLL_MS = 5000

// Real Socket.IO is used during development or whenever VITE_SOCKET_URL is
// configured; otherwise (e.g. the Vercel production build) we poll.
const USE_SOCKET = Boolean(import.meta.env.VITE_SOCKET_URL) || import.meta.env.DEV
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.DEV ? 'https://e-project-server-pb0fx3t9o-zeny3.vercel.app' : window.location.origin)

let socket = null // real Socket.IO connection (when available)
let poller = null // polling fallback emitter
let timers = []

// Purpose: Builds a Socket.IO-shaped emitter that keeps the UI fresh by
// polling the API. It fires the same 'notification' and 'data:changed' events,
// so pages and the notification bell need no changes.
const createPoller = () => {
  const listeners = {}

  const fire = (event, payload) => {
    ;(listeners[event] || []).slice().forEach((fn) => {
      try { fn(payload) } catch { /* a listener must never break the poll loop */ }
    })
  }

  let since = new Date().toISOString()
  const seen = new Set()
  let seeded = false

  // Asks the server for data-change markers recorded since the last poll and
  // re-emits them so open pages refresh themselves.
  const pollChanges = async () => {
    try {
      const { data } = await api.get('/events', { params: { since } })
      if (data.now) since = data.now
      ;(data.changes || []).forEach((c) => fire('data:changed', { scope: c.scope, expoId: c.expoId }))
    } catch { /* transient error — try again on the next tick */ }
  }

  // Watches for brand-new notifications and toasts them (the provider already
  // loads the existing list, so we only announce ones that appear later).
  const pollNotifications = async () => {
    if (!localStorage.getItem('token')) return
    try {
      const { data } = await api.get('/notifications')
      const list = data.notifications || []
      if (!seeded) {
        list.forEach((n) => seen.add(n._id))
        seeded = true
        return
      }
      list.forEach((n) => {
        if (!seen.has(n._id)) {
          seen.add(n._id)
          if (!n.read) fire('notification', n)
        }
      })
    } catch { /* transient error */ }
  }

  return {
    on: (event, fn) => { (listeners[event] = listeners[event] || []).push(fn) },
    off: (event, fn) => { listeners[event] = (listeners[event] || []).filter((f) => f !== fn) },
    emit: () => {}, // joinExpo/leaveExpo are unnecessary with polling
    start: () => {
      pollChanges()
      pollNotifications()
      timers = [
        window.setInterval(pollChanges, POLL_MS),
        window.setInterval(pollNotifications, POLL_MS)
      ]
      window.dispatchEvent(new Event('eventsphere:socket-ready'))
    },
    stop: () => {
      timers.forEach((t) => window.clearInterval(t))
      timers = []
    }
  }
}

// Purpose: Opens a single real-time channel for the current session (called
// when a user logs in / the app starts with a token) and returns an object with
// the same on/off/emit API whether we are using Socket.IO or polling.
export const connectSocket = (token) => {
  disconnectSocket()

  if (USE_SOCKET) {
    socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] })
    // Let any page know when the connection is ready so it can subscribe to its
    // rooms (e.g. an expo room) even if it mounted before this connected.
    socket.on('connect', () => window.dispatchEvent(new Event('eventsphere:socket-ready')))
    return socket
  }

  poller = createPoller()
  poller.start()
  return poller
}

export const getSocket = () => socket || poller

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
  if (poller) {
    poller.stop()
    poller = null
  }
}
