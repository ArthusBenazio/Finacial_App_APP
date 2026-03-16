import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PrivateValue } from "@/components/PrivateValue";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  MoreVertical,
  Users,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Repeat2,
  ChevronDown,
  Check,
  Wallet,
  Heart,
  Frown,
  Meh,
  Smile,
  BarChart3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { useAccountsBalance } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { useGroups } from "@/hooks/use-groups";
import { Link } from "react-router-dom";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Detecta se uma string é um emoji (caractere especial Unicode) ou texto comum (nome de ícone Lucide etc.)
function isEmoji(str: string | null | undefined): boolean {
  if (!str) return false;
  // Emojis têm code point > 0x2000 ou são caracteres compostos
  return /\p{Emoji}/u.test(str) && !/^[\w\s-]+$/.test(str);
}

// ─── Custom Tooltip do gráfico ──────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-xl px-4 py-3 text-sm">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold" style={{ color: entry.color }}>
              {formatBRL(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Dashboard principal ────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: accountsBalance } = useAccountsBalance();
  const { data: transactions } = useTransactions();
  const { data: budgets } = useBudgets();
  const { data: groups } = useGroups();

  // toggle: top 5 gastos ou receitas
  const [categoryMode, setCategoryMode] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  // select de carteiras (null = todas selecionadas)
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string> | null>(null);

  const allAccounts = accountsBalance?.accounts ?? [];

  // IDs efetivamente ativos (null => todos)
  const activeIds = useMemo(
    () => selectedAccountIds ?? new Set(allAccounts.map((a) => a.id)),
    [selectedAccountIds, allAccounts]
  );

  const isAllSelected = selectedAccountIds === null || selectedAccountIds.size === allAccounts.length;

  const filteredBalance = useMemo(
    () => allAccounts.filter((a) => activeIds.has(a.id)).reduce((acc, a) => acc + a.balance, 0),
    [allAccounts, activeIds]
  );

  function toggleAccount(id: string) {
    setSelectedAccountIds((prev) => {
      // Se era null (todas), começa desmarcando apenas esta
      const current = prev ?? new Set(allAccounts.map((a) => a.id));
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // Se voltou a ter todas, normalize para null
      if (next.size === allAccounts.length) return null;
      return next;
    });
  }

  function toggleAll() {
    setSelectedAccountIds(null);
  }

  const walletLabel = useMemo(() => {
    if (isAllSelected) return "Todas as carteiras";
    if (activeIds.size === 0) return "Nenhuma carteira";
    if (activeIds.size === 1) {
      const name = allAccounts.find((a) => activeIds.has(a.id))?.name;
      return name ?? "1 carteira";
    }
    return `${activeIds.size} carteiras`;
  }, [isAllSelected, activeIds, allAccounts]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // ── Transações do mês atual ──
  const currentMonthTransactions = useMemo(
    () =>
      (transactions ?? []).filter((t) => {
        const d = new Date(t.occurredAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }),
    [transactions, currentMonth, currentYear]
  );

  const receitas = useMemo(
    () =>
      currentMonthTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((acc, t) => acc + t.amount, 0),
    [currentMonthTransactions]
  );

  const despesas = useMemo(
    () =>
      currentMonthTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((acc, t) => acc + t.amount, 0),
    [currentMonthTransactions]
  );

  // ── Top 5 categorias ──
  const top5Categories = useMemo(() => {
    const filtered = currentMonthTransactions.filter((t) => t.type === categoryMode);
    const grouped: Record<
      string,
      { name: string; icon: string; color: string; total: number }
    > = {};

    for (const t of filtered) {
      const key = t.categoryId ?? "sem-categoria";
      const name = t.categoryRel?.name ?? t.category ?? "Sem categoria";
      const icon = t.categoryRel?.icon ?? "📦";
      const color = t.categoryRel?.color ?? "#94a3b8";
      if (!grouped[key]) grouped[key] = { name, icon, color, total: 0 };
      grouped[key].total += t.amount;
    }

    const sorted = Object.values(grouped).sort((a, b) => b.total - a.total).slice(0, 5);
    const grandTotal = sorted.reduce((acc, c) => acc + c.total, 0);
    return sorted.map((c) => ({ ...c, pct: grandTotal > 0 ? (c.total / grandTotal) * 100 : 0 }));
  }, [currentMonthTransactions, categoryMode]);

  // ── Últimas 5 transações ──
  const recentTransactions = useMemo(() => transactions?.slice(0, 5) ?? [], [transactions]);

  // ── Gráfico de evolução (6 meses) ──
  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const ref = subMonths(now, 5 - i);
      const m = ref.getMonth();
      const y = ref.getFullYear();
      const start = startOfMonth(ref);
      const end = endOfMonth(ref);
      const monthTxs = (transactions ?? []).filter((t) => {
        const d = new Date(t.occurredAt);
        return isWithinInterval(d, { start, end });
      });
      const rec = monthTxs.filter((t) => t.type === "INCOME").reduce((a, t) => a + t.amount, 0);
      const desp = monthTxs.filter((t) => t.type === "EXPENSE").reduce((a, t) => a + t.amount, 0);
      return {
        mes: format(ref, "MMM", { locale: ptBR }),
        Receitas: rec,
        Despesas: desp,
      };
    });
  }, [transactions]);

  // ── Saúde financeira ──
  const healthPct = receitas > 0 ? Math.round(((receitas - despesas) / receitas) * 100) : 0;
  const healthInfo = useMemo(() => {
    if (healthPct >= 20) return { label: "Ótimo", msg: `Você economizou ${healthPct}% da sua renda!`, icon: Smile, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800/40" };
    if (healthPct >= 0) return { label: "Atenção", msg: `Você economizou ${healthPct}% da renda. Pode melhorar!`, icon: Meh, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800/40" };
    return { label: "Alerta", msg: `Suas despesas superaram a renda em ${Math.abs(healthPct)}%!`, icon: Frown, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800/40" };
  }, [healthPct]);

  // ── Próximas recorrentes (próximos 30 dias) ──
  const upcoming = useMemo(() => {
    const today = new Date();
    const limit = addDays(today, 30);
    return (transactions ?? [])
      .filter((t) => {
        if (!t.isRecurring) return false;
        const d = new Date(t.occurredAt);
        return d >= today && d <= limit;
      })
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())
      .slice(0, 4);
  }, [transactions]);

  const getAccountName = (id: string) =>
    accountsBalance?.accounts.find((a) => a.id === id)?.name ?? "Conta";

  const HealthIcon = healthInfo.icon;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Linha 1: Cards de resumo ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo Total */}
        <Card className="bg-primary text-primary-foreground border-none shadow-md overflow-hidden relative">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
          <CardHeader className="pb-2 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary-foreground/80 text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Saldo Total
              </CardTitle>

              {/* Popover de seleção de carteiras */}
              {allAccounts.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1.5 text-[11px] font-medium bg-white/15 hover:bg-white/25 transition-colors rounded-full px-2.5 py-1 text-primary-foreground/90">
                      <Wallet className="w-3 h-3" />
                      <span className="max-w-[110px] truncate">{walletLabel}</span>
                      <ChevronDown className="w-3 h-3 opacity-70 flex-shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={8}
                    className="w-56 p-2 shadow-xl"
                  >
                    <p className="text-[11px] font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wide">
                      Filtrar carteiras
                    </p>

                    {/* Opção: todas */}
                    <button
                      onClick={toggleAll}
                      className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isAllSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/40"
                        }`}>
                          {isAllSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                        </div>
                        <span className="font-medium text-foreground">Todas as carteiras</span>
                      </div>
                      {isAllSelected && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                          {allAccounts.length}
                        </Badge>
                      )}
                    </button>

                    <div className="border-t border-border my-1.5 mx-2" />

                    {/* Cada conta */}
                    {allAccounts.map((acc) => {
                      const isChecked = activeIds.has(acc.id);
                      return (
                        <button
                          key={acc.id}
                          onClick={() => toggleAccount(acc.id)}
                          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors text-sm"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isChecked
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/40"
                          }`}>
                            {isChecked && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                          </div>
                          <span className="flex-1 text-left truncate text-foreground">{acc.name}</span>
                          <span className="text-[11px] text-muted-foreground font-medium flex-shrink-0">
                            <PrivateValue value={formatBRL(acc.balance)} />
                          </span>
                        </button>
                      );
                    })}
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold tracking-tight">
              <PrivateValue value={formatBRL(filteredBalance)} />
            </div>
            {/* Indicador quando filtrado */}
            {!isAllSelected && (
              <p className="text-[11px] text-primary-foreground/70 mt-1.5">
                {activeIds.size === 0
                  ? "Nenhuma carteira selecionada"
                  : `${activeIds.size} de ${allAccounts.length} carteiras`}
              </p>
            )}
            {isAllSelected && allAccounts.length > 0 && (
              <p className="text-[11px] text-primary-foreground/70 mt-1.5">
                {allAccounts.length} {allAccounts.length === 1 ? "carteira" : "carteiras"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Receitas */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm font-medium">Receitas no mês</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              <PrivateValue value={formatBRL(receitas)} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonthTransactions.filter((t) => t.type === "INCOME").length} lançamentos
            </p>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-muted-foreground text-sm font-medium">Despesas no mês</CardTitle>
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              <PrivateValue value={formatBRL(despesas)} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonthTransactions.filter((t) => t.type === "EXPENSE").length} lançamentos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Linha 2: Gráfico + Saúde Financeira ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de linha (6 meses) */}
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Evolução dos últimos 6 meses
                </CardTitle>
                <CardDescription className="text-xs mt-1">Receitas vs Despesas por mês</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                  }
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Receitas"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorReceitas)"
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="Despesas"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="url(#colorDespesas)"
                  dot={{ fill: "#f43f5e", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Saúde Financeira */}
        <Card className={cn("shadow-sm border", healthInfo.bg, healthInfo.border)}>
          <CardHeader className="pb-3">
            <CardTitle className={cn("text-sm font-semibold flex items-center gap-2", healthInfo.color)}>
              <Heart className="w-4 h-4" />
              Saúde Financeira
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pt-2">
            {/* Gauge circular */}
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={healthPct >= 20 ? "#10b981" : healthPct >= 0 ? "#f59e0b" : "#f43f5e"}
                  strokeWidth="10"
                  strokeDasharray={`${Math.max(0, Math.min(100, healthPct)) * 2.513} 251.3`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <HealthIcon className={cn("w-6 h-6", healthInfo.color)} />
                <span className={cn("text-xl font-bold leading-none mt-1", healthInfo.color)}>
                  {healthPct}%
                </span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className={cn("text-sm font-semibold", healthInfo.color)}>{healthInfo.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{healthInfo.msg}</p>
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Receitas</span>
                <span className="font-medium text-emerald-600">
                  <PrivateValue value={formatBRL(receitas)} />
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Despesas</span>
                <span className="font-medium text-rose-600">
                  <PrivateValue value={formatBRL(despesas)} />
                </span>
              </div>
              <div className="flex justify-between text-xs border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground font-medium">Economia</span>
                <span className={cn("font-bold", receitas - despesas >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  <PrivateValue value={formatBRL(receitas - despesas)} />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Linha 3: Últimos lançamentos + Top 5 Categorias ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimos lançamentos */}
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Últimos Lançamentos</CardTitle>
              <CardDescription className="text-xs mt-1">Sua movimentação recente em todas as contas.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs rounded-full" asChild>
              <Link to="/transactions">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentTransactions.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhum lançamento encontrado.
                </div>
              )}
              {recentTransactions.map((t) => (
                <div
                  key={t.id}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center",
                        t.type === "INCOME"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50"
                          : t.type === "EXPENSE"
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50"
                          : "bg-blue-50 text-blue-600 dark:bg-blue-950/50"
                      )}
                    >
                      {t.type === "INCOME" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : t.type === "EXPENSE" ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowLeftRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                        {t.description}
                        {t.isShared && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-medium h-4 px-1.5 gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300"
                          >
                            <Users className="w-2.5 h-2.5" /> Divisão
                          </Badge>
                        )}
                        {t.isRecurring && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-medium h-4 px-1.5 gap-1 bg-violet-50 text-violet-700 hover:bg-violet-50 border-violet-100 dark:bg-violet-950/50 dark:text-violet-300"
                          >
                            <Repeat2 className="w-2.5 h-2.5" /> Recorrente
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {t.categoryRel?.name ?? t.category ?? "Sem categoria"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div
                        className={cn(
                          "font-semibold text-sm",
                          t.type === "INCOME"
                            ? "text-emerald-600"
                            : t.type === "EXPENSE"
                            ? "text-foreground"
                            : "text-blue-600"
                        )}
                      >
                        <PrivateValue
                          value={
                            (t.type === "EXPENSE" ? "−" : "+") +
                            t.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          }
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {getAccountName(t.accountId)} &bull;{" "}
                        {new Intl.DateTimeFormat("pt-BR").format(new Date(t.occurredAt))}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem>Editar Lançamento</DropdownMenuItem>
                        <DropdownMenuItem>Anexar Comprovante</DropdownMenuItem>
                        {t.isShared && <DropdownMenuItem>Detalhes da Divisão</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Categorias */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Top 5 Categorias</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {categoryMode === "EXPENSE" ? "Maiores gastos" : "Maiores receitas"} do mês
                </CardDescription>
              </div>
              {/* Toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setCategoryMode("EXPENSE")}
                  className={cn(
                    "flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition-all duration-200",
                    categoryMode === "EXPENSE"
                      ? "bg-background shadow-sm text-rose-600"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TrendingDown className="w-3 h-3" />
                  Gastos
                </button>
                <button
                  onClick={() => setCategoryMode("INCOME")}
                  className={cn(
                    "flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition-all duration-200",
                    categoryMode === "INCOME"
                      ? "bg-background shadow-sm text-emerald-600"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TrendingUp className="w-3 h-3" />
                  Receitas
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {top5Categories.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Nenhuma {categoryMode === "EXPENSE" ? "despesa" : "receita"} no mês.
                </div>
              ) : (
                top5Categories.map((cat, idx) => (
                  <div
                    key={cat.name}
                    className="space-y-1 group animate-in fade-in slide-in-from-left-2 duration-300"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {isEmoji(cat.icon) ? (
                          <span
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-sm shadow-sm border border-background flex-shrink-0"
                            style={{ background: cat.color + "22" }}
                          >
                            {cat.icon}
                          </span>
                        ) : (
                          // Cor sólida + barra lateral quando ícone é nome de texto
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: cat.color }}
                          />
                        )}
                        <span className="font-medium text-foreground truncate max-w-[110px]">
                          {cat.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-foreground">
                          <PrivateValue value={formatBRL(cat.total)} />
                        </div>
                        <div className="text-[10px] text-muted-foreground">{cat.pct.toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                        style={{
                          width: `${cat.pct}%`,
                          background: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Rodapé total */}
            {top5Categories.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  Total {categoryMode === "EXPENSE" ? "gasto" : "recebido"}
                </span>
                <span className={cn("font-bold", categoryMode === "EXPENSE" ? "text-rose-600" : "text-emerald-600")}>
                  <PrivateValue
                    value={formatBRL(
                      top5Categories.reduce((acc, c) => acc + c.total, 0)
                    )}
                  />
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Linha 4: Recorrentes + Orçamentos + Pendências ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas recorrentes */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Repeat2 className="w-4 h-4 text-violet-600" />
                Próximas Recorrentes
              </CardTitle>
              <CardDescription className="text-xs mt-1">Nos próximos 30 dias</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Nenhuma transação recorrente futura.
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs",
                          t.type === "INCOME"
                            ? "bg-emerald-100 dark:bg-emerald-950/50"
                            : "bg-rose-100 dark:bg-rose-950/50"
                        )}
                      >
                        {t.categoryRel?.icon ?? (t.type === "INCOME" ? "↑" : "↓")}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-none">{t.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Intl.DateTimeFormat("pt-BR").format(new Date(t.occurredAt))}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold",
                        t.type === "INCOME" ? "text-emerald-600" : "text-rose-500"
                      )}
                    >
                      <PrivateValue value={formatBRL(t.amount)} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orçamentos */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Orçamentos Ativos</CardTitle>
            <span className="text-xs text-muted-foreground">
              {format(now, "MMM yyyy", { locale: ptBR })}
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            {!budgets?.length && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Nenhum orçamento definido.
              </div>
            )}
            {budgets?.slice(0, 4).map((budget) => (
              <div key={budget.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {budget.categoryRel?.icon && (
                      <span className="text-sm">{budget.categoryRel.icon}</span>
                    )}
                    <span className="font-semibold text-foreground text-xs">
                      {budget.categoryRel?.name ?? budget.category ?? "Sem categoria"}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-semibold",
                      budget.spent > budget.limit ? "text-rose-500" : "text-muted-foreground"
                    )}
                  >
                    <PrivateValue
                      value={`${formatBRL(budget.spent)} / ${formatBRL(budget.limit)}`}
                    />
                  </span>
                </div>
                <Progress
                  value={Math.min((budget.spent / budget.limit) * 100, 100)}
                  className={cn(
                    "h-1.5",
                    budget.spent > budget.limit
                      ? "bg-rose-100 dark:bg-rose-950/40 [&>div]:bg-rose-500"
                      : `bg-muted [&>div]:${budget.color}`
                  )}
                />
                {budget.spent > budget.limit && (
                  <p className="text-[10px] font-medium text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" /> Limite excedido
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pendências */}
        <Card className="shadow-sm border-orange-200/50 bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertCircle className="w-4 h-4" />
              A Receber (Pendências)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!groups?.length ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Nenhuma pendência recente.
              </div>
            ) : (
              <div className="space-y-3">
                {groups.slice(0, 3).map((group, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white dark:bg-card p-3 rounded-lg shadow-sm border border-orange-100 dark:border-orange-900/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                        <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{group.name}</div>
                        <div className="text-[11px] text-muted-foreground">Divisão de grupo</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-[11px]">
                      Ver Grupo
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
