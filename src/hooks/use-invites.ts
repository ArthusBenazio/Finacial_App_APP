import { useMutation } from '@tanstack/react-query'
import { http } from '../lib/http'
import { toast } from 'sonner'

export function useCreateInvite() {
  return useMutation({
    mutationFn: async ({ email, groupId }: { email: string; groupId: string }) => {
      const response = await http.post<{ invite: { token: string } }>('/invites', {
        email,
        groupId,
      })
      return response.data.invite
    },
    onSuccess: (data) => {
      const inviteUrl = `${window.location.origin}/invite/${data.token}`
      navigator.clipboard.writeText(inviteUrl)
      toast.success('Convite criado e link copiado para a área de transferência!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar convite.')
    },
  })
}
