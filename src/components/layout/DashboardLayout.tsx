import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePrivateMode } from "@/hooks/use-private-mode";
import { NewTransactionModal } from "@/components/modals/NewTransactionModal";
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
  Plus
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ArrowLeftRight, label: "Lançamentos", path: "/transactions" },
  { icon: Wallet, label: "Carteiras", path: "/wallets" },
  { icon: PieChart, label: "Orçamentos", path: "/budgets" },
  { icon: Users, label: "Grupos", path: "/groups" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation().pathname;
  const navigate = useNavigate();
  const { isPrivate, togglePrivateMode } = usePrivateMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">FinApp</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                location === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Button className="w-full justify-start gap-3 h-12" variant="ghost">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
              <AvatarFallback>JS</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-semibold leading-tight">João Silva</span>
              <span className="text-xs text-muted-foreground leading-tight">Plano Premium</span>
            </div>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
            <span className="font-bold text-lg">FinApp</span>
          </div>
          
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-foreground">
              {navItems.find(i => i.path === location)?.label || "FinApp"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={togglePrivateMode} title="Modo Privado" className="rounded-full bg-accent/50 hover:bg-accent">
              {isPrivate ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-accent/50 hover:bg-accent">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </Button>
            <NewTransactionModal />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
