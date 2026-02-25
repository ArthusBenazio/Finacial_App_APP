import { http } from '../lib/http'
import { User } from '../types/domain'

interface AuthenticateResponse {
  token: string
}

interface ProfileResponse {
  user: User
}

export async function registerUser(data: { name: string; email: string; password: string }) {
  await http.post('/users', data)
}

export async function authenticate(data: { email: string; password: string }) {
  const response = await http.post<AuthenticateResponse>('/sessions', data)
  return response.data
}

export async function getProfile() {
  const response = await http.get<ProfileResponse>('/me')
  return response.data.user
}
