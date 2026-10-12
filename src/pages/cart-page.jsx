import { Link } from "react-router"
import { RotateCcw, ShieldCheck } from "lucide-react"

import { CartEmpty } from "@/components/cart/cart-empty"
import { CartLineItem } from "@/components/cart/cart-line-item"
import { CartSummary } from "@/components/cart/cart-summary"
import { CheckoutButton } from "@/components/cart/checkout-button"
import { FreeShippingProgress } from "@/components/cart/free-shipping-progress"
import { Page } from "@/components/layout/page"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/hooks/use-cart"
import { pluralize } from "@/lib/format"

export function CartPage() {
  const { data: cart, isPending } = useCart()

  if (isPending) {
    return (
      <Page title="Shopping cart">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </Page>
    )
  }

  if (cart.lines.length === 0) {
    return (
      <Page title="Shopping cart">
        <CartEmpty className="rounded-2xl border border-dashed" />
      </Page>
    )
  }

  return (
    <Page
      title="Shopping cart"
      description={pluralize(cart.count, "item")}
      actions={
        <Link to="/products" className="text-[13px] font-medium text-primary hover:underline">
          Continue shopping
        </Link>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <FreeShippingProgress subtotal={cart.subtotal} remaining={cart.freeShippingRemaining} className="rounded-xl border bg-subtle p-4" />
          <ul className="mt-2 divide-y">
            {cart.lines.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </ul>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 text-[13px] font-semibold tracking-wider text-muted-foreground uppercase">Price details</h2>
            <CartSummary cart={cart} />
            <CheckoutButton size="lg" className="mt-5 h-11 w-full" />
          </div>
          <ul className="mt-4 space-y-2 px-1 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Safe and secure payments
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="size-4 text-primary" /> 30-day free returns
            </li>
          </ul>
        </aside>
      </div>
    </Page>
  )
}
