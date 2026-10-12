import { Link } from "react-router"
import { ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/hooks/use-cart"
import { formatPrice, pluralize } from "@/lib/format"
import { useCartSheet } from "@/providers/cart-sheet-provider"
import { CartEmpty } from "./cart-empty"
import { CartLineItem } from "./cart-line-item"
import { CheckoutButton } from "./checkout-button"
import { FreeShippingProgress } from "./free-shipping-progress"

/** Header cart button (icon + label + floating count) that opens the slide-over cart. */
export function CartSheet() {
  const { open, setOpen, closeCart } = useCartSheet()
  const { data: cart, isPending } = useCart()
  const count = cart?.count ?? 0

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={`Cart, ${count} items`}
        className="flex h-10 items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors hover:bg-accent"
      >
        <span className="relative">
          <ShoppingCart className="size-5" />
          <span className="absolute -top-2 -right-2.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] leading-none font-bold text-primary-foreground ring-2 ring-background">
            {count > 99 ? "99+" : count}
          </span>
        </span>
        <span className="hidden lg:inline">Cart</span>
      </SheetTrigger>

      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Your cart{count > 0 && <span className="font-normal text-muted-foreground"> ({pluralize(count, "item")})</span>}</SheetTitle>
          <SheetDescription className="sr-only">Review items in your cart</SheetDescription>
        </SheetHeader>

        {isPending ? (
          <div className="space-y-4 p-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-20 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-7 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : cart.lines.length === 0 ? (
          <CartEmpty onNavigate={closeCart} className="my-auto" />
        ) : (
          <>
            <FreeShippingProgress subtotal={cart.subtotal} remaining={cart.freeShippingRemaining} className="border-b bg-subtle px-4 py-3" />
            <ul className="flex-1 divide-y overflow-y-auto px-4">
              {cart.lines.map((line) => (
                <CartLineItem key={line.id} line={line} compact onNavigate={closeCart} />
              ))}
            </ul>
            <SheetFooter className="gap-3 border-t bg-background">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] text-muted-foreground">
                  Subtotal{cart.shipping > 0 && ` + ${formatPrice(cart.shipping)} delivery`}
                </span>
                <span className="text-lg font-semibold tabular-nums">{formatPrice(cart.total)}</span>
              </div>
              {cart.savings > 0 && <p className="-mt-2 text-xs font-medium text-success">You save {formatPrice(cart.savings)}</p>}
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline">
                  <Link to="/cart" onClick={closeCart}>
                    View cart
                  </Link>
                </Button>
                <CheckoutButton onNavigate={closeCart} />
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
