import { Link } from "react-router"
import { Crown, Heart, ShoppingCart, Star, Truck, Zap } from "lucide-react"

import { discountPercent } from "@/api/products"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAddToCart } from "@/hooks/use-cart"
import { useIsWishlisted, useToggleWishlist } from "@/hooks/use-wishlist"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants"
import { deliveryDate, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { ProductImage } from "./product-image"

// Badges sit on photos, so they use a neutral dark chip (no backdrop blur: it is costly while scrolling); only the filled icon carries colour.
const RIBBONS = {
  Bestseller: { icon: Crown, iconClassName: "text-amber-300" },
  New: { icon: Zap, iconClassName: "text-emerald-300" },
}

export function ProductCard({ product, className }) {
  const saved = useIsWishlisted(product.id)
  const toggleWishlist = useToggleWishlist()
  const addToCart = useAddToCart()
  const off = discountPercent(product)
  const soldOut = product.stock === 0
  const lowStock = !soldOut && product.stock <= 10
  const needsOptions = product.sizes.length > 1
  const ribbon = product.badges.find((b) => RIBBONS[b])
  const Ribbon = ribbon && RIBBONS[ribbon]

  // only offered when there's no size to choose; uses the default colour
  function quickAdd() {
    addToCart.mutate({ productId: product.id, color: product.colors[0]?.name ?? null, size: product.sizes[0] ?? null })
  }

  function toggleSaved() {
    toggleWishlist(product)
  }

  return (
    // "stretched link": the title link covers the whole card; buttons sit above it (z-10)
    <article className={cn("group relative flex flex-col rounded-2xl has-[a:focus-visible]:ring-[3px] has-[a:focus-visible]:ring-ring/50", className)}>
      {/* image tile */}
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/5 transition-shadow duration-300 group-hover:shadow-md dark:ring-white/10">
        <ProductImage
          product={product}
          className={cn("transition-transform duration-500 group-hover:scale-[1.04]", soldOut && "opacity-60 grayscale-[70%]")}
        />

        {Ribbon && (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm ring-1 ring-white/15">
            <Ribbon.icon className={cn("size-3", Ribbon.iconClassName)} fill="currentColor" strokeWidth={1.5} aria-hidden />
            {ribbon}
          </span>
        )}

        <button
          type="button"
          onClick={toggleSaved}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          className="absolute top-2 right-2 z-10 grid size-8 place-items-center rounded-full bg-background/90 text-foreground/70 shadow-sm transition hover:scale-110 hover:text-deal"
        >
          <Heart className={cn("size-4", saved && "fill-deal text-deal")} />
        </button>

        {soldOut ? (
          <span className="absolute inset-x-2.5 bottom-2.5 rounded-lg bg-background/95 py-1.5 text-center text-xs font-semibold">
            Out of stock
          </span>
        ) : (
          // quick action: slides up on hover (pointer devices only)
          <span className="absolute inset-x-2.5 bottom-2.5 z-10 hidden translate-y-[130%] transition-transform duration-300 group-hover:translate-y-0 group-has-[a:focus-visible]:translate-y-0 [@media(hover:hover)]:block">
            {needsOptions ? (
              <Link
                to={`/products/${product.slug}`}
                tabIndex={-1}
                className="flex h-9 items-center justify-center rounded-lg bg-background text-xs font-semibold shadow-md hover:bg-background"
              >
                Choose options
              </Link>
            ) : (
              <button
                type="button"
                onClick={quickAdd}
                disabled={addToCart.isPending}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
              >
                <ShoppingCart className="size-3.5" /> Add to cart
              </button>
            )}
          </span>
        )}
      </div>

      {/* details */}
      <div className="flex flex-1 flex-col px-1 pt-3">
        <p className="truncate text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{product.brand}</p>

        <h3 title={product.name} className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 font-medium text-foreground/90 group-hover:text-foreground">
          <Link to={`/products/${product.slug}`} className="outline-none after:absolute after:inset-0 after:rounded-2xl">
            {product.name}
          </Link>
        </h3>

        <Badge
          variant="secondary"
          className="mt-2 gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold"
          aria-label={`Rated ${product.rating} out of 5 from ${product.reviewCount} reviews`}
        >
          {product.rating.toFixed(1)}
          <Star className="size-2.5 text-primary" fill="currentColor" strokeWidth={0} aria-hidden />
          <span className="h-2.5 w-px bg-foreground/20" aria-hidden />
          <span className="font-normal text-muted-foreground">{product.reviewCount.toLocaleString("en-IN")}</span>
        </Badge>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-base font-bold tracking-tight">{formatPrice(product.price)}</span>
          {off > 0 && (
            <>
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
              <span className="text-xs font-semibold text-success">{off}% off</span>
            </>
          )}
        </div>

        {lowStock ? (
          <p className="mt-1.5 text-[11px] font-semibold text-deal">Only {product.stock} left</p>
        ) : (
          !soldOut && (
            <p className="mt-1.5 flex items-start gap-1 text-[11px] leading-4 text-muted-foreground">
              <Truck className="mt-0.5 size-3 shrink-0" />
              {/* one inline run so narrow cards wrap it like a sentence */}
              <span>
                {product.price >= FREE_SHIPPING_THRESHOLD ? "Free delivery" : "Delivery"} by{" "}
                <span className="font-medium whitespace-nowrap text-foreground">{deliveryDate()}</span>
              </span>
            </p>
          )
        )}
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-2 px-1 pt-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  )
}

export function ProductGrid({ products, loading, skeletonCount = 8, className }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4", className)}>
      {loading
        ? Array.from({ length: skeletonCount }, (_, i) => (
            <li key={i}>
              <ProductCardSkeleton />
            </li>
          ))
        : products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} className="h-full" />
            </li>
          ))}
    </ul>
  )
}
