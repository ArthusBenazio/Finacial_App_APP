import { useQuery } from '@tanstack/react-query'
import { http } from '../lib/http'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string | null
  occurredAt: string
  accountId: string
  userId: string
  createdAt: string
  groupId: string | null
  isShared: boolean
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await http.get<{ transactions: Transaction[] }>('/transactions')
      return response.data.transactions
    },
  })
}
