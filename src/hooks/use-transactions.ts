import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string | null
  categoryId: string | null
  categoryRel: {
    id: string
    name: string
    icon: string
    color: string
  } | null
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

interface CreateTransactionData {
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  accountId: string
  occurredAt: string
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      const response = await http.post<{ transaction: Transaction }>('/transactions', data)
      return response.data.transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts-balance'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (transactionId: string) => {
      await http.delete(`/transactions/${transactionId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts-balance'] })
    },
  })
}
