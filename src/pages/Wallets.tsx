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
import { useAccountsBalance, useDeleteAccount } from "@/hooks/use-accounts";
import { NewAccountModal } from "@/components/modals/NewAccountModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Wallets() {
  const { data: accountsBalance } = useAccountsBalance();
  const { mutate: deleteAccount } = useDeleteAccount();
  const accounts = accountsBalance?.accounts || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carteiras & Contas</h1>
          <p className="text-muted-foreground text-sm">Organize seu dinheiro em diferentes bancos e categorias.</p>
        </div>
        <NewAccountModal>
          <Button className="rounded-full gap-2">
            <PlusCircle className="w-4 h-4" /> Adicionar Conta
          </Button>
        </NewAccountModal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!accounts.length ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl border-border/50">
            Nenhuma conta cadastrada.
          </div>
        ) : accounts.map((account) => (
          <Card key={account.id} className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-5 rounded-full bg-primary"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm bg-primary">
                  <Banknote className="w-5 h-5" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-rose-500 hover:text-rose-600 focus:text-rose-600 focus:bg-rose-50" onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Deseja realmente excluir esta conta e suas transações associadas?")) {
                        deleteAccount(account.id);
                      }
                    }}>
                      Excluir Conta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-4">
                <CardTitle className="text-base font-semibold">{account.name}</CardTitle>
                <CardDescription className="text-[11px] uppercase tracking-wider font-bold opacity-70">
                  Conta
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <span className="text-2xl font-bold tracking-tight">
                  <PrivateValue value={account.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                </span>
                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="secondary" className="bg-muted/50 text-[10px] font-medium px-2 py-0">Ativa</Badge>
                  <span className="text-[11px] text-muted-foreground italic">Atualizado hoje</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <NewAccountModal>
          <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary min-h-[180px] w-full">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-semibold text-sm text-center">Configurar nova<br/>conta ou carteira</span>
          </button>
        </NewAccountModal>
      </div>


    </div>
  );
}
