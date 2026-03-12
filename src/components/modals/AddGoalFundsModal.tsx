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
import { Button } from "@/components/ui/button"
import { Loader2, Plus, ArrowUpCircle } from "lucide-react"
import { Goal, useAddGoalFunds } from "@/hooks/use-goals"
import { NumericFormat } from "react-number-format"

const formSchema = z.object({
  amount: z.string().min(1, "O valor do depósito é obrigatório"),
})

interface AddGoalFundsModalProps {
  goal: Goal
  children?: React.ReactNode
}

export function AddGoalFundsModal({ goal, children }: AddGoalFundsModalProps) {
  const [open, setOpen] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState("")
  const { mutateAsync: addFunds, isPending } = useAddGoalFunds()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setErrorMsg("")
    try {
      const parsedAmount = Number(values.amount.replace(/\./g, '').replace(',', '.'))

      if (parsedAmount <= 0) {
        setErrorMsg("O valor deve ser maior que zero.")
        return
      }

      await addFunds({
        goalId: goal.id,
        amount: parsedAmount,
      })
      
      setOpen(false)
      form.reset()
    } catch (error: any) {
      console.error(error)
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message)
      } else {
        setErrorMsg("Erro ao adicionar fundos.")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) {
         setErrorMsg("")
         form.reset()
      }
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Depositar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-primary" />
            Adicionar Fundos em {goal.title}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor a Depositar</FormLabel>
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

            {errorMsg && (
               <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm font-medium border border-red-200">
                  {errorMsg === "Insufficient funds in the linked account." 
                    ? "Saldo insuficiente na carteira associada para realizar o depósito." 
                    : errorMsg}
               </div>
            )}

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isPending} className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Depósito
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
