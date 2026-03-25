import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { AuthGuard } from './components/auth-guard'
import { useAuth } from './context/auth-context'
import { AuthCallbackPage } from './pages/auth-callback-page'
import { LoginPage } from './pages/login-page'
import { RegisterPage } from './pages/register-page'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Wallets from './pages/Wallets'
import Budgets from './pages/Budgets'
import Groups from './pages/Groups'
import Settings from './pages/Settings'
import NotFound from './pages/not-found'

import { InvitePage } from './pages/InvitePage'
import { SelectGroupPage } from './pages/SelectGroupPage'

function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth()

  if (token) {
    return <Navigate to="/select-group" replace />
  }

  return children
}

export function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/select-group" replace />}
      />

      <Route
        path="/select-group"
        element={
          <AuthGuard>
            <SelectGroupPage />
          </AuthGuard>
        }
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

      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />

      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/transactions"
        element={
          <AuthGuard>
            <DashboardLayout>
              <Transactions />
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/wallets"
        element={
          <AuthGuard>
            <DashboardLayout>
              <Wallets />
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/budgets"
        element={
          <AuthGuard>
            <DashboardLayout>
              <Budgets />
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/groups"
        element={
          <AuthGuard>
            <DashboardLayout>
              <Groups />
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route
        path="/settings"
        element={
          <AuthGuard>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route path="/invite/:token" element={<InvitePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
