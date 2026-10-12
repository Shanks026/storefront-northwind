import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

/** Five stars with fractional fill; `count` renders the review count next to them. */
export function RatingStars({ rating, count, size = "sm", className }) {
  const px = size === "lg" ? "size-4.5" : "size-3.5"

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex" role="img" aria-label={`Rated ${rating} out of 5`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, rating - i))
          return (
            <span key={i} className={cn("relative", px)}>
              <Star className={cn("absolute inset-0 text-muted-foreground/30", px)} fill="currentColor" strokeWidth={0} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className={cn("text-rating", px)} fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          )
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground">
          {rating.toFixed(1)} ({count.toLocaleString("en-IN")})
        </span>
      )}
    </div>
  )
}
