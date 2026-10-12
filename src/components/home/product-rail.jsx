import { Link } from "react-router"
import { ArrowRight } from "lucide-react"

import { ProductGrid } from "@/components/catalog/product-card"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/hooks/use-products"

const RAIL_SIZE = 5

/**
 * A fixed-size product row for the home page. `query` goes to the API;
 * "Explore all" opens the full results page with the same filters.
 */
export function ProductRail({ id, title, subtitle, query, exploreHref }) {
  const { data, isPending } = useProducts({ ...query, limit: RAIL_SIZE })

  return (
    <section aria-labelledby={id}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id={id} className="text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-[13px] text-muted-foreground">{subtitle}</p>}
        </div>
        <Button asChild variant="link" size="sm" className="group h-auto shrink-0 gap-1 px-0 hover:no-underline">
          <Link to={exploreHref}>
            Explore all <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>
      <ProductGrid
        products={data?.items ?? []}
        loading={isPending}
        skeletonCount={RAIL_SIZE}
        className="md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5"
      />
    </section>
  )
}
