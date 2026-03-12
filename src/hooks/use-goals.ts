import { useQuery } from '@tanstack/react-query'
import { http } from '../lib/http'

export interface Goal {
  id: string
  title: string
  target: number
  current: number
  deadline: string
  icon: string
  userId: string
  createdAt: string
  updatedAt: string
}

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await http.get<{ goals: Goal[] }>('/goals')
      return response.data.goals
    },
  })
}
