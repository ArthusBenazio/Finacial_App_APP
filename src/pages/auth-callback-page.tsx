import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signInWithToken } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setError('Google authentication failed. Missing token.')
      return
    }

    signInWithToken(token)
    navigate('/dashboard', { replace: true })
  }, [navigate, searchParams, signInWithToken])

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-[#f8faf9] to-[#edf5f4]">
      {error ? (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-[#0b6e6f] border-r-transparent animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Finishing Google sign-in...</p>
        </div>
      )}
    </div>
  )
}
