import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth-api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await registerUser({ name, email, password })
      navigate('/login')
    } catch {
      setError('Unable to create your account. This email may already be in use.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 md:p-10 bg-gradient-to-br from-[#f8faf9] to-[#edf5f4]">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-[#2cc3a2] via-[#0b6e6f] to-[#084e4f]" />
          
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-[#2cc3a2]/20 to-[#0b6e6f]/20 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#0b6e6f]">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-[#084e4f]">Create an account</CardTitle>
            <CardDescription className="text-base">Start your financial journey</CardDescription>
          </CardHeader>
          
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-foreground/80 font-semibold">Full Name</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="John Doe"
                  className="h-11 bg-muted/20 focus-visible:ring-[#0b6e6f] border-muted-foreground/20"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-foreground/80 font-semibold">Email address</Label>
                <Input
                  id="email"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  className="h-11 bg-muted/20 focus-visible:ring-[#0b6e6f] border-muted-foreground/20"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="text-foreground/80 font-semibold">Password</Label>
                <Input
                  id="password"
                  required
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className="h-11 bg-muted/20 focus-visible:ring-[#0b6e6f] border-muted-foreground/20"
                />
              </div>

              {error ? (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                  {error}
                </div>
              ) : null}

              <Button type="submit" className="w-full h-11 mt-2 bg-[#0b6e6f] hover:bg-[#084e4f] text-white shadow-md transition-all active:scale-[0.98] font-semibold text-base" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
              
              <div className="text-center text-sm font-medium mt-2">
                Already registered?{' '}
                <Link to="/login" className="text-[#0b6e6f] hover:text-[#084e4f] hover:underline transition-colors font-semibold">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
