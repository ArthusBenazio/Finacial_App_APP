import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PrivateValue } from "@/components/PrivateValue";
import { 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Plus,
  Flame,
  CheckCircle2,
  PieChart,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBudgets, useDeleteBudget } from "@/hooks/use-budgets";
import { useGoals, useDeleteGoal } from "@/hooks/use-goals";
import { NewBudgetModal } from "@/components/modals/NewBudgetModal";
import { NewGoalModal } from "@/components/modals/NewGoalModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export default function Budgets() {
  const { data: budgets } = useBudgets();
  const { data: goals } = useGoals();
  const { mutate: deleteBudget } = useDeleteBudget()
  const { mutate: deleteGoal } = useDeleteGoal()
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orçamentos & Metas</h1>
          <p className="text-muted-foreground text-sm">Planeje seus gastos e acompanhe seus objetivos financeiros.</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="rounded-full gap-2 px-4 py-2">
                <Plus className="w-4 h-4" /> Criar Planejamento
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <NewBudgetModal>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2">
                   <PieChart className="w-4 h-4" /> Novo Orçamento Mensal
                 </DropdownMenuItem>
              </NewBudgetModal>
              <NewGoalModal>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer gap-2">
                   <Target className="w-4 h-4" /> Nova Meta de Economia
                 </DropdownMenuItem>
              </NewGoalModal>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orçamentos por Categoria */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Orçamentos Mensais
            </h2>
            <span className="text-xs font-medium text-muted-foreground">Março 2024</span>
          </div>
          
          <div className="grid gap-4">
            {!budgets?.length ? (
              <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg flex flex-col items-center justify-center">
                <PieChart className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm font-medium">Nenhum orçamento ativo</p>
                <p className="text-xs">Crie um planejamento para organizar seus gastos.</p>
              </div>
            ) : budgets.map((budget) => {
              const warning = budget.spent > budget.limit;
              const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
              return (
              <Card key={budget.id} className="border-border/50 shadow-sm overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: budget.categoryRel?.color || budget.color }} />
                          <p className="font-bold text-sm">{budget.categoryRel?.name ?? budget.category ?? 'Sem Categoria'}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground -mr-2">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-rose-500 hover:text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer" onClick={() => {
                              if (window.confirm("Deseja realmente excluir este orçamento?")) {
                                deleteBudget(budget.id)
                              }
                            }}>
                              Excluir Orçamento
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Restam <PrivateValue value={Math.max(0, budget.limit - budget.spent).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", warning ? "text-rose-500" : "text-foreground")}>
                        <PrivateValue value={budget.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                        <span className="text-muted-foreground font-normal text-xs ml-1">/ {budget.limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </p>
                    </div>
                  </div>
                  <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full transition-all duration-500" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: budget.categoryRel?.color || '#0b6e6f'
                      }}
                    />
                  </div>
                  {warning && (
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-rose-500 animate-pulse">
                      <AlertCircle className="w-3 h-3" /> ORÇAMENTO ESTOURADO
                    </div>
                  )}
                </CardContent>
              </Card>
            )})}
          </div>
        </section>

        {/* Metas Financeiras */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Metas de Economia
            </h2>
          </div>

          <div className="grid gap-4">
            {!goals?.length ? (
              <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg flex flex-col items-center justify-center">
                <Target className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm font-medium">Nenhuma meta ativa</p>
                <p className="text-xs">Defina novos objetivos para alcançar.</p>
              </div>
            ) : goals.map((goal) => {
              const percentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
              return (
              <Card key={goal.id} className="border-border/50 shadow-sm group">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-sm">{goal.title}</h3>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground -mr-2 -mt-1">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-rose-500 hover:text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer" onClick={() => {
                                  if (window.confirm("Deseja realmente excluir esta meta?")) {
                                    deleteGoal(goal.id)
                                  }
                                }}>
                                  Excluir Meta
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-[11px] text-muted-foreground">Prazo: {new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(goal.deadline))}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-primary mt-1">
                            {Math.round(percentage)}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Progress value={percentage} className="h-1.5" />
                        <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                          <span><PrivateValue value={goal.current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} /></span>
                          <span>Objetivo: <PrivateValue value={goal.target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} /></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )})}

            <Card className="border-dashed border-2 border-border/50 bg-transparent flex flex-col items-center justify-center p-6 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all cursor-pointer">
              <CheckCircle2 className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm font-semibold italic">Complete suas metas para desbloquear insights avançados</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
