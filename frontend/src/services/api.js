import axios from 'axios'
import { API_BASE_URL } from '../types'

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const cartApi = {
  getAll: () => request.get('/carts'),
  getById: (id) => request.get(`/carts/${id}`),
  updateStatus: (id, data) => request.put(`/carts/${id}/status`, data)
}

export const taskApi = {
  getAll: () => request.get('/tasks'),
  getById: (id) => request.get(`/tasks/${id}`),
  getByStatus: (status) => request.get(`/tasks/status/${status}`),
  getPending: () => request.get('/tasks/pending'),
  create: (data) => request.post('/tasks', data),
  assign: (data) => request.post('/tasks/assign', data),
  start: (id) => request.put(`/tasks/${id}/start`),
  complete: (id) => request.put(`/tasks/${id}/complete`),
  cancel: (id) => request.put(`/tasks/${id}/cancel`)
}

export const locationApi = {
  getAll: () => request.get('/locations'),
  getById: (id) => request.get(`/locations/${id}`)
}
