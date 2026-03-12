import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PrivateValue } from "@/components/PrivateValue";
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight,
  Plus,
  Calendar as CalendarIcon,
  Tag,
  Download,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTransactions, useDeleteTransaction } from "@/hooks/use-transactions";
import { useAccountsBalance } from "@/hooks/use-accounts";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: transactions } = useTransactions();
  const { data: accountsBalance } = useAccountsBalance();
  const { mutate: deleteTransaction } = useDeleteTransaction();

  const getAccountName = (id: string) => {
    return accountsBalance?.accounts.find(a => a.id === id)?.name || 'Conta';
  }

  const filteredTransactions = transactions?.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.categoryRel && t.categoryRel.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const exportToCSV = () => {
    if (!filteredTransactions.length) return;
    
    const headers = ['Tipo', 'Descrição', 'Categoria', 'Conta', 'Data', 'Valor'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.type,
        `"${t.description.replace(/"/g, '""')}"`,
        `"${t.category || ''}"`,
        `"${getAccountName(t.accountId)}"`,
        new Date(t.occurredAt).toISOString().split('T')[0],
        t.amount
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
              <Button variant="outline" size="sm" className="h-9 gap-2 whitespace-nowrap">
                <Filter className="w-4 h-4" /> Filtros
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-2 whitespace-nowrap">
                <CalendarIcon className="w-4 h-4" /> Fevereiro
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-2 whitespace-nowrap text-primary border-primary/20 bg-primary/5">
                Todas as Contas
              </Button>
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
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {!filteredTransactions.length ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-muted-foreground">
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
                        {t.type === 'INCOME' ? <ArrowUpRight className="w-3.5 h-3.5" /> :
                         t.type === 'EXPENSE' ? <ArrowDownRight className="w-3.5 h-3.5" /> :
                         <ArrowLeftRight className="w-3.5 h-3.5" />}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      <div className="flex flex-col">
                        <span className="text-foreground">{t.description}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {t.categoryRel ? (
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
                      {getAccountName(t.accountId)}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                      {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(t.occurredAt))}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={cn(
                        "font-semibold",
                        t.type === 'INCOME' ? "text-emerald-600" :
                        t.type === 'EXPENSE' ? "text-foreground" : "text-blue-600"
                      )}>
                        <PrivateValue value={
                          (t.type === 'EXPENSE' ? "-" : t.type === 'INCOME' ? "+" : "") + 
                          Math.abs(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        } />
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Editar Lançamento</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-500 hover:text-rose-600 focus:text-rose-600 focus:bg-rose-50" onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Deseja realmente excluir este lançamento?")) {
                              deleteTransaction(t.id);
                            }
                          }}>
                            Excluir Lançamento
                          </DropdownMenuItem>
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
    </div>
  );
}
