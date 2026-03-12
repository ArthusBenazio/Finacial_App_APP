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
import { Loader2, Plus, PieChart, Tag } from "lucide-react"
import { useCreateBudget } from "@/hooks/use-budgets"
import { useCategories } from "@/hooks/use-categories"
import { NumericFormat } from "react-number-format"
import { NewCategoryModal } from "./NewCategoryModal"

const formSchema = z.object({
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  limit: z.string().min(1, "O limite é obrigatório"),
  month: z.string().min(1, "O mês é obrigatório"),
})

export function NewBudgetModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [newCatOpen, setNewCatOpen] = React.useState(false)
  const { mutateAsync: createBudget, isPending } = useCreateBudget()
  const { data: categories } = useCategories()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      limit: "",
      month: new Date().toISOString().slice(0, 7), // "YYYY-MM"
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const parsedLimit = Number(values.limit.replace(/\./g, '').replace(',', '.'))

      await createBudget({
        categoryId: values.categoryId,
        limit: parsedLimit,
        month: values.month,
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
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Novo Orçamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Novo Orçamento
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 bg-muted/30 border-none">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
              name="limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite Mensal</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                      <NumericFormat
                        className="flex h-11 w-full rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 bg-muted/30 border-none font-medium text-lg text-primary"
                        placeholder="0,00"
                        decimalSeparator=","
                        thousandSeparator="."
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={false}
                        value={field.value}
                        onValueChange={(values: { formattedValue: string }) => {
                          field.onChange(values.formattedValue)
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mês</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} className="h-11 bg-muted/30 border-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isPending} className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Orçamento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
