import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PrivateValue } from "@/components/PrivateValue";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight,
  MoreVertical,
  Users,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAccountsBalance } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { useGroups } from "@/hooks/use-groups";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data: accountsBalance } = useAccountsBalance();
  const { data: transactions } = useTransactions();
  const { data: budgets } = useBudgets();
  const { data: groups } = useGroups();

  const recentTransactions = transactions?.slice(0, 5) || [];
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthTransactions = transactions?.filter(t => {
    const date = new Date(t.occurredAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }) || [];

  const receitas = currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const despesas = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const getAccountName = (id: string) => {
    return accountsBalance?.accounts.find(a => a.id === id)?.name || 'Conta';
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary text-primary-foreground border-none shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <div className="w-24 h-24 rounded-full border-[10px] border-white/20 absolute -top-8 -right-8"></div>
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-primary-foreground/80 text-sm font-medium">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold tracking-tight">
              <PrivateValue value={(accountsBalance?.totalBalance || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm font-medium">Receitas no mês</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              <PrivateValue value={receitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm font-medium">Despesas no mês</CardTitle>
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              <PrivateValue value={despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Lançamentos */}
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Últimos Lançamentos</CardTitle>
              <CardDescription className="text-xs mt-1">Sua movimentação recente em todas as contas.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-full" asChild>
              <Link to="/transactions">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentTransactions.map((t) => (
                <div key={t.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-background",
                      t.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" :
                      t.type === 'EXPENSE' ? "bg-rose-50 text-rose-600" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      {t.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> :
                       t.type === 'EXPENSE' ? <ArrowDownRight className="w-4 h-4" /> :
                       <ArrowLeftRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                        {t.description}
                        {t.isShared && (
                          <Badge variant="secondary" className="text-[9px] font-medium h-4 px-1.5 gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-100">
                            <Users className="w-2.5 h-2.5" /> Divisão
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground font-medium">{t.category || 'Sem categoria'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={cn(
                        "font-semibold text-sm",
                        t.type === 'INCOME' ? "text-emerald-600" :
                        t.type === 'EXPENSE' ? "text-foreground" : "text-blue-600"
                      )}>
                        <PrivateValue value={
                          (t.type === 'EXPENSE' ? "" : "+") + 
                          t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        } />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{getAccountName(t.accountId)} &bull; {new Intl.DateTimeFormat('pt-BR').format(new Date(t.occurredAt))}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem>Editar Lançamento</DropdownMenuItem>
                        <DropdownMenuItem>Anexar Comprovante</DropdownMenuItem>
                        {t.isShared && <DropdownMenuItem>Detalhes da Divisão</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Esquerda (Pendências & Orçamentos) */}
        <div className="space-y-6">
          {/* Compartilhamento e Divisão */}
          <Card className="shadow-sm border-orange-200/50 bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertCircle className="w-4 h-4" />
                A Receber (Pendências)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!groups?.length ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Nenhuma pendência recente.
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.slice(0, 2).map((group, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-card p-3 rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/30">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 flex items-center justify-center bg-muted">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </Avatar>
                        <div>
                          <div className="text-sm font-semibold">{group.name}</div>
                          <div className="text-[11px] text-muted-foreground">Divisão de grupo</div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <Button variant="outline" size="sm" className="h-7 text-[11px]">Ver Grupo</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orçamentos */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Orçamentos Ativos</CardTitle>
              <span className="text-xs text-muted-foreground">Fev 2024</span>
            </CardHeader>
            <CardContent className="space-y-5">
              {!budgets?.length && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Nenhum orçamento definido.
                </div>
              )}
              {budgets?.map((budget) => (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">{budget.category}</span>
                    <span className={cn("text-xs font-semibold", budget.spent > budget.limit ? "text-rose-500" : "text-muted-foreground")}>
                      <PrivateValue value={`${budget.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / ${budget.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} />
                    </span>
                  </div>
                  <Progress value={Math.min((budget.spent / budget.limit) * 100, 100)} className={cn("h-2", budget.spent > budget.limit ? "bg-rose-100 [&>div]:bg-rose-500" : `bg-muted [&>div]:${budget.color}`)} />
                  {budget.spent > budget.limit && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Limite excedido
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
