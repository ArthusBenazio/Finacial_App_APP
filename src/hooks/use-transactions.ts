import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
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
  destinationAccountId: string | null
  userId: string
  createdAt: string
  groupId: string | null
  isShared: boolean
  // recurring fields
  isRecurring: boolean
  recurringGroupId: string | null
  recurringIndex: number | null
  recurringTotal: number | null
  recurringInterval: 'MONTHLY' | 'WEEKLY' | 'YEARLY' | null
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
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  categoryId?: string
  accountId: string
  destinationAccountId?: string
  occurredAt: string
  // recurring
  isRecurring?: boolean
  recurringCount?: number
  recurringInterval?: 'MONTHLY' | 'WEEKLY' | 'YEARLY'
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

export function useDeleteRecurringGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupId: string) => {
      await http.delete(`/transactions/recurring/${groupId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts-balance'] })
    },
  })
}

interface UpdateTransactionData extends Omit<CreateTransactionData, 'isRecurring' | 'recurringCount' | 'recurringInterval'> {
  id: string
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTransactionData) => {
      const response = await http.put<{ transaction: Transaction }>(`/transactions/${id}`, data)
      return response.data.transaction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts-balance'] })
    },
  })
}
