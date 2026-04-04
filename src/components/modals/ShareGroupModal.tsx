import { useState } from 'react'
import { Share2, Loader2, Copy, Mail } from 'lucide-react'
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
import { useCreateInvite } from '@/hooks/use-invites'

interface ShareGroupModalProps {
  groupId: string
  groupName: string
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ShareGroupModal({ groupId, groupName, children, open, onOpenChange }: ShareGroupModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const { mutateAsync: createInvite, isPending } = useCreateInvite()

  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    try {
      await createInvite({ email, groupId })
      setEmail('')
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
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Compartilhar "{groupName}"
            </DialogTitle>
            <DialogDescription>
              Convide outras pessoas para visualizar e gerenciar as finanças deste perfil. 
              Um link de convite único será gerado e enviado para o email abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-semibold px-1">Email do Convidado</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  className="pl-9 h-11 bg-muted/20 border-muted-foreground/20 focus-visible:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
                type="button" 
                variant="ghost" 
                className="flex-1 text-muted-foreground"
                onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-[2] gap-2 h-11 font-bold shadow-lg shadow-primary/10" 
              disabled={isPending || !email}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando Convite...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Gerar e Copiar Link
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
