import { useState } from "react"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createBrowserRouter, RouterProvider } from "react-router"

import { createQueryClient } from "@/lib/query-client"
import { AppProviders } from "@/providers/app-providers"
import { routes } from "@/routes"

const router = createBrowserRouter(routes)

export default function App() {
  const [queryClient] = useState(createQueryClient)

  return (
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </AppProviders>
  )
}
