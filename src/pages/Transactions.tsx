import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PrivateValue } from "@/components/PrivateValue";
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight,
  Plus,
  Calendar as CalendarIcon,
  Download,
  MoreVertical,
  Clock,
  RefreshCw,
  CalendarClock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTransactions, useDeleteTransaction, useDeleteRecurringGroup } from "@/hooks/use-transactions";
import { useAccounts, useAccountsBalance } from "@/hooks/use-accounts";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";
import { EditTransactionModal } from "@/components/modals/EditTransactionModal";
import { Transaction } from "@/hooks/use-transactions";

export default function Transactions() {
  const currentDate = new Date();
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");

  const { data: transactions } = useTransactions();
  const { data: accounts } = useAccounts();
  const { data: accountsBalance } = useAccountsBalance();
  const { mutate: deleteTransaction } = useDeleteTransaction();
  const { mutate: deleteRecurringGroup } = useDeleteRecurringGroup();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getAccountName = (id: string) => {
    return accountsBalance?.accounts.find(a => a.id === id)?.name || 'Conta';
  }

  const formatMonth = (monthStr: string) => {
    if (monthStr === "all") return "Todos os meses";
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const availableMonths = Array.from(new Set([
    currentMonthStr,
    ...(transactions?.map(t => {
      const d = new Date(t.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }) || [])
  ])).sort().reverse();

  // Calcular saldos ao longo do tempo (saldos após cada transação, incluindo futuras)
  const transactionBalances = new Map<string, { source: number, dest?: number, global: number, projected: boolean }>();
  
  if (transactions && accounts && accountsBalance) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get strictly confirmed "real-world" balances for each account from the backend
    const currentRealBalances: Record<string, number> = {};
    accounts.forEach(acc => {
      const pastAlignedAcc = accountsBalance.accounts.find(a => a.id === acc.id);
      currentRealBalances[acc.id] = pastAlignedAcc ? pastAlignedAcc.balance : Number(acc.balance);
    });
    console.log('DEBUG BALANCES:', currentRealBalances);

    // We also need "Projetado" balances which include everything
    const currentProjectedBalances: Record<string, number> = {};
    accounts.forEach(acc => {
      // Standard DB balance already includes everything
      currentProjectedBalances[acc.id] = Number(acc.balance);
    });
    console.log('STARTING GLOBAL:', Object.values(currentRealBalances).reduce((a,b)=>a+b,0));

    // To calculate the balance at EACH row, we walk BACKWARDS from the current balances.
    // Row balance = Balance after this transaction happened.
    const chronoSortedDesc = [...transactions].sort((a, b) => {
      const timeDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (timeDiff !== 0) return timeDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const runningReal = { ...currentRealBalances };
    const runningProjected = { ...currentProjectedBalances };

    chronoSortedDesc.forEach(t => {
      const txDate = new Date(t.date);
      txDate.setHours(0, 0, 0, 0);
      const isFuture = txDate > today;
      const isPrediction = t.isPrediction;
      const isProjected = isPrediction || isFuture;

      // The balance FOR THIS ROW is the CURRENT running balance.
      transactionBalances.set(t.id, {
        source: isProjected ? runningProjected[t.accountId] : runningReal[t.accountId],
        dest: t.destinationAccountId 
          ? (isProjected ? runningProjected[t.destinationAccountId] : runningReal[t.destinationAccountId]) 
          : undefined,
        global: Object.values(isProjected ? runningProjected : runningReal).reduce((a, b) => a + b, 0),
        projected: isProjected
      });

      // Now "un-apply" this transaction to move backwards to the balance BEFORE it happened.
      const val = Math.abs(Number(t.amount));
      if (t.type === 'INCOME') {
        runningProjected[t.accountId] -= val;
        if (!isProjected) runningReal[t.accountId] -= val;
      } else if (t.type === 'EXPENSE') {
        runningProjected[t.accountId] += val;
        if (!isProjected) runningReal[t.accountId] += val;
      } else if (t.type === 'TRANSFER') {
        runningProjected[t.accountId] += val;
        if (!isProjected) runningReal[t.accountId] += val;
        if (t.destinationAccountId) {
          runningProjected[t.destinationAccountId] -= val;
          if (!isProjected) runningReal[t.destinationAccountId] -= val;
        }
      }
    });
  }



  const getTransactionBalance = (t: Transaction, selectedAccId: string) => {
    const balances = transactionBalances.get(t.id);
    if (!balances) return null;

    if (selectedAccId === "all") {
      return { value: balances.global, projected: balances.projected };
    }
    
    if (t.type === 'TRANSFER' && selectedAccId === t.destinationAccountId && balances.dest !== undefined) {
      return { value: balances.dest, projected: balances.projected };
    }
    
    return { value: balances.source, projected: balances.projected };
  };

  const filteredTransactions = (transactions?.filter(t => {
    const transactionDate = new Date(t.date);
    const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
    
    const matchesSearch = 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.categoryRel && t.categoryRel.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMonth = selectedMonth === "all" || transactionMonth === selectedMonth;

    const matchesAccount = selectedAccountId === "all" || t.accountId === selectedAccountId || t.destinationAccountId === selectedAccountId;

    return matchesSearch && matchesMonth && matchesAccount;
  }) || []).sort((a, b) => {
    // Mesmo critério de ordenação usado no cálculo dos saldos (mais novo primeiro para exibição)
    const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (diff !== 0) return diff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const exportToCSV = () => {
    if (!filteredTransactions.length) return;
    
    const headers = ['Tipo', 'Descrição', 'Categoria', 'Conta', 'Data', 'Valor', 'Saldo'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.type,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.category || ''}"`,
        `"${getAccountName(t.accountId)}"`,
        new Date(t.date).toISOString().split('T')[0],
        t.amount,
        getTransactionBalance(t, selectedAccountId) || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lancamentos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lançamentos</h1>
          <p className="text-muted-foreground text-sm">Gerencie todas as suas entradas, saídas e transferências.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={exportToCSV}>
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <NewTransactionModal>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Novo Lançamento
            </Button>
          </NewTransactionModal>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-xs font-mono mb-4">
        <h4 className="font-bold mb-2">DEBUG PANEL</h4>
        <div>Accounts Loaded: {accounts?.length}</div>
        <div>Transactions Loaded: {transactions?.length}</div>
        <div className="mt-2 text-amber-800">
           {accounts && accountsBalance?.accounts.map(a => (
             <div key={a.id}>{a.name}: {a.balance.toFixed(2)} (DB: {accounts.find(x => x.id === a.id)?.balance.toFixed(2)})</div>
           ))}
        </div>
        <div className="mt-2 font-bold bordert-t border-amber-200 pt-2">
           Global Real Sum: {accountsBalance?.accounts.reduce((sum, a) => sum + a.balance, 0).toFixed(2)}
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por descrição, categoria, tag..." 
                className="pl-10 h-10 bg-muted/30 border-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px] h-9 bg-background">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground hidden sm:block" />
                    <SelectValue placeholder="Selecione o mês" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {formatMonth(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="w-[180px] h-9 text-primary border-primary/20 bg-primary/5">
                  <SelectValue placeholder="Todas as Contas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Contas</SelectItem>
                  {accountsBalance?.accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-12 text-center">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Categoria</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Conta</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Data</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Valor</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Saldo</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {!filteredTransactions.length ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-muted-foreground">
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                ) : filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                    <td className="py-4 px-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full mx-auto flex items-center justify-center",
                        t.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" :
                        t.type === 'EXPENSE' ? "bg-rose-50 text-rose-600" :
                        "bg-blue-50 text-blue-600"
                      )}>
                        {t.isPrediction ? <CalendarClock className="w-3.5 h-3.5" /> :
                         t.type === 'INCOME' ? <ArrowUpRight className="w-3.5 h-3.5" /> :
                         t.type === 'EXPENSE' ? <ArrowDownRight className="w-3.5 h-3.5" /> :
                         <ArrowLeftRight className="w-3.5 h-3.5" />}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{t.description}</span>
                          {t.isRecurring && t.recurringIndex && t.recurringTotal && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-600 border border-violet-200">
                              <RefreshCw className="w-2.5 h-2.5" />
                              {t.recurringIndex}/{t.recurringTotal}
                            </span>
                          )}
                          {t.isPrediction && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
                              <CalendarClock className="w-2.5 h-2.5" />
                              Previsão
                            </span>
                          )}
                        </div>
                        {t.type === 'TRANSFER' && (
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Transferência</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {t.type === 'TRANSFER' ? (
                        <Badge variant="outline" className="font-normal text-[11px] bg-blue-50 text-blue-600 border-blue-200">
                          Transferência
                        </Badge>
                      ) : t.categoryRel ? (
                        <Badge variant="outline" className="font-normal text-[11px] border-transparent" style={{ backgroundColor: `${t.categoryRel.color}15`, color: t.categoryRel.color }}>
                          {t.categoryRel.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="font-normal text-[11px] bg-background">
                          {t.category || 'Sem categoria'}
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {t.type === 'TRANSFER' ? (
                        <div className="flex items-center gap-1 text-[11px] font-medium">
                          <span className="text-rose-600">{getAccountName(t.accountId)}</span>
                          <ArrowLeftRight className="w-3 h-3" />
                          <span className="text-emerald-600">{getAccountName(t.destinationAccountId || '')}</span>
                        </div>
                      ) : (
                        getAccountName(t.accountId)
                      )}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                      {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(t.date))}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={cn(
                        "font-semibold",
                        t.type === 'INCOME' ? "text-emerald-600" :
                        t.type === 'EXPENSE' ? "text-rose-600" : "text-blue-600"
                      )}>
                        <PrivateValue value={
                          (t.type === 'EXPENSE' ? "-" : t.type === 'INCOME' ? "+" : "") + 
                          Math.abs(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        } />
                        {t.isPrediction && <span className="text-[10px] block opacity-70 font-normal">Previsto</span>}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      {(() => {
                        const bal = getTransactionBalance(t, selectedAccountId);
                        if (bal === null) return <span className="text-muted-foreground/50 text-xs">-</span>;
                        return (
                          <span className={cn(
                            "text-sm inline-flex items-center gap-1",
                            bal.projected
                              ? bal.value >= 0 ? "text-emerald-500/60" : "text-rose-500/60"
                              : bal.value >= 0 ? "text-emerald-600/80" : "text-rose-600/80"
                          )}>
                            {bal.projected && (
                              <div className="flex flex-col items-end">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 opacity-60" />
                                  <PrivateValue value={bal.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                                </span>
                                <span className="text-[9px] opacity-60 font-medium">Projetado</span>
                              </div>
                            )}
                            {!bal.projected && (
                              <PrivateValue value={bal.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                            )}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setEditingTransaction(t);
                            setIsEditModalOpen(true);
                          }}>
                            Editar Lançamento
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-rose-500 hover:text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("Deseja realmente excluir este lançamento?")) {
                                deleteTransaction(t.id);
                              }
                            }}
                          >
                            Excluir este lançamento
                          </DropdownMenuItem>
                          {t.isRecurring && t.recurringGroupId && (
                            <DropdownMenuItem
                              className="text-rose-500 hover:text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Deseja excluir TODOS os ${t.recurringTotal} lançamentos desta série?`)) {
                                  deleteRecurringGroup(t.recurringGroupId!);
                                }
                              }}
                            >
                              <RefreshCw className="w-3.5 h-3.5 mr-1" />
                              Excluir toda a série
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editingTransaction && (
        <EditTransactionModal 
          transaction={editingTransaction} 
          open={isEditModalOpen} 
          onOpenChange={setIsEditModalOpen} 
        />
      )}
    </div>
  );
}
