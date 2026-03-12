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
  PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";

const budgets = [
  { id: 1, category: "Mercado", spent: 850.00, limit: 1200.00, color: "bg-blue-500" },
  { id: 2, category: "Lazer & Saídas", spent: 550.00, limit: 500.00, color: "bg-rose-500", warning: true },
  { id: 3, category: "Transporte", spent: 210.00, limit: 400.00, color: "bg-amber-500" },
  { id: 4, category: "Assinaturas", spent: 180.00, limit: 200.00, color: "bg-purple-500" },
];

const goals = [
  { id: 1, title: "Reserva de Emergência", current: 8500, target: 15000, deadline: "Dez 2024", icon: Target },
  { id: 2, title: "Viagem de Julho", current: 3200, target: 5000, deadline: "Jun 2024", icon: TrendingUp },
  { id: 3, title: "Novo Macbook", current: 1200, target: 12000, deadline: "Fev 2025", icon: Flame },
];

export default function Budgets() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orçamentos & Metas</h1>
          <p className="text-muted-foreground text-sm">Planeje seus gastos e acompanhe seus objetivos financeiros.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Criar Planejamento
          </button>
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
            {budgets.map((budget) => (
              <Card key={budget.id} className="border-border/50 shadow-sm overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-sm">{budget.category}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Restam <PrivateValue value={(budget.limit - budget.spent).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", budget.warning ? "text-rose-500" : "text-foreground")}>
                        <PrivateValue value={budget.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                        <span className="text-muted-foreground font-normal text-xs ml-1">/ {budget.limit}</span>
                      </p>
                    </div>
                  </div>
                  <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("absolute top-0 left-0 h-full transition-all duration-500", budget.color)} 
                      style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                    />
                  </div>
                  {budget.warning && (
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-rose-500 animate-pulse">
                      <AlertCircle className="w-3 h-3" /> ORÇAMENTO ESTOURADO
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
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
            {goals.map((goal) => (
              <Card key={goal.id} className="border-border/50 shadow-sm group">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <goal.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm">{goal.title}</h3>
                          <p className="text-[11px] text-muted-foreground">Prazo: {goal.deadline}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-primary">
                            {Math.round((goal.current / goal.target) * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Progress value={(goal.current / goal.target) * 100} className="h-1.5" />
                        <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                          <span><PrivateValue value={goal.current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} /></span>
                          <span>Objetivo: <PrivateValue value={goal.target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} /></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

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
