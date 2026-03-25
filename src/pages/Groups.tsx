import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  UserPlus, 
  History, 
  ChevronRight,
  ShieldCheck,
  Mail,
  Loader2,
  Check
} from "lucide-react";
import { useGroups } from "@/hooks/use-groups";
import { createInvite } from "@/api/invites-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { NewGroupModal } from "@/components/modals/NewGroupModal";

export default function Groups() {
  const { data: groups } = useGroups();
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSendInvite = async () => {
    if (!selectedGroupId || !inviteEmail) return;

    setIsInviting(true);
    try {
      await createInvite(inviteEmail, selectedGroupId);
      toast.success("Convite enviado com sucesso!");
      setInviteEmail("");
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao enviar convite.");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perfis Compartilhados</h1>
          <p className="text-muted-foreground text-sm">Gerencie quem tem acesso às suas contas financeiras.</p>
        </div>
        <div className="flex items-center gap-2">
          <NewGroupModal>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Novo Perfil
            </button>
          </NewGroupModal>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!groups?.length ? (
          <div className="md:col-span-2 text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl border-border/50">
            Nenhum perfil cadastrado.
          </div>
        ) : groups.map((group) => (
          <Card key={group.id} className="border-border/50 shadow-sm hover:border-primary/50 transition-all group overflow-hidden">
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
              <div className="p-3 rounded-xl bg-muted/30 flex items-center justify-between mb-4">
                <div className="flex -space-x-2 overflow-hidden">
                  {group.members?.map((member) => (
                    <Avatar key={member.id} className="w-7 h-7 border-2 border-background ring-2 ring-transparent hover:ring-primary transition-all cursor-help" title={member.user.name}>
                      <AvatarFallback className="text-[8px] font-bold bg-muted-foreground/10">
                        {member.user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <Dialog open={isDialogOpen && selectedGroupId === group.id} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (open) setSelectedGroupId(group.id);
                  }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs gap-2 hover:bg-primary/10 hover:text-primary">
                      <UserPlus className="w-3 h-3" /> Convidar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Convidar para o grupo</DialogTitle>
                      <DialogDescription>
                        Envie um convite por e-mail para compartilhar o perfil <strong>{group.name}</strong>.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2 py-4">
                      <div className="grid flex-1 gap-2">
                        <Input
                          id="email"
                          placeholder="e-mail@exemplo.com"
                          className="rounded-xl h-12"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <Button type="submit" size="sm" className="px-5 h-12 rounded-xl font-bold" onClick={handleSendInvite} disabled={isInviting}>
                        {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar"}
                      </Button>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-500" />
                            O usuário receberá um link seguro para aceitar o convite.
                        </p>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 h-9 rounded-full text-xs gap-2 hover:bg-primary hover:text-white transition-colors" onClick={() => {
                       localStorage.setItem('financial:selectedGroupId', group.id);
                       window.location.href = '/dashboard';
                }}>
                  Entrar neste Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Membros Recém-Adicionados
        </h3>
        <Card className="border-border/50 shadow-sm overflow-hidden p-6 text-center">
          <p className="text-muted-foreground text-sm">Gerencie convites pendentes e permissões em breve.</p>
        </Card>
      </section>
    </div>
  );
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
