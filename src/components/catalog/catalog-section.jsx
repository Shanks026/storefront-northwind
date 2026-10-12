import { Link } from "react-router"
import { RotateCcw, SearchX } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { useCatalogFilters } from "@/hooks/use-catalog-filters"
import { useProducts } from "@/hooks/use-products"
import { CATEGORIES, categoryHref } from "@/lib/categories"
import { cn } from "@/lib/utils"
import { CatalogToolbar } from "./catalog-toolbar"
import { FilterPanel } from "./filter-panel"
import { ProductGrid } from "./product-card"

function headingFor(filters) {
  const cat = CATEGORIES.find((c) => c.slug === filters.category)
  const sub = cat?.subcategories.find((s) => s.slug === filters.sub)
  if (filters.q) return { title: `Results for “${filters.q}”`, cat, sub }
  if (sub) return { title: sub.name, cat, sub }
  if (cat) return { title: cat.name, cat }
  if (filters.deals) return { title: "Deals of the day", subtitle: "Handpicked price drops, while stock lasts." }
  // "Explore all" from the home rails lands here with just a sort
  if (filters.sort === "bestselling") return { title: "Bestsellers this week", subtitle: "The most-loved picks across the marketplace." }
  if (filters.sort === "newest") return { title: "Just landed", subtitle: "New from the makers we love." }
  return { title: "Recommended for you", subtitle: "Popular picks from independent makers." }
}

function EmptyState({ onReset }) {
  return (
    <div className="bg-grid flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-muted">
        <SearchX className="size-5 text-muted-foreground" />
      </span>
      <h3 className="mt-4 text-base font-semibold">No products match</h3>
      <p className="mt-1 max-w-sm text-muted-foreground">Try a different search term, or remove a few filters to see more results.</p>
      <Button className="mt-5" onClick={onReset}>
        <RotateCcw /> Reset filters
      </Button>
    </div>
  )
}

export function CatalogSection({ className }) {
  const { filters, setFilters, clearFilters } = useCatalogFilters()
  const { data, isPending, isError, refetch, isPlaceholderData } = useProducts(filters)
  const { title, subtitle, cat, sub } = headingFor(filters)

  return (
    <section id="catalog" aria-labelledby="catalog-title" className={className}>
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {cat || filters.q ? (
              <BreadcrumbLink asChild>
                <Link to="/products">All products</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>All products</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {cat && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {sub ? (
                  <BreadcrumbLink asChild>
                    <Link to={categoryHref(cat.slug)}>{cat.name}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{cat.name}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </>
          )}
          {sub && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{sub.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-5">
        <h2 id="catalog-title" className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="grid gap-8 lg:grid-cols-[232px_minmax(0,1fr)]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-32">
            <FilterPanel filters={filters} setFilters={setFilters} facets={data?.facets} />
          </div>
        </aside>

        <div className="min-w-0">
          <CatalogToolbar
            filters={filters}
            setFilters={setFilters}
            clearFilters={clearFilters}
            facets={data?.facets}
            total={data?.total ?? 0}
            loading={isPending}
          />
          {isError ? (
            <Alert variant="destructive">
              <AlertTitle>Couldn&apos;t load products</AlertTitle>
              <AlertDescription className="flex items-center gap-3">
                Something went wrong talking to the store.
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          ) : !isPending && data.items.length === 0 ? (
            <EmptyState onReset={clearFilters} />
          ) : (
            <div className={cn("transition-opacity", isPlaceholderData && "pointer-events-none opacity-60")}>
              <ProductGrid products={data?.items ?? []} loading={isPending} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
