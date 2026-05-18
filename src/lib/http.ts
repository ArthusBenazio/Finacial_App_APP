import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const groupId = localStorage.getItem('financial:selectedGroupId')

  if (groupId) {
    config.headers['x-group-id'] = groupId
  }

  return config
})
