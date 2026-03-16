import { useQuery } from '@tanstack/react-query'
import { http } from '../lib/http'

export interface UserProfile {
  id: string
  name: string
  email: string
  googleId: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await http.get<{ user: UserProfile }>('/me')
      return response.data.user
    },
  })
}
