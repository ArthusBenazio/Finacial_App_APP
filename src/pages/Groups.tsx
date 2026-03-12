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
import { useGroups } from "@/hooks/use-groups";

export default function Groups() {
  const { data: groups } = useGroups();

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
        {!groups?.length ? (
          <div className="md:col-span-2 text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl border-border/50">
            Nenhum grupo cadastrado.
          </div>
        ) : groups.map((group) => (
          <Card key={group.id} className="border-border/50 shadow-sm hover:border-primary/50 transition-all cursor-pointer group">
            <CardHeader className="p-5 flex flex-row items-center gap-4">
              <Avatar className="w-14 h-14 rounded-2xl">
                <AvatarFallback className="bg-primary/5 text-primary"><Users /></AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">{group.name}</CardTitle>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase opacity-60">
                    {group.members?.length || 0} Membro(s)
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-[11px] text-muted-foreground">Ativo</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="p-3 rounded-xl bg-muted/30 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Descrição</p>
                  <p className="text-sm font-semibold text-foreground truncate max-w-[150px]">
                    {group.description || "Nenhuma descrição"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-9 rounded-full text-xs gap-2">
                  Ver Detalhes
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
        <Card className="border-border/50 shadow-sm overflow-hidden p-6 text-center">
          <p className="text-muted-foreground text-sm">Nenhuma atividade recente.</p>
        </Card>
      </section>
    </div>
  );
}
