import { FormEvent, useMemo, useState } from 'react'
import { createInvite } from '../api/invites-api'
import { InviteCreated } from '../types/domain'

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
    <section className="content-grid">
      <article className="hero-panel">
        <div>
          <p className="eyebrow">Collaboration</p>
          <h1>Invite a family member</h1>
        </div>
      </article>

      <article className="card">
        <h2>Create invite</h2>

        <form className="inline-form" onSubmit={handleCreateInvite}>
          <label className="field">
            <span>Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="person@email.com"
            />
          </label>

          <button type="submit" className="primary-btn" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Generate invite'}
          </button>
        </form>

        {error ? <p className="form-error">{error}</p> : null}
      </article>

      {invite ? (
        <article className="card">
          <h2>Invite ready</h2>

          <p className="muted">Expires at {new Date(invite.expiresAt).toLocaleString('pt-BR')}</p>

          <label className="field">
            <span>Web fallback link</span>
            <input value={webLink} readOnly />
          </label>
          <button type="button" className="ghost-btn" onClick={() => void copyToClipboard(webLink)}>
            Copy web link
          </button>

          <label className="field">
            <span>Deep link</span>
            <input value={deepLink} readOnly />
          </label>
          <button type="button" className="ghost-btn" onClick={() => void copyToClipboard(deepLink)}>
            Copy deep link
          </button>

          {copyStatus ? <p className="success-text">{copyStatus}</p> : null}
        </article>
      ) : null}
    </section>
  )
}
