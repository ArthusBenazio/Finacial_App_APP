import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '../lib/http'

export interface Account {
  id: string
  name: string
  balance: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface AccountsBalanceResponse {
  totalBalance: number
  accounts: {
    id: string
    name: string
    balance: number
  }[]
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await http.get<{ accounts: Account[] }>('/accounts')
      return response.data.accounts
    },
  })
}

export function useAccountsBalance() {
  return useQuery({
    queryKey: ['accounts', 'balance'],
    queryFn: async () => {
      const response = await http.get<AccountsBalanceResponse>('/accounts/balance')
      return response.data
    },
  })
}

interface CreateAccountData {
  name: string
  balance?: number
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateAccountData) => {
      const response = await http.post<{ account: Account }>('/accounts', data)
      return response.data.account
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['accounts', 'balance'] })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (accountId: string) => {
      await http.delete(`/accounts/${accountId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['accounts', 'balance'] })
    },
  })
}
