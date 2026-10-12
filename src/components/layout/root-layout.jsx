import { Outlet } from "react-router"

import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

/** Store chrome: header + footer around every shopping page. */
export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
