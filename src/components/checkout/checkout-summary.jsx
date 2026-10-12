import { Loader2, Lock, ShieldCheck } from "lucide-react"

import { ProductImage } from "@/components/catalog/product-image"
import { Button } from "@/components/ui/button"
import { deliveryDate, formatPrice, pluralize } from "@/lib/format"
import { DELIVERY } from "@/lib/pricing"
import { cn } from "@/lib/utils"

function Row({ label, value, className }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}

/** Sticky order summary on the checkout page: items, price breakdown, place-order button. */
export function CheckoutSummary({ lines, totals, paymentMethod, placing, buyNow, onPlaceOrder }) {
  const cta = paymentMethod === "cod" ? "Place order" : `Pay ${formatPrice(totals.total)}`

  return (
    <div className="rounded-2xl border bg-card">
      <div className="border-b p-5">
        <h2 className="text-[13px] font-semibold tracking-wider text-muted-foreground uppercase">
          Order summary <span className="font-normal normal-case">· {pluralize(totals.count, "item")}</span>
        </h2>
        {buyNow && <p className="mt-1 text-xs text-muted-foreground">Buying this item only. Your cart stays as it is.</p>}
        <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
          {lines.map((l) => (
            <li key={l.id ?? l.productId} className="flex gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/5 dark:ring-white/10">
                <ProductImage product={l} color={l.color} />
                <span className="absolute top-0.5 right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
                  {l.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13px] leading-snug font-medium">{l.name}</p>
                <p className="text-xs text-muted-foreground">{[l.color?.name, l.size].filter(Boolean).join(" · ")}</p>
              </div>
              <p className="shrink-0 text-[13px] font-semibold tabular-nums">{formatPrice(l.price * l.quantity)}</p>
            </li>
          ))}
        </ul>
      </div>

      <dl className="space-y-2 p-5 text-[13px]">
        <Row label="Price (MRP)" value={formatPrice(totals.mrp)} />
        {totals.savings > 0 && <Row label="Discount" value={`− ${formatPrice(totals.savings)}`} className="text-success" />}
        <Row label="Delivery" value={totals.shipping === 0 ? <span className="font-medium text-success">Free</span> : formatPrice(totals.shipping)} />
        <p className="-mt-1 text-xs text-muted-foreground">
          {DELIVERY.label} · arrives by {deliveryDate(DELIVERY.days)}
        </p>
        <Row label="Total" value={formatPrice(totals.total)} className="border-t pt-3 text-base font-semibold" />
        <p className="text-xs text-muted-foreground">Includes {formatPrice(totals.gstIncluded)} GST</p>
      </dl>

      <div className="space-y-3 border-t p-5">
        <Button size="lg" className="h-11 w-full" disabled={placing} onClick={onPlaceOrder}>
          {placing ? <Loader2 className="animate-spin" /> : <Lock />}
          {placing ? "Placing your order…" : cta}
        </Button>
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-px size-4 shrink-0 text-primary" />
          Demo checkout: no real payment is taken and card details are never stored.
        </p>
      </div>
    </div>
  )
}
