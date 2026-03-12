import { useQuery } from '@tanstack/react-query'
import { http } from '../lib/http'

export interface Budget {
  id: string
  category: string
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
