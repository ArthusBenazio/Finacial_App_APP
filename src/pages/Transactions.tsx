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

const allTransactions = [
  { id: 1, title: "Aluguel", category: "Moradia", amount: -2200.00, date: "01 Mar, 2024", account: "Conta Itaú", type: "expense", tags: ["#fixo"] },
  { id: 2, title: "Freelance Projeto X", category: "Renda", amount: 4500.00, date: "28 Fev, 2024", account: "Conta PJ", type: "income", tags: ["#extra"] },
  { id: 3, title: "Supermercado", category: "Alimentação", amount: -540.20, date: "27 Fev, 2024", account: "Nubank", type: "expense", tags: ["#essencial"] },
  { id: 4, title: "Academia", category: "Saúde", amount: -150.00, date: "25 Fev, 2024", account: "Nubank", type: "expense", tags: ["#recorrente"] },
  { id: 5, title: "Transferência para Investimento", category: "Transferência", amount: 1000.00, date: "24 Fev, 2024", account: "Caixinha", type: "transfer", tags: ["#metas"] },
  { id: 6, title: "Restaurante", category: "Lazer", amount: -120.00, date: "24 Fev, 2024", account: "XP Vis", type: "expense", tags: ["#fds"] },
];

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");

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
                {allTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                    <td className="py-4 px-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full mx-auto flex items-center justify-center",
                        t.type === 'income' ? "bg-emerald-50 text-emerald-600" :
                        t.type === 'expense' ? "bg-rose-50 text-rose-600" :
                        "bg-blue-50 text-blue-600"
                      )}>
                        {t.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5" /> :
                         t.type === 'expense' ? <ArrowDownRight className="w-3.5 h-3.5" /> :
                         <ArrowLeftRight className="w-3.5 h-3.5" />}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      <div className="flex flex-col">
                        <span className="text-foreground">{t.title}</span>
                        <div className="flex gap-1 mt-1">
                          {t.tags.map(tag => (
                            <span key={tag} className="text-[10px] text-primary/70 font-medium">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="font-normal text-[11px] bg-background">
                        {t.category}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {t.account}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {t.date}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={cn(
                        "font-semibold",
                        t.type === 'income' ? "text-emerald-600" :
                        t.type === 'expense' ? "text-foreground" : "text-blue-600"
                      )}>
                        <PrivateValue value={
                          (t.type === 'expense' ? "-" : t.type === 'income' ? "+" : "") + 
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
