import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { acceptInvite, getInvite } from '../api/invites-api'
import { useAuth } from '../context/auth-context'
import { Invite } from '../types/domain'

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
      <div className="center-screen">
        <p>Loading invite...</p>
      </div>
    )
  }

  return (
    <div className="auth-layout">
      <section className="auth-card">
        <p className="eyebrow">Invite center</p>
        <h1>Shared account invitation</h1>

        {error ? <p className="form-error">{error}</p> : null}

        {invite ? (
          <div className="stack">
            <p>
              <strong>Email:</strong> {invite.email}
            </p>
            <p>
              <strong>Status:</strong> {invite.status}
            </p>
            <p>
              <strong>Expires:</strong>{' '}
              {new Date(invite.expiresAt).toLocaleString('pt-BR')}
            </p>
          </div>
        ) : null}

        {statusMessage ? <p className="success-text">{statusMessage}</p> : null}

        {user ? (
          <button
            type="button"
            className="primary-btn"
            onClick={() => void handleAcceptInvite()}
            disabled={isAccepting || !invite || invite.status !== 'PENDING'}
          >
            {isAccepting ? 'Accepting...' : 'Accept invite'}
          </button>
        ) : (
          <p className="muted">
            Please <Link to={`/login?redirect=${encodeURIComponent(`/invite/${token ?? ''}`)}`}>sign in</Link> to
            accept this invite.
          </p>
        )}
      </section>
    </div>
  )
}
