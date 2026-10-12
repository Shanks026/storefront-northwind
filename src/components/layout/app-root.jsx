import { Outlet, ScrollRestoration } from "react-router"

import { useSessionSync } from "@/hooks/use-auth"
import { useScrollHoverPause } from "@/hooks/use-scroll-hover-pause"

/** Top-level route element shared by the store layout and the full-page auth screens. */
export function AppRoot() {
  useSessionSync()
  useScrollHoverPause()

  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}
