import { discountPercent } from "@/api/products"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

export function PriceTag({ product, size = "sm", className }) {
  const off = discountPercent(product)

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-semibold tracking-tight", size === "lg" ? "text-3xl" : "text-base")}>
        {formatPrice(product.price)}
      </span>
      {off > 0 && (
        <>
          <span className={cn("text-muted-foreground line-through", size === "lg" ? "text-base" : "text-xs")}>
            {formatPrice(product.compareAtPrice)}
          </span>
          <span className={cn("font-semibold text-success", size === "lg" ? "text-base" : "text-xs")}>{off}% off</span>
        </>
      )}
    </div>
  )
}
