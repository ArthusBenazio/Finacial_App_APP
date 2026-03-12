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

const recentTransactions = [
  { id: 1, title: "Mercado do Bairro", category: "Alimentação", subcategory: "Hortifruti", amount: -245.50, date: "Hoje, 10:30", tags: ["#urgente"], account: "Cartão Nubank", type: "expense" },
  { id: 2, title: "Salário Mensal", category: "Renda", subcategory: "Fixo", amount: 8500.00, date: "Ontem, 09:00", tags: [], account: "Conta Itaú", type: "income" },
  { id: 3, title: "Aluguel da Praia", category: "Viagem", subcategory: "Hospedagem", amount: -800.00, date: "24 Fev, 14:20", tags: ["#viagem"], account: "Cartão XP", type: "expense", shared: true, owes: 400 },
  { id: 4, title: "Reserva de Emergência", category: "Transferência", subcategory: "Investimento", amount: 500.00, date: "22 Fev, 18:45", tags: [], account: "Caixinha", type: "transfer" },
];

export default function Dashboard() {
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
              <PrivateValue value="R$ 12.450,00" />
            </div>
            <p className="text-sm text-primary-foreground/80 mt-2 flex justify-between items-center">
              <span>Previsto no mês:</span>
              <span className="font-medium"><PrivateValue value="R$ 14.100,00" /></span>
            </p>
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
              <PrivateValue value="R$ 8.500,00" />
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
              <PrivateValue value="R$ 3.120,50" />
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
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-full">Ver todos</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentTransactions.map((t) => (
                <div key={t.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-background",
                      t.type === 'income' ? "bg-emerald-50 text-emerald-600" :
                      t.type === 'expense' ? "bg-rose-50 text-rose-600" :
                      "bg-blue-50 text-blue-600"
                    )}>
                      {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> :
                       t.type === 'expense' ? <ArrowDownRight className="w-4 h-4" /> :
                       <ArrowLeftRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                        {t.title}
                        {t.shared && (
                          <Badge variant="secondary" className="text-[9px] font-medium h-4 px-1.5 gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-100">
                            <Users className="w-2.5 h-2.5" /> Divisão
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground font-medium">{t.category} &bull; {t.subcategory}</span>
                        {t.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={cn(
                        "font-semibold text-sm",
                        t.type === 'income' ? "text-emerald-600" :
                        t.type === 'expense' ? "text-foreground" : "text-blue-600"
                      )}>
                        <PrivateValue value={
                          (t.type === 'expense' ? "" : "+") + 
                          t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        } />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t.account} &bull; {t.date.split(',')[0]}</p>
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
                        {t.shared && <DropdownMenuItem>Detalhes da Divisão</DropdownMenuItem>}
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
              <div className="flex items-center justify-between bg-white dark:bg-card p-3 rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/30">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://i.pravatar.cc/150?u=b" />
                    <AvatarFallback>MA</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold">Marcos</div>
                    <div className="text-[11px] text-muted-foreground">Aluguel da Praia</div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-sm font-bold text-emerald-600"><PrivateValue value="R$ 400,00" /></div>
                  <Button variant="link" className="text-[11px] h-auto p-0 font-medium text-orange-600">Liquidar</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orçamentos */}
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Orçamentos Ativos</CardTitle>
              <span className="text-xs text-muted-foreground">Fev 2024</span>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">Mercado</span>
                  <span className="text-muted-foreground text-xs"><PrivateValue value="R$ 800 / 1.200" /></span>
                </div>
                <Progress value={66} className="h-2 bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">Lazer & Saídas</span>
                  <span className="text-rose-500 font-semibold text-xs"><PrivateValue value="R$ 550 / 500" /></span>
                </div>
                <Progress value={100} className="h-2 bg-rose-100 [&>div]:bg-rose-500" />
                <p className="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Limite excedido
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
