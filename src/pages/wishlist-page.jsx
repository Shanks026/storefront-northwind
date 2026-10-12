import { Link } from "react-router"
import { Heart, Loader2, ShoppingCart, X } from "lucide-react"

import { PriceTag } from "@/components/catalog/price-tag"
import { ProductImage } from "@/components/catalog/product-image"
import { Page } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAddToCart } from "@/hooks/use-cart"
import { useToggleWishlist, useWishlist } from "@/hooks/use-wishlist"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

function WishlistItem({ product, addedAt }) {
  const addToCart = useAddToCart()
  const toggleWishlist = useToggleWishlist()
  const soldOut = product.stock === 0
  const needsSize = product.sizes.length > 1

  function moveToCart() {
    addToCart.mutate(
      { productId: product.id, color: product.colors[0]?.name ?? null, size: product.sizes[0] ?? null, quantity: 1 },
      { onSuccess: () => toggleWishlist(product, { silent: true }) },
    )
  }

  return (
    <article className="flex flex-col">
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
        <Link to={`/products/${product.slug}`}>
          <ProductImage product={product} className={cn(soldOut && "opacity-60 grayscale-[70%]")} />
        </Link>
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={`Remove ${product.name} from wishlist`}
          className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-background/90 text-foreground/70 shadow-sm transition hover:text-destructive"
        >
          <X className="size-4" />
        </button>
        {soldOut && (
          <span className="absolute inset-x-2.5 bottom-2.5 rounded-lg bg-background/95 py-1.5 text-center text-xs font-semibold">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <p className="truncate text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{product.brand}</p>
        <Link to={`/products/${product.slug}`} className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 font-medium hover:text-primary">
          {product.name}
        </Link>
        <PriceTag product={product} className="mt-1.5" />
        <p className="mt-1 text-[11px] text-muted-foreground">Saved {formatDate(addedAt, { day: "numeric", month: "short" })}</p>
        <div className="mt-auto pt-3">
          {soldOut ? (
            <Button variant="outline" size="sm" className="w-full" disabled>
              Currently unavailable
            </Button>
          ) : needsSize ? (
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to={`/products/${product.slug}`}>Choose size</Link>
            </Button>
          ) : (
            <Button size="sm" className="w-full" disabled={addToCart.isPending} onClick={moveToCart}>
              {addToCart.isPending ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
              Move to cart
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

/** /wishlist — protected by <RequireAuth>. */
export function WishlistPage() {
  const { data: items, isPending } = useWishlist()

  return (
    <Page
      title={
        <>
          Wishlist
          {items?.length > 0 && <span className="ml-2 font-normal text-muted-foreground tabular-nums">{items.length}</span>}
        </>
      }
      headerClassName="mb-6"
    >
      {isPending ? (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i}>
              <Skeleton className="aspect-square rounded-2xl" />
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-2 h-8 w-full" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="bg-grid flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-accent text-deal">
            <Heart className="size-5" />
          </span>
          <h2 className="mt-4 text-base font-semibold">Your wishlist is empty</h2>
          <p className="mt-1 max-w-sm text-muted-foreground">Tap the heart on any product to save it here for later.</p>
          <Button asChild className="mt-5">
            <Link to="/products">Explore products</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-5">
          {items.map(({ product, addedAt }) => (
            <li key={product.id}>
              <WishlistItem product={product} addedAt={addedAt} />
            </li>
          ))}
        </ul>
      )}
    </Page>
  )
}
