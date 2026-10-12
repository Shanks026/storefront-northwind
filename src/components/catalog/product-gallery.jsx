import { useState } from "react"

import { cn } from "@/lib/utils"
import { ProductImage } from "./product-image"

const VIEW_LABELS = ["Front", "Angle", "Detail", "Lifestyle"]

/**
 * Products with a photo show it on its own (one photo per product for now).
 * Products without one fall back to four generated "views" with a thumbnail strip.
 */
export function ProductGallery({ product, color }) {
  const [view, setView] = useState(0)

  if (product.image) {
    return (
      <div className="overflow-hidden rounded-2xl border">
        <ProductImage product={product} color={color} eager />
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      <div className="flex gap-2 md:flex-col" role="tablist" aria-label="Product images">
        {VIEW_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={view === i}
            aria-label={`${label} view`}
            onClick={() => setView(i)}
            onMouseEnter={() => setView(i)}
            className={cn(
              "w-16 overflow-hidden rounded-lg border-2 transition-colors sm:w-18",
              view === i ? "border-primary" : "border-transparent opacity-80 hover:opacity-100",
            )}
          >
            <ProductImage product={product} color={color} view={i} />
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden rounded-2xl border">
        <ProductImage product={product} color={color} view={view} />
      </div>
    </div>
  )
}
