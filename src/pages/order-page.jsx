import { Link, useParams, useSearchParams } from "react-router"
import { ArrowLeft, Banknote, CheckCircle2, CircleX, CreditCard, MapPin, Phone, Smartphone } from "lucide-react"

import { formatAddress } from "@/api/addresses"
import { ProductImage } from "@/components/catalog/product-image"
import { Page } from "@/components/layout/page"
import { CancelOrderButton } from "@/components/orders/cancel-order-button"
import { deliveryLine, OrderStatusBadge, OrderTracker } from "@/components/orders/order-status"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrder } from "@/hooks/use-orders"
import { formatDate, formatPrice, pluralize } from "@/lib/format"
import { cn } from "@/lib/utils"
import { NotFoundPage } from "./not-found-page"

const PAYMENT_ICONS = { card: CreditCard, upi: Smartphone, cod: Banknote }

function Row({ label, value, className }) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}

function SummarySection({ title, children }) {
  return (
    <section className="space-y-2 p-5">
      <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  )
}

function OrderPageSkeleton() {
  return (
    <Page className="max-w-5xl">
      <Skeleton className="mb-6 h-10 w-72" />
      <Skeleton className="mb-6 h-40 rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </Page>
  )
}

/** /orders/:id — order detail; `?placed=1` adds a slim post-checkout confirmation strip. */
export function OrderPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { data: order, isPending, error } = useOrder(id)
  const justPlaced = params.get("placed") === "1"

  if (error?.status === 404) return <NotFoundPage title="Order not found" message="We couldn't find this order on your account." />
  if (isPending || !order) return <OrderPageSkeleton />

  const t = order.totals
  const cancelled = order.status === "cancelled"
  const PaymentIcon = PAYMENT_ICONS[order.payment.method] ?? CreditCard
  const totalLabel = cancelled ? "Order total" : order.payment.method === "cod" ? "Amount to pay" : "Total paid"

  return (
    <Page className="max-w-5xl">
      {justPlaced && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <CheckCircle2 className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Thank you, your order is confirmed!</p>
              <p className="text-[13px] text-muted-foreground">We&apos;ve emailed the details to {order.email}.</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/orders">View all orders</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/products">Continue shopping</Link>
            </Button>
          </div>
        </div>
      )}

      {/* header */}
      <div className="mb-6">
        <Link to="/orders" className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> All orders
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex flex-wrap items-center gap-2.5 text-2xl font-semibold tracking-tight">
              Order #{order.number}
              <OrderStatusBadge status={order.status} />
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Placed {formatDate(order.createdAt)} · {pluralize(t.count, "item")} · {formatPrice(t.total)}
            </p>
          </div>
          <CancelOrderButton order={order} />
        </div>
      </div>

      {/* tracking */}
      <section aria-labelledby="tracking-title" className="mb-6 rounded-2xl border bg-card p-5 sm:p-6">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="tracking-title" className={cn("text-lg font-semibold tracking-tight", order.status === "delivered" && "text-success")}>
            {deliveryLine(order)}
          </h2>
          {!cancelled && <p className="text-[13px] text-muted-foreground">{order.shipping.label}</p>}
        </div>
        {cancelled && (
          <p className="mb-6 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-[13px]">
            <CircleX className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>
              {order.payment.method === "cod"
                ? "Nothing was charged for this order."
                : `A refund of ${formatPrice(t.total)} to ${order.payment.label} is on its way (3–5 business days).`}
            </span>
          </p>
        )}
        <OrderTracker order={order} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* items */}
        <section aria-labelledby="items-title" className="self-start rounded-2xl border bg-card">
          <h2 id="items-title" className="border-b px-5 py-4 font-semibold">
            Items <span className="font-normal text-muted-foreground">({t.count})</span>
          </h2>
          <ul className="divide-y">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.color?.name}-${item.size}`} className="flex gap-4 px-5 py-4">
                <Link to={`/products/${item.slug}`} className="size-18 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10">
                  <ProductImage product={item} color={item.color} />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{item.brand}</p>
                  <Link to={`/products/${item.slug}`} className="line-clamp-2 text-sm font-medium hover:text-primary">
                    {item.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{[item.color?.name, item.size, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                  {item.quantity > 1 && <p className="text-xs text-muted-foreground tabular-nums">{formatPrice(item.price)} each</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* one summary card: address, payment, price */}
        <aside aria-label="Order summary" className="divide-y self-start rounded-2xl border bg-card lg:sticky lg:top-32">
          <SummarySection title={`Delivery address · ${order.address.label}`}>
            <p className="text-sm font-medium">{order.address.fullName}</p>
            <p className="flex gap-1.5 text-[13px] text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0" />
              {formatAddress(order.address)}
            </p>
            <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              {order.address.phone}
            </p>
          </SummarySection>

          <SummarySection title="Payment method">
            <p className="flex items-center gap-2 text-sm font-medium">
              <span className="grid size-7 place-items-center rounded-md bg-muted">
                <PaymentIcon className="size-4 text-muted-foreground" />
              </span>
              {order.payment.label}
            </p>
          </SummarySection>

          <SummarySection title="Price details">
            <dl className="space-y-2 text-[13px]">
              <Row label={`Price (${pluralize(t.count, "item")})`} value={formatPrice(t.mrp)} />
              {t.savings > 0 && <Row label="Discount" value={`− ${formatPrice(t.savings)}`} className="text-success" />}
              <Row label="Delivery" value={t.shipping === 0 ? <span className="text-success">Free</span> : formatPrice(t.shipping)} />
              <Row label={totalLabel} value={formatPrice(t.total)} className="border-t pt-3 text-base font-semibold" />
              <p className="text-xs text-muted-foreground">Includes {formatPrice(t.gstIncluded)} GST</p>
            </dl>
          </SummarySection>
        </aside>
      </div>
    </Page>
  )
}
