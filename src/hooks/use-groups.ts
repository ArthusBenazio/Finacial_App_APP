import { useQuery } from '@tanstack/react-query'
import { http } from '../lib/http'

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  role: string
  joinedAt: string
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

export interface Group {
  id: string
  name: string
  description: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  members: GroupMember[]
}

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await http.get<{ groups: Group[] }>('/groups')
      return response.data.groups
    },
  })
}
