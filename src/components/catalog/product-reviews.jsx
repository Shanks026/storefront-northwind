import { useMemo, useState } from "react"
import { BadgeCheck, Star, ThumbsUp, X } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useProductReviews } from "@/hooks/use-products"
import { formatDate, initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { RatingStars } from "./rating-stars"

const SORTS = {
  helpful: { label: "Most helpful", fn: (a, b) => b.helpful - a.helpful },
  newest: { label: "Newest", fn: (a, b) => Date.parse(b.date) - Date.parse(a.date) },
}

/** Display-only ratings: summary, clickable 5★→1★ bars (filter), sortable review cards. */
export function ProductReviews({ slug }) {
  const { data, isPending } = useProductReviews(slug)
  const [sort, setSort] = useState("helpful")
  const [stars, setStars] = useState(null)

  const reviews = useMemo(() => {
    if (!data) return []
    return data.reviews.filter((r) => !stars || r.rating === stars).sort(SORTS[sort].fn)
  }, [data, sort, stars])

  if (isPending) {
    return (
      <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Skeleton className="h-56 rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* summary */}
      <div className="self-start rounded-2xl border bg-card p-5 lg:sticky lg:top-[172px]">
        <div className="flex items-end gap-3">
          <p className="text-4xl font-semibold tracking-tight">{data.average.toFixed(1)}</p>
          <div className="pb-1">
            <RatingStars rating={data.average} size="lg" />
            <p className="mt-0.5 text-xs text-muted-foreground">
              {data.total.toLocaleString("en-IN")} ratings · {data.reviewCount.toLocaleString("en-IN")} reviews
            </p>
          </div>
        </div>
        <ul className="mt-5 space-y-1.5" aria-label="Rating distribution">
          {[5, 4, 3, 2, 1].map((level) => {
            const count = data.distribution[level]
            const pct = data.total ? Math.round((count / data.total) * 100) : 0
            const active = stars === level
            return (
              <li key={level}>
                <button
                  type="button"
                  onClick={() => setStars(active ? null : level)}
                  aria-pressed={active}
                  aria-label={`${level} star: ${pct}% (${count.toLocaleString("en-IN")} ratings). Show only ${level} star reviews`}
                  className={cn(
                    "grid w-full grid-cols-[2.25rem_1fr_2.75rem] items-center gap-2 rounded-md px-1 py-1 text-xs transition-colors hover:bg-accent",
                    active && "bg-accent",
                  )}
                >
                  <span className="flex items-center gap-0.5 font-medium">
                    {level}
                    <Star className="size-3 text-primary" fill="currentColor" strokeWidth={0} />
                  </span>
                  <span className="h-2 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="text-right text-muted-foreground tabular-nums">{pct}%</span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">Sample reviews for this demo store. Ratings are from verified and unverified buyers.</p>
      </div>

      {/* review list */}
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-[13px] text-muted-foreground">
              Showing {reviews.length} {stars ? `${stars}★ ` : ""}review{reviews.length === 1 ? "" : "s"}
            </p>
            {stars && (
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={() => setStars(null)}>
                <X className="size-3.5" /> Clear
              </Button>
            )}
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger size="sm" aria-label="Sort reviews" className="min-w-40">
              <span className="text-muted-foreground">Sort:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {Object.entries(SORTS).map(([key, s]) => (
                <SelectItem key={key} value={key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {reviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed px-6 py-10 text-center text-[13px] text-muted-foreground">
            No {stars}★ reviews in this sample.
          </p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border bg-card p-5">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-muted text-[11px] font-semibold">{initials(r.author)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.author}</p>
                    <p className="text-xs text-muted-foreground">Reviewed {formatDate(r.date)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <RatingStars rating={r.rating} />
                  <p className="text-sm font-semibold">{r.title}</p>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                  {r.variant && <span>{r.variant}</span>}
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                      <BadgeCheck className="size-3.5" /> Verified purchase
                    </span>
                  )}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/85">{r.body}</p>
                {r.helpful > 0 && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ThumbsUp className="size-3.5" /> {r.helpful} {r.helpful === 1 ? "person" : "people"} found this helpful
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
