import { useState } from "react"
import { Link } from "react-router"
import { ChevronRight, MapPin, Package } from "lucide-react"

import { ProductImage } from "@/components/catalog/product-image"
import { Page } from "@/components/layout/page"
import { CancelOrderButton } from "@/components/orders/cancel-order-button"
import { deliveryLine, OrderStatusBadge } from "@/components/orders/order-status"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrders } from "@/hooks/use-orders"
import { formatDate, formatPrice, pluralize } from "@/lib/format"
import { cn } from "@/lib/utils"

const TABS = [
  { key: "all", label: "All", match: () => true },
  { key: "active", label: "In progress", match: (o) => !["delivered", "cancelled"].includes(o.status) },
  { key: "delivered", label: "Delivered", match: (o) => o.status === "delivered" },
  { key: "cancelled", label: "Cancelled", match: (o) => o.status === "cancelled" },
]
const MAX_THUMBS = 4

function OrderCard({ order }) {
  const first = order.items[0]
  const extraThumbs = order.items.length - MAX_THUMBS
  const inProgress = !["delivered", "cancelled"].includes(order.status)

  return (
    <article className="rounded-2xl border bg-card">
      {/* 1. status + headline (primary), order meta (secondary), total (prominent, right) */}
      <header className="flex flex-wrap items-start justify-between gap-4 p-5 pb-4">
        <div className="min-w-0 space-y-1.5">
          <OrderStatusBadge status={order.status} />
          <h2 className="text-base font-semibold tracking-tight">{deliveryLine(order)}</h2>
          <p className="text-xs text-muted-foreground">
            Order #{order.number} · Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold tracking-tight tabular-nums">{formatPrice(order.totals.total)}</p>
          <p className="text-xs text-muted-foreground">{pluralize(order.totals.count, "item")}</p>
        </div>
      </header>

      {/* 2. items: first name + count, then a thumbnail row */}
      <div className="px-5 pb-4">
        <p className="line-clamp-1 text-sm font-medium">
          {first.name}
          {order.items.length > 1 && <span className="font-normal text-muted-foreground"> + {pluralize(order.items.length - 1, "more item")}</span>}
        </p>
        <ul className="mt-3 flex gap-2" aria-label="Items in this order">
          {order.items.slice(0, MAX_THUMBS).map((item) => (
            <li
              key={`${item.productId}-${item.color?.name}-${item.size}`}
              title={item.name}
              className="relative size-14 overflow-hidden rounded-lg ring-1 ring-black/5 dark:ring-white/10"
            >
              <ProductImage product={item} color={item.color} />
              {item.quantity > 1 && (
                <span className="absolute right-1 bottom-1 rounded bg-black/70 px-1 text-[10px] leading-4 font-bold text-white">
                  ×{item.quantity}
                </span>
              )}
            </li>
          ))}
          {extraThumbs > 0 && (
            <li className="grid size-14 place-items-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">+{extraThumbs}</li>
          )}
        </ul>
      </div>

      {/* 3. ship-to (tertiary) + actions */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">
            Ship to <span className="font-medium text-foreground">{order.address.fullName}</span>, {order.address.city}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <CancelOrderButton order={order} variant="ghost" className="text-muted-foreground hover:text-destructive" />
          <Button asChild size="sm" variant={inProgress ? "default" : "outline"}>
            <Link to={`/orders/${order.id}`}>
              {inProgress ? "Track order" : "View details"}
              <ChevronRight />
            </Link>
          </Button>
        </div>
      </footer>
    </article>
  )
}

/** /orders — protected by <RequireAuth>. */
export function OrdersPage() {
  const { data: orders, isPending } = useOrders()
  const [tab, setTab] = useState("all")
  const visible = (orders ?? []).filter(TABS.find((t) => t.key === tab).match)

  return (
    <Page
      title={
        <>
          Your orders
          {orders?.length > 0 && <span className="ml-2 font-normal text-muted-foreground tabular-nums">{orders.length}</span>}
        </>
      }
      headerClassName="mb-4"
      className="max-w-5xl"
    >
      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-grid flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-muted">
            <Package className="size-5 text-muted-foreground" />
          </span>
          <h2 className="mt-4 text-base font-semibold">No orders yet</h2>
          <p className="mt-1 max-w-sm text-muted-foreground">When you place an order it will show up here with live status and tracking.</p>
          <Button asChild className="mt-5">
            <Link to="/products">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Filter orders" className="no-scrollbar mb-5 flex gap-1 overflow-x-auto border-b">
            {TABS.map((t) => {
              const count = orders.filter(t.match).length
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "-mb-px shrink-0 border-b-2 px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors",
                    tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label} <span className="ml-0.5 text-xs text-muted-foreground tabular-nums">{count}</span>
                </button>
              )
            })}
          </div>
          {visible.length === 0 ? (
            <p className="rounded-2xl border border-dashed px-6 py-12 text-center text-muted-foreground">No orders here.</p>
          ) : (
            <div className="space-y-4">
              {visible.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          )}
        </>
      )}
    </Page>
  )
}
