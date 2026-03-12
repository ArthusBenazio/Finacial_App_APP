import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { acceptInvite, getInvite } from '../api/invites-api'
import { useAuth } from '../context/auth-context'
import { Invite } from '../types/domain'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const { user } = useAuth()

  const [invite, setInvite] = useState<Invite | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadInvite() {
      if (!token) {
        setError('Invalid invite token.')
        setIsLoading(false)
        return
      }

      try {
        const data = await getInvite(token)
        setInvite(data)
      } catch {
        setError('Invite not found or expired.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadInvite()
  }, [token])

  async function handleAcceptInvite() {
    if (!token) {
      return
    }

    setIsAccepting(true)
    setError(null)

    try {
      const accepted = await acceptInvite(token)
      setInvite(accepted)
      setStatusMessage('Invite accepted successfully.')
    } catch {
      setError('Unable to accept invite.')
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-[#f8faf9] to-[#edf5f4]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-r-transparent animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading invite details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 md:p-10 bg-gradient-to-br from-[#f8faf9] to-[#edf5f4]">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden text-center">
          <div className="h-2 w-full bg-gradient-to-r from-[#2cc3a2] via-[#0b6e6f] to-[#084e4f]" />
          
          <CardHeader className="pt-8 pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#2cc3a2]/20 to-[#0b6e6f]/20 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0b6e6f]">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line>
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-[#084e4f]">Invited to Collaborate</CardTitle>
            <CardDescription className="text-base">You've been invited to join a shared financial account.</CardDescription>
          </CardHeader>
          
          <CardContent className="pb-8 px-6 sm:px-10">
            {error ? (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-medium">
                {error}
              </div>
            ) : null}

            {invite ? (
              <div className="mb-8 p-5 bg-muted/30 rounded-xl space-y-3 text-left border border-muted-foreground/10 shadow-inner">
                <div className="flex justify-between items-center border-b border-muted py-1">
                  <span className="text-muted-foreground font-semibold text-sm">Recipient</span>
                  <span className="font-medium">{invite.email}</span>
                </div>
                <div className="flex justify-between items-center border-b border-muted py-1">
                  <span className="text-muted-foreground font-semibold text-sm">Status</span>
                  <span className="font-medium tracking-wide">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      invite.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-[#e8f7ed] text-[#037847] border border-[#037847]/20'
                    }`}>
                      {invite.status}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground font-semibold text-sm">Expires</span>
                  <span className="font-medium text-sm">{new Date(invite.expiresAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ) : null}

            {statusMessage ? (
              <div className="mb-6 p-4 rounded-xl bg-[#e8f7ed] border border-[#037847]/20 text-[#037847] font-medium animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span className="font-bold">Success!</span>
                </div>
                {statusMessage}
              </div>
            ) : null}

            {statusMessage ? (
              <Button asChild className="w-full h-12 bg-[#0b6e6f] hover:bg-[#084e4f] text-white shadow-md font-semibold text-base transition-all">
                 <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : user ? (
              <Button
                type="button"
                className="w-full h-12 bg-[#0b6e6f] hover:bg-[#084e4f] text-white shadow-md font-bold text-base transition-all active:scale-[0.98]"
                onClick={() => void handleAcceptInvite()}
                disabled={isAccepting || !invite || invite.status !== 'PENDING'}
              >
                {isAccepting ? 'Processing...' : 'Accept Invitation'}
              </Button>
            ) : (
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                <p className="text-sm font-medium text-slate-600">
                  Authentication is required to accept this secure invitation.
                </p>
                <Button asChild variant="outline" className="w-full border-[#0b6e6f] text-[#0b6e6f] hover:bg-[#0b6e6f] hover:text-white font-semibold transition-colors">
                  <Link to={`/login?redirect=${encodeURIComponent(`/invite/${token ?? ''}`)}`}>
                    Sign in to continue
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
