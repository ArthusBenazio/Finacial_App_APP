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
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/use-transactions";
import { useAccountsBalance } from "@/hooks/use-accounts";

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: transactions } = useTransactions();
  const { data: accountsBalance } = useAccountsBalance();

  const getAccountName = (id: string) => {
    return accountsBalance?.accounts.find(a => a.id === id)?.name || 'Conta';
  }

  const filteredTransactions = transactions?.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lançamentos</h1>
          <p className="text-muted-foreground text-sm">Gerencie todas as suas entradas, saídas e transferências.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Novo Lançamento
          </Button>
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
                      <Badge variant="outline" className="font-normal text-[11px] bg-background">
                        {t.category || 'Sem categoria'}
                      </Badge>
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
