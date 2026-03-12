import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-[#f8faf9] to-[#edf5f4]">
      <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
        <p className="text-[#0b6e6f] text-sm font-bold uppercase tracking-widest font-mono">404 Error</p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#084e4f]">Page not found</h1>
        <p className="text-muted-foreground text-lg max-w-sm mx-auto">The route you are looking for does not exist or has been moved.</p>
        
        <div className="pt-4">
          <Button asChild className="h-11 px-8 bg-[#0b6e6f] hover:bg-[#084e4f] text-white shadow-md font-semibold text-base transition-all rounded-full">
            <Link to="/dashboard">Return to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
