import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useGroups } from "@/hooks/use-groups";
import { Briefcase, Home, Plus, Users, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewGroupModal } from "@/components/modals/NewGroupModal";

export function SelectGroupPage() {
  const { user, signOut } = useAuth();
  const { data: groups, isLoading } = useGroups();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (groupId: string) => {
    localStorage.setItem('financial:selectedGroupId', groupId);
    navigate('/dashboard');
  };

  // O usuário solicitou que SEMPRE caia nesta tela, mesmo tendo apenas 1 grupo.
  // Removido useEffect que fazia auto-redirecionamento.

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasGroups = groups && groups.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
          Olá, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            {hasGroups 
              ? "Escolha qual perfil financeiro você deseja acessar hoje." 
              : "Vamos começar sua organização financeira criando seu primeiro perfil."}
          </p>
        </div>

        {hasGroups ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups?.map((group) => (
              <Card 
                key={group.id} 
                className={cn(
                  "group cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 hover:shadow-md border-border/50",
                  selectedId === group.id && "ring-2 ring-primary"
                )}
                onClick={() => handleSelect(group.id)}
              >
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    {group.name.toLowerCase().includes('pessoal') ? <Home className="w-6 h-6" /> : 
                     group.name.toLowerCase().includes('trabalho') ? <Briefcase className="w-6 h-6" /> :
                     <Users className="w-6 h-6" />}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{group.description || 'Perfil compartilhado'}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between pt-0">
                  <span className="text-xs font-medium text-muted-foreground">Clique para entrar</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            ))}

            <NewGroupModal>
              <Card className="border-dashed flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium">Criar Novo Perfil</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">Configure uma nova conta compartilhada ou pessoal.</p>
              </Card>
            </NewGroupModal>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <NewGroupModal>
              <Button size="lg" className="h-20 w-full max-w-sm rounded-2xl text-lg font-bold gap-4 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                <Sparkles className="w-6 h-6" />
                Criar Meu Primeiro Perfil
              </Button>
            </NewGroupModal>
            <p className="mt-6 text-sm text-muted-foreground">
              Ex: "Finanças Pessoais" ou "Contas da Casa"
            </p>
          </div>
        )}
        
        <div className="text-center">
            <Button variant="link" className="text-muted-foreground text-xs" onClick={signOut}>
                Sair da conta
            </Button>
        </div>
      </div>
    </div>
  );
}
