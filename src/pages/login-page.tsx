import { FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
    <div className="auth-layout">
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to your workspace</h1>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="primary-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          First time here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </div>
  )
}
