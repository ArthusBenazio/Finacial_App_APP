export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

export interface Account {
  id: string
  name: string
  balance: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface AccountBalance {
  id: string
  name: string
  balance: number
}

export interface AccountsBalanceResponse {
  totalBalance: number
  accounts: AccountBalance[]
}

export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: string | null
  date: string
  accountId: string
  userId: string
  groupId: string | null
  createdAt: string
}

export interface Invite {
  id: string
  email: string
  token: string
  senderId: string
  groupId: string | null
  receiverId: string | null
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  expiresAt: string
}

export interface InviteCreated {
  id: string
  email: string
  token: string
  senderId: string
  groupId: string | null
  expiresAt: string
}
