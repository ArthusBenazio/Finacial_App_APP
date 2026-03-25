import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateGroup } from '@/hooks/use-groups'

interface NewGroupModalProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewGroupModal({ children, open, onOpenChange }: NewGroupModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { mutateAsync: createGroup, isPending } = useCreateGroup()

  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name) return

    try {
      const group = await createGroup({ name, description })
      
      // Se for o primeiro grupo (ainda não houver um selecionado), seleciona automaticamente
      if (!localStorage.getItem('financial:selectedGroupId')) {
          localStorage.setItem('financial:selectedGroupId', group.id);
          window.location.href = '/dashboard';
      }

      setName('')
      setDescription('')
      setIsOpen(false)
    } catch {
      // toast is handled in hook
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Novo Perfil Financeiro</DialogTitle>
            <DialogDescription>
              Cada perfil tem suas próprias contas, categorias e transações. 
              Ideal para separar vida pessoal da empresarial.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Perfil</Label>
              <Input
                id="name"
                placeholder="Ex: Pessoal, Empresa, Investimentos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                placeholder="Uma breve descrição sobre este perfil."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !name}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Perfil'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
