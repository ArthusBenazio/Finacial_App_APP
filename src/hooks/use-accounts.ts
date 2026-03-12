import { useQuery } from '@tanstack/react-query'
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
