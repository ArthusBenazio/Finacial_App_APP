import { http } from '../lib/http'
import { Transaction, TransactionType } from '../types/domain'

interface TransactionsResponse {
  transactions: Transaction[]
}

interface TransactionResponse {
  transaction: Transaction
}

export async function fetchTransactionsByAccount(accountId: string) {
  const response = await http.get<TransactionsResponse>(`/accounts/${accountId}/transactions`)
  return response.data.transactions
}

export async function createTransaction(data: {
  description: string
  amount: number
  type: TransactionType
  category: string
  occurredAt: string
  accountId: string
}) {
  const response = await http.post<TransactionResponse>('/transactions', data)
  return response.data.transaction
}

export async function deleteTransaction(transactionId: string) {
  await http.delete(`/transactions/${transactionId}`)
}
