import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Adjunta el JWT en cada request si existe
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('strideai_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// En 401: borra el token y señaliza logout a useAuth
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('strideai_token')
      window.dispatchEvent(new Event('auth:logout'))
    }
    return Promise.reject(err)
  }
)

export default client
