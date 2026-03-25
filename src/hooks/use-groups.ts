import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'
import { toast } from 'sonner'

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

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const response = await http.post<{ group: Group }>('/groups', {
        name,
        description,
      })
      return response.data.group
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Perfil criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar perfil.')
    },
  })
}
