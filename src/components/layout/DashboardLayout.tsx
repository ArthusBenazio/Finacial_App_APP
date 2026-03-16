import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePrivateMode } from "@/hooks/use-private-mode";
import { useProfile } from "@/hooks/use-profile";
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
  X,
  LogOut,
} from "lucide-react";

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

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-card border-r border-border/60 w-64">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-border/40">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <Wallet className="text-primary-foreground w-4 h-4" />
        </div>
        <span className="font-bold text-xl tracking-tight">FinApp</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
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
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors cursor-pointer">
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
      {/* Sidebar - Desktop: fixed, always visible */}
      <div className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>

      {/* Main content — offset by sidebar width on desktop */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
          {/* Mobile: hamburger */}
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

          {/* Desktop: page title */}
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-foreground">
              {navItems.find((i) => i.path === location)?.label ?? "FinApp"}
            </h2>
          </div>

          {/* Actions */}
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
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-accent/50 hover:bg-accent"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
            </Button>
            <NewTransactionModal />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
