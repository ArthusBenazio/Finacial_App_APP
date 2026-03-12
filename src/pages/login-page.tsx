import { FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoginForm } from '../components/login-form'
import { useAuth } from '../context/auth-context'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signIn, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    try {
      await signIn(email, password)
      const redirectTo = searchParams.get('redirect')
      const nextRoute = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard'
      navigate(nextRoute)
    } catch {
      setError('Invalid credentials. Please check your email and password.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 md:p-10 bg-gradient-to-br from-[#f8faf9] to-[#edf5f4]">
      <div className="w-full max-w-sm">
        <LoginForm
          email={email}
          password={password}
          isLoading={isLoading}
          error={error}
          onLoginSubmit={handleSubmit}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />
      </div>
    </div>
  )
}
