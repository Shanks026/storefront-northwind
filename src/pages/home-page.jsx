import { CategoryGrid } from "@/components/home/category-grid"
import { HeroCarousel } from "@/components/home/hero-carousel"
import { ProductRail } from "@/components/home/product-rail"
import { SidePromos } from "@/components/home/side-promos"
import { TrustStrip } from "@/components/home/trust-strip"

const RAILS = [
  {
    id: "trending",
    title: "Bestsellers this week",
    subtitle: "The most-loved picks across the marketplace",
    query: { sort: "bestselling" },
    exploreHref: "/products?sort=bestselling",
  },
  {
    id: "deals",
    title: "Deals of the day",
    subtitle: "Handpicked price drops, while stock lasts",
    query: { deals: "true", sort: "discount" },
    exploreHref: "/products?deals=true&sort=discount",
  },
  {
    id: "new",
    title: "Just landed",
    subtitle: "New from the makers we love",
    query: { sort: "newest" },
    exploreHref: "/products?sort=newest",
  },
]

export function HomePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 pt-6 sm:px-6">
      {/* minmax(0,1fr) stops the carousel track from stretching the grid past the viewport */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <HeroCarousel />
        <SidePromos />
      </div>
      {RAILS.map((rail) => (
        <ProductRail key={rail.id} {...rail} />
      ))}
      <CategoryGrid />
      <TrustStrip />
    </div>
  )
}
