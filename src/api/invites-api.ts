import { http } from '../lib/http'
import { Invite, InviteCreated } from '../types/domain'

interface InviteResponse {
  invite: Invite
}

interface InviteCreatedResponse {
  invite: InviteCreated
}

export async function createInvite(email: string) {
  const response = await http.post<InviteCreatedResponse>('/invites', { email })
  return response.data.invite
}

export async function getInvite(token: string) {
  const response = await http.get<InviteResponse>(`/invites/${token}`)
  return response.data.invite
}

export async function acceptInvite(token: string) {
  const response = await http.post<InviteResponse>(`/invites/${token}/accept`)
  return response.data.invite
}
