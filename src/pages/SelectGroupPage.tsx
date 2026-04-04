import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useGroups, useDeleteGroup } from "@/hooks/use-groups";
import { Briefcase, Home, Plus, Users, ArrowRight, Loader2, Sparkles, MoreVertical, Trash2, Share2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewGroupModal } from "@/components/modals/NewGroupModal";
import { ShareGroupModal } from "@/components/modals/ShareGroupModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function SelectGroupPage() {
  const { user, signOut, isLoading: isLoadingAuth } = useAuth();
  const { data: groups, isLoading: isLoadingGroups } = useGroups();
  const { mutateAsync: deleteGroup, isPending: isDeleting } = useDeleteGroup();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<{ id: string, name: string } | null>(null);
  const [groupToShare, setGroupToShare] = useState<{ id: string, name: string } | null>(null);

  const handleSelect = (groupId: string) => {
    localStorage.setItem('financial:selectedGroupId', groupId);
    navigate('/dashboard');
  };

  const handleDelete = async () => {
    if (!groupToDelete) return;
    try {
      await deleteGroup(groupToDelete.id);
      setGroupToDelete(null);
    } catch {
      // Error handled in hook
    }
  };

  const isLoadingInitial = isLoadingAuth || (isLoadingGroups && !groups);

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
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
              ? "Escolha qual conta você deseja acessar hoje." 
              : user?.isFirstAccess 
                ? "Vamos começar sua organização financeira criando sua primeira conta."
                : "Você não possui nenhuma conta ativa no momento. Vamos criar uma nova?"}
          </p>
        </div>

        {hasGroups ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups?.map((group) => (
              <Card 
                key={group.id} 
                className={cn(
                  "group relative cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 hover:shadow-md border-border/50 overflow-hidden",
                  selectedId === group.id && "ring-2 ring-primary"
                )}
                onClick={() => handleSelect(group.id)}
              >
                <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            >
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            align="end" 
                            className="w-48 shadow-xl border-border/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <DropdownMenuItem 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setGroupToShare({ id: group.id, name: group.name });
                                }}
                                className="gap-2 cursor-pointer font-medium"
                            >
                                <Share2 className="w-4 h-4 text-sky-500" /> Compartilhar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator onClick={(e) => e.stopPropagation()} />
                            <DropdownMenuItem 
                                className="gap-2 text-destructive focus:text-destructive cursor-pointer font-bold"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setGroupToDelete({ id: group.id, name: group.name });
                                }}
                            >
                                <Trash2 className="w-4 h-4" /> Excluir Conta
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    {group.name.toLowerCase().includes('pessoal') ? <Home className="w-6 h-6" /> : 
                     group.name.toLowerCase().includes('trabalho') ? <Briefcase className="w-6 h-6" /> :
                     <Users className="w-6 h-6" />}
                  </div>
                  <div className="space-y-1 pr-8">
                    <CardTitle className="text-lg truncate">{group.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{group.description || 'Conta compartilhada'}</CardDescription>
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
                <h3 className="font-medium">Criar Nova Conta</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">Configure uma nova conta compartilhada ou pessoal.</p>
              </Card>
            </NewGroupModal>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <NewGroupModal>
              <Button size="lg" className="h-20 w-full max-w-sm rounded-2xl text-lg font-bold gap-4 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                <Sparkles className="w-6 h-6" />
                {user?.isFirstAccess ? "Criar Minha Primeira Conta" : "Criar Nova Conta"}
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

      <ShareGroupModal 
        open={!!groupToShare} 
        onOpenChange={(open) => !open && setGroupToShare(null)}
        groupId={groupToShare?.id || ""} 
        groupName={groupToShare?.name || ""} 
      />

      <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent className="border-destructive/20 shadow-2xl">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">Excluir conta "{groupToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-foreground/70">
              Esta ação é <strong className="text-foreground font-bold">irreversível</strong>. Todos os dados financeiros, 
              transações, orçamentos e contas bancárias associadas a este perfil serão 
              <strong className="text-destructive font-bold"> permanentemente excluídos</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="font-medium text-muted-foreground h-11">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90 text-white font-bold h-11 px-8 shadow-lg shadow-destructive/20"
                disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir Definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
