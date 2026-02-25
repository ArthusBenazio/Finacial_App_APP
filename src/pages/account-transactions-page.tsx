import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAccount } from '../api/accounts-api'
import { createTransaction, deleteTransaction, fetchTransactionsByAccount } from '../api/transactions-api'
import { formatCurrency } from '../components/currency'
import { Account, Transaction, TransactionType } from '../types/domain'

export function AccountTransactionsPage() {
  const { accountId } = useParams<{ accountId: string }>()

  const [account, setAccount] = useState<Account | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('0')
  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [category, setCategory] = useState('')
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 10))
  const [isCreating, setIsCreating] = useState(false)

  async function loadData() {
    if (!accountId) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [fetchedAccount, fetchedTransactions] = await Promise.all([
        getAccount(accountId),
        fetchTransactionsByAccount(accountId),
      ])

      setAccount(fetchedAccount)
      setTransactions(fetchedTransactions)
    } catch {
      setError('Could not load account transactions.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [accountId])

  async function handleCreateTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accountId) {
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      await createTransaction({
        description,
        amount: Number(amount),
        type,
        category,
        occurredAt: new Date(occurredAt).toISOString(),
        accountId,
      })

      setDescription('')
      setAmount('0')
      setType('EXPENSE')
      setCategory('')
      setOccurredAt(new Date().toISOString().slice(0, 10))

      await loadData()
    } catch {
      setError('Could not create transaction.')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteTransaction(transactionId: string) {
    try {
      await deleteTransaction(transactionId)
      await loadData()
    } catch {
      setError('Could not delete transaction.')
    }
  }

  const balance = useMemo(() => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'INCOME') {
        return total + transaction.amount
      }

      return total - transaction.amount
    }, account?.balance ?? 0)
  }, [transactions, account?.balance])

  if (isLoading) {
    return <p>Loading transactions...</p>
  }

  return (
    <section className="content-grid">
      <article className="hero-panel">
        <div>
          <p className="eyebrow">Account details</p>
          <h1>{account?.name ?? 'Account'}</h1>
        </div>

        <div className="balance-block">
          <span>Current balance</span>
          <strong>{formatCurrency(balance)}</strong>
        </div>
      </article>

      <article className="card">
        <div className="row-head">
          <h2>Create transaction</h2>
          <Link className="ghost-btn" to="/dashboard">
            Back
          </Link>
        </div>

        <form className="inline-form" onSubmit={handleCreateTransaction}>
          <label className="field">
            <span>Description</span>
            <input
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Lunch, salary, transfer..."
            />
          </label>

          <label className="field">
            <span>Amount</span>
            <input
              required
              type="number"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Type</span>
            <select value={type} onChange={(event) => setType(event.target.value as TransactionType)}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </label>

          <label className="field">
            <span>Category</span>
            <input
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Food, salary..."
            />
          </label>

          <label className="field">
            <span>Date</span>
            <input
              required
              type="date"
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
            />
          </label>

          <button type="submit" className="primary-btn" disabled={isCreating}>
            {isCreating ? 'Saving...' : 'Save transaction'}
          </button>
        </form>
      </article>

      <article className="card">
        <h2>Transactions</h2>

        {error ? <p className="form-error">{error}</p> : null}

        {transactions.length === 0 ? (
          <p className="muted">No transactions yet for this account.</p>
        ) : (
          <ul className="list-grid">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="list-item">
                <div>
                  <strong>{transaction.description}</strong>
                  <p className="muted">
                    {transaction.category ?? 'No category'} |{' '}
                    {new Date(transaction.occurredAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="row-actions">
                  <span className={transaction.type === 'INCOME' ? 'tag-income' : 'tag-expense'}>
                    {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </span>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => void handleDeleteTransaction(transaction.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  )
}
