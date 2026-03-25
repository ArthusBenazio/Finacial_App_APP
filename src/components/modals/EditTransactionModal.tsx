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
import { Wallet, Tag, Calendar as CalendarIcon, Loader2, CalendarPlus } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useUpdateTransaction, Transaction } from "@/hooks/use-transactions"
import { useAccountsBalance } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import { NewCategoryModal } from "./NewCategoryModal"

const formSchema = z.object({
  description: z.string().min(2, "Descrição é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  category: z.string().optional(),
  account: z.string().min(1, "Conta é obrigatória"),
  destinationAccount: z.string().optional(),
  date: z.string().min(1, "Data é obrigatória"),
  isPrediction: z.boolean().default(false),
}).refine((data) => {
  if (data.type !== 'TRANSFER' && !data.category) return false;
  return true;
}, {
  message: "Categoria é obrigatória",
  path: ["category"]
}).refine((data) => {
  if (data.type === 'TRANSFER' && !data.destinationAccount) return false;
  return true;
}, {
  message: "Conta de destino é obrigatória",
  path: ["destinationAccount"]
})

interface EditTransactionModalProps {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTransactionModal({ transaction, open, onOpenChange }: EditTransactionModalProps) {
  const [newCatOpen, setNewCatOpen] = React.useState(false)
  const { mutateAsync: updateTransaction, isPending } = useUpdateTransaction()
  const { data: accountsBalance } = useAccountsBalance()
  const { data: categories } = useCategories()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      type: transaction.type,
      category: transaction.categoryId || "",
      account: transaction.accountId,
      destinationAccount: transaction.destinationAccountId || "",
      date: new Date(transaction.date).toISOString().split('T')[0],
      isPrediction: transaction.isPrediction,
    },
  })

  // Update form defaults when transaction changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        description: transaction.description,
        amount: Math.abs(transaction.amount).toString(),
        type: transaction.type,
        category: transaction.categoryId || "",
        account: transaction.accountId,
        destinationAccount: transaction.destinationAccountId || "",
        date: new Date(transaction.date).toISOString().split('T')[0],
        isPrediction: transaction.isPrediction,
      })
    }
  }, [transaction, open, form])

  const transactionType = form.watch("type")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateTransaction({
        id: transaction.id,
        description: values.description,
        amount: Number(values.amount.replace(',', '.')),
        type: values.type,
        categoryId: values.type !== 'TRANSFER' ? values.category : undefined,
        accountId: values.account,
        destinationAccountId: values.type === 'TRANSFER' ? values.destinationAccount : undefined,
        date: new Date(values.date).toISOString(),
        isPrediction: values.isPrediction,
      })
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-5">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Editar Lançamento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 pt-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O que foi?</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mercado, Salário, Aluguel" {...field} className="h-10 bg-muted/30 border-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0,00" {...field} className="h-10 bg-muted/30 border-none font-bold" />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 bg-muted/30 border-none">
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

            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{transactionType === 'TRANSFER' ? 'Conta de Origem' : 'Conta'}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 bg-muted/30 border-none">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-muted-foreground" />
                          <SelectValue placeholder="Selecione a conta" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountsBalance?.accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {transactionType === 'TRANSFER' ? (
                <FormField
                  control={form.control}
                  name="destinationAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Para</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 bg-muted/30 border-none">
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-muted-foreground" />
                              <SelectValue placeholder="Destino" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accountsBalance?.accounts
                            .filter(acc => acc.id !== form.watch("account"))
                            .map(acc => (
                              <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 bg-muted/30 border-none">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-muted-foreground" />
                              <SelectValue placeholder="Selecione" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!categories?.length && (
                            <div className="text-xs text-muted-foreground p-2 text-center">Nenhuma categoria</div>
                          )}
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
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
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setNewCatOpen(true);
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
                        <Input type="date" {...field} className="h-10 bg-muted/30 border-none pl-11" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* ── PREDICTION TOGGLE ─────────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="isPrediction"
              render={({ field }) => (
                <FormItem>
                  <div
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                        field.value
                        ? "bg-indigo-500/10 border-indigo-500/30"
                        : "bg-muted/30 border-transparent"
                    }`}
                    onClick={() => field.onChange(!field.value)}
                  >
                    <CalendarPlus
                      className={`w-4 h-4 transition-colors ${
                        field.value ? "text-indigo-600" : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lançar como Previsão</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {field.value 
                          ? "Não afeta o saldo real até você confirmar no dia." 
                          : "Lançamento confirmado que afeta seu saldo real."}
                      </p>
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

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isPending} className="w-full h-11 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Atualizar Lançamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function Plus(props: React.SVGProps<SVGSVGElement>) {
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
