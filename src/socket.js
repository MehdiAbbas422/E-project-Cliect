import { io } from 'socket.io-client'

// In dev the client runs on :3000 and the API/socket server on :5000.
// In production both are served from the same origin, so we reuse it.
const URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin)

let socket = null

// Purpose: Opens a single authenticated socket connection for the current
// session (called when a user logs in / the app starts with a token).
export const connectSocket = (token) => {
  if (socket) socket.disconnect()
  socket = io(URL, { auth: { token }, transports: ['websocket', 'polling'] })
  // Let any page know when the connection is ready so it can subscribe to
  // its rooms (e.g. an expo room) even if it mounted before this connected.
  socket.on('connect', () => window.dispatchEvent(new Event('eventsphere:socket-ready')))
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
