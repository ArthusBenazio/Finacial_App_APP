import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authenticate, getProfile, signOut as signOutApi } from '../api/auth-api'
import { User } from '../types/domain'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithToken: () => void
  signOut: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void refreshProfile()
  }, [])

  async function refreshProfile() {
    setIsLoading(true)

    try {
      const profile = await getProfile()
      setUser(profile)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    setIsLoading(true)

    try {
      await authenticate({ email, password })

      localStorage.removeItem('financial:selectedGroupId')

      const profile = await getProfile()
      setUser(profile)
    } finally {
      setIsLoading(false)
    }
  }

  function signInWithToken() {
    // Com cookies, o token já está no navegador após o redirect do Google.
    // Basta limpar o groupId e carregar o perfil.
    localStorage.removeItem('financial:selectedGroupId')
    void refreshProfile()
  }

  async function signOut() {
    try {
      await signOutApi()
    } finally {
      localStorage.removeItem('financial:selectedGroupId')
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signInWithToken,
      signOut,
      refreshProfile,
    }),
    [user, isLoading],
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
