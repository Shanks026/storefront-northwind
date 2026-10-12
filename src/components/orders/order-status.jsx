import { Check, CircleCheck, CircleX, House, Package, PackageCheck, Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

// Badge colours: Tailwind 100 background / 700 text (dark: tinted 500/15 background / 300 text).
export const STATUS_META = {
  confirmed: { label: "Confirmed", icon: CircleCheck, tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  packed: { label: "Packed", icon: Package, tone: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  shipped: { label: "Shipped", icon: Truck, tone: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  out_for_delivery: { label: "Out for delivery", icon: Truck, tone: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" },
  delivered: { label: "Delivered", icon: PackageCheck, tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  cancelled: { label: "Cancelled", icon: CircleX, tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
}

const TIMELINE_ICONS = { confirmed: CircleCheck, packed: Package, shipped: Truck, out_for_delivery: House, delivered: PackageCheck, cancelled: CircleX }

export function OrderStatusBadge({ status, className }) {
  const meta = STATUS_META[status] ?? STATUS_META.confirmed
  return (
    <Badge className={cn("gap-1 border-transparent font-semibold", meta.tone, className)}>
      <meta.icon />
      {meta.label}
    </Badge>
  )
}

/** One-line delivery status: "Arriving by …", "Delivered on …" or "Cancelled on …". */
export function deliveryLine(order) {
  if (order.status === "cancelled") return `Cancelled on ${formatDate(order.cancelledAt)}`
  if (order.status === "delivered") return `Delivered on ${formatDate(order.deliveredAt, { weekday: "short", day: "numeric", month: "short" })}`
  return `Arriving by ${formatDate(order.estimatedDelivery, { weekday: "short", day: "numeric", month: "short" })}`
}

const time = (iso) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(iso))

/**
 * Horizontal tracker for the order detail page (vertical on small screens).
 * Done steps are green with a filled connector; the current step gets a soft ring.
 */
export function OrderTracker({ order }) {
  const steps = order.timeline
  const lastDone = steps.reduce((i, step, idx) => (step.done ? idx : i), -1)

  return (
    <ol className="flex flex-col gap-5 sm:flex-row sm:gap-0" aria-label="Order progress">
      {steps.map((step, i) => {
        const Icon = TIMELINE_ICONS[step.key] ?? Check
        const current = i === lastDone
        const cancelled = step.key === "cancelled"
        const isLast = i === steps.length - 1
        const connectorDone = i < lastDone
        return (
          <li key={step.key} className="relative flex gap-3 sm:flex-1 sm:flex-col sm:items-center sm:gap-2 sm:text-center" aria-current={current ? "step" : undefined}>
            {!isLast && (
              <>
                {/* vertical connector (mobile) */}
                <span className={cn("absolute top-9 -bottom-5 left-[17px] w-0.5 rounded-full sm:hidden", connectorDone ? "bg-emerald-500" : "bg-border")} aria-hidden />
                {/* horizontal connector (sm+) */}
                <span
                  className={cn("absolute top-[17px] left-[calc(50%+22px)] hidden h-0.5 w-[calc(100%-44px)] rounded-full sm:block", connectorDone ? "bg-emerald-500" : "bg-border")}
                  aria-hidden
                />
              </>
            )}
            <span
              className={cn(
                "relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2",
                cancelled
                  ? "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300"
                  : step.done
                    ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
                    : "border-border bg-background text-muted-foreground",
                current && !cancelled && "ring-4 ring-emerald-500/20",
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="pt-1.5 sm:pt-0">
              <p className={cn("text-[13px] font-semibold", !step.done && "font-medium text-muted-foreground")}>{step.label}</p>
              <p className="text-xs text-muted-foreground">
                {step.at ? time(step.at) : step.key === "delivered" ? `By ${formatDate(order.estimatedDelivery, { day: "numeric", month: "short" })}` : "Pending"}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
