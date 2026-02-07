import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <h1 className="gradient-text mb-2 text-7xl font-bold">404</h1>
      <h2 className="mb-2 text-xl font-semibold text-slate-300">
        Page not found
      </h2>
      <p className="mb-8 max-w-sm text-sm text-slate-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary" icon={Home}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  )
}
