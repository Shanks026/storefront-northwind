import { formatPrice, pluralize } from "@/lib/format"
import { cn } from "@/lib/utils"

function Row({ label, value, className }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}

/** Price breakdown shared by the cart sheet and the cart page (checkout reuses it in Phase 5). */
export function CartSummary({ cart, className }) {
  return (
    <dl className={cn("space-y-2 text-[13px]", className)}>
      <Row label={`Price (${pluralize(cart.count, "item")})`} value={formatPrice(cart.subtotal + cart.savings)} />
      {cart.savings > 0 && <Row label="Discount" value={`− ${formatPrice(cart.savings)}`} className="text-success" />}
      <Row
        label="Delivery"
        value={cart.shipping === 0 ? <span className="font-medium text-success">Free</span> : formatPrice(cart.shipping)}
      />
      <Row label="Total" value={formatPrice(cart.total)} className="border-t pt-3 text-base font-semibold" />
      {cart.savings > 0 && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success">
          You&apos;re saving {formatPrice(cart.savings)} on this order
        </p>
      )}
    </dl>
  )
}
