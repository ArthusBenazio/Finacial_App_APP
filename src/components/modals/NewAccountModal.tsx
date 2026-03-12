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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Wallet } from "lucide-react"
import { useCreateAccount } from "@/hooks/use-accounts"
import { NumericFormat } from "react-number-format"

const formSchema = z.object({
  name: z.string().min(2, "O nome da conta é obrigatório"),
  balance: z.string().optional(),
})

export function NewAccountModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const { mutateAsync: createAccount, isPending } = useCreateAccount()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      balance: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const parsedBalance = values.balance 
        ? Number(values.balance.replace(/\./g, '').replace(',', '.'))
        : 0;

      await createAccount({
        name: values.name,
        balance: parsedBalance,
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
          <Button className="rounded-full gap-2 text-sm">
            <Plus className="w-4 h-4" /> Adicionar Conta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Nova Conta
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Conta / Instituição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nubank, Itaú, Carteira..." {...field} className="h-11 bg-muted/30 border-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Inicial (Opcional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                      <NumericFormat
                        className="flex h-11 w-full rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 bg-muted/30 border-none font-medium"
                        placeholder="0,00"
                        decimalSeparator=","
                        thousandSeparator="."
                        decimalScale={2}
                        fixedDecimalScale
                        allowNegative={true}
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

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isPending} className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Conta
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
