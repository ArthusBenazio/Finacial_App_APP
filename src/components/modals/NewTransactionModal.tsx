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
import { Plus, Wallet, Tag, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { useCreateTransaction } from "@/hooks/use-transactions"
import { useAccountsBalance } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import { NewCategoryModal } from "./NewCategoryModal"

const formSchema = z.object({
  title: z.string().min(2, "Título é obrigatório"),
  amount: z.string().min(1, "Valor é obrigatório"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  account: z.string().min(1, "Conta é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
})

export function NewTransactionModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [newCatOpen, setNewCatOpen] = React.useState(false) // State to control NewCategoryModal independently
  const { mutateAsync: createTransaction, isPending } = useCreateTransaction()
  const { data: accountsBalance } = useAccountsBalance()
  const { data: categories } = useCategories()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      type: "EXPENSE",
      category: "",
      account: "",
      date: new Date().toISOString().split('T')[0],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createTransaction({
        description: values.title,
        amount: Number(values.amount.replace(',', '.')),
        type: values.type,
        categoryId: values.category,
        accountId: values.account,
        occurredAt: new Date(values.date).toISOString()
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
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Novo Lançamento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>O que foi?</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mercado, Salário, Aluguel" {...field} className="h-11 bg-muted/30 border-none" />
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
                      <Input type="number" step="0.01" placeholder="0,00" {...field} className="h-11 bg-muted/30 border-none font-bold" />
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
                  <FormLabel>Qual conta?</FormLabel>
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
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="date" {...field} className="h-11 bg-muted/30 border-none pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isPending} className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Lançamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
