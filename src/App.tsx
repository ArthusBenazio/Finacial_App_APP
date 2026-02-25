import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/app-shell'
import { AuthGuard } from './components/auth-guard'
import { useAuth } from './context/auth-context'
import { AccountTransactionsPage } from './pages/account-transactions-page'
import { DashboardPage } from './pages/dashboard-page'
import { InvitePage } from './pages/invite-page'
import { InvitesPage } from './pages/invites-page'
import { LoginPage } from './pages/login-page'
import { NotFoundPage } from './pages/not-found-page'
import { RegisterPage } from './pages/register-page'

function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth()

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </AuthGuard>
        }
      />

      <Route
        path="/accounts/:accountId"
        element={
          <AuthGuard>
            <AppShell>
              <AccountTransactionsPage />
            </AppShell>
          </AuthGuard>
        }
      />

      <Route
        path="/invites"
        element={
          <AuthGuard>
            <AppShell>
              <InvitesPage />
            </AppShell>
          </AuthGuard>
        }
      />

      <Route path="/invite/:token" element={<InvitePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
