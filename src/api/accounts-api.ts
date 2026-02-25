import { http } from '../lib/http'
import { Account, AccountsBalanceResponse } from '../types/domain'

interface AccountsResponse {
  accounts: Account[]
}

interface AccountResponse {
  account: Account
}

export async function fetchAccounts() {
  const response = await http.get<AccountsResponse>('/accounts')
  return response.data.accounts
}

export async function fetchAccountsBalance() {
  const response = await http.get<AccountsBalanceResponse>('/accounts/balance')
  return response.data
}

export async function getAccount(accountId: string) {
  const response = await http.get<AccountResponse>(`/accounts/${accountId}`)
  return response.data.account
}

export async function createAccount(data: { name: string; balance?: number }) {
  const response = await http.post<AccountResponse>('/accounts', data)
  return response.data.account
}

export async function deleteAccount(accountId: string) {
  await http.delete(`/accounts/${accountId}`)
}
