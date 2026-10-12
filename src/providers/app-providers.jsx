import { QueryClientProvider } from "@tanstack/react-query"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CartSheetProvider } from "./cart-sheet-provider"
import { ThemeProvider } from "./theme-provider"

export function AppProviders({ queryClient, children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider delayDuration={200}>
          <CartSheetProvider>
            {children}
            <Toaster position="bottom-right" />
          </CartSheetProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
