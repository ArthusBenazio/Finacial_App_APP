import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authenticate, getProfile } from '../api/auth-api'
import { User } from '../types/domain'

interface AuthContextValue {
  token: string | null
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithToken: (authToken: string) => void
  signOut: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'financial:token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    void refreshProfile()
  }, [token])

  async function refreshProfile() {
    if (!token) {
      setUser(null)
      return
    }

    setIsLoading(true)

    try {
      const profile = await getProfile()
      setUser(profile)
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    setIsLoading(true)

    try {
      const { token: authToken } = await authenticate({ email, password })

      localStorage.setItem(TOKEN_KEY, authToken)
      setToken(authToken)

      const profile = await getProfile()
      setUser(profile)
    } finally {
      setIsLoading(false)
    }
  }

  function signInWithToken(authToken: string) {
    localStorage.setItem(TOKEN_KEY, authToken)
    setToken(authToken)
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      signIn,
      signInWithToken,
      signOut,
      refreshProfile,
    }),
    [token, user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
