import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="center-screen">
      <div className="not-found">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="muted">This route does not exist yet.</p>
        <Link className="primary-btn" to="/dashboard">
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
