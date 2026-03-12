import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'

export interface Budget {
  id: string
  category: string | null
  categoryId: string | null
  categoryRel: {
    id: string
    name: string
    icon: string
    color: string
  } | null
  limit: number
  spent: number
  color: string
  month: string
  userId: string
  createdAt: string
  updatedAt: string
}

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await http.get<{ budgets: Budget[] }>('/budgets')
      return response.data.budgets
    },
  })
}

interface CreateBudgetData {
  categoryId: string
  limit: number
  month: string
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBudgetData) => {
      const response = await http.post<{ budget: Budget }>('/budgets', data)
      return response.data.budget
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (budgetId: string) => {
      await http.delete(`/budgets/${budgetId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })
}
