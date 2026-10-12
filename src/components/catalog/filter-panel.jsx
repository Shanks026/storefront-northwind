import { Star } from "lucide-react"

import { PRICE_RANGES } from "@/api/products"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CATEGORIES } from "@/lib/categories"
import { cn } from "@/lib/utils"

function Section({ title, children }) {
  return (
    <section className="border-b py-5 first:pt-0 last:border-b-0">
      <h3 className="mb-3 text-[13px] font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function CategoryRow({ active, onClick, children, count, indent }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-accent",
        indent && "pl-5",
        active ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground",
      )}
    >
      <span className="truncate">{children}</span>
      {count !== undefined && <span className="ml-2 text-xs tabular-nums opacity-70">{count}</span>}
    </button>
  )
}

/** Sidebar / sheet filter controls. `facets` come from the list query. */
export function FilterPanel({ filters, setFilters, facets }) {
  const counts = Object.fromEntries((facets?.categories ?? []).map((c) => [c.slug, c.count]))
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const activeCategory = CATEGORIES.find((c) => c.slug === filters.category)

  return (
    <div>
      <Section title="Category">
        <div className="space-y-0.5">
          <CategoryRow active={!filters.category} onClick={() => setFilters({ category: null })} count={total}>
            All categories
          </CategoryRow>
          {CATEGORIES.map((c) => (
            <div key={c.slug}>
              <CategoryRow
                active={filters.category === c.slug && !filters.sub}
                onClick={() => setFilters({ category: c.slug, sub: null })}
                count={counts[c.slug] ?? 0}
              >
                {c.name}
              </CategoryRow>
              {activeCategory?.slug === c.slug &&
                c.subcategories.map((s) => (
                  <CategoryRow key={s.slug} indent active={filters.sub === s.slug} onClick={() => setFilters({ sub: s.slug })}>
                    {s.name}
                  </CategoryRow>
                ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Price">
        <RadioGroup value={filters.price ?? "any"} onValueChange={(v) => setFilters({ price: v === "any" ? null : v })} className="gap-2.5">
          {[{ value: "any", label: "Any price" }, ...PRICE_RANGES].map((r) => (
            <div key={r.value} className="flex items-center gap-2.5">
              <RadioGroupItem value={r.value} id={`price-${r.value}`} />
              <Label htmlFor={`price-${r.value}`} className="font-normal">
                {r.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Section>

      <Section title="Customer rating">
        <RadioGroup value={filters.rating ?? "any"} onValueChange={(v) => setFilters({ rating: v === "any" ? null : v })} className="gap-2.5">
          {["any", "4.5", "4"].map((v) => (
            <div key={v} className="flex items-center gap-2.5">
              <RadioGroupItem value={v} id={`rating-${v}`} />
              <Label htmlFor={`rating-${v}`} className="gap-1 font-normal">
                {v === "any" ? (
                  "Any rating"
                ) : (
                  <>
                    {v} <Star className="size-3.5 text-rating" fill="currentColor" strokeWidth={0} /> &amp; up
                  </>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Section>

      <Section title="Availability & offers">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Checkbox id="f-instock" checked={filters.inStock === "true"} onCheckedChange={(v) => setFilters({ inStock: v ? "true" : null })} />
            <Label htmlFor="f-instock" className="font-normal">
              In stock only
            </Label>
          </div>
          <div className="flex items-center gap-2.5">
            <Checkbox id="f-deals" checked={filters.deals === "true"} onCheckedChange={(v) => setFilters({ deals: v ? "true" : null })} />
            <Label htmlFor="f-deals" className="font-normal">
              On sale
            </Label>
          </div>
        </div>
      </Section>
    </div>
  )
}
