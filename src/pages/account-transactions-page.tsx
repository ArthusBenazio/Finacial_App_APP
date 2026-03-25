import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAccount } from '../api/accounts-api'
import { createTransaction, deleteTransaction, fetchTransactionsByAccount } from '../api/transactions-api'
import { formatCurrency } from '../components/currency'
import { Account, Transaction, TransactionType } from '../types/domain'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

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
  const [date, setOccurredAt] = useState(new Date().toISOString().slice(0, 10))
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
        date: new Date(date).toISOString(),
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
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-r-transparent animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading transactions...</p>
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
            <div className="flex items-center gap-3 mb-2">
              <Button asChild variant="ghost" size="sm" className="bg-white/10 hover:bg-white/20 text-white rounded-full h-8 px-3 border-none flex items-center justify-center -ml-1 shadow-sm transition-colors">
                <Link to="/dashboard">
                  <span className="mr-1">&larr;</span> Back
                </Link>
              </Button>
              <p className="text-white/70 text-sm font-bold uppercase tracking-widest font-mono">Account details</p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">{account?.name ?? 'Account'}</h1>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <p className="text-white/70 text-sm mb-1 font-medium">Current balance</p>
            <p className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter shadow-sm">{formatCurrency(balance)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Create Transaction Form */}
        <Card className="md:col-span-5 shadow-md border-muted/60 transition-all hover:shadow-lg flex flex-col h-min">
          <CardHeader className="bg-muted/10 border-b border-muted/20 pb-5">
            <CardTitle className="text-xl text-[#0b6e6f]">New Transaction</CardTitle>
            <CardDescription>Record an income or expense.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleCreateTransaction}>
              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-sm font-semibold text-foreground/80">Description</Label>
                <Input
                  id="description"
                  required
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Lunch, salary, transfer..."
                  className="bg-white focus-visible:ring-[#0b6e6f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <Label htmlFor="amount" className="text-sm font-semibold text-foreground/80">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="amount"
                      required
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      className="pl-8 bg-white focus-visible:ring-[#0b6e6f]"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="type" className="text-sm font-semibold text-foreground/80">Type</Label>
                  <select 
                    id="type"
                    value={type} 
                    onChange={(event) => setType(event.target.value as TransactionType)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0b6e6f] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <Label htmlFor="category" className="text-sm font-semibold text-foreground/80">Category</Label>
                  <Input
                    id="category"
                    required
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="Food, salary..."
                    className="bg-white focus-visible:ring-[#0b6e6f]"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="date" className="text-sm font-semibold text-foreground/80">Date</Label>
                  <Input
                    id="date"
                    required
                    type="date"
                    value={date}
                    onChange={(event) => setOccurredAt(event.target.value)}
                    className="bg-white focus-visible:ring-[#0b6e6f]"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-2 bg-[#0b6e6f] hover:bg-[#084e4f] text-white shadow-md transition-transform active:scale-[0.98]" disabled={isCreating}>
                {isCreating ? 'Saving...' : 'Save transaction'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="md:col-span-7 shadow-md border-muted/60 flex flex-col transition-all hover:shadow-lg">
          <CardHeader className="bg-muted/10 border-b border-muted/20 pb-5">
            <CardTitle className="text-xl text-[#0b6e6f]">Transactions</CardTitle>
            <CardDescription>History of movements for this account.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1">
            {error ? (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {error}
              </div>
            ) : null}

            {transactions.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-10 text-center bg-muted/20 rounded-xl border border-dashed border-muted-foreground/30 h-full min-h-[200px]">
                 <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/70">
                     <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                   </svg>
                 </div>
                 <p className="text-muted-foreground font-medium">No transactions yet.</p>
                 <p className="text-sm text-muted-foreground/70 mt-1">Record your first movement using the form.</p>
               </div>
            ) : (
              <ul className="space-y-3">
                {transactions.map((transaction) => (
                  <li key={transaction.id} className="group flex items-center justify-between p-4 rounded-xl border bg-card transition-all hover:shadow-md hover:border-[#0b6e6f]/30">
                    <div className="space-y-1">
                      <p className="font-bold text-base leading-tight text-foreground">{transaction.description}</p>
                      <p className="text-xs font-medium text-muted-foreground flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-muted text-muted-foreground">
                          {transaction.category ?? 'No category'}
                        </span>
                        <span className="text-muted-foreground/50">•</span>
                        <span>{new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                      <span className={`inline-flex font-mono text-sm sm:text-base font-bold px-2.5 py-1 rounded-full ${
                        transaction.type === 'INCOME' 
                          ? 'text-[#037847] bg-[#e8f7ed]' 
                          : 'text-[#912018] bg-[#fdebea]'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </span>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-[#b42318] hover:bg-[#b42318]/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-full"
                        onClick={() => void handleDeleteTransaction(transaction.id)}
                        title="Delete transaction"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                         </svg>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
