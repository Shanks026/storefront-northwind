import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { BadgeCheck, Check, Heart, Loader2, RotateCcw, ShieldCheck, ShoppingCart, Store, Truck, Zap } from "lucide-react"

import { discountPercent } from "@/api/products"
import { PriceTag } from "@/components/catalog/price-tag"
import { ProductGrid } from "@/components/catalog/product-card"
import { ProductQuestions } from "@/components/catalog/product-questions"
import { ProductReviews } from "@/components/catalog/product-reviews"
import { ProductGallery } from "@/components/catalog/product-gallery"
import { QuantityStepper } from "@/components/catalog/quantity-stepper"
import { RatingStars } from "@/components/catalog/rating-stars"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAddToCart } from "@/hooks/use-cart"
import { useIsWishlisted, useToggleWishlist } from "@/hooks/use-wishlist"
import { useProduct, useRelatedProducts } from "@/hooks/use-products"
import { CATEGORIES, categoryHref } from "@/lib/categories"
import { FREE_SHIPPING_THRESHOLD, MAX_QTY_PER_ITEM } from "@/lib/constants"
import { deliveryDate, formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { NotFoundPage } from "./not-found-page"


export function ProductPage() {
  const { slug } = useParams()
  const { data: product, isPending, error } = useProduct(slug)

  if (error?.status === 404) {
    return <NotFoundPage title="Product not found" message="This product may have been removed or the link is incorrect." />
  }
  if (isPending || !product) return <ProductPageSkeleton />

  // key resets colour/size/quantity when navigating between products
  return <ProductDetail key={product.id} product={product} />
}

function ProductDetail({ product }) {
  const [color, setColor] = useState(product.colors[0])
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [sizeError, setSizeError] = useState(false)
  const addToCartMutation = useAddToCart()
  const saved = useIsWishlisted(product.id)
  const toggleWishlist = useToggleWishlist()
  const navigate = useNavigate()

  const category = CATEGORIES.find((c) => c.slug === product.category)
  const sub = category?.subcategories.find((s) => s.slug === product.sub)
  const soldOut = product.stock === 0
  const maxQty = Math.max(1, Math.min(product.stock, MAX_QTY_PER_ITEM))
  const off = discountPercent(product)

  function selection() {
    if (product.sizes.length > 0 && !size) {
      setSizeError(true)
      return null
    }
    return { color: color.name, size, quantity }
  }

  function addToCart() {
    const s = selection()
    if (s) addToCartMutation.mutate({ productId: product.id, ...s })
  }
  // Straight to checkout with just this item; the cart is left untouched.
  function buyNow() {
    const s = selection()
    if (!s) return
    const params = new URLSearchParams({ mode: "buynow", product: product.slug, qty: String(s.quantity) })
    if (s.color) params.set("color", s.color)
    if (s.size) params.set("size", s.size)
    navigate(`/checkout?${params}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Breadcrumb className="mb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={categoryHref(category.slug)}>{category.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          {sub && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={categoryHref(category.slug, sub.slug)}>{sub.name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbPage className="max-w-60 truncate">{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="mx-auto w-full max-w-lg lg:sticky lg:top-32 lg:max-w-none lg:self-start">
          <ProductGallery product={product} color={color} />
        </div>

        <div className="min-w-0">
          <Link to={`/products?q=${encodeURIComponent(product.brand)}`} className="text-[13px] font-medium text-primary hover:underline">
            Visit the {product.brand} store
          </Link>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{product.name}</h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <a href="#reviews" className="rounded-md hover:opacity-80" aria-label={`Rated ${product.rating} out of 5 from ${product.reviewCount} ratings. See reviews`}>
              <RatingStars rating={product.rating} count={product.reviewCount} size="lg" />
            </a>
            <span className="text-xs text-muted-foreground">· {product.soldCount.toLocaleString("en-IN")}+ bought</span>
          </div>
          {product.badges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.badges.map((b) => (
                <Badge key={b} variant={b === "Low stock" ? "destructive" : "secondary"}>
                  {b}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-5">
            {off > 0 && <p className="mb-1 text-xs font-semibold tracking-wide text-deal uppercase">Limited-time deal</p>}
            <PriceTag product={product} size="lg" />
            <p className="mt-1.5 text-xs text-muted-foreground">Inclusive of all taxes</p>
            <p className="mt-2.5 text-muted-foreground">{product.tagline}</p>
          </div>

          {/* Colour */}
          <fieldset className="mt-5">
            <legend className="mb-2 text-[13px]">
              <span className="font-semibold">Colour:</span> <span className="text-muted-foreground">{color.name}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={c.name}
                  aria-pressed={color.name === c.name}
                  className={cn(
                    "grid size-9 place-items-center rounded-full border-2 transition-shadow",
                    color.name === c.name ? "border-primary ring-2 ring-foreground/10" : "border-border hover:border-foreground/30",
                  )}
                >
                  <span className="size-6 rounded-full border border-black/10" style={{ background: c.hex }} />
                </button>
              ))}
            </div>
          </fieldset>

          {/* Size */}
          {product.sizes.length > 0 && (
            <fieldset className="mt-5">
              <legend className="mb-2 text-[13px]">
                <span className="font-semibold">Size:</span> <span className="text-muted-foreground">{size ?? "Select a size"}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSize(s)
                      setSizeError(false)
                    }}
                    aria-pressed={size === s}
                    className={cn(
                      "h-9 min-w-12 rounded-lg border px-3 text-[13px] font-medium transition-colors",
                      size === s ? "border-primary bg-accent text-accent-foreground" : "hover:border-foreground/30",
                      sizeError && !size && "border-destructive",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {sizeError && !size && (
                <p role="alert" className="mt-2 text-xs font-medium text-destructive">
                  Please select a size.
                </p>
              )}
            </fieldset>
          )}

          {/* Quantity + stock */}
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <QuantityStepper value={quantity} onChange={setQuantity} max={maxQty} disabled={soldOut} />
            <StockLabel stock={product.stock} />
          </div>

          <div className="mt-6 grid grid-cols-[1fr_auto] gap-2.5 sm:grid-cols-[1fr_1fr_auto]">
            <Button size="lg" variant="outline" className="h-11 border-primary text-primary hover:bg-accent hover:text-primary" disabled={soldOut || addToCartMutation.isPending} onClick={addToCart}>
              {addToCartMutation.isPending ? <Loader2 className="animate-spin" /> : <ShoppingCart />} Add to cart
            </Button>
            <Button size="lg" className="order-3 col-span-2 h-11 sm:order-none sm:col-span-1" disabled={soldOut} onClick={buyNow}>
              <Zap /> Buy now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="size-11"
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              aria-pressed={saved}
              onClick={() => toggleWishlist(product)}
            >
              <Heart className={cn(saved && "fill-deal text-deal")} />
            </Button>
          </div>
          {quantity > 1 && !soldOut && (
            <p className="mt-2 text-xs text-muted-foreground">
              {quantity} × {formatPrice(product.price)} = <span className="font-semibold text-foreground">{formatPrice(product.price * quantity)}</span>
            </p>
          )}

          <ul className="mt-6 divide-y rounded-xl border text-[13px]">
            <InfoRow
              icon={Truck}
              title={`${product.price >= FREE_SHIPPING_THRESHOLD ? "Free delivery" : "Delivery"} by ${deliveryDate()}`}
              body={product.price >= FREE_SHIPPING_THRESHOLD ? "Standard delivery, free on this item." : `₹49 delivery, free on orders over ₹999.`}
            />
            <InfoRow icon={RotateCcw} title="30-day free returns" body="Changed your mind? Send it back, no questions asked." />
            <InfoRow icon={Store} title={`Sold by ${product.brand}`} body="Independent maker · Fulfilled by Northwind" />
            <InfoRow icon={ShieldCheck} title="Secure transaction" body="Your payment details are protected." />
          </ul>

          <Accordion type="multiple" defaultValue={["description"]} className="mt-6">
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{product.description}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="highlights">
              <AccordionTrigger>Highlights</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {h}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="specs">
              <AccordionTrigger>Specifications</AccordionTrigger>
              <AccordionContent>
                <dl className="divide-y rounded-lg border">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[140px_1fr] gap-3 px-3 py-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping &amp; returns</AccordionTrigger>
              <AccordionContent className="space-y-2 text-muted-foreground">
                <p>Standard delivery in 3–5 business days: free on orders over ₹999, otherwise ₹49.</p>
                <p>Returns are free within 30 days of delivery for unused items in original packaging.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* in-page navigation for the long lower half of the page */}
      <nav aria-label="On this page" className="no-scrollbar sticky top-[162px] z-30 -mx-4 mt-14 flex gap-1 overflow-x-auto border-b bg-background px-4 sm:-mx-6 sm:px-6 md:top-[110px]">
        {[
          ["#reviews", "Ratings & reviews"],
          ["#questions", "Questions & answers"],
          ["#related", "You may also like"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="shrink-0 border-b-2 border-transparent px-3 py-3 text-[13px] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
            {label}
          </a>
        ))}
      </nav>

      <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-44 pt-10">
        <h2 id="reviews-title" className="mb-5 text-lg font-semibold tracking-tight">
          Ratings &amp; reviews
        </h2>
        <ProductReviews slug={product.slug} />
      </section>

      <section id="questions" aria-labelledby="questions-title" className="scroll-mt-44 pt-14">
        <ProductQuestions slug={product.slug} vendor={product.brand} />
      </section>

      <RelatedProducts slug={product.slug} />
    </div>
  )
}

function StockLabel({ stock }) {
  if (stock === 0) return <span className="text-[13px] font-semibold text-destructive">Currently out of stock</span>
  if (stock <= 10)
    return <span className="text-[13px] font-semibold text-deal">Hurry — only {stock} left in stock</span>
  return (
    <span className="flex items-center gap-1 text-[13px] font-medium text-success">
      <BadgeCheck className="size-4" /> In stock
    </span>
  )
}

function InfoRow({ icon: Icon, title, body }) {
  return (
    <li className="flex gap-3 p-3.5">
      <Icon className="mt-0.5 size-4.5 shrink-0 text-primary" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground">{body}</p>
      </div>
    </li>
  )
}

function RelatedProducts({ slug }) {
  const { data, isPending } = useRelatedProducts(slug)
  if (!isPending && !data?.length) return null

  return (
    <section id="related" aria-labelledby="related-title" className="scroll-mt-44 pt-14">
      <h2 id="related-title" className="mb-4 text-lg font-semibold tracking-tight">
        You may also like
      </h2>
      <ProductGrid products={data ?? []} loading={isPending} skeletonCount={4} className="xl:grid-cols-6" />
    </section>
  )
}

function ProductPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6" aria-busy="true" aria-label="Loading product">
      <Skeleton className="mb-5 h-4 w-64" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-9 w-72" />
          <div className="grid grid-cols-2 gap-2.5">
            <Skeleton className="h-11" />
            <Skeleton className="h-11" />
          </div>
        </div>
      </div>
    </div>
  )
}
