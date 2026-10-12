import { SlidersHorizontal, X } from "lucide-react"

import { PRICE_RANGES, SORT_OPTIONS } from "@/api/products"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CATEGORIES } from "@/lib/categories"
import { pluralize } from "@/lib/format"
import { FilterPanel } from "./filter-panel"

/** Human labels for each active filter, used for the removable chips. */
function activeChips(filters) {
  const chips = []
  const cat = CATEGORIES.find((c) => c.slug === filters.category)
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”` })
  if (cat) chips.push({ key: "category", label: cat.name, clear: { category: null, sub: null } })
  if (cat && filters.sub) {
    const sub = cat.subcategories.find((s) => s.slug === filters.sub)
    if (sub) chips.push({ key: "sub", label: sub.name })
  }
  if (filters.price) chips.push({ key: "price", label: PRICE_RANGES.find((r) => r.value === filters.price)?.label ?? filters.price })
  if (filters.rating) chips.push({ key: "rating", label: `${filters.rating}★ & up` })
  if (filters.inStock) chips.push({ key: "inStock", label: "In stock" })
  if (filters.deals) chips.push({ key: "deals", label: "On sale" })
  return chips
}

export function CatalogToolbar({ filters, setFilters, clearFilters, facets, total, loading }) {
  const chips = activeChips(filters)

  return (
    <div className="mb-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          {loading ? "Loading products…" : pluralize(total, "product")}
        </p>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal />
                Filters
                {chips.length > 0 && (
                  <span className="grid size-4.5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {chips.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm gap-0">
              <SheetHeader className="border-b">
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>{pluralize(total, "product")} match</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-4">
                <FilterPanel filters={filters} setFilters={setFilters} facets={facets} />
              </div>
              <SheetFooter className="border-t">
                <Button variant="outline" onClick={clearFilters} disabled={chips.length === 0}>
                  Clear all
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <Select value={filters.sort ?? "featured"} onValueChange={(v) => setFilters({ sort: v === "featured" ? null : v })}>
            <SelectTrigger size="sm" aria-label="Sort products" className="min-w-44">
              <span className="text-muted-foreground">Sort:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilters(chip.clear ?? { [chip.key]: null })}
              className="inline-flex items-center gap-1 rounded-full border bg-card py-1 pr-1.5 pl-2.5 text-xs font-medium transition-colors hover:border-foreground/20 hover:bg-accent"
              aria-label={`Remove filter ${chip.label}`}
            >
              {chip.label}
              <X className="size-3.5 opacity-60" />
            </button>
          ))}
          <Button variant="link" size="sm" className="h-auto px-1.5 text-xs" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
