import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrivateValue } from "@/components/PrivateValue";
import { 
  Plus, 
  Wallet, 
  CreditCard, 
  Banknote, 
  TrendingUp, 
  MoreHorizontal,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const wallets = [
  { id: 1, name: "Conta Itaú", type: "bank", balance: 5200.45, icon: Banknote, color: "bg-orange-500", currency: "BRL" },
  { id: 2, name: "Nubank Principal", type: "card", balance: 1250.00, icon: CreditCard, color: "bg-purple-600", currency: "BRL" },
  { id: 3, name: "Dinheiro Espécie", type: "cash", balance: 340.00, icon: Wallet, color: "bg-emerald-500", currency: "BRL" },
  { id: 4, name: "Investimentos Selic", type: "investment", balance: 15400.00, icon: TrendingUp, color: "bg-blue-600", currency: "BRL" },
  { id: 5, name: "Caixinha Reserva", type: "investment", balance: 2500.00, icon: TrendingUp, color: "bg-pink-500", currency: "BRL" },
];

export default function Wallets() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carteiras & Contas</h1>
          <p className="text-muted-foreground text-sm">Organize seu dinheiro em diferentes bancos e categorias.</p>
        </div>
        <Button className="rounded-full gap-2">
          <PlusCircle className="w-4 h-4" /> Adicionar Conta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <Card key={wallet.id} className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer">
            <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-5 rounded-full", wallet.color)}></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm", wallet.color)}>
                  <wallet.icon className="w-5 h-5" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4">
                <CardTitle className="text-base font-semibold">{wallet.name}</CardTitle>
                <CardDescription className="text-[11px] uppercase tracking-wider font-bold opacity-70">
                  {wallet.type === 'bank' ? 'Conta Bancária' : 
                   wallet.type === 'card' ? 'Cartão de Crédito' : 
                   wallet.type === 'investment' ? 'Investimento' : 'Dinheiro'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <span className="text-2xl font-bold tracking-tight">
                  <PrivateValue value={wallet.balance.toLocaleString('pt-BR', { style: 'currency', currency: wallet.currency })} />
                </span>
                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="secondary" className="bg-muted/50 text-[10px] font-medium px-2 py-0">Ativa</Badge>
                  <span className="text-[11px] text-muted-foreground italic">Atualizado hoje às 08:00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary min-h-[180px]">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-semibold text-sm text-center">Configurar nova<br/>conta ou carteira</span>
        </button>
      </div>

      {/* Seção de Cartões de Crédito */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Próximos Fechamentos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/50 shadow-sm bg-muted/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 rounded bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/20"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold">Nubank • Fatura</p>
                  <p className="text-[11px] text-muted-foreground">Vence em 10 Mar</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-rose-500"><PrivateValue value="R$ 1.840,50" /></p>
                <Button variant="link" className="h-auto p-0 text-[11px] text-primary">Ver fatura</Button>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-muted/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 rounded bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/20"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold">XP Visa • Fatura</p>
                  <p className="text-[11px] text-muted-foreground">Vence em 15 Mar</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-rose-500"><PrivateValue value="R$ 4.120,00" /></p>
                <Button variant="link" className="h-auto p-0 text-[11px] text-primary">Ver fatura</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
