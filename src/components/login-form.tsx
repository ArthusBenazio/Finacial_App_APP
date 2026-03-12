import type { ComponentPropsWithoutRef, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginFormProps extends ComponentPropsWithoutRef<'div'> {
  email: string
  password: string
  isLoading: boolean
  error?: string | null
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
}

export function LoginForm({
  email,
  password,
  isLoading,
  error,
  onLoginSubmit,
  onEmailChange,
  onPasswordChange,
  className,
  ...props
}: LoginFormProps) {
  const googleAuthUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3333'}/auth/google`

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-[#2cc3a2] via-[#0b6e6f] to-[#084e4f]" />
        
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-[#2cc3a2]/20 to-[#0b6e6f]/20 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#0b6e6f]">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#084e4f]">Welcome back</CardTitle>
          <CardDescription className="text-base">Sign in to your financial dashboard</CardDescription>
        </CardHeader>
        
        <CardContent className="pb-8">
          <form onSubmit={onLoginSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full h-11 border-muted hover:bg-muted/50 transition-colors font-medium shadow-sm" asChild>
                  <a href={googleAuthUrl} className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Continue with Google
                  </a>
                </Button>
              </div>
              
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-muted-foreground/20">
                <span className="relative z-10 bg-white px-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                  Or sign in with email
                </span>
              </div>
              
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-foreground/80 font-semibold">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    required
                    className="h-11 bg-muted/20 focus-visible:ring-[#0b6e6f] border-muted-foreground/20"
                  />
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground/80 font-semibold">Password</Label>
                    <a href="#" className="text-xs text-[#0b6e6f] hover:underline font-medium">Forgot password?</a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    minLength={6}
                    value={password}
                    onChange={(event) => onPasswordChange(event.target.value)}
                    required
                    className="h-11 bg-muted/20 focus-visible:ring-[#0b6e6f] border-muted-foreground/20"
                  />
                </div>
                
                {error ? (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    {error}
                  </div>
                ) : null}
                
                <Button type="submit" className="w-full h-11 mt-2 bg-[#0b6e6f] hover:bg-[#084e4f] text-white shadow-md transition-all active:scale-[0.98] font-semibold text-base" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
              
              <div className="text-center text-sm font-medium mt-2">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-[#0b6e6f] hover:text-[#084e4f] hover:underline transition-colors font-semibold">
                  Create one now
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="text-balance text-center text-xs text-muted-foreground font-medium">
        Secure session using your Financial App credentials.
      </div>
    </div>
  )
}
