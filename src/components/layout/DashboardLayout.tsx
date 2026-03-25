import { useState, useMemo } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePrivateMode } from "@/hooks/use-private-mode";
import { useProfile } from "@/hooks/use-profile";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";
import { useGroups } from "@/hooks/use-groups";
import { useAuth } from "@/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PieChart,
  Users,
  Settings,
  Eye,
  EyeOff,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
  CalendarClock,
  Trash2,
  Check,
  Plus
} from "lucide-react";
import { useTransactions, useUpdateTransaction, useDeleteTransaction, Transaction } from "@/hooks/use-transactions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ArrowLeftRight, label: "Lançamentos", path: "/transactions" },
  { icon: Wallet, label: "Carteiras", path: "/wallets" },
  { icon: PieChart, label: "Orçamentos", path: "/budgets" },
  { icon: Users, label: "Grupos", path: "/groups" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation().pathname;
  const navigate = useNavigate();
  const { isPrivate, togglePrivateMode } = usePrivateMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: profile } = useProfile();
  const { data: transactions } = useTransactions();
  const { data: groups, isLoading: isLoadingGroups } = useGroups();
  const { mutate: updateTransaction } = useUpdateTransaction();
  const { mutate: deleteTransaction } = useDeleteTransaction();
  const { signOut } = useAuth();

  const selectedGroupId = localStorage.getItem('financial:selectedGroupId');
  const currentGroup = groups?.find(g => g.id === selectedGroupId);

  // Se não estiver carregando E (não houver ID ou o ID selecionado não existir no banco), redireciona
  if (!isLoadingGroups && (!selectedGroupId || !currentGroup) && location !== '/select-group') {
    localStorage.removeItem('financial:selectedGroupId');
    return <Navigate to="/select-group" replace />
  }

  const pendingPredictions = useMemo(() => {
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);
    return (transactions ?? [])
      .filter((t: Transaction) => t.isPrediction && new Date(t.date) <= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-card border-r border-border/60 w-64">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-border/40">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <Wallet className="text-primary-foreground w-4 h-4" />
        </div>
        <span className="font-bold text-xl tracking-tight">FinApp</span>
      </div>

      {/* Current Group Selector */}
      <div className="px-4 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-12 px-3 border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-2 overflow-hidden text-left">
                <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight leading-none mb-1">Perfil Ativo</span>
                  <span className="text-sm font-semibold truncate leading-none">{currentGroup?.name || 'Selecione'}</span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-50 rotate-90" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <div className="p-2 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Trocar Perfil</div>
            {groups?.map(g => (
               <DropdownMenuItem key={g.id} onClick={() => {
                 localStorage.setItem('financial:selectedGroupId', g.id);
                 window.location.reload();
               }}>
                 <span className={cn("flex-1", g.id === selectedGroupId && "font-bold text-primary")}>{g.name}</span>
                 {g.id === selectedGroupId && <Check className="w-4 h-4 text-primary ml-2" />}
               </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/select-group')}>
              <Plus className="w-4 h-4 mr-2" /> Gerenciar Perfis
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t border-border/40">
        <div 
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors cursor-pointer"
        >
          <Avatar className="w-9 h-9 ring-2 ring-primary/20 flex-shrink-0">
            {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.name} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {profile ? getInitials(profile.name) : "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left min-w-0">
            <span className="text-sm font-semibold leading-tight truncate max-w-[120px]">
              {profile?.name ?? "Carregando..."}
            </span>
            <span className="text-xs text-muted-foreground leading-tight truncate max-w-[120px]">
              {profile?.email ?? ""}
            </span>
          </div>
          <LogOut className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0 opacity-50 hover:opacity-100" />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64">
        <Sidebar />
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-w-0 md:ml-64">
        <header className="h-16 border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
            <span className="font-bold text-lg">FinApp</span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-foreground">
              {navItems.find((i) => i.path === location)?.label ?? "FinApp"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePrivateMode}
              title="Modo Privado"
              className="rounded-full bg-accent/50 hover:bg-accent"
            >
              {isPrivate ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-accent/50 hover:bg-accent relative"
                >
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  {pendingPredictions.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-background animate-pulse">
                      {pendingPredictions.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 shadow-2xl border-border/50">
                <div className="p-4 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm">Notificações</h3>
                      <p className="text-[10px] text-muted-foreground">Você tem {pendingPredictions.length} previsões pendentes</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5 bg-indigo-50 text-indigo-600 border-indigo-200">
                      Previsões
                    </Badge>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {pendingPredictions.length === 0 ? (
                    <div className="py-12 px-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
                        <Check className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">Tudo em dia!</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">Nenhuma previsão pendente por enquanto.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {pendingPredictions.map((t) => (
                        <div key={t.id} className="p-4 hover:bg-muted/30 transition-colors group">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                              t.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" :
                              t.type === 'EXPENSE' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                            )}>
                              <CalendarClock className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-semibold text-foreground truncate">{t.description}</p>
                                  <span className="text-[10px] whitespace-nowrap font-bold text-foreground">
                                    {(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Vencimento: {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(t.date))}
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                  <Button 
                                    size="sm" 
                                    className="h-7 text-[10px] px-3 font-bold bg-primary hover:bg-primary/90"
                                    onClick={() => updateTransaction({
                                      id: t.id,
                                      description: t.description,
                                      amount: t.amount,
                                      type: t.type,
                                      categoryId: t.categoryId || undefined,
                                      accountId: t.accountId,
                                      destinationAccountId: t.destinationAccountId || undefined,
                                      date: t.date,
                                      isPrediction: false
                                    })}
                                  >
                                    Confirmar
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                                    onClick={() => {
                                      if(confirm("Excluir esta previsão?")) {
                                        deleteTransaction(t.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <NewTransactionModal />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
