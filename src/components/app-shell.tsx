import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  function handleLogout() {
    signOut()
    navigate('/login')
  }

  const isDashboard = location.pathname === '/dashboard'
  const isInvites = location.pathname === '/invites'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          <strong>Financial App</strong>
        </div>

        <nav className="topbar-nav">
          <Link className={isDashboard ? 'active' : ''} to="/dashboard">
            Dashboard
          </Link>
          <Link className={isInvites ? 'active' : ''} to="/invites">
            Invites
          </Link>
        </nav>

        <div className="user-box">
          <span>{user?.name ?? 'User'}</span>
          <button type="button" className="ghost-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  )
}
