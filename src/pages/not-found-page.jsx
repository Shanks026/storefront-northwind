import { Link } from "react-router"

import { Button } from "@/components/ui/button"

export function NotFoundPage({ title = "Page not found", message = "The page you're looking for doesn't exist or has moved." }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-xs text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/">Back to shop</Link>
      </Button>
    </div>
  )
}
