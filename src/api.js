import axios from 'axios'

// Keep local requests on the Vite proxy, but send production requests directly
// to the separately deployed API unless VITE_API_URL overrides the default.
const baseURL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://e-project-server.vercel.app/api' : '/api')

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
