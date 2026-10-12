import { Truck } from "lucide-react"

import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export function FreeShippingProgress({ subtotal, remaining, className }) {
  const unlocked = remaining === 0
  // never show a full bar until it's actually unlocked (₹998 of ₹999 would round to 100%)
  const pct = unlocked ? 100 : Math.min(99, Math.floor((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  return (
    <div className={cn("space-y-2", className)}>
      <p className="flex items-center gap-2 text-[13px]">
        <Truck className={cn("size-4 shrink-0", unlocked ? "text-success" : "text-muted-foreground")} />
        {unlocked ? (
          <span>
            You&apos;ve unlocked <span className="font-semibold text-success">free delivery</span>
          </span>
        ) : (
          <span>
            Add <span className="font-semibold">{formatPrice(remaining)}</span> more for free delivery
          </span>
        )}
      </p>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Progress to free delivery"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className={cn("h-full rounded-full transition-all duration-500", unlocked ? "bg-success" : "bg-primary")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
