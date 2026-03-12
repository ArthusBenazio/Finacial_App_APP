import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'

export interface Goal {
  id: string
  title: string
  target: number
  current: number
  deadline: string
  icon: string
  accountId: string | null
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

interface CreateGoalData {
  title: string
  target: number
  deadline: string
  icon?: string
  accountId?: string | null
}

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateGoalData) => {
      const response = await http.post<{ goal: Goal }>('/goals', data)
      return response.data.goal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goalId: string) => {
      await http.delete(`/goals/${goalId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useAddGoalFunds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: string; amount: number }) => {
      const response = await http.patch<{ goal: Goal }>(`/goals/${goalId}/add-funds`, { amount })
      return response.data.goal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
