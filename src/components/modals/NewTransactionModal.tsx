import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Plus, Wallet, Tag, Calendar as CalendarIcon, Loader2, RefreshCw } from "lucide-react"
import { useCreateTransaction } from "@/hooks/use-transactions"
import { useAccountsBalance } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import { NewCategoryModal } from "./NewCategoryModal"

const INTERVAL_LABELS = {
  MONTHLY: "meses",
  WEEKLY: "semanas",
  YEARLY: "anos",
} as const

const INTERVAL_PERIOD_LABELS = {
  MONTHLY: "mensais",
  WEEKLY: "semanais",
  YEARLY: "anuais",
} as const

function buildRecurringPreview(
  amount: string,
  count: number,
  interval: "MONTHLY" | "WEEKLY" | "YEARLY",
  startDate: string
): string {
  const amountNum = parseFloat(amount.replace(",", "."))
  if (!count || count < 2 || isNaN(amountNum) || !startDate) return ""

  const start = new Date(startDate)
  const end = new Date(startDate)

  if (interval === "MONTHLY") end.setMonth(end.getMonth() + count - 1)
  else if (interval === "WEEKLY") end.setDate(end.getDate() + (count - 1) * 7)
  else if (interval === "YEARLY") end.setFullYear(end.getFullYear() + count - 1)

  const fmt = (d: Date) =>
    d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })

  return `${count} lançamentos ${INTERVAL_PERIOD_LABELS[interval]} de R$ ${amountNum.toFixed(2).replace(".", ",")} — de ${fmt(start)} até ${fmt(end)}`
}

const formSchema = z
  .object({
    title: z.string().min(2, "Título é obrigatório"),
    amount: z.string().min(1, "Valor é obrigatório"),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    category: z.string().optional(),
    account: z.string().min(1, "Conta é obrigatória"),
    destinationAccount: z.string().optional(),
    date: z.string().min(1, "Data é obrigatória"),
    isRecurring: z.boolean().default(false),
    recurringCount: z.string().optional(),
    recurringInterval: z.enum(["MONTHLY", "WEEKLY", "YEARLY"]).default("MONTHLY"),
  })
  .refine(
    (data) => {
      if (data.type !== "TRANSFER" && !data.category) return false
      return true
    },
    { message: "Categoria é obrigatória", path: ["category"] }
  )
  .refine(
    (data) => {
      if (data.type === "TRANSFER" && !data.destinationAccount) return false
      return true
    },
    { message: "Conta de destino é obrigatória", path: ["destinationAccount"] }
  )
  .refine(
    (data) => {
      if (data.isRecurring) {
        const n = parseInt(data.recurringCount ?? "")
        if (isNaN(n) || n < 2 || n > 360) return false
      }
      return true
    },
    { message: "Informe um número entre 2 e 360", path: ["recurringCount"] }
  )

type FormValues = {
  title: string
  amount: string
  type: "INCOME" | "EXPENSE" | "TRANSFER"
  category?: string
  account: string
  destinationAccount?: string
  date: string
  isRecurring: boolean
  recurringCount?: string
  recurringInterval: "MONTHLY" | "WEEKLY" | "YEARLY"
}

export function NewTransactionModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [newCatOpen, setNewCatOpen] = React.useState(false)
  const { mutateAsync: createTransaction, isPending } = useCreateTransaction()
  const { data: accountsBalance } = useAccountsBalance()
  const { data: categories } = useCategories()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: "",
      amount: "",
      type: "EXPENSE",
      category: "",
      account: "",
      destinationAccount: "",
      date: new Date().toLocaleDateString("en-CA"),
      isRecurring: false,
      recurringCount: "",
      recurringInterval: "MONTHLY",
    },
  })

  const transactionType = form.watch("type")
  const isRecurring = form.watch("isRecurring")
  const recurringCount = form.watch("recurringCount")
  const recurringInterval = form.watch("recurringInterval")
  const amount = form.watch("amount")
  const date = form.watch("date")

  const recurringPreview = React.useMemo(
    () =>
      isRecurring
        ? buildRecurringPreview(
            amount,
            parseInt(recurringCount ?? ""),
            recurringInterval,
            date
          )
        : "",
    [isRecurring, amount, recurringCount, recurringInterval, date]
  )

  async function onSubmit(values: FormValues) {
    try {
      await createTransaction({
        description: values.title,
        amount: Number(values.amount.replace(",", ".")),
        type: values.type,
        categoryId: values.type !== "TRANSFER" ? values.category : undefined,
        accountId: values.account,
        destinationAccountId:
          values.type === "TRANSFER" ? values.destinationAccount : undefined,
        occurredAt: new Date(values.date).toISOString(),
        isRecurring: values.isRecurring,
        recurringCount: values.isRecurring
          ? parseInt(values.recurringCount ?? "1")
          : undefined,
        recurringInterval: values.isRecurring ? values.recurringInterval : undefined,
      })
      setOpen(false)
      form.reset()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 rounded-full shadow-sm">
            <Plus className="w-4 h-4" />
            Lançamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Novo Lançamento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O que foi?</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Mercado, Salário, Faculdade"
                      {...field}
                      className="h-11 bg-muted/30 border-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount + Type */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        {...field}
                        className="h-11 bg-muted/30 border-none font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 bg-muted/30 border-none">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EXPENSE">Despesa</SelectItem>
                        <SelectItem value="INCOME">Receita</SelectItem>
                        <SelectItem value="TRANSFER">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Account */}
            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {transactionType === "TRANSFER" ? "De qual conta?" : "Qual conta?"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 bg-muted/30 border-none">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-muted-foreground" />
                          <SelectValue placeholder="Selecione a conta" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountsBalance?.accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Destination account (TRANSFER) */}
            {transactionType === "TRANSFER" && (
              <FormField
                control={form.control}
                name="destinationAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Para qual conta?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 bg-muted/30 border-none">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Selecione a conta de destino" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountsBalance?.accounts
                          .filter((acc) => acc.id !== form.watch("account"))
                          .map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Category + Date */}
            <div className="grid grid-cols-2 gap-4">
              {transactionType !== "TRANSFER" ? (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 bg-muted/30 border-none">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-muted-foreground" />
                              <SelectValue placeholder="Categoria" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!categories?.length && (
                            <div className="text-xs text-muted-foreground p-2 text-center">
                              Nenhuma categoria
                            </div>
                          )}
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: cat.color }}
                                />
                                {cat.name}
                              </div>
                            </SelectItem>
                          ))}
                          <div className="p-1 mt-1 border-t border-border/50">
                            <NewCategoryModal open={newCatOpen} onOpenChange={setNewCatOpen}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-xs h-8 gap-2 bg-primary/5 text-primary hover:bg-primary/10"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setNewCatOpen(true)
                                }}
                              >
                                <Plus className="w-3 h-3" /> Criar Categoria
                              </Button>
                            </NewCategoryModal>
                          </div>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div />
              )}

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="date"
                          {...field}
                          className="h-11 bg-muted/30 border-none pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── RECURRING TOGGLE ─────────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem>
                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                      field.value
                        ? "bg-primary/8 border-primary/30"
                        : "bg-muted/30 border-transparent"
                    }`}
                    onClick={() => field.onChange(!field.value)}
                  >
                    <RefreshCw
                      className={`w-4 h-4 transition-colors ${
                        field.value ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lançamento recorrente</p>
                      {!field.value && (
                        <p className="text-xs text-muted-foreground">
                          Ex: mensalidade, salário, parcelamento
                        </p>
                      )}
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            {/* ── RECURRING CONFIG (animated) ──────────────────────────────── */}
            {isRecurring && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="recurringCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantas vezes?</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min={2}
                              max={360}
                              placeholder="Ex: 12"
                              {...field}
                              className="h-11 bg-muted/30 border-none font-bold pr-14"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              {recurringInterval ? INTERVAL_LABELS[recurringInterval] : "vezes"}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recurringInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 bg-muted/30 border-none">
                              <SelectValue placeholder="Intervalo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MONTHLY">Mensal</SelectItem>
                            <SelectItem value="WEEKLY">Semanal</SelectItem>
                            <SelectItem value="YEARLY">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Preview */}
                {recurringPreview && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 animate-in fade-in duration-200">
                    <RefreshCw className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-primary leading-relaxed">{recurringPreview}</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isRecurring
                  ? `Criar ${recurringCount || "N"} lançamentos`
                  : "Salvar Lançamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
