import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createAccount, deleteAccount, fetchAccounts, fetchAccountsBalance } from '../api/accounts-api'
import { formatCurrency } from '../components/currency'
import { Account, AccountsBalanceResponse } from '../types/domain'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

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
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-r-transparent animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-[#0b6e6f] to-[#084e4f] text-white shadow-xl border-0 overflow-hidden relative">
        <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[200%] bg-white/5 rounded-full blur-3xl pointer-events-none transform rotate-12"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[100%] bg-[#2cc3a2]/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <CardContent className="p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-8">
          <div className="space-y-3">
            <p className="text-white/70 text-sm font-bold uppercase tracking-widest font-mono">Overview</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">Your financial pulse</h1>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <p className="text-white/70 text-sm mb-1 font-medium">Total balance</p>
            <p className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter shadow-sm">{formatCurrency(balance?.totalBalance ?? 0)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Create Account */}
        <Card className="md:col-span-5 shadow-md border-muted/60 transition-all hover:shadow-lg flex flex-col">
          <CardHeader className="bg-muted/10 border-b border-muted/20 pb-5">
            <CardTitle className="text-xl text-[#0b6e6f]">Create Account</CardTitle>
            <CardDescription>Add a new wallet or bank account.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1">
            <form className="space-y-5" onSubmit={handleCreateAccount}>
              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground/80">Name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Main wallet"
                  className="bg-white focus-visible:ring-[#0b6e6f]"
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="initialBalance" className="text-sm font-semibold text-foreground/80">Initial balance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="initialBalance"
                    required
                    type="number"
                    step="0.01"
                    value={initialBalance}
                    onChange={(event) => setInitialBalance(event.target.value)}
                    className="pl-8 bg-white focus-visible:ring-[#0b6e6f]"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#0b6e6f] hover:bg-[#084e4f] text-white shadow-md transition-transform active:scale-[0.98]" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Add account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <Card className="md:col-span-7 shadow-md border-muted/60 flex flex-col transition-all hover:shadow-lg">
          <CardHeader className="bg-muted/10 border-b border-muted/20 pb-5">
            <CardTitle className="text-xl text-[#0b6e6f]">Accounts</CardTitle>
            <CardDescription>Manage your active financial accounts.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1">
            {error ? (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {error}
              </div>
            ) : null}

            {accountsWithComputedBalance.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center bg-muted/20 rounded-xl border border-dashed border-muted-foreground/30 h-full min-h-[200px]">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="text-muted-foreground text-xl">+</span>
                </div>
                <p className="text-muted-foreground font-medium">No accounts yet.</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Create your first one to get started.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {accountsWithComputedBalance.map((account) => (
                  <li key={account.id} className="group flex items-center justify-between p-4 rounded-xl border bg-card transition-all hover:shadow-md hover:border-[#0b6e6f]/30">
                    <div className="space-y-1.5">
                      <p className="font-bold text-lg leading-none text-foreground">{account.name}</p>
                      <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${account.computedBalance >= 0 ? 'bg-[#037847]' : 'bg-[#b42318]'}`}></span>
                        {formatCurrency(account.computedBalance)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 opacity-100 sm:opacity-90 sm:group-hover:opacity-100 transition-opacity">
                      <Button asChild variant="outline" size="sm" className="hidden sm:flex hover:text-[#0b6e6f] hover:border-[#0b6e6f]/50 bg-white">
                        <Link to={`/accounts/${account.id}`}>Open</Link>
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="bg-white text-[#b42318] border border-[#f2c9c6] hover:bg-[#b42318] hover:text-white"
                        onClick={() => void handleDeleteAccount(account.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card className="md:col-span-12 bg-gradient-to-br from-[#f8faf9] to-[#edf5f4] border-dashed border-2 border-[#0b6e6f]/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-[#0b6e6f]">Upcoming Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                "Onboarding wizard flow",
                "Invite management center",
                "Premium AI insights chat panel"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-[#084e4f] bg-white p-3.5 rounded-lg border border-[#0b6e6f]/10 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#2cc3a2] to-[#0b6e6f] shadow-sm" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
