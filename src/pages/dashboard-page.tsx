import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createAccount, deleteAccount, fetchAccounts, fetchAccountsBalance } from '../api/accounts-api'
import { formatCurrency } from '../components/currency'
import { Account, AccountsBalanceResponse } from '../types/domain'

export function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [balance, setBalance] = useState<AccountsBalanceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [initialBalance, setInitialBalance] = useState('0')
  const [isCreating, setIsCreating] = useState(false)

  async function loadData() {
    setIsLoading(true)
    setError(null)

    try {
      const [fetchedAccounts, fetchedBalance] = await Promise.all([
        fetchAccounts(),
        fetchAccountsBalance(),
      ])

      setAccounts(fetchedAccounts)
      setBalance(fetchedBalance)
    } catch {
      setError('Unable to load accounts right now.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  async function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreating(true)

    try {
      await createAccount({
        name,
        balance: Number(initialBalance),
      })

      setName('')
      setInitialBalance('0')
      await loadData()
    } catch {
      setError('Could not create account.')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteAccount(accountId: string) {
    try {
      await deleteAccount(accountId)
      await loadData()
    } catch {
      setError('Could not delete account.')
    }
  }

  const accountsWithComputedBalance = useMemo(() => {
    const mapped = new Map(balance?.accounts.map((account) => [account.id, account.balance]) ?? [])

    return accounts.map((account) => ({
      ...account,
      computedBalance: mapped.get(account.id) ?? account.balance,
    }))
  }, [accounts, balance])

  if (isLoading) {
    return <p>Loading dashboard...</p>
  }

  return (
    <section className="content-grid">
      <article className="hero-panel">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Your financial pulse</h1>
        </div>

        <div className="balance-block">
          <span>Total balance</span>
          <strong>{formatCurrency(balance?.totalBalance ?? 0)}</strong>
        </div>
      </article>

      <article className="card">
        <h2>Create account</h2>

        <form className="inline-form" onSubmit={handleCreateAccount}>
          <label className="field">
            <span>Name</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Main wallet"
            />
          </label>

          <label className="field">
            <span>Initial balance</span>
            <input
              required
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={(event) => setInitialBalance(event.target.value)}
            />
          </label>

          <button type="submit" className="primary-btn" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Add account'}
          </button>
        </form>
      </article>

      <article className="card">
        <h2>Accounts</h2>

        {error ? <p className="form-error">{error}</p> : null}

        {accountsWithComputedBalance.length === 0 ? (
          <p className="muted">No accounts yet. Create your first one above.</p>
        ) : (
          <ul className="list-grid">
            {accountsWithComputedBalance.map((account) => (
              <li key={account.id} className="list-item">
                <div>
                  <strong>{account.name}</strong>
                  <p>{formatCurrency(account.computedBalance)}</p>
                </div>

                <div className="row-actions">
                  <Link className="ghost-btn" to={`/accounts/${account.id}`}>
                    Open
                  </Link>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => void handleDeleteAccount(account.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="card card-muted">
        <h2>Roadmap slots</h2>
        <ul className="todo-list">
          <li>Onboarding wizard flow</li>
          <li>Invite management center</li>
          <li>Premium AI insights chat panel</li>
        </ul>
      </article>
    </section>
  )
}
