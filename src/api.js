import axios from 'axios'

// Base URL of the API. In development the Vite proxy forwards /api to the
// local server, so a relative path is enough. In production (for example a
// Vercel frontend talking to a Render/Railway backend) set VITE_API_URL to
// the server origin, e.g. https://your-backend.onrender.com/api
const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
