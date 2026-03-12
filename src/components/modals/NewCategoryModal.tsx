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
import { Plus, Loader2 } from "lucide-react"
import { useCreateCategory } from "@/hooks/use-categories"

const formSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  color: z.string().min(4, "Cor é obrigatória"),
  icon: z.string().min(1, "Ícone é obrigatório"),
})

export function NewCategoryModal({ 
  children,
  open: externalOpen,
  onOpenChange: setExternalOpen 
}: { 
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = externalOpen !== undefined
  const open = isControlled ? externalOpen : internalOpen
  const setOpen = isControlled ? setExternalOpen! : setInternalOpen

  const { mutateAsync: createCategory, isPending } = useCreateCategory()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#0b6e6f",
      icon: "Tag",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createCategory({
        name: values.name,
        color: values.color,
        icon: values.icon,
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
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Nova Categoria
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nova Categoria</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mercado, Lazer, etc." {...field} className="h-11 bg-muted/30 border-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <div className="flex gap-3 items-center">
                      <Input type="color" {...field} className="h-11 w-20 p-1 bg-muted/30 border-none cursor-pointer" />
                      <span className="text-sm font-medium text-muted-foreground">{field.value}</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isPending} className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Categoria
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
