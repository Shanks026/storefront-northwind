import { Navigate, Outlet, useLocation, useSearchParams } from "react-router"
import { Loader2 } from "lucide-react"

import { useSession } from "@/hooks/use-auth"

/** Only same-site paths are allowed as redirect targets (no "//evil.com" or absolute URLs). */
export function safeRedirect(target, fallback = "/") {
  return typeof target === "string" && target.startsWith("/") && !target.startsWith("//") ? target : fallback
}

function FullPageSpinner() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Loading">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}

/** Wrap routes that need a signed-in user; guests go to /login?redirect=<current path>. */
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) return <FullPageSpinner />
  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  return <Outlet />
}

/** Wrap /login and /register; signed-in users are sent on to where they were going. */
export function GuestOnly() {
  const { isAuthenticated, isLoading } = useSession()
  const [params] = useSearchParams()

  if (isLoading) return <FullPageSpinner />
  if (isAuthenticated) return <Navigate to={safeRedirect(params.get("redirect"))} replace />
  return <Outlet />
}
