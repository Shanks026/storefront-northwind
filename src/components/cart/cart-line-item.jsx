import { Link } from "react-router"
import { Trash2 } from "lucide-react"

import { ProductImage } from "@/components/catalog/product-image"
import { QuantityStepper } from "@/components/catalog/quantity-stepper"
import { Button } from "@/components/ui/button"
import { useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

/** One cart row. `compact` = slide-over sheet; default = full cart page. */
export function CartLineItem({ line, compact = false, onNavigate }) {
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const variant = [line.color?.name, line.size].filter(Boolean).join(" · ")
  const lineTotal = line.price * line.quantity
  const lineMrp = (line.compareAtPrice ?? line.price) * line.quantity

  return (
    <li className={cn("flex gap-3", compact ? "py-4" : "gap-4 py-5")}>
      <Link
        to={`/products/${line.slug}`}
        onClick={onNavigate}
        className={cn("aspect-square shrink-0 self-start overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10", compact ? "w-20" : "w-24 sm:w-28")}
      >
        <ProductImage product={line} color={line.color} />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{line.brand}</p>
            <Link
              to={`/products/${line.slug}`}
              onClick={onNavigate}
              className={cn("line-clamp-2 font-medium hover:text-primary", compact ? "text-[13px]" : "text-sm")}
            >
              {line.name}
            </Link>
            {variant && <p className="mt-0.5 text-xs text-muted-foreground">{variant}</p>}
          </div>
          <div className="shrink-0 text-right">
            <p className="font-semibold tabular-nums">{formatPrice(lineTotal)}</p>
            {lineMrp > lineTotal && <p className="text-xs text-muted-foreground tabular-nums line-through">{formatPrice(lineMrp)}</p>}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-2">
            <QuantityStepper
              size="sm"
              value={line.quantity}
              max={line.maxQuantity}
              onChange={(quantity) => update.mutate({ id: line.id, quantity })}
            />
            {line.quantity >= line.maxQuantity && <span className="text-[11px] whitespace-nowrap text-muted-foreground">Max {line.maxQuantity}</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => remove.mutate(line.id)}
            aria-label={`Remove ${line.name}`}
          >
            <Trash2 className="size-3.5" />
            {!compact && "Remove"}
          </Button>
        </div>
      </div>
    </li>
  )
}
