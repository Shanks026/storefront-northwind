import { createContext, useContext, useMemo, useState } from "react"

const CartSheetContext = createContext(null)

/** Open/close state for the slide-over cart, so any "Add to cart" can offer to open it. */
export function CartSheetProvider({ children }) {
  const [open, setOpen] = useState(false)
  const value = useMemo(() => ({ open, setOpen, openCart: () => setOpen(true), closeCart: () => setOpen(false) }), [open])
  return <CartSheetContext value={value}>{children}</CartSheetContext>
}

export function useCartSheet() {
  const ctx = useContext(CartSheetContext)
  if (!ctx) throw new Error("useCartSheet must be used inside <CartSheetProvider>")
  return ctx
}
