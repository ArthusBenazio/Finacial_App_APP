import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PrivateValue } from "@/components/PrivateValue";
import { 
  Users, 
  UserPlus, 
  ArrowRightLeft, 
  History, 
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  { 
    id: 1, 
    name: "Família Silva", 
    members: 4, 
    balance: -450.00, 
    type: "debt",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=100&h=100&fit=crop"
  },
  { 
    id: 2, 
    name: "República Vila Verde", 
    members: 6, 
    balance: 120.00, 
    type: "credit",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&h=100&fit=crop"
  },
  { 
    id: 3, 
    name: "Viagem Europeia 2024", 
    members: 3, 
    balance: 0, 
    type: "settled",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=100&h=100&fit=crop"
  }
];

export default function Groups() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grupos & Divisões</h1>
          <p className="text-muted-foreground text-sm">Divida despesas com amigos, família ou república de forma justa.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
            <UserPlus className="w-4 h-4" /> Novo Grupo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="border-border/50 shadow-sm hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader className="p-5 flex flex-row items-center gap-4">
              <Avatar className="w-14 h-14 rounded-2xl">
                <AvatarImage src={group.image} />
                <AvatarFallback className="bg-primary/5 text-primary"><Users /></AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">{group.name}</CardTitle>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase opacity-60">
                    {group.members} Membros
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-[11px] text-muted-foreground">Admin: Você</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="p-3 rounded-xl bg-muted/30 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Seu Acerto</p>
                  <p className={cn(
                    "text-lg font-black",
                    group.type === 'debt' ? "text-rose-500" : 
                    group.type === 'credit' ? "text-emerald-500" : "text-muted-foreground"
                  )}>
                    <PrivateValue value={
                      group.balance === 0 ? "Tudo em dia" :
                      (group.type === 'debt' ? "- " : "+ ") + 
                      Math.abs(group.balance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    } />
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-9 rounded-full text-xs gap-2">
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Liquidar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-9 rounded-full text-xs gap-2">
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Atividade Recente dos Grupos
        </h3>
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="divide-y divide-border/50">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      <span className="text-primary font-bold">Marcos</span> adicionou uma despesa em <span className="font-bold">República</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">Ontem às 19:45 • Faxina Mensal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold"><PrivateValue value="R$ 45,00" /></p>
                  <p className="text-[10px] text-muted-foreground">Sua parte</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
