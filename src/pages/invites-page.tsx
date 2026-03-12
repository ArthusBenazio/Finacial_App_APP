import { FormEvent, useMemo, useState } from 'react'
import { createInvite } from '../api/invites-api'
import { InviteCreated } from '../types/domain'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export function InvitesPage() {
  const [email, setEmail] = useState('')
  const [invite, setInvite] = useState<InviteCreated | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  const webLink = useMemo(() => {
    if (!invite) {
      return ''
    }

    return `${window.location.origin}/invite/${invite.token}`
  }, [invite])

  const deepLink = useMemo(() => {
    if (!invite) {
      return ''
    }

    return `myapp://invite?token=${invite.token}`
  }, [invite])

  async function handleCreateInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setCopyStatus(null)
    setIsLoading(true)

    try {
      const createdInvite = await createInvite(email)
      setInvite(createdInvite)
    } catch {
      setError('Could not create invite.')
    } finally {
      setIsLoading(false)
    }
  }

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopyStatus('Copied to clipboard.')
    } catch {
      setCopyStatus('Copy failed. Please copy manually.')
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-[#0b6e6f] to-[#084e4f] text-white shadow-xl border-0 overflow-hidden relative">
        <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[200%] bg-white/5 rounded-full blur-3xl pointer-events-none transform rotate-12"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[100%] bg-[#2cc3a2]/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <CardContent className="p-8 sm:p-10 flex flex-col justify-center items-start relative z-10 gap-3">
          <p className="text-white/70 text-sm font-bold uppercase tracking-widest font-mono">Collaboration</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">Invite a family member</h1>
          <p className="text-white/80 max-w-xl text-lg mt-2">Generate special access links to share this workspace and collaborate together.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Invite */}
        <Card className="shadow-md border-muted/60 transition-all hover:shadow-lg flex flex-col h-min">
          <CardHeader className="bg-muted/10 border-b border-muted/20 pb-5">
            <CardTitle className="text-xl text-[#0b6e6f]">Create Invite</CardTitle>
            <CardDescription>Generate a new invite token for a specific email.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleCreateInvite}>
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">Collaborator Email</Label>
                <div className="flex gap-3">
                  <Input
                    id="email"
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="person@email.com"
                    className="flex-1 bg-white focus-visible:ring-[#0b6e6f]"
                  />
                  <Button type="submit" className="bg-[#0b6e6f] hover:bg-[#084e4f] text-white shadow-md transition-transform active:scale-[0.98]" disabled={isLoading}>
                    {isLoading ? 'Wait...' : 'Generate'}
                  </Button>
                </div>
              </div>
              
              {error ? (
                <div className="p-3 mt-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                  {error}
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {/* Invite Results */}
        {invite ? (
          <Card className="shadow-md border-[#0b6e6f]/30 bg-gradient-to-br from-[#f8faf9] to-[#edf5f4] flex flex-col animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-[#0b6e6f] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Invite Ready
              </CardTitle>
              <CardDescription className="text-[#084e4f]/70 font-medium">
                Expires at {new Date(invite.expiresAt).toLocaleString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="webLink" className="text-sm font-semibold text-[#084e4f]">Web fallback link</Label>
                <div className="flex gap-2">
                  <Input id="webLink" value={webLink} readOnly className="font-mono text-sm bg-white" />
                  <Button type="button" variant="outline" className="shrink-0 hover:text-[#0b6e6f] hover:border-[#0b6e6f]/50 bg-white" onClick={() => void copyToClipboard(webLink)}>
                    Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="deepLink" className="text-sm font-semibold text-[#084e4f]">Deep link (Mobile)</Label>
                <div className="flex gap-2">
                  <Input id="deepLink" value={deepLink} readOnly className="font-mono text-sm bg-white" />
                  <Button type="button" variant="outline" className="shrink-0 hover:text-[#0b6e6f] hover:border-[#0b6e6f]/50 bg-white" onClick={() => void copyToClipboard(deepLink)}>
                    Copy
                  </Button>
                </div>
              </div>

              {copyStatus ? (
                <div className="p-2.5 rounded-md bg-[#e8f7ed] border border-[#037847]/20 text-[#037847] text-sm font-medium text-center animate-in fade-in slide-in-from-bottom-2">
                  {copyStatus}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center p-10 text-center bg-muted/10 rounded-xl border border-dashed border-muted-foreground/20 h-full min-h-[250px]">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground/40">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <p className="text-muted-foreground font-medium">No invite generated yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-1 max-w-[250px]">Fill the form on the left to create a secure access link.</p>
          </div>
        )}
      </div>
    </div>
  )
}
