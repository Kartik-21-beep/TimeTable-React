import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: false
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    const message = error?.response?.data?.message || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

const noCache = { headers: { 'Cache-Control': 'no-cache' } }
export const get = async (url, config) => (await api.get(url, { ...noCache, ...config })).data
export const post = async (url, data, config) => (await api.post(url, data, { ...noCache, ...config })).data
export const put = async (url, data, config) => (await api.put(url, data, { ...noCache, ...config })).data
export const del = async (url, config) => (await api.delete(url, { ...noCache, ...config })).data

export default api


